# Session Notes - Waste Diversion App

---

## Field Team Schedule Portal - Vision & Roadmap

**Live URL**: https://wasteprogram.vercel.app/schedule

### What It Does Now (v1.0)

The Schedule page is a **mobile-first portal** for field staff to track incoming deliveries in real-time:

**Today View (Default Tab)**
- See all deliveries scheduled for today at a glance
- Navigate between days using prev/next arrows
- Tap any load card to see full details (VR number, tonnage, ETA, notes)
- Quick stats: Delivered vs Pending count
- "Back to Today" button when viewing other days

**Overview Tab**
- Complete list of all loads with VR numbers
- Toggle between List view and By Day view
- Total tonnage tracking (delivered + remaining)
- Project summary (Client, Origin, Generator, Material)

**Calendar Tab**
- Monthly calendar view
- Tap any day to see that day's deliveries
- Color-coded: Today (blue), Has deliveries (green)

### Coming Soon (v2.0)

**Mark as Unloaded** (Button visible, coming soon)
- One-tap confirmation when a load is unloaded at the facility
- Automatically updates status in real-time
- Timestamp recorded for records

**Upload Documentation**
- Upload weight tickets directly from phone camera
- BOL (Bill of Lading) attachments
- Any shipment documentation
- All docs linked to the specific load record

### Future Features (v3.0+)

**SMS Notifications**
- Automatic text when a new load is scheduled
- ETA updates sent to field team
- Delay/reschedule alerts
- Delivery confirmation reminders

**Email Notifications**
- Daily schedule summary (morning email)
- Weekly delivery reports
- New VR number alerts
- Integration with Soil Seed & Water Gmail

**Real-Time Updates**
- Push notifications for schedule changes
- Live ETA tracking
- Driver communication portal

**Reporting**
- Tonnage reports by date range
- Client delivery summaries
- Environmental impact calculations
- Export to CSV/PDF

---

## 2025-12-17 (Evening) - UI Polish + Mobile Responsive

### What We Did
- Added Tonnage column to loads table (20 tons placeholder per load)
- Created OverviewTable component with List/By Day toggle views
- Made entire schedule page mobile-responsive
- Polished Calendar view for mobile (compact cells, tap to see details)
- Drafted team email with delivery schedule link
- Added "Today" tab as default view for mobile-first experience
- Created TodayView component with clickable load cards
- Added detail modal with "Mark as Unloaded" button (disabled, Coming Soon)
- Added Upload Documentation placeholder for weight tickets/BOL
- Improved button contrast and visibility

### Key Changes
- `src/components/schedule/TodayView.tsx` - NEW client component with clickable cards, modal, action buttons
- `src/components/schedule/OverviewTable.tsx` - New client component with toggle
- `src/app/schedule/page.tsx` - Integrated OverviewTable & TodayView, Today tab is now default
- `src/components/schedule/Calendar.tsx` - Mobile-responsive redesign

### Known Issues / TODO
- **Soil Seed & Water Gmail MCP needs re-authentication**
  - Location: `~/.soilseed-mcp/`
  - Has `credentials.json` but missing `token.json`
  - Error: `unauthorized_client`
  - Need to run OAuth flow to complete setup
  - For now, using Better Systems AI Gmail for all emails

---

## 2025-12-17 - Gmail MCP Working + Calendar Updated with All VR Numbers

### What We Did
- Confirmed dual Gmail MCP setup working (both Better Systems AI + Soil Seed & Water)
- Enabled Gmail API in Google Cloud Console for Soil Seed & Water project
- Extracted all VR numbers from Casey Tucker emails (Vanguard Renewables)
- Updated public schedule calendar with complete delivery data

### VR Numbers Extracted & Added to Calendar

**Nestle Dog Food Loads (11 total - Original batch):**
| Date | VR Number | Status |
|------|-----------|--------|
| Thu 12/11 | VR121125-109, VR121125-110 | Delivered |
| Fri 12/12 | VR121225-98, VR121225-99 | Delivered |
| Mon 12/15 | VR121525-49 | Delivered |
| Mon 12/15 | VR121525-50 | Delayed → Delivered 12/17 |
| Tue 12/16 | VR121025-117, VR121625-45 | Delivered |
| Wed 12/17 | VR121725-41, VR121725-72 | Delivered |
| Thu 12/18 | VR121825-74 | Scheduled |

**Tyson Tolleson Load (Separate):**
| Date | VR Number | Status |
|------|-----------|--------|
| Thu 12/18 | VR121825-90 | Scheduled |

**12 Additional Dog Food Loads (VR numbers pending from Casey):**
| Date | Loads | Status |
|------|-------|--------|
| Thu 12/18 | 1 | Scheduled (VR pending) |
| Fri 12/19 | 2 | Scheduled (VR pending) |
| Mon 12/22 | 3 | Scheduled (VR pending) |
| Tue 12/23 | 2 | Scheduled (VR pending) |
| Wed 12/24 | 1 | Scheduled (VR pending) - Christmas Eve |
| Mon 12/29 | 3 | Scheduled (VR pending) |

### Key Changes
- `/src/app/schedule/page.tsx` - Updated `getManualSchedule()` with all VR data
- Added Tyson Tolleson load (separate from Nestle)
- Added 12 pending loads with placeholder tickets until Casey sends VR numbers
- Status tags: "arrived" for completed, "moved" for delayed, "scheduled" for upcoming

### Closed Days (per email confirmation)
- Christmas Day: Dec 25, 2025
- Dec 30 - Jan 2: Closed
- Reopening: Monday, Jan 5, 2026

---

## 2025-12-09 - Initial Build Complete

### What We Did
- Created full Next.js 14 app from SSW Waste Intake PDF requirements
- Set up Prisma + SQLite database with comprehensive schema
- Built dashboard with YTD stats, charts, environmental impact
- Created intake form with full contamination checklist
- Built client management pages
- Seeded database with sample data (4 clients, 28 intakes)
- Fixed Server/Client component boundary issue with icons
- Created PROJECT_CONTEXT.md with all original requirements

### Key Changes
- `/src/app/page.tsx` - Dashboard with stats cards, charts, recent intakes
- `/src/components/dashboard/*` - All dashboard components
- `/src/components/intake/IntakeForm.tsx` - Full intake form
- `/prisma/schema.prisma` - Database models
- `/prisma/seed.ts` - Sample data
- `/PROJECT_CONTEXT.md` - Full requirements doc

### Next Steps
- Add user authentication
- Implement PDF invoice generation
- Connect to production PostgreSQL database
- Deploy to Vercel
