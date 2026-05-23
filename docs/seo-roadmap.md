# Dealio Marketplace SEO Strategy Build Order Roadmap

This document outlines the phased roadmap for building out the Dealio Marketplace SEO infrastructure, ensuring maximum indexability, dynamic routing efficiency, and user conversion.

## Phase 1: Technical & Audit Foundation (Current Phase)
- **Objective**: Establish documentation, internal linking frameworks, and correct programmatic configurations.
- **Tasks**:
  1. Map out all keywords, topics, and initial page mappings (`seo-topic-map-coverage.md`, `seo-first-30-coverage.md`, and this roadmap).
  2. Implement local internal linking cluster data structures (`internal-linking.js`).
  3. Ensure robust metadata standardizations across pages, canonicalizing all domains to `https://www.dealiomarketplace.com` with the `www` subdomain.

## Phase 2: Configuration & Utility Upgrades (Current Phase)
- **Objective**: Connect dynamic configs to database search parameters and support complex filtering.
- **Tasks**:
  1. Fix database column filters (e.g. `min_revenue` mapping to `annual_revenue` in listings table).
  2. Enable industry + location cross-combinations (e.g., Ontario + HVAC, Toronto + Restaurants).
  3. Integrate financial and quality deal filters (`under-250k`, `cash-flow-over-250k`, `profitable-businesses`, etc.).
  4. Gracefully support partial pages (e.g. `absentee-owner`, `recurring-revenue`) showing high-converting custom copy when database fields are pending.

## Phase 3: Crawlability & Indexation Control (Current Phase)
- **Objective**: Control indexation health and optimize crawler budget.
- **Tasks**:
  1. Inject standard and conditional JSON-LD schema schemas (WebPage, BreadcrumbList, FAQPage, ItemList) into `page.js`.
  2. Implement conditional `noindex` rules for combined industry-location pages that have zero active listings to prevent empty page indexation.
  3. Generate dynamic `sitemap.xml` that performs single-pass listing checks, filtering out any empty combined pages and mirroring `noindex` rules.
  4. Deploy `robots.js` containing rules for crawlers and pointing to the absolute sitemap.

## Phase 4: Interactive Seller & Buyer Funnels (Completed)
- **Objective**: Deploy high-converting lead generation pages.
- **Tasks**:
  1. Build `/exit-readiness-scorecard` interactive seller quiz.
  2. Build `/buyer-profile-builder` interactive buyer acquisition wizard.
  3. Deploy `/how-much-is-my-business-worth` with targeted SEO config reusing the valuation calculator.
  4. Sync leads captured from these pages to GoHighLevel (GHL) via `api/inquiries`.

## Phase 5: Authority Content & Guide Distribution (Completed)
- **Objective**: Create content downloads and templates to secure high search intent.
- **Tasks**:
  1. Deploy buyer checklists and templates (e.g., Due Diligence Checklist, LOI Template).
  2. Deploy seller preparation tools (e.g., CIM Teaser Template, Confidential Sale Guide).

## Phase 6: Broker & Partner Growth Funnels (Completed)
- **Objective**: Capture B2B broker listing flow.
- **Tasks**:
  1. Deploy landing pages targeted at Canadian business brokers looking to generate leads.
  2. Implement partner CTA blocks within comparison pages and listings feeds.
