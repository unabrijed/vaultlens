# Nugen API reconciliation

No authenticated Nugen calls have been made. Live writes are blocked.

Sources checked during planning: https://docs.nugen.in/llms.txt and cookbook commit 383bc9c067550afe0c5c89ca503459f4f535ff36.
Raw specification https://api.nugen.in/openapi-public.json could not be retrieved; local curl fails DNS resolution. Rendered reference evidence is not full OpenAPI validation.

|Operation|Reference endpoint / payload|Finding|
|---|---|---|
|Upload|POST /api/v3/documents/create; multipart files, optional names/categories|Plain text; at least 500 words per document; poll document status|
|Benchmark|POST /api/v3/benchmarks/create; document_ids, n_samples|Cookbook uses num_questions; reference prose/schema disagree on requiredness; set explicit count|
|Alignment|POST /api/v3/alignment-projects/create; alignment_name, base_model_id, document_ids; optional workflow_id, benchmark_id, description|Retrieved cookbook and rendered reference agree|
|Deployment|POST /api/v3/models/{model_id}/deployment|No body; keep early disabled; asynchronous|
|Inference|POST /api/v3/inference/chat/completions; model, messages, temperature, max_tokens, stream|Validate real model and readiness before use|

Never select the first aligned model blindly. GET /api/v3/models/{model_id} must match expected alignment_id and base_model_id. Never probe alternative paid endpoints after an error.

Read-only example (credentials remain environment variables):
```sh
curl --fail --silent --show-error https://api.nugen.in/api/v3/models/base --header "Authorization: Bearer $NUGEN_API_KEY"
```
Do not run write examples until raw schema reconciliation is complete.

## November 21 inference integration

The user supplied the inference endpoint and streaming payload and added a server key. The app now implements that request with `Qwen/Qwen2.5-0.5B-Instruct` as its default model. This authorizes the requested inference integration; earlier blanket live-write blocking above describes the original prototype. Upload, alignment and deployment remain unimplemented.

One synthetic inference smoke test was attempted. It did not receive a provider response. A separate unauthenticated reachability check returned DNS `ENOTFOUND` for `api.nugen.in`. Credential validity, model access and actual provider stream compatibility remain unverified. The key was not printed or sent to any other host.
