# November 23 development evaluation

The deployment works, but the current aligned 0.5B model is not reliable enough for incident assessment. We kept the original prompt after three stricter candidates failed to improve exact category/severity agreement. UI and validation changes make these limitations visible; they do not correct the model's factual reasoning.

## Method

32 sequential live Nugen requests: eight existing synthetic cases per prompt, one answer each. Model `model_01m818x0xgw183ts`, temperature 0.1, max_tokens 500, stream true. No retries or fallback annotations. Records carry UTC timestamps (November 22 UTC, November 23 local Asia/Kolkata). No retraining, deployment of a replacement model, or additional benchmark generation was performed.

The eight cases began as held-out cases, but were inspected during prompt iteration. They are now development cases, not an independent test set. Training documents informed the rubric. No statistical generalization claim is supported by this small sample.

| Prompt | Exact category | Exact severity | Both | Answers with exact evidence quotes |
|---|---:|---:|---:|---:|
| Original, retained | 0/8 | 4/8 | 0/8 | 0/8 |
| JSON example, rejected | 0/8 | 0/8 | 0/8 | 2/8 |
| JSON instructions, rejected | 0/8 | 0/8 | 0/8 | 1/8 |
| Five-section rubric, rejected | 0/8 | 1/8 | 0/8 | 2/8 |

Exact category scoring requires the precise rubric label. For example, `Oracle (price-feed issue)` fails the format contract even though it contains the correct category word. This table therefore measures label compliance plus correctness, not semantic classification alone. JSON-instruction prose with inline fields is malformed under the parser and is not repaired. Invalid/missing answers remain in the denominator. No transport requests failed in this run.

Quote scoring requires a parsed five-section review with at least one quote and all its quoted excerpts matching the input literally. Case and punctuation matter. A text match is not evidence that the conclusion is correct. The final scorer was applied consistently to all saved answers; individual raw run records retain the validation result from their original run.

## Manual findings, not automatic factual-accuracy scores

- Original h01 invents a five-minute-old reference price and calls the heartbeat interval 47 minutes. The input states a five-minute heartbeat and a price last updated 47 minutes ago.
- Original h05 says fallback validation was not completed, contradicting the report's explicit successful validation.
- The JSON-example candidate copied pipe-separated label alternatives into category and severity.
- The final five-section candidate often returned Medium regardless of containment or contradictory evidence, and supplied no useful next checks on several cases.
- The embedded instruction in h07 caused a wrong answer in all four variants. Text matching alone does not detect this instruction-following error.

The app flags missing sections, out-of-rubric labels, and nonmatching quotes. It does not claim to detect every hallucination, contradiction, injection, or wrong severity. No scores or responses were fabricated, and no expected labels replace model output.

## Reproduce

Raw responses: `data/evaluation/prompt-comparison-initial.json`, `prompt-comparison-v2.json`, and `prompt-comparison-v3.json`. Exact prompts are in `data/evaluation/prompts.json`; aggregate scores are in `summary.json`.

Recompute locally without inference or credits:

```sh
node scripts/summarize-evaluation.mjs
```

To make eight new paid inference calls from a network with Nugen access, set the server key and model ID in the environment and select exactly one variant:

```sh
node --env-file=.env scripts/evaluate.mjs --variant baseline > artifacts/evaluation-baseline.jsonl
```

Create `artifacts/` first. Other accepted variants: `revised`, `revised-v2`, `revised-v3`. This writes JSONL results; it does not overwrite the committed comparison JSON. Do not tune further on these eight cases and call them unseen evaluation data. Select the next alignment/model configuration using separate development material, then author a fresh independent test set.
