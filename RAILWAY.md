# Railway - fix failed builds

Railway auto-detected the monorepo and created **4 services**. Only **one** is needed.

## What to delete in Railway UI

Delete these services (click service -> Settings -> Danger -> Delete):

- `@personal-cfo/bot` - run bot on your PC, not Railway
- `@personal-cfo/web` - deploy website on **Vercel**, not Railway
- `contracts` - smart contract already deployed, not a server

## What to keep

Keep **one** service for the agent API:

- Rename `@personal-cfo/agent` to `clawcfo-agent` (optional)

## Configure the agent service

1. Click `@personal-cfo/agent` (or create **Empty Service** -> **GitHub Repo** -> clawcfo)
2. **Settings** -> **Build**:
   - Builder: **Dockerfile**
   - Dockerfile path: `Dockerfile`
   - Root directory: `/` (repo root, NOT packages/agent)
3. **Variables** -> add env vars (see DEPLOY.md)
4. **Networking** -> **Generate Domain**
5. Test: `https://YOUR-URL/health`

## Why builds failed

Railway tried to build each npm workspace separately with Nixpacks. The bot and web packages are not standalone servers in this repo. Only the root `Dockerfile` runs the agent.
