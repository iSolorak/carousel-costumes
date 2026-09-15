# Deploying to the VPS

## First-time setup

```bash
git clone <your-repo-url> sakis
cd sakis
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — keep `file:./dev.db` (or point somewhere persistent)
- `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` — generate a hash with
  `node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"`
- `SESSION_SECRET` — generate with
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `UPLOADS_DIR` — an absolute path **outside** the repo/build output, e.g.
  `/var/www/sakis-uploads`, so uploaded costume images survive redeploys
- `SITE_URL` — your real domain, e.g. `https://sakiscostumes.com` (used for
  sitemap/OG tags)

Then:

```bash
npm ci
npm run db:migrate      # creates the SQLite DB / applies schema
npm run db:seed         # optional: adds 4 demo costumes to see the design
npm run build
pm2 start ecosystem.config.js
pm2 save                # persist across reboots
pm2 startup             # follow the printed instructions once, so PM2 survives a reboot
```

Copy `deploy/nginx.conf.example` to `/etc/nginx/sites-available/sakis`, edit
`server_name`, symlink it into `sites-enabled`, `nginx -t && systemctl reload nginx`,
then run `certbot --nginx` for HTTPS.

## Every later deploy

```bash
npm run deploy
```

This runs: `git pull` → `npm ci` → apply DB migrations → `next build` →
`pm2 restart` (or `pm2 start` the first time). Run it from the project
directory on the VPS.
