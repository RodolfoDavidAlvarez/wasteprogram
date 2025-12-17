# SSW Waste Diversion App - Project Context & Requirements

> **Document Created:** 2025-12-09
> **Last Updated:** 2025-12-09
> **Version:** 1.0.0

---

## Update Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-09 | 1.0.0 | Initial document creation with full requirements from original PDF |

---

## 1. Project Overview

**Organization:** Soil Seed & Water (SSW)
**Program:** Waste Diversion Program
**Application:** Waste Intake Data Tracking and Reporting System

### Purpose
A comprehensive system to track, maintain, and manage waste intake operations including:
- Client onboarding and management
- Waste intake form processing
- Contamination compliance tracking
- Environmental impact reporting
- Billing and revenue tracking

---

## 2. Original Requirements Document

### WASTE INTAKE DATA TRACKING AND REPORTING PLAN

#### 2.1 Client & Account Details

**Required Fields:**
- Account Number (auto-generated: SSW-XXXXXX)
- Company Name
- Operational Contact (name, email, phone)
- Billing Contact (name, email, phone) - if different
- Service Address (street, city, state, zip)
- Contract Status (active, pending, inactive)
- Tipping Fee Rate ($/ton - may vary by client)
- Notes/Special Instructions

#### 2.2 Waste Type & Description

**Accepted Waste Types:**
- Food Waste (produce, dairy, bakery, prepared foods)
- Green Waste / Yard Trimmings
- Wood Chips / Tree Debris
- Manure (horse, cow, chicken)
- Brewery/Winery Byproducts (spent grain, pomace)
- Expired Packaged Foods (depackaged)
- Coffee Grounds
- Other Organic Materials (specify)

**Required Fields:**
- Primary Waste Type (dropdown selection)
- Secondary Waste Types (if mixed load)
- Description/Notes
- Source Industry (restaurant, farm, grocery, brewery, etc.)

#### 2.3 Quantity & Volume Tracking

**Required Fields:**
- Estimated Weight (tons) - provided by client
- Actual Weight (tons) - recorded at intake
- Weight Variance (calculated)
- Measurement Method (scale ticket, estimated, client-provided)
- Scale Ticket Number (if applicable)

#### 2.4 Packaging & Container Types

**Packaging Options:**
- Loose/Bulk
- Pallets
- Totes/Bins
- Roll-off Container
- Bags (compostable/plastic - note if needs depackaging)
- Drums/Barrels

**Required Fields:**
- Primary Container Type
- Number of Containers
- Container Size/Capacity
- Depackaging Required? (Yes/No)
- Packaging Notes

#### 2.5 Delivery & Pickup Logistics

**Delivery Types:**
- Client Delivery (client drops off at SSW)
- SSW Pickup (SSW collects from client)
- Third-Party Hauler

**Required Fields:**
- Delivery Type
- Vehicle Type (pickup truck, dump truck, flatbed, semi)
- Driver Name
- Company (if third-party)
- License Plate
- Scheduled Date/Time Window
- Actual Arrival Time
- Pickup Address (if SSW pickup)
- Destination Site (which SSW facility)

#### 2.6 Contamination Compliance Checklist

**Pre-Intake Certification (Client must confirm):**
- [ ] Material is free of non-organic contaminants
- [ ] No hazardous materials included
- [ ] No treated/painted wood
- [ ] No meat/dairy (if applicable to facility)
- [ ] Packaging is compostable or will be removed

**On-Site Inspection (SSW Staff):**
- [ ] Visual inspection completed
- [ ] Load matches description
- [ ] Contamination level acceptable (< X%)
- [ ] Photos taken (if issues found)

**Contamination Findings:**
- Contamination Found? (Yes/No)
- Contamination Type (plastic, metal, glass, hazardous, other)
- Contamination Level (none, minor <5%, moderate 5-15%, severe >15%)
- Action Taken (accepted, accepted with surcharge, rejected, partial acceptance)
- Surcharge Applied? (amount)

#### 2.7 Schedule & Frequency

**Frequency Options:**
- One-time
- Weekly
- Bi-weekly
- Monthly
- On-call/As-needed

**Required Fields:**
- Service Frequency
- Preferred Day(s) of Week
- Preferred Time Window
- Next Scheduled Pickup/Delivery
- Recurring Schedule ID (for repeat clients)

#### 2.8 Special Handling Instructions

**Optional Fields:**
- Temperature Requirements (refrigerated waste)
- Timing Constraints (perishable - process within X hours)
- Equipment Needed (forklift, loader, etc.)
- Access Instructions (gate code, contact on arrival)
- PPE Requirements
- Other Special Instructions

#### 2.9 Internal Review & Approval Fields

**Workflow Status:**
- Pending Review
- Approved
- Scheduled
- In Transit
- Received
- Processing
- Completed
- Rejected

**Approval Fields:**
- Reviewed By (staff name)
- Review Date
- Approved By
- Approval Date
- Rejection Reason (if applicable)
- Internal Notes

#### 2.10 Billing & Charges

**Calculated Fields:**
- Base Tipping Fee (weight × rate)
- Contamination Surcharge (if applicable)
- Rush/After-hours Fee (if applicable)
- Pickup/Hauling Fee (if SSW pickup)
- Depackaging Fee (if applicable)
- Total Charge
- Invoice Status (pending, invoiced, paid)
- Invoice Number
- Payment Date

---

## 3. Dashboard Requirements

### 3.1 Key Metrics (YTD & Monthly)

- Total Waste Diverted (tons)
- Total Tipping Revenue ($)
- Number of Intakes
- Active Clients
- Pending Intakes

### 3.2 Environmental Impact Calculations

Using EPA WARM Model approximations:

| Metric | Formula |
|--------|---------|
| CO2 Avoided | tons diverted × 0.5 (metric tons CO2e) |
| Landfill Space Saved | tons diverted × 1.2 (cubic yards) |
| Compost Produced | tons diverted × 0.4 (tons) |
| Methane Avoided | tons diverted × 0.1 (metric tons) |

### 3.3 Charts & Visualizations

- Monthly waste volume trend (bar chart)
- Waste by type distribution (pie chart)
- Revenue trend (line chart)
- Client activity breakdown

### 3.4 Quick Access Widgets

- Recent Intakes (last 5)
- Upcoming Schedule (next 7 days)
- Pending Approvals
- Contamination Alerts

---

## 4. Monthly Reporting Requirements

### 4.1 Diversion Summary Report

- Total tons diverted (by waste type)
- Comparison to previous month/year
- Top 10 contributing clients
- Contamination incident summary

### 4.2 Client Activity Report

- Per-client breakdown
- Tonnage and revenue by client
- Service frequency analysis

### 4.3 Environmental Impact Report

- CO2 equivalents avoided
- Landfill diversion metrics
- Compost production estimates

### 4.4 Financial Summary

- Revenue by waste type
- Revenue by client
- Outstanding invoices
- Collection rate

---

## 5. Technical Implementation

### 5.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma |
| Charts | Recharts |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| State | Zustand |

### 5.2 Database Schema

**Core Models:**
- `Client` - Company information, contacts, billing
- `Contract` - Service agreements
- `WasteIntake` - Individual intake records
- `ContaminationReport` - Contamination incidents
- `WasteTypeConfig` - Waste type settings
- `DailyOperations` - Daily summaries
- `EnvironmentalMetrics` - Impact tracking
- `User` - System users

### 5.3 API Routes

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/clients` | GET, POST | List/create clients |
| `/api/clients/[id]` | GET, PUT, DELETE | Single client operations |
| `/api/intakes` | GET, POST | List/create intakes |
| `/api/intakes/[id]` | GET, PUT, DELETE | Single intake operations |
| `/api/dashboard` | GET | Dashboard data |

### 5.4 Pages/Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard |
| `/intake/new` | New intake form |
| `/intakes` | Intake list |
| `/intakes/[id]` | Intake detail |
| `/clients` | Client list |
| `/clients/new` | New client form |
| `/clients/[id]` | Client detail |
| `/reports` | Reports dashboard |
| `/schedule` | Schedule view |
| `/impact` | Environmental impact |
| `/contamination` | Contamination log |
| `/settings` | System settings |

---

## 6. Seed Data

### 6.1 Sample Clients

1. **Green Valley Farms** (SSW-ABC123) - Organic farm, $45/ton
2. **Sunset Brewery Co** (SSW-DEF456) - Spent grain, $40/ton
3. **Fresh Market Grocery** (SSW-GHI789) - Expired produce, $50/ton
4. **City Parks Department** (SSW-JKL012) - Green waste, $35/ton

### 6.2 Waste Type Configurations

| Code | Name | Category | Default Rate |
|------|------|----------|--------------|
| food_waste | Food Waste | organic | $45/ton |
| green_waste | Green Waste | green_waste | $35/ton |
| wood_chips | Wood Chips | wood | $30/ton |
| brewery_grain | Brewery Grain | organic | $40/ton |
| manure | Manure | manure | $25/ton |

---

## 7. Future Enhancements

### Phase 2 (Planned)
- [ ] User authentication (NextAuth.js)
- [ ] Role-based access control
- [ ] Email notifications
- [ ] PDF invoice generation
- [ ] Client portal

### Phase 3 (Future)
- [ ] Mobile app
- [ ] GPS tracking for pickups
- [ ] Automated scheduling
- [ ] Integration with accounting software
- [ ] Advanced analytics

---

## 8. Commands Reference

```bash
# Development
npm run dev          # Start dev server

# Database
npm run db:push      # Push schema to database
npm run db:seed      # Seed sample data
npm run db:reset     # Reset and reseed database

# Build
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run linter
```

---

## 9. Environment Variables

```env
DATABASE_URL="file:./dev.db"
```

For production (PostgreSQL):
```env
DATABASE_URL="postgresql://user:password@host:5432/waste_diversion"
```

---

## 10. Contact & Support

**Organization:** Soil Seed & Water
**Program:** Waste Diversion Program
**Support Email:** operations@soilseedwater.com

---

*This document serves as the single source of truth for the Waste Diversion App project requirements and should be updated with each significant change.*
