# SIH26100 Production-Oriented Website Foundation (v1.2)

Working full-stack foundation for Bidder Portal + Procurement Officer Portal.

## What works now (v1.2)

- Authentication (JWT cookie + middleware + RBAC)
- Tenders: Create, List, Detail
- Bids: Create draft, Submit, List
- **Document Upload** (simulated storage + DB record + verification stub)
- **Compliance engine** (mock adapters → score + risk + AI recommendation)
- **Officer Decision** (Qualify / Disqualify / Clarification + notify bidder)
- **Evaluation pages**: Technical, Financial, Comparative, Shortlisting (live data)
- **Notifications** (in-app + mark read)
- **Profile / Settings** (edit company / department details)
- Audit trail on all important actions
- Seed data + live dashboards

## Demo accounts

Password for all: `Password@123`

| Role    | Email                 |
|---------|-----------------------|
| Officer | officer@sih.gov.in    |
| Bidder  | bidder1@abctech.com   |
| Admin   | admin@sih.gov.in      |

## Quick start

```bash
docker compose up -d
cp .env.example .env
npm install
npx prisma db push
npm run seed
npm run dev
```

Open http://localhost:3000 → Login.

## Still remaining for true production

See `docs/PRODUCTION-GAPS.md`:
- Real SSO/MFA, DSC/eSign
- Authorized GeM/GSTN/PAN/Udyam/... connectors
- Real binary file upload to S3/MinIO + malware scan + OCR
- Background workers
- Managed infrastructure, WAF, SIEM, pen-test, etc.

This is a **strong Stage-1 / Stage-2 foundation** ready for further production hardening.


## BidShield unified build

This build combines the polished BidShield marketing website with the bidder and procurement-officer application. The Next.js application is the canonical runtime. The public home page is the redesigned marketing experience; authenticated/role workflows remain available under `/bidder` and `/officer`, with the existing tender, bid, compliance, evaluation, documents, audit, reports, notifications, decision and settings routes preserved.
