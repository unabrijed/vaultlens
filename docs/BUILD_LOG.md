# Build log

Implemented a new Next.js/TypeScript offline prototype in the empty workspace using Yarn. Added responsive incident examples, explicit deterministic-demo labeling, disabled custom inference, workflow and evaluation status views, a server route returning an honest unavailable error, request-preview skeleton, API reconciliation notes, and an initial offline scorer.

No credentials were read or printed. No authenticated Nugen requests or paid operations were attempted. Raw OpenAPI retrieval failed with DNS resolution error. Yarn dependency installation encountered network resolution failures. Typecheck, build, and dev were attempted but cannot run without dependencies. Two Python scorer tests pass through yarn test.

## Limitations

This is a partial implementation, not a completed hiring submission. Corpus, holdout, full evaluator, executable workflow, model validation, screenshots, CI, and public GitHub repository remain outstanding. No metrics are claimed. API previews are explicitly incomplete and cannot execute.

## Honest 90-second prototype demo

0–15s: Explain educational incident triage and the synthetic-data boundary.
15–45s: Select each fixed example, run its annotation, and inspect evidence and next checks.
45–65s: Show that edited input cannot silently receive a canned model answer.
65–80s: Show workflow blockers and the evaluation empty state.
80–90s: State that no model was trained or evaluated and describe remaining API verification and approval gates.

Screenshots have not been captured because the app could not be launched without dependencies. See API_NOTES.md for a read-only cURL example and source limitations.

## Design iteration

Replaced the dark prototype presentation with a cool-white/graphite design and cobalt accents. Added a code-rendered SVG lens with a finite assembly sequence, HTML incident preview, replay control, shared incident selection, anchor/focus handoff into the working demo, animated findings, and active navigation. Preserved fixed-demo labels and all live-inference blocks. The shell styling also applies to Corpus and Evaluation.

Responsive rules stack the layout below 900px and adapt controls and artwork for narrow screens. CSS gates all motion behind prefers-reduced-motion: no-preference, so changing the preference removes active animations. No images, videos, animation libraries, or web fonts were added. No backend behavior changed.

Validation: dependency installation retried but encountered network failures. Typecheck/build cannot complete without installed dependencies. Browser screenshots and interaction recording remain unverified; responsive and accessibility behavior have only been reviewed in source. Do not treat this as browser-validated production UI.

## November 21: server-side inference

Connected the supplied Nugen streaming request format to a separate live-review action, using the provided base-model ID by default and keeping credentials on the server. Added bounded input, timeout, SSE parsing across chunk boundaries, completion checks, generic provider errors and a distinct live-output label. Fixed demo annotations remain independently available. Updated configuration and installed dependencies with a Yarn lockfile.

Validation: four new Node tests and the two Python scorer tests pass. Production build passes. Next.js added its standard TypeScript settings during build, resolving the initial dependency declaration-check errors. One live synthetic request failed before receiving a provider response; an unauthenticated reachability check confirmed DNS ENOTFOUND for api.nugen.in. Live credentials, model access and output remain unverified. No training, deployment or evaluation run was performed. Browser interaction checks and original submission deliverables remain outstanding.

## November 22: alignment and deployment handoff

Prepared two original educational plain-text documents (685 and 752 words), eight separate held-out cases, and a Node CLI for explicit upload/alignment and read-only status calls. Checked rendered official upload, alignment and deployment references. API reachability still fails with ENOTFOUND; no upload or alignment was executed and no resulting model ID exists yet.

Added standalone Next.js output, a multi-stage non-root Dockerfile, secret-excluding dockerignore, production environment template and deployment handoff. Production inference now requires an explicit model setting. Build and typecheck pass; five Node tests plus two Python tests pass. CLI syntax/help checks pass. Docker image build, container startup, browser interactions and real provider behavior remain unverified. User will perform deployment. No credits were knowingly consumed by this preparation.

## November 22: Railway deployment and Nugen verification

Created Railway project vaultlens (6b0de356-6569-4d2a-b0fd-97a825341e2c), service vaultlens-api, domain https://vaultlens-api-production.up.railway.app. Deployment 3968e95f-ed1d-4b88-97ed-21b599c5399d includes Docker runtime, private backend token, health endpoint, and Vercel server-side proxy support. Build and typecheck pass; seven Node tests and two Python tests pass. Railway health endpoint returned HTTP 200; unauthenticated inference returned 401.

From Railway, verified Nugen model model_01m818x0xgw183ts has deployment_status DEPLOYED, alignment_id alignment_01m818tjnm28q4td and base_model_id Qwen/Qwen2.5-0.5B-Instruct. Alignment status returned READY. A synthetic report through the public Railway API with the private token returned HTTP 200, source nugen and the correct model ID. This is a connectivity smoke test, not a quality pass: the answer used Market Manipulation instead of Oracle and introduced a prior-day comparison absent from the input. Full held-out evaluation remains necessary.

Vercel account is not connected and no CLI credentials are configured. User requested a new VaultLens frontend project. Prepared server-only variables in ignored .env.vercel, including the matching Railway private token. Frontend deployment awaits account access. Local Corpus/Evaluation pages now reflect the verified model state; these frontend-only updates follow the Railway API release.

Removed a real API key the user had placed in the publishable .env.production.example. The key appeared in tool output before removal; rotate it. The original .env is retained and ignored. Temporary duplicate secret files were deleted. No secrets are in Docker build context or application browser variables.
