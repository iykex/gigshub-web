Prompt for a developer / UI-UX lead

You are an experienced Next.js programmer and UI-UX designer. Build GiGSHUB, a simple data purchase platform. Keep the interface minimal. Make every flow usable by a child or a grandmother.

Goals

* Simple checkout with option to buy without an account.
* Agent model with registration fee of GHS 30.00.
* Admin panel with live pricing edits.
* Fast, mobile-first UI with iOS 26 liquid glass cards.
* Secure payments via Paystack and wallet topup.

Design constraints

* Top navbar: pill style.
* Mobile bottom navbar: iOS 26 glassy pill icons.
* Card style: small glassy cards with subtle blur and rounded corners.
* Typography: legible, large tap targets, concise labels.
* Colors: high contrast for text. Soft glass background for cards.
* Actions: clear primary button, single CTA per screen.
* Microcopy: short phrases. Use direct instructions. Show order status clearly.

Core features

* Browse data packages by provider.
* Quick buy option for guest checkout.
* Full checkout for logged-in users with wallet option.
* Agent signup flow with one-time fee payment.
* Agent dashboard: wallet topup, order history, sales log, toggle agent mode.
* Admin dashboard: manage pricing, manage topups, manage orders, toggle agent mode, view sales, update content, manage users.

Data pricing source

* Store all pricing in the database.
* Admin edits pricing from dashboard.
* Pricing must be versioned and auditable.

Deliverables for initial sprint

* App shell and routing with Next.js 16 app router.
* UI library scaffolding with shadcn components.
* Cloudflare D1 schema and seed data for all packages.
* Paystack integration for payments.
* Wallet topup flow.
* Simple admin UI to edit pricing and publish.
* Agent signup flow and verification.

PRD.md (product requirements)

Project name: GiGSHUB
One line: Simple data purchase app for Ghana telcos. Guest checkout and agent model included.

Users

* Guest buyer. Buys data without account.
* Registered buyer. Uses wallet and order history.
* Agent. Pays GHS 30 registration fee. Sells data, uses wallet.
* Admin. Manages pricing, orders, users, content.

Core flows

* Browse packages by provider.
* Quick buy: enter phone, choose package, pay via Paystack or wallet.
* Account signup: email or phone, passwordless OTP as optional.
* Agent registration: form, fee payment, status pending approval.
* Dashboard for agents: topup wallet, place orders, view sales.
* Admin panel: pricing editor, order manager, topup manager, user manager.

Functional requirements

* All pricing stored in Cloudflare D1.
* Admin must edit pricing and save draft or publish.
* Orders persist with status: pending, processing, success, failed, refunded.
* Support MTN Afa registration entries.
* Support instant data products for AirtelTigo and Telecel.
* Wallet ledger with entries for topup, purchases, refunds.
* Audit logs for pricing changes.

Non functional requirements

* Performance: pages load under 1.5s on 4G.
* Accessibility: WCAG AA baseline.
* Security: HTTPS, server-side validation, rate limits.
* Reliability: retry logic for provider API failures.
* Maintainability: clear module boundaries and tests.

Acceptance criteria

* Guest checkout completes an order and returns success receipt.
* Admin edits pricing and changes reflect in storefront within 10 seconds.
* Agent topup updates wallet balance and appears in sales log.
* All transactions logged with reference IDs.

AI Development Guidelines

Scope

* Use AI for tasks that improve developer productivity and UX testing.
* Do not use AI to sign transactions or approve payouts.
* Use AI for automated tests, content suggestions, UI copy variants, and anomaly detection in sales logs.

Rules

* All model outputs must be reviewed by a human before production use.
* Do not allow AI to auto-publish pricing edits. AI may suggest only.
* Log every AI suggestion with user identifier and timestamp.
* Keep PII out of model prompts. Hash or redact phone numbers and emails before sending to any external service.

Use cases

* Generate UI microcopy variants for A/B testing.
* Summarize sales logs for daily reports.
* Create unit test skeletons for new components.
* Suggest layout improvements from user session metrics.

Privacy

* Do not store raw PII in AI request logs.
* Redact sensitive fields before external calls.
* Keep audit trail for each AI-assisted action.

Project structure (Next.js 16, app router)

root

* app

  * layout.tsx
  * page.tsx (marketing)
  * provider (shared providers)
  * auth

    * route.ts (API for auth)
    * components (login, otp)
  * store

    * page.tsx (storefront)
    * [provider]

      * page.tsx (provider listing)
      * [packageId]

        * page.tsx (package details)
  * checkout

    * page.tsx
    * route.ts (create order)
  * dashboard

    * agent

      * page.tsx
      * settings
    * admin

      * page.tsx
      * pricing

        * page.tsx (pricing editor)
        * route.ts (update pricing)
  * api

    * paystack

      * route.ts (webhook)
    * provider-proxy

      * route.ts (proxy to telco APIs)
* components

  * ui (shadcn based)
  * cards (glassy card)
  * nav (top pill nav, mobile bottom nav)
  * forms
* lib

  * db.ts (Cloudflare D1 client)
  * payments.ts (Paystack)
  * wallet.ts
  * providers (MTN, AirtelTigo, Telecel)
* prisma or migrations (if using tools locally)
* scripts

  * seed_pricing.sql
* tests

  * e2e
  * unit
* public

  * images
* styles

  * globals.css
  * glass.css

Technology notes

* UI: shadcn/ui components for primitives and layout.
* Styling: Tailwind CSS.
* DB: Cloudflare D1 for pricing, orders, users.
* Payments: Paystack webhooks for confirmations.
* Hosting: Vercel or Cloudflare Pages with Worker edge functions if needed.
* API calls to telcos should run server-side only.
* Use incremental static rendering for marketing pages.
* Use server components for data heavy pages.

Database schema (Cloudflare D1 SQL)

Tables

* users

  * id TEXT PRIMARY KEY
  * name TEXT
  * phone TEXT
  * email TEXT
  * role TEXT CHECK(role IN ('guest','user','agent','admin'))
  * wallet_balance REAL DEFAULT 0
  * created_at DATETIME DEFAULT CURRENT_TIMESTAMP

* pricing

  * id INTEGER PRIMARY KEY AUTOINCREMENT
  * provider TEXT
  * name TEXT
  * size TEXT
  * price REAL
  * agent_price REAL NULL
  * product_code TEXT
  * is_active INTEGER DEFAULT 1
  * updated_by TEXT
  * updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  * version INTEGER DEFAULT 1

* pricing_audit

  * id INTEGER PRIMARY KEY AUTOINCREMENT
  * pricing_id INTEGER
  * old_price REAL
  * new_price REAL
  * changed_by TEXT
  * changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  * comment TEXT

* orders

  * id TEXT PRIMARY KEY
  * user_id TEXT NULL
  * phone TEXT
  * provider TEXT
  * package_id INTEGER
  * amount REAL
  * status TEXT CHECK(status IN ('pending','processing','success','failed','refunded'))
  * reference TEXT
  * created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  * updated_at DATETIME

* wallet_ledger

  * id INTEGER PRIMARY KEY AUTOINCREMENT
  * user_id TEXT
  * change REAL
  * balance_after REAL
  * type TEXT
  * reference TEXT
  * created_at DATETIME DEFAULT CURRENT_TIMESTAMP

Seed SQL for pricing (partial, include all entries)

INSERT INTO pricing (provider, name, size, price, agent_price, product_code) VALUES
('MTN','MTN Regular 1GB','1GB',5.5,4.9,'mtn_reg_1gb'),
('MTN','MTN Regular 2GB','2GB',12,9.8,'mtn_reg_2gb'),
('MTN','MTN Regular 3GB','3GB',18,14.7,'mtn_reg_3gb'),
('MTN','MTN Regular 4GB','4GB',23,19.2,'mtn_reg_4gb'),
('MTN','MTN Regular 5GB','5GB',27,25,'mtn_reg_5gb'),
('MTN','MTN Regular 6GB','6GB',34,29,'mtn_reg_6gb'),
('MTN','MTN Regular 8GB','8GB',42,38.6,'mtn_reg_8gb'),
('MTN','MTN Regular 10GB','10GB',47,45,'mtn_reg_10gb'),
('MTN','MTN Regular 15GB','15GB',74,70,'mtn_reg_15gb'),
('MTN','MTN Regular 20GB','20GB',90,86,'mtn_reg_20gb'),
('MTN','MTN Agent 30GB','30GB',125,125,'mtn_agent_30gb'),
('MTN','MTN Agent 50GB','50GB',200,200,'mtn_agent_50gb'),
('MTN','MTN Agent 100GB','100GB',399,399,'mtn_agent_100gb');

INSERT INTO pricing (provider, name, size, price, agent_price, product_code) VALUES
('Telecel','Telecel 5GB','5GB',28,23,'telecel_5gb'),
('Telecel','Telecel 10GB','10GB',47,42,'telecel_10gb'),
('Telecel','Telecel 15GB','15GB',65,60,'telecel_15gb'),
('Telecel','Telecel 20GB','20GB',85,80,'telecel_20gb'),
('Telecel','Telecel 25GB','25GB',104,98,'telecel_25gb'),
('Telecel','Telecel 30GB','30GB',130,117,'telecel_30gb'),
('Telecel','Telecel 40GB','40GB',165,157,'telecel_40gb'),
('Telecel','Telecel 50GB','50GB',193,187,'telecel_50gb'),
('Telecel','Telecel 100GB','100GB',390,385,'telecel_100gb');

INSERT INTO pricing (provider, name, size, price, agent_price, product_code) VALUES
('AirtelTigo','AT Ishare 1GB','1GB',5,4.3,'at_ishare_1gb'),
('AirtelTigo','AT Ishare 2GB','2GB',10,8.6,'at_ishare_2gb'),
('AirtelTigo','AT Ishare 3GB','3GB',15,NULL,'at_ishare_3gb'),
('AirtelTigo','AT Ishare 4GB','4GB',20,18,'at_ishare_4gb'),
('AirtelTigo','AT Ishare 5GB','5GB',25,20.6,'at_ishare_5gb'),
('AirtelTigo','AT Ishare 6GB','6GB',30,24.8,'at_ishare_6gb'),
('AirtelTigo','AT Ishare 7GB','7GB',35,28.6,'at_ishare_7gb'),
('AirtelTigo','AT Ishare 8GB','8GB',40,33,'at_ishare_8gb'),
('AirtelTigo','AT Ishare 10GB','10GB',50,40.2,'at_ishare_10gb'),
('AirtelTigo','AT Ishare 15GB','15GB',70,60.2,'at_ishare_15gb');

INSERT INTO pricing (provider, name, size, price, agent_price, product_code) VALUES
('AirtelTigo','AT Bigtime 20GB','20GB',70,68,'at_bigtime_20gb'),
('AirtelTigo','AT Bigtime 30GB','30GB',80,78,'at_bigtime_30gb'),
('AirtelTigo','AT Bigtime 40GB','40GB',90,88,'at_bigtime_40gb'),
('AirtelTigo','AT Bigtime 50GB','50GB',110,103,'at_bigtime_50gb'),
('AirtelTigo','AT Bigtime 100GB','100GB',120,190,'at_bigtime_100gb'),
('AirtelTigo','AT Bigtime 200GB','200GB',350,350,'at_bigtime_200gb');

Admin pricing editor requirements

* Editor lists providers and packages.
* Inline edit for price and agent_price.
* Validate numeric input and minimum price thresholds.
* On save, create pricing_audit entry.
* Preview changes before publish.
* Publish push updates to storefront with optimistic locking.

API endpoints (examples)

* GET /api/pricing

  * Returns active pricing list.
* POST /api/orders

  * Creates order, reserves stock, returns payment reference.
* POST /api/paystack/webhook

  * Validates signature, updates order and wallet ledger.
* POST /api/admin/pricing/update

  * Auth required. Updates pricing and writes audit.
* POST /api/wallet/topup

  * Creates topup order and updates wallet on confirmation.

Telco integration

* Proxy all telco calls through server endpoints.
* Retry up to 3 times on failure.
* Store telco response log in orders table.

Testing checklist

* Unit tests for pricing editor and wallet ledger.
* E2E tests for guest checkout and agent registration.
* Load test for 200 orders per minute.

Security checklist

* Server-side validation for phone and amount.
* Rate limit API endpoints.
* Webhook signature verification for Paystack.
* Use environment variables for secrets.
* Encrypt sensitive fields at rest when required.

Deployment notes

* Build on Vercel with environment variables for D1 and Paystack keys.
* Use Cloudflare Workers for provider proxies if lower latency required.
* Schedule daily backup of D1 data to object storage.

Admin UX for pricing edits (quick)

* Show provider list.
* Show package table with size, current price, agent price, last updated.
* Inline edit cell for price.
* Save draft button.
* Publish button with confirmation modal.
* Show last 5 changes and who edited them.

Minimal UI copy examples

* Buy now
* Quick buy
* Enter phone number
* Pay with Paystack
* Top up wallet
* Become agent
* Agent registration fee GHS 30.00
* Order status: pending, processing, success, failed

Notes about guest checkout

* Store minimal info: phone and order reference.
* Offer account creation after purchase with prefilled phone.

