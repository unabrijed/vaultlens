# VaultLens alignment and deployment handoff

Prepared November 22, 2026. No documents have been uploaded, no alignment has run, and no model has been deployed by this workspace. API DNS resolution currently fails with ENOTFOUND. These are prepared instructions and tooling, not evidence of completed Nugen steps.

## 1. Create the aligned model in Nugen

Use your Nugen platform account. Check available credits and the estimated cost before starting; the invitation's $50 is not a verified current balance. Upload only these two original synthetic educational documents:

- `data/training/01-triage-policy.txt` (685 whitespace-delimited words)
- `data/training/02-mechanisms-and-examples.txt` (752 words)

Wait for both documents to become READY. Create an alignment named `VaultLens DeFi triage v1`, select these documents, and select an available alignment-capable base model. Qwen/Qwen2.5-0.5B-Instruct is the initial candidate, not a verified available choice for this account. Wait for successful completion. Save the alignment ID and identify its resulting model; verify the model belongs to that alignment and chosen base model. Deploy it in Nugen and wait for deployment readiness. Copy the exact model ID offered for inference, not an invented name or merely the alignment ID.

Do not upload `data/evaluation/holdout.json`. Its eight cases are a small initial test set, not a statistically robust benchmark. Keep them out of training and alignment feedback. Their severity labels follow this project's explicit educational rubric.

The API alternative, from a network that can reach Nugen, is:

```sh
node --env-file=.env scripts/nugen-workflow.mjs models
node --env-file=.env scripts/nugen-workflow.mjs upload
node --env-file=.env scripts/nugen-workflow.mjs document-status DOCUMENT_ID
node --env-file=.env scripts/nugen-workflow.mjs align BASE_MODEL_ID DOCUMENT_ID_1 DOCUMENT_ID_2
node --env-file=.env scripts/nugen-workflow.mjs alignment-status ALIGNMENT_ID
node --env-file=.env scripts/nugen-workflow.mjs aligned-models
node --env-file=.env scripts/nugen-workflow.mjs model MODEL_ID
node --env-file=.env scripts/nugen-workflow.mjs deployment-status MODEL_ID
```

Replace placeholders with returned IDs. Check each document separately. The CLI performs a single request per invocation and does not deploy models, retry writes, enforce a dollar budget, or automatically poll. Inspect platform state after ambiguous write timeouts before retrying. Read-only model output may include account metadata; do not publish it indiscriminately. The older `nugen_workflow.py` is an obsolete offline preview.

## 2. Host the application

There are two deployments: Nugen hosts the aligned model; your Node server hosts the VaultLens web application. The app does not need a GPU or a database. It needs outbound HTTPS access to `api.nugen.in`. A static-only host cannot run the inference route.

Use the included Dockerfile with your container host. Set secrets at runtime; `.dockerignore` excludes local environment files. The runtime listens on `PORT` (default 3000) on all interfaces. It runs as the non-root node user. No Nugen credentials are needed to build the image.

```sh
docker build -t vaultlens .
docker run --rm -p 3000:3000 --env-file .env.production vaultlens
```

Create `.env.production` locally from `.env.production.example` and fill the values; do not commit it. Alternatively configure these runtime variables in your host dashboard:

```dotenv
NUGEN_API_KEY=your_existing_key
NUGEN_MODEL_ID=exact_deployed_aligned_model_id
```

`NUGEN_ALIGNMENT_ID` and `NUGEN_BASE_MODEL_ID` are optional recordkeeping; the app does not validate them at runtime. Never prefix secrets with NEXT_PUBLIC_. Restart or redeploy the app after changing runtime variables. Production refuses live inference if NUGEN_MODEL_ID is absent; an explicitly configured base model still does not satisfy the hiring exercise.

For a conventional Node host without Docker, use Node 22.18+, install with `yarn install --frozen-lockfile`, build with `yarn build`, and start with `yarn start --hostname 0.0.0.0`. Set PORT through the host environment. The container path instead starts the generated standalone server directly.

The paid inference route currently has no user authentication or quota enforcement. Keep the demo behind hosting access protection until application access controls are added. Cross-origin checks alone are not authentication. The request timeout is 45 seconds, so configure the hosting request timeout above that duration.

## 3. Verify before submission

Open the app and run one synthetic report through Review with Nugen. Confirm that the response shows the intended aligned model ID and does not display an error. Check demo mode separately. Test the eight held-out cases, preserve raw model answers and model ID, and compare category, severity, exact evidence, uncertainty and useful next checks against the rubric. Missing, malformed or failed answers count as failures. Do not claim accuracy until this is executed.

Save evidence of document readiness, completed alignment, deployed model, successful inference and a working app. Check mobile layout and failure states. Document remaining limitations honestly. The invitation requires upload, alignment, deployment, inference and an application; publication and screenshots support review but are not explicitly mandated by the invitation.

References checked November 22:
- Upload schema, plain-text requirements and readiness: https://docs.nugen.in/api-reference/documents/upload-documents
- Alignment request: https://docs.nugen.in/api-reference/alignment-projects/create-alignment
- Deployment and asynchronous status: https://docs.nugen.in/api-reference/models/deploy-aligned-model

The CLI follows these rendered official references. Raw OpenAPI retrieval and real end-to-end CLI behavior remain unverified because of DNS failure.

## Railway API + Vercel frontend (November 22 setup)

Railway project: `vaultlens` (`6b0de356-6569-4d2a-b0fd-97a825341e2c`). Service: `vaultlens-api`. Backend URL: `https://vaultlens-api-production.up.railway.app`.

Railway has NUGEN_API_KEY, NUGEN_MODEL_ID=model_01m818x0xgw183ts, VAULTLENS_ROLE=backend, VAULTLENS_BACKEND_TOKEN, PORT=3000, and NODE_ENV=production configured. Verified through Railway: Nugen model model_01m818x0xgw183ts is DEPLOYED, belongs to alignment_01m818tjnm28q4td, and uses Qwen/Qwen2.5-0.5B-Instruct. The alignment status is READY. Health checks use `/api/health`. Health success means the application is running, not that Nugen is ready.

Vercel should deploy this same Next.js source with two server-only environment variables:

```dotenv
VAULTLENS_BACKEND_URL=https://vaultlens-api-production.up.railway.app
VAULTLENS_BACKEND_TOKEN=<same private token as Railway>
```

The exact values are prepared in ignored `.env.vercel`; do not publish that file. Do not set VAULTLENS_ROLE=backend in Vercel. Do not copy the Nugen API key into Vercel. The browser keeps calling same-origin `/api/triage`; Vercel forwards the request with the private token to Railway. Railway rejects requests without this token. This protects direct backend access, but the Vercel frontend still needs hosting access protection or application-level quotas before unrestricted public use.

The default frontend route allows up to 60 seconds for the Railway response. Railway does the model call. There is no database or GPU requirement for either app host.

Railway CLI deployment:
```sh
railway up --service vaultlens-api --detach
```

Build/restart/health settings are configured on the Railway service directly. No deprecated railway.json is needed. No GitHub repository is connected, so local changes require another CLI deployment. The local directory is not a Git repository yet.
