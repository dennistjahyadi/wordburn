# Engine constraints: what whisper.rn 0.7.4 and its bundled whisper.cpp can run

Scope: which whisper.cpp whisper.rn 0.7.4 carries, DTW alignment-head presets, exact ggml file sizes, fixed vs auto language, large-model loading on Android, and GPU/NPU paths. "Verified from source" means read in `/Users/dennis.tjahyadi/Documents/workspaces/captionfy/node_modules/whisper.rn` (as patched by `patches/whisper.rn+0.7.4.patch`) or in the app's own `src/asr/`. Local file references are given as paths; web claims carry URLs.

## Which whisper.cpp does whisper.rn 0.7.4 bundle, and which DTW presets exist?

### Takeaway
whisper.rn 0.7.4 (released 2026-08-27) vendors whisper.cpp reporting `whisper_version() == "1.9.3"` (upstream v1.9.3 was released 2026-08-20). It has 12 alignment-head presets, including `WHISPER_AHEADS_LARGE_V3_TURBO`. The local patch maps a model-name string to a preset, and any name it does not recognise turns DTW off. **Important finding: the app turns DTW on but never reads the DTW timestamps. Word timing currently comes from whisper.cpp's heuristic `t0/t1` token timestamps.**

### Cited Findings
- **Verified from source:** `node_modules/whisper.rn/package.json` gives `"version": "0.7.4"`. `cpp/whisper.cpp` line ~9265 has `const char * whisper_version(void) { return "1.9.3"; }`. The package does not record the exact upstream commit hash.
- whisper.rn 0.7.4 was released 2026-08-27, with the note "sync whisper.cpp" (commit 193856b). 0.7.3 (2026-08-24) also synced whisper.cpp. 0.7.0 (2026-07-19) added "integrate parakeet model support". — [whisper.rn releases](https://github.com/mybigday/whisper.rn/releases)
- whisper.cpp v1.9.3 was published 2026-08-20. v1.9.4 followed about 22 days later, so whisper.rn 0.7.4 is one upstream release behind as of today (2026-09-30). — [newreleases.io v1.9.3](https://newreleases.io/project/github/ggml-org/whisper.cpp/release/v1.9.3); [Freedom.Tech on 1.9.4](https://freedom.tech/posts/2026-09-11-whisper-cpp-1-9-4/) (secondary source)
- **Verified from source:** `cpp/whisper.h` lines 89–103 declare this enum: `WHISPER_AHEADS_NONE, N_TOP_MOST, CUSTOM, TINY_EN, TINY, BASE_EN, BASE, SMALL_EN, SMALL, MEDIUM_EN, MEDIUM, LARGE_V1, LARGE_V2, LARGE_V3, LARGE_V3_TURBO`. `cpp/whisper.cpp` lines 388–413 define the head tables. Multilingual ones, as (text layer, head):
  - `base`: 8 heads `{3,1},{4,2},{4,3},{4,7},{5,1},{5,2},{5,4},{5,6}`
  - `small`: 10 heads `{5,3},{5,9},{8,0},{8,4},{8,7},{8,8},{9,0},{9,7},{9,9},{10,5}`
  - `medium`: 6 heads `{13,15},{15,4},{15,15},{16,1},{20,0},{23,4}`
  - `large-v1`: 9 heads. `large-v2`: 23 heads.
  - `large-v3`: 10 heads `{7,0},{10,17},{12,18},{13,12},{16,1},{17,14},{19,11},{21,4},{24,1},{25,6}`
  - `large-v3-turbo`: 6 heads `{2,4},{2,11},{3,3},{3,6},{3,11},{3,14}`
- **No preset exists for `large-v3` quantisations as separate entries, because presets are per architecture, not per file.** The q5_0/q8_0 files of a model use that model's preset. Verified from the table structure: presets key on model, not ftype.
- **Verified from source (the patch):** `patches/whisper.rn+0.7.4.patch` adds a `dtwAheadsPreset` string to `initWhisper`. `dtwPresetFromName()` in `cpp/jsi/RNWhisperJSI.h` maps these exact strings: `"tiny.en","tiny","base.en","base","small.en","small","medium.en","medium","large-v1","large-v2","large-v3","large-v3-turbo"`. Anything else returns `WHISPER_AHEADS_NONE`, which turns DTW off. When DTW is on, the patch also forces `flash_attn` off, because whisper.cpp itself logs "dtw_token_timestamps is not supported with flash_attn - disabling" (`cpp/whisper.cpp` ~line 3795). The default for `flash_attn` is `true` (~line 3694). The patch also returns per-token `t0`, `t1`, `tDtw` (centiseconds) and `p`.
- **Verified from source (the app):** `src/asr/models.ts` sets `DTW_PRESET = 'base.en'`, and `src/asr/whisper.ts` passes it to `initWhisper`. But `transcribeChunk` builds words from `segment.t0 * 10` / `segment.t1 * 10`, using `maxLen: 1, tokenTimestamps: true, language: 'en'`. It reads only `segment.tokens[0]?.p` from the patch's token data. `grep -rn "tDtw\|t_dtw" src app` returns nothing. **The DTW timestamps are computed and then thrown away. Today's word timings are whisper.cpp's heuristic (timestamp-token based) token times, not DTW.**

### Inferences
- A wrong preset in `DTW_PRESET` currently cannot degrade word timing, because `tDtw` is not consumed. It still costs time: DTW runs, and flash attention is forced off. The parent task's premise, that per-word timestamps come from DTW, is not what the code does today. Whichever model is chosen, the team should decide whether to switch word timing to `tDtw` or keep the heuristic path, and measure both.
- Every multilingual candidate (base, small, medium, large-v3, large-v3-turbo) has a preset and a name the patch already maps. No patch change is needed to pick one; only `DTW_PRESET` and `WHISPER_MODEL` change.

### Gaps
- The exact upstream whisper.cpp commit hash inside 0.7.4 is not recorded in the npm package. It would need the whisper.rn repo's submodule pointer at commit 193856b, which I did not fetch.

## Does large-v3-turbo have DTW alignment heads, where did they come from, and how good are its word timestamps?

### Takeaway
Yes. `WHISPER_AHEADS_LARGE_V3_TURBO` exists, with six heads on decoder layers 2–3. They are exactly OpenAI's own heads for turbo: I decoded the `_ALIGNMENT_HEADS` mask in OpenAI's `whisper/__init__.py`, and they also match the HF `generation_config.json`. Evidence on turbo word-timestamp quality is thin and mixed. A preset whose layer indices do not fit the model fails context init; it does not produce silently wrong timings.

### Cited Findings
- **Verified:** OpenAI's `whisper/__init__.py` holds `"large-v3-turbo": b"ABzY8j^C+e0{>%RARaKHP%t(lGR*)0g!tONPyhe\`"` in `_ALIGNMENT_HEADS`. I decoded it locally (base85 → gzip → bool mask of 80 = 4 layers × 20 heads). True indices are `[44, 51, 63, 66, 71, 74]`, which is (2,4),(2,11),(3,3),(3,6),(3,11),(3,14). That is identical to whisper.cpp's table. — [openai/whisper `__init__.py`](https://raw.githubusercontent.com/openai/whisper/main/whisper/__init__.py)
- **Verified:** HF `openai/whisper-large-v3-turbo` `generation_config.json` has `alignment_heads [[2, 4], [2, 11], [3, 3], [3, 6], [3, 11], [3, 14]]`. — [HF generation_config](https://huggingface.co/openai/whisper-large-v3-turbo/raw/main/generation_config.json)
- The turbo preset was requested in whisper.cpp issue #2480. The reporter extracted indices `[44, 51, 63, 66, 71, 74]` from "the official Python implementation" and noted that using the large-v3 preset on turbo fails with "tried to set alignment head on text layer 8, but model only has 4 text layers". Issue #2462 separately reported that the enum was missing. — [whisper.cpp #2480](https://github.com/ggml-org/whisper.cpp/issues/2480); [whisper.cpp #2462](https://github.com/ggml-org/whisper.cpp/issues/2462)
- **Verified from source (mismatch behaviour):** `aheads_masks_init` in `cpp/whisper.cpp` (~lines 1175–1215) checks every head. It logs an error and returns false if a head's layer is `>= n_text_layer` or its head index is `>= n_text_head`. So a preset from a bigger model fails init. A preset from a *smaller or equal* model with in-range indices, for example `base` heads on `small`, passes the checks and silently uses the wrong heads. Nothing validates that the heads are semantically right for the weights. The patch's comment says the same: "a wrong head set gives timestamps that look plausible and are not."
- Timestamp-quality reports for turbo:
  - A transformers user reported "Incorrect word timestamps" and word repetition with large-v3-turbo (2025-04-03). No methodology, no root cause, and no maintainer answer is visible. — [transformers #37248](https://github.com/huggingface/transformers/issues/37248)
  - A third-party project's PR reports that with openai-whisper's method (alignment heads, median filter, DTW) on turbo, "Word starts within 0.1 s of HF token timestamps for more than 90% of words". This is parity with a reference implementation, not accuracy against ground truth. — [mstar PR #318](https://github.com/mstar-project/mstar/pull/318)
  - whisper.cpp issue #3010, "Can I use DTW with large-v3-turbo?" (2025-04-05), was closed stale with no answer. — [whisper.cpp #3010](https://github.com/ggml-org/whisper.cpp/issues/3010)
- General DTW caveats in whisper.cpp:
  - `t_dtw = -1` can appear on some tokens, for example repetitive stretches. — [whisper.cpp #2329](https://github.com/ggml-org/whisper.cpp/issues/2329)
  - A `-dtw` WHISPER_ASSERT failure has been reported. — [whisper.cpp #2301](https://github.com/ggml-org/whisper.cpp/issues/2301)
  - A downstream app reports a DTW median_filter abort on a VAD tail chunk ending within ~140 ms of the chunk end. — [humla #181](https://github.com/michaelwilhelmsen/humla/issues/181)
  - A report of all `t_dtw` = -1 with medium was closed stale. — [whisper.cpp #3623](https://github.com/ggml-org/whisper.cpp/issues/3623)

### Inferences
- Turbo's heads have the right provenance. With only 4 decoder layers and 6 heads, its alignment signal comes from fewer heads than large-v3's 10, or small's 10. Whether that hurts word-onset precision is unmeasured in any source I found.
- The humla median_filter crash is relevant if the app ever consumes DTW, because the app packs VAD spans into chunks of up to 28 s (`MAX_CHUNK_MS = 28_000`, `MIN_SPAN_MS = 120`).

### Gaps
- I found no benchmark of whisper.cpp DTW word-timing error, in ms against forced-alignment ground truth, per model (base vs small vs turbo), and none for multilingual speech.

## Exact ggml file sizes on huggingface.co/ggerganov/whisper.cpp

### Takeaway
Byte-exact sizes come from the HF API (`/api/models/ggerganov/whisper.cpp/tree/main`, LFS size, fetched 2026-09-30). The repo does **not** have every combination:
- base and small ship q5_1 and q8_0 (no q5_0)
- medium ships q5_0 and q8_0 (no q5_1)
- large-v3 ships only f16 and q5_0 (no q8_0)
- large-v3-turbo ships f16, q5_0 and q8_0

### Cited Findings
All from [HF API tree listing](https://huggingface.co/api/models/ggerganov/whisper.cpp/tree/main). MB = 10^6 bytes.

| file | bytes | MB | MiB |
|---|---:|---:|---:|
| ggml-base.bin (f16) | 147,951,465 | 148.0 | 141.1 |
| ggml-base-q5_1.bin | 59,707,625 | 59.7 | 56.9 |
| ggml-base-q8_0.bin | 81,768,585 | 81.8 | 78.0 |
| ggml-small.bin (f16) | 487,601,967 | 487.6 | 465.0 |
| ggml-small-q5_1.bin | 190,085,487 | 190.1 | 181.3 |
| ggml-small-q8_0.bin | 264,464,607 | 264.5 | 252.2 |
| ggml-medium.bin (f16) | 1,533,763,059 | 1533.8 | 1462.7 |
| ggml-medium-q5_0.bin | 539,212,467 | 539.2 | 514.2 |
| ggml-medium-q8_0.bin | 823,369,779 | 823.4 | 785.2 |
| ggml-large-v3.bin (f16) | 3,095,033,483 | 3095.0 | 2951.7 |
| ggml-large-v3-q5_0.bin | 1,081,140,203 | 1081.1 | 1031.1 |
| ggml-large-v3-turbo.bin (f16) | 1,624,555,275 | 1624.6 | 1549.3 |
| ggml-large-v3-turbo-q5_0.bin | 574,041,195 | 574.0 | 547.4 |
| ggml-large-v3-turbo-q8_0.bin | 874,188,075 | 874.2 | 833.7 |

For reference: `ggml-base.en-q8_0.bin` is 81,781,811 bytes, the app's current model and the 81.8 MB in CLAUDE.md. `ggml-tiny-q5_1.bin` is 32,152,673 and `ggml-tiny-q8_0.bin` is 43,537,433. `ggml-large-v2-q5_0.bin` is 1,080,732,091 and `ggml-large-v2-q8_0.bin` is 1,656,129,691.

### Inferences
- Against CLAUDE.md's 150 MB APK line (62.9 MB app + 0.9 MB VAD), only tiny and base multilingual quantisations fit if bundled:
  - base-q8_0 is a like-for-like swap at 81.8 MB
  - base-q5_1 frees about 22 MB
  - small-q5_1 at 190 MB, and everything larger, would need a download or Play Asset Delivery
- The other files (small-q5_0, medium-q5_1, large-v3-q8_0, turbo-q5_1) could be produced locally with whisper.cpp's `quantize` tool. They are not published upstream.

### Gaps
- No sizes for self-quantised variants. They are easy to generate but I did not generate them.

## Do quantised models work with DTW?

### Takeaway
Yes, per source. DTW works on cross-attention scores computed in f32, which do not depend on the weight storage type. Nothing in whisper.cpp restricts DTW by ftype. The app already opens a q8_0 model with a DTW preset without error. Whether quantisation *shifts* the timestamps has not been measured.

### Cited Findings
- **Verified from source:** DTW's head masks are `WSP_GGML_TYPE_F32` tensors (`cpp/whisper.cpp` ~line 1234). The sanity checks in `aheads_masks_init` look only at layer and head counts, never at `hparams.ftype`. The only runtime incompatibility coded is `flash_attn` (~line 3795).
- **Verified from source (the app):** `ggml-base.en-q8_0.bin` is opened with `dtwAheadsPreset: 'base.en'` (`src/asr/models.ts`, `src/asr/whisper.ts`), and CLAUDE.md records this build transcribing on the A54. But see the first section: `tDtw` is never read, so this proves DTW *runs* on q8_0, not that its output was checked.
- whisper.cpp documents DTW via `-dtw` and says the implementation follows OpenAI's Python one. Quantised models are a supported, documented use. — [whisper.cpp README](https://github.com/ggml-org/whisper.cpp); [whisper.cpp #2283](https://github.com/ggml-org/whisper.cpp/issues/2283)

### Inferences
- Quantisation perturbs the attention weights slightly. At q8_0 the effect on DTW paths should be negligible, and q5 is more likely to move boundaries by a frame (20 ms). This is an inference, not a measurement.

### Gaps
- I found no published comparison of DTW timestamps between f16 and q5/q8 files of the same model.

## Fixed language vs `language: 'auto'`: cost and API

### Takeaway
A fixed language per call is supported. `'auto'` (or empty/null) costs **one extra encoder pass plus a one-token decode, once per `whisper_full` call**, on the first 30 s of that call's audio. It is not per 30 s window. The detected language is then used for the whole call. The app calls `transcribeData` once per ≤28 s chunk, so auto-detect would roughly double encoder work per chunk. It could also pick a different language chunk to chunk. whisper.rn exposes no standalone detect-language API.

### Cited Findings
- **Verified from source:** in `whisper_full_with_state` (`cpp/whisper.cpp` ~line 6942), if `params.language` is null, empty or `"auto"`, or `params.detect_language` is set, it calls `whisper_lang_auto_detect_with_state(ctx, state, 0, ...)` once. That function (~line 4129) runs `whisper_encode_with_state` at offset 0, then `whisper_decode_with_state` on `[SOT]`, and takes the argmax over language tokens. The result is stored in `state->lang_id` and `params.language`, and used for every window in the call. With `detect_language = true` it returns immediately after detection, which is a detect-only mode in the C API.
- **Verified from source:** the C API also exports `whisper_lang_auto_detect(ctx, offset_ms, n_threads, lang_probs)` (~line 4204), which returns probabilities for all languages.
- **Verified from source (the binding):** whisper.rn's `TranscribeOptions.language` is documented "Default: 'auto' for auto-detect" (`src/NativeRNWhisper.ts` line 6). The JSI layer sets `params.language` only if the string is non-empty (`cpp/jsi/RNWhisperJSI.cpp` ~line 876). Otherwise it stays at `whisper_full_default_params`' `"en"` (~line 6076). So omitting `language` in this build actually means **English, not auto**, which contradicts the binding's own doc comment. Pass `'auto'` explicitly to get detection. Results return `language` from `whisper_full_lang_id` (~line 1404). No `detectLanguage` method exists in whisper.rn's TS surface (grep of `src/*.ts` for "detect" finds only VAD).
- **Verified from source (the app):** `src/asr/whisper.ts` passes `language: 'en'`. `MAX_CHUNK_MS = 28_000`, and chunks are transcribed one `transcribeData` call each (`src/asr/runner.ts`).

### Inferences
- Two cheap strategies for a multilingual build:
  1. Ask the user for the language (a fixed `language` per project, with zero extra cost).
  2. Detect once on the first chunk with `'auto'`, read `result.language`, then pin it for the rest of the run.

  Both avoid per-chunk re-detection and per-chunk language flips. Detect-only via `detect_language` would need a patch, since the binding does not expose it.
- On a 28 s chunk, the extra cost is one full encoder pass, which dominates runtime for small and turbo-class models. So auto-detect on every chunk is close to 2× encoder cost. The exact ratio depends on the decoder share, which I did not measure.

### Gaps
- I found no measured detect-language latency on a phone for any model size.

## Loading models over 500 MB on Android: mmap, AssetManager and file paths

### Takeaway
whisper.cpp in this build **never mmaps** the model, on any path: AssetManager, raw resource or file path. Every loader streams bytes through a `read()` callback into ggml backend buffers allocated on the heap. So a model costs its full size in resident RAM, plus KV cache and compute buffers, however it is opened. Loading from app-private storage by file path does not change this. CLAUDE.md's "nothing is unpacked" is true for disk, but the weights are still copied into RAM.

### Cited Findings
- **Verified from source:**
  - `android/src/main/jni.cpp` `hostInitWhisperContext` (~line 615) has three routes: `isBundleAsset`/`asset:/` goes through `AAssetManager_open(..., AASSET_MODE_STREAMING)` with an `AAsset_read` loader; a raw resource goes through a Java `InputStream` loader; otherwise `whisper_init_from_file_with_params(path)`.
  - The file-path route in `cpp/whisper.cpp` (~line 3709) wraps `std::ifstream::read`.
  - `grep -n mmap` over `cpp/whisper.cpp`, `cpp/rn-whisper.cpp`, `android/src/main/jni.cpp` and `cpp/jsi/*.cpp` finds nothing.
  - Weights are allocated with `wsp_ggml_backend_alloc_ctx_tensors` on the CPU buffer type (~lines 1010, 1409).
- **Verified from source:** remote URLs are downloaded to cache first (`downloadToCache`), then loaded by file path.
- whisper.rn's README warns that the RN packager cannot bundle files over 2 GB (the f16 large model is 2.9 GB) and that bundling "will significantly increase the size of the app". — `node_modules/whisper.rn/README.md`, "Usage with assets"
- whisper.rn's README says the Parakeet models "are too large to bundle comfortably" and the example app downloads them at runtime. — `node_modules/whisper.rn/README.md`, "NVIDIA Parakeet TDT"

### Inferences
- turbo-q5_0 (574 MB) or medium-q5_0 (539 MB) means roughly 0.55–0.6 GB resident for weights alone, plus state. On an 8 GB A54 that is probably fine. On 4 GB devices, low-memory-killer pressure while a foreground service runs and the video editor is open is a real risk. The APK's `AASSET_MODE_STREAMING` path also keeps the compressed-or-stored asset readable only sequentially. Since CLAUDE.md turns compression off for `.bin`, that is fine.
- Play's install-size limits make bundling anything above base impractical anyway, so large models imply a download to `files/`, loaded by path. There is no memory advantage in either direction.

### Gaps
- I found no whisper.rn-specific issue reports about OOM or crashes loading models over 500 MB on Android. I did not search the whisper.rn issue tracker exhaustively.
- Exact compute and KV buffer sizes per model on this build were not measured. whisper.cpp logs them at init, so one device run would answer this.

## GPU/NPU acceleration on Android (Exynos 1380, Mali-G68)

### Takeaway
None. whisper.rn 0.7.4 on Android is CPU-only by construction. `useGpu` is ignored with the reason "Currently not supported", and the Android CMake build defines only `WSP_GGML_USE_CPU` / `WSP_GGML_USE_CPU_REPACK`, with no Vulkan, OpenCL or NNAPI. **The best arm64 variant is also compiled without `+dotprod`**, so ggml's int8 dot-product kernels and the ARM repack GEMMs, which are compile-time gated on `__ARM_FEATURE_DOTPROD` / `__ARM_FEATURE_MATMUL_INT8`, are absent even on CPUs that have them.

### Cited Findings
- **Verified from source:** `android/src/main/jni.cpp` has `params.use_gpu = false; ... if (options.useGpu) { result.reasonNoGPU = "Currently not supported"; }`.
- **Verified from source:** `android/src/main/CMakeLists.txt` passes `-DWSP_GGML_USE_CPU -DWSP_GGML_USE_CPU_REPACK`. For arm64 it builds `rnwhisper_v8fp16_va_2` (`-march=armv8.2-a+fp16`) and `rnwhisper_v8` (`-march=armv8-a`). `RNWhisper.java` picks the fp16 build when `/proc/cpuinfo` lists `fp16`/`fphp`.
- **Verified from source:** `cpp/ggml-cpu/ggml-cpu.c` `wsp_ggml_cpu_has_dotprod()` returns 1 only `#if defined(__ARM_FEATURE_DOTPROD)`, a compile-time check. The kernels in `cpp/ggml-cpu/arch/arm/quants.c` and `repack.cpp` are wrapped in `#if ... defined(__ARM_FEATURE_DOTPROD)` or `__ARM_FEATURE_MATMUL_INT8`. Neither macro is set by `-march=armv8.2-a+fp16`.
- Upstream whisper.cpp does have Vulkan and OpenCL backends, but Android reports are rough:
  - Vulkan: an "Unsupported device" error on Adreno 640 for lack of 16-bit storage. — [whisper.cpp #2765](https://github.com/ggml-org/whisper.cpp/issues/2765)
  - Vulkan: build-instructions questions. — [whisper.cpp #2370](https://github.com/ggml-org/whisper.cpp/issues/2370)
  - OpenCL: missing symbols on OpenCL 2.0 Adreno. — [whisper.cpp #3015](https://github.com/ggml-org/whisper.cpp/issues/3015)
  - OpenCL: incorrect results reported on an earlier Android build. — [whisper.cpp #1140](https://github.com/ggml-org/whisper.cpp/issues/1140)
  - The OpenCL backend in ggml targets Adreno primarily. I found no Mali-G68 success report for whisper.cpp's Vulkan backend.
- whisper.cpp has no NNAPI backend. Android NPU access is not part of the codebase I inspected; no NNAPI symbols appear in `cpp/`.

### Inferences
- The Exynos 1380's Cortex-A78 and A55 cores implement Armv8.2 dot-product instructions (general Arm knowledge, not fetched here). So a rebuilt `rnwhisper_v8fp16_va_2` with `-march=armv8.2-a+fp16+dotprod` would probably speed up q5/q8 matmuls on the A54 noticeably. It would need a patch to whisper.rn's CMakeLists and a runtime `asimddp` check in `RNWhisper.java`. That changes the relative economics: today f16 weights benefit from the fp16 build while quantised ones fall back to non-dotprod NEON paths. This is a model-choice lever worth a measured spike before judging small or turbo "too slow".
- Any GPU path would mean building ggml-vulkan into whisper.rn yourself and validating on Mali. That is high risk given the upstream reports and outside what 0.7.4 offers.

### Gaps
- There are no measured numbers for dotprod vs non-dotprod on the A54 for any model.
- I found no whisper.cpp Vulkan result on Mali-G68 specifically.
- Side note, outside scope: whisper.rn 0.7.x also bundles Parakeet TDT 0.6B v3 (English + 24 European languages; q4_0 356 MB, q8_0 669 MB per the README). I did not check whether it exposes word timestamps.
