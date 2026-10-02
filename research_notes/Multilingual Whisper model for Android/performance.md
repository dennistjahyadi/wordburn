# Performance of whisper.cpp multilingual models (base / small / medium / large-v3-turbo) on a mid-range Android phone (Galaxy A54 class)

Research date: 2026-09-30. Target: Exynos 1380 (4x Cortex-A78 @ 2.4 GHz + 4x A55, LPDDR4X, 6–8 GB), CPU only, 4 threads.
App reference point: ships `base.en-q8_0`; budget is at most 45 s of processing per 60 s of audio on the A54. No measured A54 transcription time was available to this researcher (CLAUDE.md records transcription working on the A54 but not a timing), so every A54 number below is an extrapolation.

Units: "s/min" = seconds of processing per 60 s of speech. RTF = processing time / audio time (RTF 0.5 = 30 s/min).

---

## 1. Published measurements on ARM phones and ARM boards

### Takeaway
There are very few dated, reproducible whisper.cpp numbers on mid-range ARM. The two usable anchors are (a) a 2026 RK3588 board run (4x A76 @ 2.4 GHz, the closest CPU to the A54's big cluster) for tiny/base/small/medium, quant unspecified, and (b) a 2026 model card with long-form large-v3-turbo Q8_0 runs on a Snapdragon 732G phone and a Dimensity 9500 phone using whisper.cpp v1.9.4. They imply very different speeds for big models (see section 6), and that disagreement is the main uncertainty.

### Cited Findings
**RK3588 (Turing Pi RK1, 4x Cortex-A76 + 4x Cortex-A55, Ubuntu 22.04 ARM64), article dated 1 June 2026, 5-minute English 16 kHz WAV** — [Turing Pi](https://turingpi.com/whisper-cpp-piper-tts-arm64-turing-pi-rk3588/)
| Model | -t 4 wall clock (5 min audio) | -t 4 → s/min | -t 8 wall clock | RTF @ -t 8 | Peak RSS |
|---|---|---|---|---|---|
| tiny | 32.56 s | 6.5 | 29.79 s | 0.10 | 299 MB |
| base | 63.62 s | 12.7 | 48.57 s | 0.16 | 410 MB |
| small | 162.16 s | 32.4 | 141.86 s | 0.47 | 889 MB |
| medium | 491.77 s | 98.4 | 453.96 s | 1.51 | 2.14 GB |
- The article does not state quantisation (f16 vs quantised), build flags, flash-attention setting or whisper.cpp commit; it only says NEON SIMD is used. Multilingual vs `.en` is also not clear from the fetched text. — [Turing Pi](https://turingpi.com/whisper-cpp-piper-tts-arm64-turing-pi-rk3588/)

**large-v3-turbo fine-tune (same architecture as large-v3-turbo), Q8_0, whisper.cpp v1.9.4, CPU backend "KleidiAI, runtime CPU-variant selection, OpenMP, flash attention off", 10 min continuous audio** (model name suffix "2604" suggests April 2026; no explicit date on page) — [Aivo model card, Hugging Face](https://huggingface.co/Aivo/whisper-large-v3-turbo-et-verbatim-2604-ggml)
| Device | Quant | RTF | s/min | Peak RAM |
|---|---|---|---|---|
| POCO X3 NFC (Snapdragon 732G) | Q8_0 | 1.34 | 80.4 | ~1.5 GB |
| OPPO Find X9 (Dimensity 9500, SME2), screen on | Q8_0 | 0.54 | 32.4 | ~2.1 GB |
- Thread count per phone is not stated in the results table; the recommended Android command line uses `-t 8` and `-nfa`. — [Aivo](https://huggingface.co/Aivo/whisper-large-v3-turbo-et-verbatim-2604-ggml)
- File sizes: Q8_0 874,188,075 B; Q5_K 574,041,195 B; Q4_0 473,992,235 B. — [Aivo](https://huggingface.co/Aivo/whisper-large-v3-turbo-et-verbatim-2604-ggml)

**Other phone data points (weaker)**
- Android phone (unnamed ARM64), tiny q8_0, 4 threads, CPU only: batch mode ~4.5 s of audio processed in under 2 s; repeated `whisper_full` calls on a growing buffer ("streaming") ran ~6.7 s per 1 s of new audio. Posted 16 Dec 2025, no maintainer reply. — [whisper.cpp Discussion #3567](https://github.com/ggml-org/whisper.cpp/discussions/3567)
- Pixel 4a (Snapdragon 730G), ggml-tiny, language auto-detect + beam search, 196 s of audio: 1 thread 55.4 s, 2 threads 43.9 s, 4 threads 72.0 s, 6 threads 78.2 s, 8 threads 98.9 s. Dated 5 Sep 2023, no maintainer explanation. (The fetched summary garbles the core layout; the 730G is a 2-big + 6-little design, so "more than 2 threads is slower" is consistent with spilling onto the A55 cores.) — [whisper.cpp Issue #1248](https://github.com/ggml-org/whisper.cpp/issues/1248)
- The canonical bench thread (whisper-bench = encoder-only timing) contains almost no ARM phone data: Raspberry Pi 4, 4 threads, tiny, 13,839 ms encoder; iPhone 13 mini, 4 threads, base, 1,091 ms encoder; both at old commit fcf515d (2022-era). — [whisper.cpp Issue #89](https://github.com/ggml-org/whisper.cpp/issues/89)
- Raspberry Pi 5 / CM5 (4x A76 @ 2.4 GHz): an ASR comparison on 250 Common Voice clips gives RTF for vanilla Whisper 1.48, faster-whisper 0.55, sherpa-onnx Whisper base 0.36 / base-int8 0.34, OpenVINO 0.29 — but no whisper.cpp row and no model size for most rows; undated. — [Pamir AI, hashnode](https://pamir-ai.hashnode.dev/benchmarking-whispers-speed-on-raspberry-pi-5-how-fast-can-it-get-on-a-cpu)
- Aggregator claim that whisper.cpp small on Pi 5 runs at "roughly 0.4–0.6× real-time" (a 10 min clip taking ~17–25 min) and that tiny/base are the real-time models — [PromptQuorum 2026](https://www.promptquorum.com/power-local-llm/local-whisper-stt-comparison-2026); **contradicted** by the RK3588 run above (same A76 core, small at RTF 0.47–0.54, i.e. ~2× faster than real time). The aggregator gives no methodology.
- A blog claims Pixel 6a (Tensor G1) numbers with "whisper.cpp b1.5.0" and base.en Q5_K, that SD 8 Gen 2 is 20–30% faster than Tensor G1 on the encoder, and SD 695 lands at 150–250 ms "on the Vulkan path". — [MVP Factory](https://mvpfactory.io/blog/wiring-whisper-cpp-to-android-s-audiorecord-api-building-a-sub-100ms-on-device). Treat as low reliability: the version string does not match whisper.cpp's tag scheme, and the numbers are not attributed to a model/window length.

### Inferences
- The A54's four A78 cores at 2.4 GHz are the same clock and a slightly newer core than the RK3588's four A76 at 2.4 GHz, so the RK3588 `-t 4` column is the most direct proxy for the A54 at 4 threads — before accounting for phone thermals (a passively cooled phone will likely do worse on long runs than a board with a heatsink).
- Four threads on the A54 exactly matches the big cluster; the Pixel 4a result shows what happens when threads spill onto A55 cores, so `-t 4` (not 8) is the right setting on the A54. The RK3588 gain from 4 → 8 threads (8–24%) was on a board where the A55s are not throttled by a phone governor; on a phone the gain may be zero or negative.

### Gaps
- No dated whisper.cpp measurement on an Exynos 1380, Snapdragon 7-series (7 Gen 1/2/3, 778G), Dimensity 7xxx/8xxx, or Tensor G2–G4 was found for base/small/medium/turbo. whisper.rn's issue tracker and FUTO Voice Input / Transcribro / WhisperInput did not surface timing numbers within this search budget.
- The RK3588 run's quantisation and build are unknown; the Aivo run's thread count is unknown.

---

## 2. Encoder vs decoder cost; word-level timestamps; large-v3-turbo's 4-layer decoder

### Takeaway
whisper.cpp always encodes a fixed 30 s window, so encoder cost per minute of audio is roughly constant (≈2 windows per minute) and dominates for the larger encoders. large-v3-turbo keeps large-v3's full 32-layer, 1280-wide encoder and cuts only the decoder, so it is far cheaper than large-v3 to decode but its encoder is still ~2× medium's and ~7× small's. No measurement of the extra cost of word-level (DTW) timestamps was found.

### Cited Findings
- `whisper-bench` "runs the Encoder part of the model and prints how much time it took to execute it" — i.e. published bench numbers are encoder-only. — [whisper.cpp README](https://github.com/ggml-org/whisper.cpp)
- The Aivo card measured a Dimensity 9500 at 41 s per 30 s window with flash attention on vs 13.5 s with it off (Q4_0, large-v3-turbo), and says "On ARM CPUs (phones), disable flash attention." — [Aivo](https://huggingface.co/Aivo/whisper-large-v3-turbo-et-verbatim-2604-ggml). A separate report says flash-attn's CPU path "appears to add meaningful overhead with no benefit" when no GPU is present and suggests `--no-flash-attn` by default on CPU-only systems — [OpenWhispr issue #1055](https://github.com/OpenWhispr/openwhispr/issues/1055) (via search snippet).
- Measured ratios on RK3588 at 4 threads (whole pipeline, not encoder-only): small/base = 2.55×, medium/small = 3.03×, medium/base = 7.7×. — derived from [Turing Pi](https://turingpi.com/whisper-cpp-piper-tts-arm64-turing-pi-rk3588/)

### Inferences
- **Architecture-based compute ratios** (from OpenAI's published model dimensions, background knowledge, not fetched in this session): encoder layers × width² — base 6×512², small 12×768², medium 24×1024², large-v3/turbo 32×1280². Relative encoder cost ≈ base 1 : small 4.5 : medium 16 : turbo 33. Decoder per-token cost ≈ base 1 (6×512²) : small 4.5 (12×768²) : medium 16 (24×1024²) : turbo 4.2 (4×1280²) : large-v3 33.
- So turbo's decoder costs about the same per token as small's and about a quarter of medium's, while its encoder costs ~2.1× medium's. If medium's time on CPU is 70–85% encoder, turbo would be about 1.5–1.8× medium overall on the same build. That is the scaling applied in section 6.
- The measured small/base (2.55×) and medium/base (7.7×) ratios are well below the pure encoder ratios (4.5×, 16×), consistent with base's time being dominated by fixed costs (mel, decoding, overhead) rather than its tiny encoder. Expect the gap between models to widen, not shrink, once the encoder dominates.
- Word timestamps: whisper.cpp's token timestamps and DTW timestamps are computed from data produced during the normal decode pass (DTW uses cross-attention weights of alignment heads), so they should not add decoder passes; splitting into one word per segment is post-processing. This is from general knowledge of whisper.cpp's design, not a measurement — the cost is expected to be small relative to the encoder but is unverified.
- For turbo, decoder cost shrinks enough that total time is essentially "number of 30 s windows × encoder time". VAD (which the app already runs) matters more for turbo than for base: skipping silent windows removes encoder passes directly.

### Gaps
- No published breakdown of encode vs decode ms for small/medium/turbo on ARM with DTW enabled. The fastest way to close this is `whisper-bench` plus one `whisper-cli` run with `-dtw` on the A54 itself.

---

## 3. Does quantisation speed up or slow down inference on ARM NEON?

### Takeaway
No whisper-specific ARM quant-vs-f16 speed table was found. The indirect evidence says 5-bit formats (q5_0/q5_1) save memory and disk but are not the fast path; Q8_0 (and Q4_0) are the formats with the optimised ARM kernels. Quantisation costs essentially no accuracy at Q8_0 and very little at Q5.

### Cited Findings
- whisper.cpp README: quantisation means "models require less memory and disk space and depending on the hardware can be processed more efficiently" — deliberately hedged on speed. — [whisper.cpp README](https://github.com/ggml-org/whisper.cpp)
- ggml v1.4.0-era LLaMA decode timing on M1 Pro (ARM, memory-bound decode, not Whisper): F16 128 ms/tok, Q4_0 56, **Q5_0 91**, Q8_0 75 — Q5_0 slower than Q8_0. — [whisper.cpp Discussion #838](https://github.com/ggml-org/whisper.cpp/discussions/838)
- On a legacy x86 CPU (i5-460M, no AVX), 5-bit formats were reported 3–5.5× slower than q4_0 ("CATASTROPHICALLY SLOW"). Not ARM, cited only as evidence that 5-bit unpacking can dominate when no fast kernel exists. — [whisper.cpp Discussion #3752](https://github.com/ggml-org/whisper.cpp/discussions/3752)
- Aivo's v1.9.4 phone runs used a CPU backend built with KleidiAI and runtime CPU-variant selection and ship Q8_0 as the phone recommendation. Accuracy: on-device ΔWER vs F16 was ≤ +0.27 pp for every quant on both phones; on desktop Q8_0 WER equalled F16 (10.90% clean / 16.96% degraded) while Q4_0 degraded to 19.39% on noisy audio. — [Aivo](https://huggingface.co/Aivo/whisper-large-v3-turbo-et-verbatim-2604-ggml)
- A secondary source describes Q5_1 as typically losing <1% WER vs F16 at ~40% smaller size. — [PromptQuorum](https://www.promptquorum.com/power-local-llm/local-whisper-stt-comparison-2026) (aggregator, no method)

### Inferences
- On a Cortex-A78 (ARMv8.2 with dot-product, no i8mm), Q8_0 should be at least as fast as f16 for the encoder's matrix multiplies and likely faster, and q5_0/q5_1 likely slower than Q8_0 because of bit unpacking. This matches the app's existing choice of q8_0 for base.en. For turbo on this phone the trade is: Q8_0 (874 MB, fastest) vs Q5 (≈574 MB, smaller, probably 10–40% slower). Not measured.
- The large disagreement between the RK3588 anchor and the Aivo 732G anchor (section 6) may be partly explained by quantisation + 2026 ARM kernels (Aivo: Q8_0, KleidiAI) vs a possibly f16, unknown-version build (Turing Pi). This is a hypothesis.

### Gaps
- No measured q5_0 vs q5_1 vs q8_0 vs f16 whisper encoder times on any Cortex-A7x core in 2024–2026. `whisper-bench -m <each quant> -t 4` on the A54 answers it in minutes.

---

## 4. Peak RAM per model and whether a 6 GB phone can hold large-v3-turbo q5_0

### Takeaway
Measured peak RSS tracks the README table closely: ~0.4 GB base, ~0.9 GB small, ~2.1 GB medium (f16 or unknown quant). large-v3-turbo Q8_0 measured 1.5–2.1 GB peak on two phones; q5 should land around 1.2–1.8 GB. That is likely to fit on a 6 GB A54 alongside the app, but it is roughly 4× what base uses and has not been tested next to video decoding.

### Cited Findings
- README memory table (original f16 models): tiny 75 MiB disk / ~273 MB mem; base 142 MiB / ~388 MB; small 466 MiB / ~852 MB; medium 1.5 GiB / ~2.1 GB; large 2.9 GiB / ~3.9 GB. — [whisper.cpp README](https://github.com/ggml-org/whisper.cpp)
- Measured peak RSS on RK3588 (2026): tiny 299 MB, base 410 MB, small 889 MB, medium 2.14 GB. — [Turing Pi](https://turingpi.com/whisper-cpp-piper-tts-arm64-turing-pi-rk3588/)
- Measured peak RAM, large-v3-turbo Q8_0, 10 min audio: Snapdragon 732G ~1.5 GB, Dimensity 9500 ~2.1 GB. — [Aivo](https://huggingface.co/Aivo/whisper-large-v3-turbo-et-verbatim-2604-ggml)
- turbo Q5_K file: 574 MB; Q8_0: 874 MB. — [Aivo](https://huggingface.co/Aivo/whisper-large-v3-turbo-et-verbatim-2604-ggml)

### Inferences
- The RK3588 RSS values match the README's f16 figures almost exactly, which suggests (not proves) that run used f16 models.
- Peak ≈ weights + compute/KV buffers. Swapping turbo Q8_0 (874 MB) for q5 (~547–574 MB) should cut ~300 MB off the 1.5–2.1 GB measured → ~1.2–1.8 GB estimated. The 0.6 GB spread between the two phones for the same file is unexplained (thread count, OpenMP buffers, or how RAM was measured).
- On a 6 GB A54 with One UI, a foreground app typically has ~2–3 GB of headroom before the low-memory killer targets it (general Android knowledge, not measured here). ~1.5 GB of whisper plus a React Native + Skia app plus an `expo-video` decoder is plausible but tight; the app should avoid holding the video player open during transcription and should expect background apps to be killed. Needs a device test with `dumpsys meminfo`.
- Separately from RAM: a ~550–880 MB model cannot ride in this app's APK under the 150 MB line documented in CLAUDE.md (base.en-q8_0 at 81.8 MB already leaves ~5 MB), so small (~250 MB at q8_0) or turbo would need Play Asset Delivery or a download.

### Gaps
- No measured peak RAM for small/medium/turbo at q5_0/q5_1 on Android; no measurement with a concurrent video decoder.

---

## 5. Thermal throttling on sustained runs

### Takeaway
No whisper-specific thermal measurement on a mid-range phone was found. The closest evidence is from LLM inference on phones, where sustained throughput drops 15–70% depending on device and workload. The Aivo 10-minute RTFs already average over whatever throttling occurred on those phones.

### Cited Findings
- iPhone 16 Pro LLM throughput dropped ~27% within three iterations and settled 41.5% below peak; S24 Ultra showed a milder ~15% reduction as its GPU clock stepped from 1,000 MHz to a 720–770 MHz plateau (GPU inference, not CPU). — [arXiv 2603.23640](https://arxiv.org/html/2603.23640v2)
- A blog reports Android LLM decode falling from 12.4 to 3.8 tok/s at the 30-minute mark (−69%). — [DEV Community / MVP Factory](https://dev.to/software_mvp-factory/thermal-throttling-and-sustained-on-device-llm-inference-on-android-4nh5) (lower-reliability source)
- The Aivo Dimensity 9500 run is labelled "screen on"; both phone RTFs are over 10 min of continuous audio. — [Aivo](https://huggingface.co/Aivo/whisper-large-v3-turbo-et-verbatim-2604-ggml)

### Inferences
- For this app's clips (≤60–90 s of audio), throttling should matter little for base: the run is short. For turbo, a 60 s clip at an estimated 40–180 s of full-load 4-core compute is long enough for an A54's governor to step the A78 cluster down; budget a 10–30% sustained penalty over a cold single-run benchmark, and more if the user runs several clips back to back. This is an estimate, not a measurement.

### Gaps
- No whisper.cpp sustained-run (tens of minutes) slowdown curve on any Exynos/Snapdragon 7-series phone.

---

## 6. Estimate for small and large-v3-turbo on the A54 (4 threads), with reasoning

### Takeaway
Two defensible anchors give very different answers for large models. **Small** likely lands at ~10–35 s/min on the A54, which is inside the 45 s budget on either anchor. **large-v3-turbo** lands at ~40–55 s/min on the optimistic anchor (Q8_0, 2026 ARM kernels) and ~150–180 s/min on the pessimistic one. Turbo is therefore borderline at best against a 45 s/min target and needs an on-device measurement before any decision. **Medium** is ~100 s/min or worse and out of budget either way.

### Cited Findings (inputs to the estimate)
- RK3588 4x A76 @ 2.4 GHz, `-t 4`: base 12.7, small 32.4, medium 98.4 s/min (quant/build unknown). — [Turing Pi](https://turingpi.com/whisper-cpp-piper-tts-arm64-turing-pi-rk3588/)
- Snapdragon 732G, turbo Q8_0, v1.9.4, flash-attn off: 80.4 s/min; Dimensity 9500: 32.4 s/min. — [Aivo](https://huggingface.co/Aivo/whisper-large-v3-turbo-et-verbatim-2604-ggml)
- Exynos 1380 AnTuTu 9 ≈ 523K vs Snapdragon 732G ≈ 345K (+51%). — [nanoreview comparison, via search snippet](https://nanoreview.net/en/soc-compare/samsung-exynos-1380-vs-qualcomm-snapdragon-732g). Exynos 1380 Geekbench (reported 2599 multi / 775 single). — [unite4buy, via search snippet](https://unite4buy.com/cpu/Samsung-Exynos-1380-geekbench/)

### Inferences (all extrapolated; none measured on the A54)

**Anchor A — RK3588 `-t 4` scaled to A54.** A78 @ 2.4 GHz vs A76 @ 2.4 GHz is roughly the same class of core (A78 slightly faster per clock); a phone has worse sustained cooling than a board. Treat as 1.0× ±25%.
| Model | A54 estimate (s/min) |
|---|---|
| base (multilingual, likely f16) | ~10–16 |
| small | ~25–40 |
| medium | ~75–125 |
| large-v3-turbo | medium × 1.5–1.8 (section 2 compute split) → **~150–180** |

**Anchor B — Snapdragon 732G turbo Q8_0 scaled to A54.** The 732G has 2x A76 @ ~2.2–2.3 GHz big cores + 6x A55 (core layout is background knowledge); the A54 has 4x A78 @ 2.4 GHz. With the encoder compute-bound, doubling big cores and a slightly faster core suggests ~1.5–2.0× the 732G's throughput (AnTuTu's +51% is the conservative end).
| Model | A54 estimate (s/min) |
|---|---|
| large-v3-turbo Q8_0 | 80.4 / (1.5–2.0) → **~40–55** |
| large-v3-turbo q5_0/q5_1 | same or 10–40% slower if 5-bit lacks the fast kernel → **~45–75** |
| small (q8_0) | turbo encoder ÷ ~7, decoder similar per token → roughly 0.15–0.3 × turbo → **~8–16** |

**Reconciling A and B.** The anchors disagree by ~3× for turbo. Anchor B is the same model, a phone, Q8_0, and a dated 2026 build with ARM-specific kernels (KleidiAI) and flash attention explicitly off; anchor A is a board, unknown quant (RSS suggests f16), unknown version and flash-attn setting. The Dimensity 9500 result in the same card (4.4× the phone's cost in 1/2.5 the time with SME2) is internally consistent with B. Weight B more heavily, but do not plan on it: it is one model card, thread count unstated, and a phone we do not have.

**Against the 45 s/min budget:**
- small: fits on either anchor, likely with margin (≈10–35 s/min). Multilingual small without `.en` loses nothing in speed relative to `small.en`.
- large-v3-turbo Q8_0: ~40–55 s/min on the optimistic anchor — right on the line before thermal throttling, which on a 60 s clip may add 10–30%. On the pessimistic anchor it is 3–4× over budget.
- medium: over budget on both anchors; turbo dominates it (more accurate, ~same or less decode cost).
- base (current, `base.en-q8_0`): ~10–16 s/min on anchor A, well under budget — so the app's 45 s target leaves roughly 3× headroom that small should consume about half of, and turbo all of.

### Gaps
- The decisive number — `whisper-bench -t 4` encoder ms for base-q8_0, small-q8_0, small-q5_1, turbo-q8_0 and turbo-q5_0 on the actual A54, with the whisper.cpp version bundled by whisper.rn 0.7.4 and flash attention off — was not found anywhere and would replace every extrapolation in this section. whisper.rn's bundled whisper.cpp version may predate the 2025–26 ARM kernel work that anchor B relied on; that version check is itself a gap.
- Geekbench 6 multi-core for the Snapdragon 732G and RK3588 could not be fetched (pages returned 403), so SoC scaling rests on core counts and AnTuTu.
