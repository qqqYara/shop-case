# Backend

Strapi CMS with PostgreSQL. Admin is at [http://localhost:1337/admin](http://localhost:1337/admin), API at [http://localhost:1337/api](http://localhost:1337/api).

Needs Node 20+ and Docker (for Postgres).

## Setup

From this folder:

```bash
cp .env.example .env
npm install
```

`.env.example` already matches the local Docker database (`shop_case` / `strapi` / `strapi` on port `5432`). Replace the `toBeModified` secrets in `.env` before going beyond local use.

## Start

From the repo root, start Postgres, then Strapi:

```bash
npm run db:up
npm run dev:backend
```

Or from this folder, after the database is up:

```bash
npm run develop
```

On first run, open [http://localhost:1337/admin](http://localhost:1337/admin) and create the admin user.

Stop the database with `npm run db:down` from the repo root.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run develop` | Dev server with auto-reload |
| `npm run build` | Build the admin panel |
| `npm run start` | Serve without auto-reload |

email: admin@admin.com
password: Password123