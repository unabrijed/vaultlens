# VaultLens

Educational DeFi incident-triage hiring exercise with fixed demo annotations and a server-side Nugen inference integration. Live inference through Railway has been verified with model_01m818x0xgw183ts. The first answer showed quality issues; full evaluation remains outstanding.

## Run

Node.js 22.18+ and Yarn Classic:
```sh
yarn install
# If .env already contains your key, preserve it; otherwise copy .env.example to .env.local.
yarn dev
yarn typecheck
yarn build
yarn test
```
Open http://localhost:3000. **Review demo incident** shows fixed annotations. **Review with Nugen** sends the report to Nugen through the server; it never substitutes demo output on failure.

Set `NUGEN_API_KEY` in `.env` or `.env.local`. `NUGEN_MODEL_ID` defaults to `Qwen/Qwen2.5-0.5B-Instruct`. Keys stay server-side; environment files are ignored. The integration follows the supplied streaming request example with a 500-token cap and a 45-second timeout. Streamed output is collected into a complete response before display.

## Status

Implemented: responsive demo, custom-report inference route and UI, streaming response handling, validation and error handling, initial scorer and integration tests. This is a local prototype; add authentication and per-user quotas before making the paid inference route publicly accessible.

Prepared: two synthetic training documents, eight held-out cases, an API workflow CLI, and Docker packaging. See [deployment handoff](docs/DEPLOYMENT.md) for exact steps and environment variables.

Verified: Nugen alignment READY, aligned model DEPLOYED, and live Railway inference HTTP 200. Railway hosts the API with private-token access. Vercel frontend creation is pending account connection.

Outstanding: evaluation runner and results, auditing the remote training inputs, browser validation/screenshots, and GitHub publication. Credit balance remains unconfirmed.
