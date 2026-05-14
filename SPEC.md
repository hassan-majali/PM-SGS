# SPEC.md — PM Portal Feature Specification
> The source of truth for what this product does and how it should behave.

---

## 🎯 Product Overview

**PM Portal** is a full-stack internal project management platform built for managing client projects end to end. It organizes work by Clients → Projects → Workspaces, where each project workspace has 8 specialized tabs covering every aspect of project delivery.

**Live URLs:**
- Frontend: `https://pm-sgs-frontend.vercel.app`
- Backend API: `https://pmtools-sgs.up.railway.app`

---

## 🏛️ Information Architecture

```
PM Portal
└── Clients
    └── Client Workspace
        └── Projects
            └── Project Workspace
                ├── Tab 1: Dashboard
                ├── Tab 2: Deliverables
                ├── Tab 3: Financials
                ├── Tab 4: Resources
                ├── Tab 5: Documents
                ├── Tab 6: Weekly Activity Log
                ├── Tab 7: Risks & Issues
                └── Tab 8: Mandays
└── Initiatives (separate module)
```

---

## 📦 Feature Specifications

---

### 1. Client Management
**Purpose:** Top-level container for all client work

**Features:**
- Create a client with name and details
- Open client workspace
- View all projects under a client
- Create new projects from within the client workspace

---

### 2. Project Workspace — Tab 1: Dashboard
**Purpose:** High-level overview of project health

**Features:**
- Summary cards (budget, progress, risks)
- Charts powered by Recharts
- Data pulled from all other tabs in real time

---

### 3. Project Workspace — Tab 2: Deliverables
**Purpose:** Track all project deliverables and their billing status

**How it works:**
- Add a deliverable: Name, Description, Qty, Unit Price
- Total = Qty × Unit Price (computed live before saving, stored on save)
- Table shows: DELIVERABLE | QTY | UNIT PRICE | TOTAL | BILLED | REMAINING
- BILLED = sum of all qty billed across all invoices for this deliverable (yellow)
- REMAINING = qty − billed (color-coded: green = plenty, yellow = low, red = critical)
- Excel import supported (xlsx library)

**Data model:**
```
Deliverable {
  name, description
  qty          // total units
  unitPrice    // price per unit
  amount       // stored = qty × unitPrice
  billedQty    // computed: sum of PaymentPlan.billedQty (not stored)
  remainingQty // computed: qty - billedQty (not stored)
}
```

---

### 4. Project Workspace — Tab 3: Financials
**Purpose:** Invoice management linked to deliverables

**How it works:**
1. Select a deliverable (shows unit price, total qty, already billed, available to bill)
2. Enter Qty to Bill (capped at remaining qty — cannot overbill)
3. Invoice Amount auto-computes = qty × unit price (read-only field)
4. Set: Invoice Date, Status, Fiscal Year, Invoice Number
5. Attach supporting documents

**Table columns:** DELIVERABLE | QTY BILLED | AMOUNT | INVOICE DATE | STATUS | FISCAL YEAR | ATTACHMENT

**Invoice status workflow:**
```
PENDING → IN_PROGRESS → INVOICED → COLLECTED
```

**Summary cards (filtered by fiscal year):**
- Forecasted — total deliverable value
- Invoiced — amount invoiced to date
- Collected — amount received
- Pending — invoiced but not yet collected

**Data model:**
```
PaymentPlan {
  deliverableId  // linked deliverable
  billedQty      // units billed in this invoice
  amount         // auto-computed = billedQty × deliverable.unitPrice
  invoiceDate
  status         // PENDING | IN_PROGRESS | INVOICED | COLLECTED
  fiscalYear
  invoiceNumber
  attachment
}
```

---

### 5. Project Workspace — Tab 4: Resources
**Purpose:** Track team members assigned to the project

**Features:**
- Add resources with name and role
- Track allocation per resource

---

### 6. Project Workspace — Tab 5: Documents
**Purpose:** Central file storage for project documents

**Features:**
- Upload files (powered by multer)
- View uploaded documents
- Download documents

---

### 7. Project Workspace — Tab 6: Weekly Activity Log
**Purpose:** Track weekly progress and activities

**Features:**
- Create weekly log entries
- Record activities completed, planned, and blockers

---

### 8. Project Workspace — Tab 7: Risks & Issues
**Purpose:** Risk register and issue tracker

**Features:**
- Add risks and issues with severity and status
- Track mitigation actions

---

### 9. Project Workspace — Tab 8: Mandays
**Purpose:** Track effort in person-days

**Features:**
- Contracted mandays
- Used mandays
- Billed mandays
- Variance tracking

---

### 10. Initiatives Module
**Purpose:** Track RFP and Sutherland-driven initiatives separately from regular projects

**Features:**
- Create an initiative with name and context
- Add action items with owners and due dates
- Mark support needed
- Export full initiative to PDF (jsPDF + jspdf-autotable)

---

## 🔌 Integrations & Libraries

| Library | Purpose |
|---|---|
| Recharts | Dashboard charts |
| xlsx | Excel file import |
| multer | File upload handling |
| jsPDF + jspdf-autotable | PDF export |
| Prisma ORM | Database access layer |
| Radix UI | Accessible UI components |

---

## 🔐 Authentication (Planned — Not Yet Built)

- User login / logout
- Role-based access: Admin, Viewer
- Session management

---

## 📊 Current Feature Completion

| Feature | Built | Tested |
|---|---|---|
| Client management | ✅ | ⏳ |
| Deliverables tab | ✅ | ⏳ |
| Financials tab | ✅ | ⏳ |
| Dashboard tab | ✅ | ⏳ |
| Resources tab | ✅ | ⏳ |
| Documents tab | ✅ | ⏳ |
| Weekly Activity Log | ✅ | ⏳ |
| Risks & Issues tab | ✅ | ⏳ |
| Mandays tab | ✅ | ⏳ |
| Initiatives module | ✅ | ⏳ |
| Excel import | ✅ | ⏳ |
| PDF export | ✅ | ⏳ |
| Authentication | ❌ Planned | — |
| User roles | ❌ Planned | — |
