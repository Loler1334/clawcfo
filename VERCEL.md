# Deploy ClawCFO website on Vercel

## Two different URLs (do not mix them up)

| URL | What it is | What you see |
|-----|------------|--------------|
| `*.up.railway.app` | **Agent API** (backend) | JSON `{"ok":true,...}` |
| `*.vercel.app` | **Website** (frontend) | ClawCFO landing page |

Opening Railway in the browser shows JSON - that is correct.
The product website must be on Vercel.

## Vercel setup (step by step)

1. https://vercel.com -> Add New Project -> Import `Loler1334/clawcfo`

2. **Configure Project:**
   - Framework Preset: **Next.js**
   - **Root Directory:** click Edit -> select `packages/web` -> Continue

3. **Environment Variables:**

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_AGENT_API` | `https://personal-cfoagent-production.up.railway.app` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0xa1Bc3e7906e99878bBa45941677d803E6eE7cd2c` |

4. Click **Deploy**

5. After deploy, open `https://your-project.vercel.app` - you should see **ClawCFO** dark landing page.

6. Update Railway **ALLOWED_ORIGINS** with your Vercel URL:
   ```
   ALLOWED_ORIGINS=https://your-project.vercel.app,http://localhost:3000
   ```

## If you already deployed wrong (JSON on Vercel)

1. Vercel -> Project -> **Settings** -> **General**
2. **Root Directory** -> set to `packages/web` -> Save
3. **Deployments** -> Redeploy latest

Or delete project and create again with steps above.
