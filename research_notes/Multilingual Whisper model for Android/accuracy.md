# Multilingual Whisper accuracy for Spanish, German, Dutch and Indonesian (sizes, turbo, quantisation, caption-quality issues)

Researched 2026-09-30. Every number below says which dataset and which normalisation it was scored with, and when it was published. **All published WERs strip punctuation and casing before scoring**, so none of them say anything about German noun capitalisation or sentence punctuation. That is covered separately in the punctuation section.

A note on method: the Whisper paper's appendix tables were pulled straight out of the arXiv PDF. The large-v3 against large-v2 per-language numbers were pulled out of OpenAI's own chart file, `language-breakdown.svg` in the openai/whisper repo (Nov 2023). The large-v3 values are the text labels printed in that chart. The large-v2 values were **read back off the bar geometry** on a log axis, fitted to the labelled v3 bars; the fit residual is under 0.8 px, so treat them as ±0.1 WER. The large-v2 figures are my reconstruction, not numbers OpenAI printed.

---

## 1. Per-language WER per model size (FLEURS, Common Voice, others)

### Takeaway
Spanish is the easiest of the four at every size and Indonesian the hardest, with **Dutch almost exactly as hard as Indonesian at tiny, base and small**. On FLEURS the four languages go roughly base ≈ 10–33%, small ≈ 6–16%, medium ≈ 4–10%, large-v2/v3/turbo ≈ 3–7%. The first size where all four are under about 10% WER on both FLEURS and Common Voice is medium, and even there Indonesian sits right on 10–12%.

### Cited Findings

**Consolidated table (WER %, lower is better). Sources and normalisation are in the bullets that follow.**

| Model (ggml size q5/q8) | es FLEURS | de FLEURS | nl FLEURS | id FLEURS | es CV | de CV | nl CV | id CV |
|---|---|---|---|---|---|---|---|---|
| tiny (32 / 44 MB) | 15.9 | 27.8 | 49.0 | 51.7 | 30.3 | 34.5 | 43.6 | 49.6 |
| base (60 / 82 MB) | 9.9 | 17.9 | 33.0 | 33.1 | 19.6 | 24.5 | 29.5 | 36.1 |
| small (190 / 264 MB) | 5.6 | 10.2 | 16.4 | 16.3 | 10.3 | 13.0 | 14.2 | 18.4 |
| medium (539 / 823 MB) | 3.6 | 6.5 | 9.9 | 10.2 | 6.9 | 8.5 | 8.0 | 11.6 |
| large-v1 | 3.5 | 5.5 | 8.3 | 8.5 | 6.4 | 7.7 | 7.1 | 10.6 |
| large-v2, paper (1.08 / 1.66 GB) | 3.0 | 4.5 | 6.7 | 7.1 | 5.6 | 6.4 | 5.8 | 8.5 |
| large-v2, OpenAI v3 chart (CV15) † | 3.1 | 5.0 | 6.5 | 7.0 | 5.9 | 6.6 | 5.5 | 8.8 |
| large-v3, OpenAI chart (1.08 GB q5_0) | 2.8 | 4.9 | 5.2 | 6.1 | 4.7 | 5.7 | 4.3 | 7.2 |
| large-v3, NVIDIA Canary paper | 3.12 | 4.30 | 5.57 | — | 4.32 ‡ | 5.94 ‡ | 5.97 ‡ | — |
| large-v3-turbo, Whisper Notes run (574 / 874 MB) § | 3.62 | 4.05 | 5.69 | 6.31 | — | 6.31 (CV19) ¶ | — | — |

CV = Common Voice 9 for tiny through large-v2 (paper), Common Voice 15 for the OpenAI v3 chart rows. † large-v2 values read off the chart's bar geometry, ±0.1. ‡ CoVoST2, which is built on Common Voice. § ~150 FLEURS sentences per language, a third party's own harness. ¶ Taken from the primeline German fine-tune's model card.

- **Whisper paper, Appendix D.2.4, Table 13 "WER (%) on Fleurs"** (Radford et al., Dec 2022). Rows run tiny / base / small / medium / large / large-v2:
  - German 27.8 / 17.9 / 10.2 / 6.5 / 5.5 / 4.5
  - Spanish 15.9 / 9.9 / 5.6 / 3.6 / 3.5 / 3.0
  - Dutch 49.0 / 33.0 / 16.4 / 9.9 / 8.3 / 6.7
  - Indonesian 51.7 / 33.1 / 16.3 / 10.2 / 8.5 / 7.1
  - For comparison, English is 12.4 / 8.9 / 6.1 / 4.4 / 4.5 / 4.2 and Malay is 51.2 / 35.1 / 18.9 / 12.2 / 10.2 / 8.7.
  - [Whisper paper](https://arxiv.org/abs/2212.04356)
- **Whisper paper, Appendix D.2.2, Table 11 "WER (%) on CommonVoice9"**, same size order:
  - German 34.5 / 24.5 / 13.0 / 8.5 / 7.7 / 6.4
  - Spanish 30.3 / 19.6 / 10.3 / 6.9 / 6.4 / 5.6
  - Dutch 43.6 / 29.5 / 14.2 / 8.0 / 7.1 / 5.8
  - Indonesian 49.6 / 36.1 / 18.4 / 11.6 / 10.6 / 8.5
  - [Whisper paper](https://arxiv.org/abs/2212.04356)
- **Whisper paper, Table 10 "WER (%) on MLS"** (Multilingual LibriSpeech, read audiobooks; no Indonesian):
  - Dutch 39.4 / 28.4 / 17.2 / 11.7 / 10.2 / 9.3
  - German 24.9 / 17.7 / 10.5 / 7.4 / 6.6 / 5.5
  - Spanish 19.2 / 12.8 / 7.8 / 5.3 / 5.4 / 4.2
  - [Whisper paper](https://arxiv.org/abs/2212.04356)
- **Whisper paper, Table 12 "WER (%) on VoxPopuli"** (parliament speech; no Indonesian):
  - German 27.4 / 20.6 / 14.8 / 12.4 / 11.9 / 11.2
  - Spanish 19.7 / 14.4 / 11.1 / 9.6 / 8.8 / 8.2
  - Dutch 41.9 / 29.4 / 18.8 / 14.9 / 14.0 / 12.9
  - [Whisper paper](https://arxiv.org/abs/2212.04356)
- **Normalisation of all the paper's non-English numbers (Appendix C):** remove text in brackets and parentheses, replace every mark, symbol and punctuation character (Unicode category M, S or P) with a space, lowercase, and collapse whitespace. The paper calls this "an imperfect solution". Because category M is removed, diacritics are effectively stripped too. — [Whisper paper](https://arxiv.org/abs/2212.04356)
- **OpenAI's large-v3 announcement chart** (`language-breakdown.svg`, dated 2023-11-06), large-v3 value labels:
  - Common Voice 15: Dutch 4.3, Spanish 4.7, German 5.7, Indonesian 7.2 (English 9.3)
  - FLEURS: Spanish 2.8, German 4.9, Dutch 5.2, Indonesian 6.1 (English 4.1, Malay 7.3)
  - Large-v2 in the same chart, recovered from the bar geometry: CV15 Dutch 5.5, Spanish 5.9, German 6.6, Indonesian 8.8; FLEURS Spanish 3.1, German 5.0, Dutch 6.5, Indonesian 7.0.
  - The chart does not state its normaliser, and its large-v2 FLEURS German (≈5.0) differs from the paper's 4.5, so the chart's evaluation setup is not identical to the paper's.
  - [openai/whisper language-breakdown.svg](https://github.com/openai/whisper/blob/main/language-breakdown.svg); [openai/whisper README](https://github.com/openai/whisper)
- **Large-v3 release discussion #1762 (Nov 2023):** large-v3 was trained on "1 million hours of weakly labeled audio and 4 million hours of pseudolabeled audio" with 128 mel bins instead of 80. It claims a "10% to 20% reduction of errors compared to large-v2" across languages that score under 60% on Common Voice 15 and FLEURS. — [openai/whisper #1762](https://github.com/openai/whisper/discussions/1762)
- **Independent large-v3 numbers (NVIDIA Canary-1B-v2 / Parakeet-TDT-0.6B-v3 paper, Sept 2025, Appendix B):**
  - FLEURS: German 4.30, Spanish 3.12, Dutch 5.57 (English 4.25)
  - MLS: Spanish 4.89, Dutch 12.08
  - CoVoST2 (Common Voice based): German 5.94, Spanish 4.32, Dutch 5.97
  - No Indonesian; the paper covers 25 European languages. I could not confirm which normaliser it used.
  - [arXiv 2509.14128](https://arxiv.org/abs/2509.14128)
- **Open ASR Leaderboard paper (Oct 2025):** the multilingual track covers only German, French, Italian, Spanish and Portuguese, so there is **no Dutch or Indonesian**. Whisper large-v3 averages German 4.26% and Spanish 3.65% across the track's datasets (4.81% overall). Scoring "removes punctuation and casing, and applies an English text normalization pipeline closely following that of Whisper". The paper gives no small, medium or turbo rows for this track. — [arXiv 2510.06961](https://arxiv.org/html/2510.06961v4)
- **Large-v3-turbo on FLEURS**, Whisper Notes' own run (≈150 read sentences per language, M5 MacBook Air, 2026): Spanish 3.62, German 4.05, Dutch 5.69, Indonesian 6.31. The authors warn that "Read-speech rankings have failed to survive real audio twice in our own testing". — [Whisper Notes](https://whispernotes.app/blog/qwen3-asr-vs-whisper)

### Inferences
- On FLEURS, going from base to small roughly halves WER in all four languages, and going from small to medium takes off roughly another 35–40%. The biggest usability jump for nl and id is base to small: 33% down to 16%.
- The ranking is stable across datasets: Spanish is easiest, German next, and Dutch and Indonesian are last. The one exception is Common Voice, where Dutch is **better** than German at medium and above (medium 8.0 against 8.5; v3 4.3 against 5.7).
- Large-v3 against large-v2 on the OpenAI chart: FLEURS Dutch improves the most (6.5 → 5.2) and FLEURS German barely moves (≈5.0 → 4.9). Taking the paper's v2 German figure of 4.5, the v3 chart's German is no better.

### Gaps
- There is no official per-language table for tiny, base, small or medium re-scored with the v3-era Common Voice 15 setup. The small-model numbers only exist on CV9 and FLEURS from the 2022 paper.
- The Open ASR Leaderboard has no Dutch or Indonesian and no small-model multilingual rows that I could find.
- I found no peer-reviewed benchmark scoring every size tiny through turbo on Dutch.

---

## 2. How much Indonesian degrades at base and small, and whether a size is unusable for captions

### Takeaway
Indonesian is about 3.3× Spanish's WER at base and about 2.9× at small on FLEURS. On real, spontaneous Indonesian speech, even small scores ~31% WER. Base (33–36%) is unusable for Indonesian captions; so is Dutch at base (29–33%). Small (16–18% on benchmarks, ~31% on varied real speech) is marginal at best.

### Cited Findings
- FLEURS, Indonesian against Spanish: base 33.1 vs 9.9, small 16.3 vs 5.6, medium 10.2 vs 3.6, large-v2 7.1 vs 3.0. Common Voice 9: base 36.1 vs 19.6, small 18.4 vs 10.3, medium 11.6 vs 6.9. — [Whisper paper](https://arxiv.org/abs/2212.04356)
- Dutch degrades exactly as much at the small end: FLEURS base 33.0, small 16.4 — [Whisper paper](https://arxiv.org/abs/2212.04356)
- **Zero-shot whisper-small on a varied Indonesian test set** (IDSV, arXiv 2410.08828, Oct 2024) scored WER 30.87 overall (CER 13.84). By speech type:
  - Read, formal, clean: 27.22
  - Read, formal, moderate: 23.04
  - Spontaneous, formal, moderate: 38.85
  - Spontaneous, informal, clean: 40.66
  - Spontaneous, informal, moderate: 22.85
  - The paper does not evaluate tiny, base, medium or large; after fine-tuning, whisper-small beat almost every other model.
  - [arXiv 2410.08828](https://arxiv.org/html/2410.08828v1)
- An Indonesian dialogue-summarisation study (JAIC, Feb 2026) evaluated "six Whisper ASR model variants (from tiny to turbo)" on a synthetic conversational set. The most accurate, labelled "turbo (distil-large-v2)" by the authors, scored **7.97% WER**. The per-size numbers were not visible on the abstract page. The label conflates turbo with a distil, so treat the model's identity with suspicion. — [JAIC article](https://jurnal.polibatam.ac.id/index.php/JAIC/article/view/11826)

### Inferences
- The benchmark-to-real gap is large for Indonesian. whisper-small reads 16–18% on FLEURS and CV (read speech) but ~31% on a mixed read and spontaneous set, and ~39–41% on spontaneous speech. Short-form vertical video is mostly spontaneous speech, so the IDSV numbers are the better predictor.
- I found no published "usable for captions" WER threshold. Reading the tables, base and below are unusable for nl and id: one word in three is wrong. Small gets one word in six wrong on read speech, and worse on spontaneous. The first size plausibly fit for Indonesian captions is medium or turbo.

### Gaps
- There are no published base or medium Indonesian results on spontaneous speech, and no Indonesian result for large-v3 or turbo on anything but FLEURS. The Whisper Notes run and the OpenAI chart are both FLEURS or Common Voice.
- There is no published caption-acceptability threshold tying WER to viewer judgement.

---

## 3. Large-v3-turbo against large-v3 and medium, per language

### Takeaway
OpenAI says turbo "performs similarly to large-v2" across languages, with the largest degradation on **Thai and Cantonese**. None of es, de, nl or id is named as a weak language. On FLEURS, turbo lands within about 0.2–0.8 WER points of large-v3 for the four languages, and it beats medium clearly on Dutch and Indonesian (≈5.7 and 6.3 against 9.9 and 10.2), at roughly the same quantised file size.

### Cited Findings
- Turbo has **4 decoder layers against large's 32**, the same as tiny's decoder. "Across languages, the turbo model performs similarly to large-v2," with "larger degradation on some languages like Thai and Cantonese." It "performs better on FLEURS … than Common Voice." It was fine-tuned without translation data, so translation is not expected to work. Users in the thread report language switching, inconsistent punctuation and degradation on very long files. — [openai/whisper #2363](https://github.com/openai/whisper/discussions/2363)
- The OpenAI chart already shows Thai as a v2-to-v3 outlier: FLEURS large-v3 8.4 against large-v2 ≈11.8. — [openai/whisper language-breakdown.svg](https://github.com/openai/whisper/blob/main/language-breakdown.svg)
- Turbo on FLEURS (third-party run): Spanish 3.62, German 4.05, Dutch 5.69, Indonesian 6.31 — [Whisper Notes](https://whispernotes.app/blog/qwen3-asr-vs-whisper). Against the OpenAI chart's large-v3 (Spanish 2.8, German 4.9, Dutch 5.2, Indonesian 6.1) and the paper's medium (Spanish 3.6, German 6.5, Dutch 9.9, Indonesian 10.2) — [Whisper paper](https://arxiv.org/abs/2212.04356)
- On German Common Voice 19, the original OpenAI turbo scores 6.31 and on Tuda-De 11.45. primeline's German fine-tune of turbo scores 4.28 and 8.10 respectively, and a ggml conversion of it exists. — [cstr/whisper-large-v3-turbo-german-ggml](https://huggingface.co/cstr/whisper-large-v3-turbo-german-ggml)
- ggml file sizes (multilingual) from the ggerganov/whisper.cpp Hugging Face repo:

  | Model | Full | q5 | q8_0 |
  |---|---|---|---|
  | tiny | 77.7 MB | 32.2 MB (q5_1) | 43.5 MB |
  | base | 148 MB | 59.7 MB (q5_1) | 81.8 MB |
  | small | 488 MB | 190 MB (q5_1) | 264 MB |
  | medium | 1.53 GB | 539 MB (q5_0) | 823 MB |
  | large-v3-turbo | 1.62 GB | 574 MB (q5_0) | 874 MB |
  | large-v2 | 3.09 GB | 1.08 GB (q5_0) | 1.66 GB |
  | large-v3 | 3.1 GB | 1.08 GB (q5_0) | — |

  — [ggerganov/whisper.cpp on HF](https://huggingface.co/ggerganov/whisper.cpp/tree/main)

### Inferences
- The turbo and large-v3 rows come from different harnesses (Whisper Notes against OpenAI), so small differences are not meaningful. Turbo's German 4.05 beating v3's 4.9 is almost certainly a harness difference, not a real win. What survives the mismatch is that turbo is in large-v3's band and well ahead of medium for Dutch and Indonesian.
- At q5_0, turbo (574 MB) and medium (539 MB) cost about the same on disk, and turbo is more accurate in all four languages. Medium is dominated.
- For the app's constraints this is decisive and awkward. CLAUDE.md puts the install at ~145 MB against a 150 MB line with base.en q8_0 (81.8 MB). Multilingual **base q8_0 is the same 81.8 MB**, but it is unusable for nl and id (≈33% WER). Every model that is acceptable in all four languages (small at best marginal, medium, turbo) is 190 MB or more and cannot ride in the APK. It would have to be downloaded, or shipped as a per-language asset pack.
- Turbo keeps a large encoder (809M total parameters, as reported in secondary sources seen in search), so on-device encoder time is likely much closer to large than the "faster than tiny" GPU claim suggests. That speed claim should be verified on the A54, not assumed.

### Gaps
- OpenAI published turbo's per-language results only as a chart image in #2363. I could not extract numbers from it, so there are no official turbo es, de, nl or id figures here.
- There is no turbo Indonesian result on spontaneous speech, and no turbo Dutch on Common Voice.

---

## 4. Do ggml quantisations (q5_0, q5_1, q8_0) change WER?

### Takeaway
For large-v3 on clean English, q8_0 and q5_0 are **not worse** than f16 (slightly better, within noise), and the first real degradation is at 4-bit. There are **no published measurements for non-English, or for small and base models, in ggml**. Small models are often assumed to be more fragile under quantisation, but I found no numbers for that.

### Cited Findings
- whisper.cpp v1.9.2, large-v3, LibriSpeech test-clean (2,620 utterances):

  | Level | WER | Size | vs f16 |
  |---|---|---|---|
  | f16 | 5.35% | 2,892 MB | baseline |
  | q8_0 | 5.25% | 1,543 MB | −1.9% relative |
  | q5_0 | 5.19% | 1,010 MB | −3.0% relative |
  | q4_0 | 5.61% | 830 MB | +4.9% relative, "the first statistically significant WER degradation" |

  The author states that CommonVoice, FLEURS and every non-English set are untested and that "results on clean read speech do not generalise". — [yoarajota/whisper-quantization-wer-degradation](https://github.com/yoarajota/whisper-quantization-wer-degradation)
- whisper.cpp discussion #859 reports WERs for quantised tiny through large on two English clips (e.g. small-q4_2 0.09, tiny-q4_0 0.29) but **has no f16 baseline**, so it cannot isolate the effect of quantisation. — [whisper.cpp #859](https://github.com/ggml-org/whisper.cpp/discussions/859)
- whisper-small quantised outside ggml (PyTorch, Quanto, HQQ, bitsandbytes), LibriSpeech (Nov 2025): dynamic int8 "reduc[ed] model size by 57% while improving on the baseline's word error rate". nf4 and int3 reached "up to 71% compression at the cost of accuracy in noisy conditions". — [arXiv 2511.08093](https://arxiv.org/abs/2511.08093)

### Inferences
- q8_0 is the safe choice and q5_0 is very probably safe for large models. For small and base in non-English, nobody has measured it, and the app should A/B q5_1 against q8_0 on its own es, de, nl and id clips before trusting the smaller file.

### Gaps
- There is no published ggml quantisation WER for any non-English language, or for tiny, base, small, medium or turbo.

---

## 5. Punctuation and capitalisation in es, de, nl and id (German nouns), and by size

### Takeaway
Whisper is trained to emit cased, punctuated text: the training data was filtered to exclude all-lowercase or unpunctuated machine transcripts. But it can fall into a "no-punctuation mode", and there are reports of German output coming out all lowercase with no punctuation even from a large model. **No published benchmark measures punctuation or casing accuracy per language or per size**, because every WER above is computed after stripping both.

### Cited Findings
- The paper filters out machine-generated transcripts from training because such systems drop "complex punctuation (exclamation points, commas, and question marks) … or stylistic aspects such as capitalization. An all-uppercase or all-lowercase transcript is very unlikely to be human generated." — [Whisper paper](https://arxiv.org/abs/2212.04356)
- All non-English WER in the paper is scored after removing punctuation and lowercasing (Appendix C) — [Whisper paper](https://arxiv.org/abs/2212.04356). The Open ASR Leaderboard does the same ("removes punctuation and casing") — [arXiv 2510.06961](https://arxiv.org/html/2510.06961v4)
- "Almost no punctuation and letter capitalization in transcript": being autoregressive, Whisper can get stuck in a "no-punctuation mode". Missing punctuation is what causes missing capitalisation. The suggested fix is an `--initial_prompt` written in punctuated prose. — [openai/whisper #290](https://github.com/openai/whisper/discussions/290)
- A faster-whisper user with the **large** model reported German output with "every word in small letters" and no punctuation. The issue is unanswered. — [SYSTRAN/faster-whisper #601](https://github.com/SYSTRAN/faster-whisper/issues/601)
- Turbo users report inconsistent punctuation even with an initial prompt — [openai/whisper #2363](https://github.com/openai/whisper/discussions/2363)

### Inferences
- For burned-in German captions, lowercase nouns look visibly wrong to a native reader, and no WER number above would reveal it. This has to be measured directly on the app's own clips: a casing-sensitive WER, or simply counting lowercase nouns.
- A punctuated, correctly cased initial prompt in the target language is the known lever. CLAUDE.md records that prompt *shape* already caused this app to drop large spans of English transcript, so any language-specific prompt needs the same A/B.

### Gaps
- There is no quantitative punctuation or casing accuracy by model size or language anywhere I could find. Whether small and base are worse at casing than large is plausible but unmeasured.

---

## 6. Hallucination and repetition loops: v2-era against v3 and turbo, and mitigations

### Takeaway
Large-v3 has a well-documented reputation for more hallucination and repetition than large-v2. whisper.cpp's maintainer told users to fall back to v2. The standard mitigations are VAD gating, dropping previous-text context (`-mc 0` in whisper.cpp), beam search and the paper's temperature fallback thresholds. Turbo inherits v3 reports, and users see language switching.

### Cited Findings
- In the large-v3 release thread, a user reports "V3 hallucinates multiple times per 10 minutes" against v2. Others could not replicate the official benchmarks. — [openai/whisper #1762](https://github.com/openai/whisper/discussions/1762)
- whisper.cpp maintainer Georgi Gerganov: "I believe that there is something wrong with the v3 large model, so you should try using large-v2 instead." Users describe repetition lasting 5–45 s (sometimes minutes), phantom "subtitles by" and "thanks for watching" in silences and after music, and "combinations of large-V2 and -mc made a big difference" (`-mc 0`, no previous-text context). — [whisper.cpp #1490](https://github.com/ggml-org/whisper.cpp/discussions/1490)
- Deepgram, **a competing vendor**, on real-world audio (calls, meetings, YouTube; Nov 2023): v3 median WER 53.4 against v2 12.7, and "hallucinates 4x more often". Treat as partisan. — [Deepgram](https://deepgram.com/learn/whisper-v3-results)
- There is a Hugging Face thread titled "Hallucination / repetition" on the large-v3 model card — [openai/whisper-large-v3 discussion 19](https://huggingface.co/openai/whisper-large-v3/discussions/19)
- Turbo users report English words appearing in Japanese output, language switching, and degradation on very long files — [openai/whisper #2363](https://github.com/openai/whisper/discussions/2363)
- The paper's own long-form heuristics:
  - Beam search with 5 beams "to reduce repetition looping which happens more frequently in greedy decoding".
  - Temperature fallback from 0 in steps of 0.2 up to 1.0 when average log-probability is below −1 or the gzip compression ratio is above 2.4.
  - Previous-text conditioning only when temperature is below 0.5.
  - No-speech probability above 0.6 combined with log-probability below −1 as VAD.
  - Initial timestamp constrained to 0–1 s.
  - Table 7 shows each step lowering long-form English WER, "but not evenly". The paper names repeat loops, dropped first or last words and "complete hallucination" as persistent failure modes.
  - [Whisper paper](https://arxiv.org/abs/2212.04356)
- WhisperX reports that VAD-based cut and merge (external VAD boundaries instead of decoded timestamps) gives the lowest insertion error and reduces hallucination and repetition — [WhisperX, arXiv 2303.00747](https://arxiv.org/pdf/2303.00747)

### Inferences
- The app already gates with Silero VAD, which targets the silence and music hallucinations most of these reports describe. For a multilingual model, the cheap additional guards are the no-context setting (`-mc 0` / `no_context`), the paper's compression-ratio and log-probability fallback, and a **forced language** rather than auto-detection. Forcing the language is an inference from turbo's language-switching reports.
- If a large-class model is chosen, turbo against large-v2 is a real trade: v2 has the more stable reputation but is 1.08 GB even at q5_0.

### Gaps
- There is no controlled, peer-reviewed hallucination-rate comparison of v2, v3 and turbo per language. Deepgram's is vendor data. Nothing I found measures hallucination rates for small or medium in es, de, nl or id.

---

## 7. Multilingual distilled Whisper models with ggml builds

### Takeaway
Official distil-whisper is English-only, and its maintainers point multilingual users at turbo. The community multilingual distil I found, multi7, covers es, de and nl but **not Indonesian**, is worse than turbo by its own card, and has no ggml build that I could find. Per-language German fine-tunes exist in ggml.

### Cited Findings
- Distil-Whisper is English-only; for multilingual the project recommends Whisper Turbo — [huggingface/distil-whisper](https://github.com/huggingface/distil-whisper). distil-large-v3 does have a ggml build, but it is English — [distil-whisper/distil-large-v3-ggml](https://huggingface.co/distil-whisper/distil-large-v3-ggml)
- **bofenghuang/whisper-large-v3-distil-multi7-v0.2**:
  - Languages: en, fr, es, de, it, pt, nl. 2 decoder layers, 0.8B parameters, MIT licence, code-switching within a segment.
  - Its own card says it performs "below both the monolingual distilled version and Whisper-Large-v3-Turbo".
  - FLEURS against large-v3: Spanish 5.15 vs 4.22, German 8.28 vs 5.92, Dutch 10.86 vs 6.99.
  - No ggml build is mentioned.
  - [HF model card](https://huggingface.co/bofenghuang/whisper-large-v3-distil-multi7-v0.2)
- German-only: primeline/distil-whisper-large-v3-german, and primeline/whisper-large-v3-turbo-german, which has a ggml conversion (CV19 German 4.28 against original turbo 6.31) — [cstr ggml card](https://huggingface.co/cstr/whisper-large-v3-turbo-german-ggml). A Spanish distil (marianbasti/distil-whisper-large-v3-es) also appears on HF; I did not verify its numbers.

### Inferences
- There is no single small multilingual distil covering all four languages. The practical ggml options are the official sizes (medium, turbo), or one fine-tuned model per language. A model per language would multiply download size, which fits an app that already forces one language per install ("no language picker") only if the language choice moves to install time.

### Gaps
- I found no Indonesian or Dutch distil with published WER and a ggml build. The multi7 model could in principle be converted to ggml (it is a Whisper architecture), but I found no one who has done so and measured it.
