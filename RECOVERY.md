# RECOVERY.md — Bylder herstel na laptopverlies of crash

Doel: bij verlies/crash van de laptop **altijd weer kunnen bouwen**. De productie
draait op **Vercel** (env-vars staan daar) — die valt dus **niet** om als je laptop
sterft. Het enige onvervangbare lokale bestand is **`app/.env.local`** (secrets,
bewust niet in git). Zet die inhoud in een wachtwoordmanager (1Password/Bitwarden).

> Dit bestand bevat **geen** secret-waarden — alleen de variabele-namen en waar je
> elke waarde ophaalt. Veilig om in git te staan.

---

## 1. Repos

| Project | Repo | Lokale map | Host |
|---|---|---|---|
| Website (bylder.com, statisch + serverless) | `github.com/bylderdotcom/website` | `~/Documents/GitHub/website` | Vercel |
| App (app.bylder.com, Next.js SaaS) | `github.com/bylderdotcom/app` | `~/Documents/GitHub/app` | Vercel |

## 2. Nieuwe laptop — snel weer aan de slag

```bash
# 1. Tools: git, Node v24, npm   (bv. via nvm)
# 2. Repos clonen
git clone https://github.com/bylderdotcom/website.git
git clone https://github.com/bylderdotcom/app.git
# 3. Secrets terugzetten (zie sectie 3 of 4)
# 4. App installeren + draaien
cd app && npm install && npm run dev
```

De **website** is statisch (plain HTML + Python-generators in `_scripts/` / `generate*.py`);
geen lokaal `.env` nodig om te draaien. De **app** heeft `app/.env.local` nodig.

## 3. Env-variabelen + waar je elke waarde ophaalt

### App — `app/.env.local`
| Variabele | Waar ophalen |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → *Project URL* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → *anon public* |
| `SUPABASE_SERVICE_ROLE_KEY` 🔒 | Supabase → Settings → API → *service_role* (geheim!) |
| `SUPABASE_ACCESS_TOKEN` 🔒 | Supabase → Account → *Access Tokens* (Management API) |
| `PAYNL_API_TOKEN` 🔒 | Pay.nl dashboard → API-tokens |
| `PAYNL_SERVICE_ID` | Pay.nl dashboard → Services (SL-xxxx-xxxx) |
| `ANTHROPIC_API_KEY` 🔒 | console.anthropic.com → API Keys |
| `DEV_SECRET` 🔒 | Zelfgekozen willekeurige string (mag je opnieuw genereren) |
| `NEXT_PUBLIC_APP_URL` | `https://app.bylder.com` (prod) / `http://localhost:3000` (dev) |

### Website — Vercel-envs (géén lokaal bestand; staan in het Vercel-project)
| Variabele | Waar ophalen |
|---|---|
| `STRIPE_SECRET_KEY` 🔒 | dashboard.stripe.com → Developers → API keys |
| `STRIPE_PRICE_CENTS` | Configwaarde (bv. `2900`), zelf instellen in Vercel |
| `ANTHROPIC_API_KEY` 🔒 | console.anthropic.com → API Keys |
| `PAYNL_API_TOKEN` 🔒 | Pay.nl dashboard |
| `PAYNL_SERVICE_ID` | Pay.nl dashboard |

🔒 = geheim — nooit committen, bewaar in je wachtwoordmanager.

## 4. Snelste herstel: `vercel env pull`

Omdat alle env-vars in Vercel staan, kun je ze met de Vercel CLI lokaal terughalen
**zonder** ze handmatig te verzamelen:

```bash
npm i -g vercel
vercel login
cd app            # (of website)
vercel link       # koppel aan het juiste Vercel-project
vercel env pull .env.local   # schrijft alle env-vars naar .env.local
```

Dit is de aanrader na een crash: één commando en je hebt je lokale env terug.

## 5. Vuistregels
- **Nooit** `.env.local` committen — de `.gitignore` van beide repos dekt dit al (geverifieerd).
- Bewaar de inhoud van `app/.env.local` **óók** in je wachtwoordmanager als backup naast Vercel.
- Productie hangt aan **Vercel env-vars**, niet aan je laptop → prod blijft staan.
- Roteer een sleutel als je vermoedt dat 'ie gelekt is (Supabase/Pay.nl/Anthropic/Stripe dashboards).

## 6. Belangrijk om te weten
- DNS/mail: nameservers bij TransIP; root-mail via Google Workspace; transactionele mail via Resend (`smtp.resend.com`, afzender `noreply@bylder.com`).
- Vercel **spend management staat AAN** → als een site offline is, check eerst Vercel → Billing / Spend Management (kan deployments pauzeren).
- Content-generators (website): `generate*.py` + `_scripts/*.py` + `template_v2.html`.
