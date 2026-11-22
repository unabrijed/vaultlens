# Deploy the VaultLens frontend

Intended GitHub repository: https://github.com/unabrijed/vaultlens

The ready-to-use frontend variables are in `.env.vercel` on this computer. That file contains a private backend token and is ignored by Git and Docker. The public `.env.vercel.example` shows the variable names without the token.

1. Ensure the application source is pushed to `unabrijed/vaultlens`, then import that repository into Vercel.
2. Use the Next.js framework with repository root as the root directory and Node.js 22.x.
3. Before deploying, copy both variables from your local `.env.vercel` into the project's environment settings. Apply them to Production; also apply to Preview if preview deployments should make live model calls.
4. Deploy. If you change variables after deployment, redeploy so the frontend uses them.
5. Open the deployed frontend and select **Review with Nugen**. A successful result should show model `model_01m818x0xgw183ts`.

Required frontend variables:

| Variable | Value |
| --- | --- |
| VAULTLENS_BACKEND_URL | https://vaultlens-api-production.up.railway.app |
| VAULTLENS_BACKEND_TOKEN | Copy the exact value from local `.env.vercel` |

Both variables are server-side. Do not prefix them with NEXT_PUBLIC_. Do not add NUGEN_API_KEY or VAULTLENS_ROLE=backend to Vercel. The browser calls the frontend's `/api/triage`; the frontend server authenticates to Railway, and Railway calls Nugen.

The committed template does not configure Vercel automatically. Enter the real values in Vercel's environment settings. Keep access protection enabled for this credit-backed demo until application quotas or user authentication are added.

Deploy the `main` branch of `unabrijed/vaultlens`. Keep the real `.env.vercel` file local and transfer its values through Vercel environment settings.
