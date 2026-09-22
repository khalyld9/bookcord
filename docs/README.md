# Bookcord — User & Admin Flowcharts

> School library system for checking textbook stock and reserving titles (ICT • Grade 11–12)  
> Stack: **Next.js 16 + Supabase** • Auth: Supabase Auth + Google OAuth

Two **separate** flowcharts — User and Admin are independent.

---

## Files — separate by role

| File | Role | What it is |
|------|------|------------|
| [`user-flow.html`](user-flow.html) | **User** | Standalone User flowchart: landing → auth → catalog → book detail (stock check) → Save / Reserve / Request Restock → My Books (PENDING→READY→CLAIMED) + Saved • Syllabi • History • Profile • Booky. Includes high-res PNG embedded + vector Mermaid diagram. |
| [`admin-flow.html`](admin-flow.html) | **Admin** | Standalone Admin flowchart: `/login?desk=admin` → guard → Overview → 5 desks: Inventory, Reservations, Claim Desk (QR scan → issue_book), Checkouts, Chat Inbox. Every write is an audited RPC. Includes PNG + Mermaid. |
| [`flowcharts.html`](flowcharts.html) | **Combined** | Master view with both flows **separate sections** + Statuses/RPCs table + condensed ER diagram + end-to-end example. Keep for printable combined PDF. |
| `bookcord-user-flow.png` | User | High-res image for docs/slides — title **Bookcord — User Flow** (no admin) |
| `bookcord-admin-flow.png` | Admin | High-res image for docs/slides — title **Bookcord — Admin Flow** (no librarian term) |

All mirrored to `Bookcord/public/docs/` for direct web serving and preview.

---

## How to view

- **User only:** open `docs/user-flow.html` (or `/docs/user-flow.html` on the preview server)
- **Admin only:** open `docs/admin-flow.html`
- **Both:** open `docs/flowcharts.html` — has both as distinct, separated sections (User on top, Admin below)
- Each page has **Download SVG** (vector) and **Print / PDF** (`Ctrl+P`).

Terminology: the privileged role is called **Admin** everywhere (not Librarian). Sign-in is ` /login?desk=admin` → `requireAdmin` guard (role `ADMIN` && status `ACTIVE`).

---

## Quick legend

- **Dark pill** = Start / End
- **White card** = Page / View
- **Amber diamond** = Decision / guard
- **Crimson** = Write — DB insert or RPC (`reserveBook`, `restock_book`, `issue_book`, `return_book`)
- **Cream** = Wait / notification

Enums: `ReservationStatus` PENDING→READY→CLAIMED/CANCELLED, `IssueStatus` ISSUED→RETURNED, `RestockRequestStatus` PENDING→RESTOCKED/DISMISSED.
