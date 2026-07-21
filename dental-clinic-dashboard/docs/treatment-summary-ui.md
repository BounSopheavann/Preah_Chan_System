# Treatment Summary Page — UI Documentation

## Overview

The Treatment Summary page is the final clinical review checkpoint before a visit is completed and sent to Billing. It provides a comprehensive view of all procedures performed during the current visit, allows the dentist to enter final clinical notes, and validates the visit before completion.

## Route

- `/treatment-summary`

## Navigation

| Action | From | To | Behavior |
|--------|------|----|----------|
| Finish Visit | Treatment Execution | Treatment Summary | Saves current state, navigates to `/treatment-summary` |
| Return to Treatment | Treatment Summary | Treatment Execution | Navigates to `/treatment-execution` — all state preserved |
| Complete Visit | Treatment Summary | Billing | Validates, saves, marks visit Completed, navigates to `/billing` |

## Page Sections

### 1. Patient / Visit Header
- Uses existing `PatientContextHeader` component
- Displays: patient name, patient code, age, sex, appointment date/time, dentist, session ID
- Medical alerts (allergies, conditions) shown prominently when present

### 2. Visit Status Overview
Three summary cards showing counts calculated from actual session state:
- **Completed Procedures** (green) — count of `session.completedProcedures`
- **In Progress** (amber) — count of in-progress procedures
- **Remaining / Planned** (slate) — count of planned/postponed items

### 3. Completed Procedures
Lists every completed procedure with:
- Procedure name
- Tooth number and surface(s)
- Duration
- Responsible dentist
- Start/end time
- Clinical notes summary (line-clamped)

### 4. In Progress Procedures
If any procedure is paused/in-progress:
- Shows procedure name, tooth, start time
- Status badge: "In Progress"
- Warning message: "These procedures are NOT completed"
- Button: "Return to resolve in Treatment"

### 5. Remaining / Planned Procedures
Shows treatment plan items not completed:
- Procedure name, tooth, surface, duration, priority
- Current status badge (Planned, Postponed, etc.)
- Note: "Available for future treatment"

### 6. Clinical Record Summary
Grid of clinical data from completed procedures:
- **Clinical Notes** — per-procedure notes
- **Anesthesia** — drug, dosage, injection site
- **Consumables / Materials** — material, quantity, batch/lot
- **Prescriptions** — medicine, dosage, frequency, duration
- **Clinical Attachments** — file name, type, uploader, time

Empty states use clean text like "No prescriptions recorded." or "No clinical attachments."

### 7. Final Clinical Review (Editable)
Three text areas persisted to `session.summary`:
- **Final Notes** (required) — marked with `*` and red validation hint
- **Recommendations** — follow-up recommendations
- **Post-Operative / Home Care Instructions** — post-op care

Values survive navigation: Treatment Summary → Return to Treatment → Treatment Summary.

### 8. Visit Status (Additional Treatment Required)
Automatically derived from remaining planned + in-progress items:
- If any remain: "Additional treatment remains" with amber warning and list
- If all completed: "All planned procedures completed" with green success

### 9. Bottom Actions
- **Return to Treatment** — preserves all state
- **Complete Visit** — triggers validation

## Validation

Before completing the visit, the following checks run:

| Check | Error Type | Message |
|-------|-----------|---------|
| At least one completed procedure | `no_completed` | "At least one procedure must be completed before completing the visit." |
| Final notes not empty | `no_final_notes` | "Final clinical notes are required before completing the visit." |
| No in-progress procedure | `in_progress_procedure` | "An active procedure is still in progress. Resume or resolve the procedure before completing the visit." |

If validation fails:
- Error banners appear at the top of the page
- Each error is dismissible via X button
- Page does NOT navigate away
- User must correct issues before retrying

## Complete Visit Behavior

When validation succeeds:
1. Saves `finalNotes`, `recommendations`, `postOpInstructions` to `session.summary`
2. Marks all `completedProcedures` with `billingEligible: true`
3. Sets `session.status` to `'Completed'`
4. Preserves all completed procedure execution records
5. Keeps unfinished treatment plan items unchanged (Planned/Postponed remain)
6. Persists updated state to localStorage
7. Navigates to `/billing`

## State Persistence

- Uses the same `localStorage` key (`preah-chan-treatment-flow`) as Treatment Execution and Active Procedure Workspace
- All state is loaded via `loadFlowState()` and saved via `saveFlowState()`
- Summary fields (`finalNotes`, `recommendations`, `postOpInstructions`) are stored in `session.summary`
- State continuity: Treatment Execution ↔ Active Procedure Workspace ↔ Treatment Summary

## Business Rules Enforced

1. Only completed procedures are marked as billing-eligible
2. Planned procedures are NOT marked as billable
3. In Progress procedures are NOT marked as billable
4. Completing the visit does NOT auto-complete unfinished treatment plan items
5. Completed procedure history is preserved
6. Clinical notes are required before visit completion
7. In Progress procedure must be resolved before completing the visit
8. Multiple procedures may be completed during one appointment
9. Remaining treatment stays available for future visits
10. Treatment Summary is the final clinical checkpoint before Billing

## Files Created

| File | Purpose |
|------|---------|
| `components/treatment-execution/treatment-summary-page.tsx` | Main Treatment Summary page component |
| `app/treatment-summary/page.tsx` | Next.js route page |
| `app/billing/page.tsx` | Billing placeholder route |

## Files Modified

| File | Changes |
|------|---------|
| `components/treatment-execution/treatment-execution-data.ts` | Added `procedureCode?` and `billingEligible?` to `ProcedureExecution` |
| `components/treatment-execution/procedure-workspace-store.ts` | Added `VisitCompletionData`, `applySummaryFieldUpdate`, `applyVisitCompletion`, `buildSummaryFromSession` |
| `components/treatment-execution/treatment-execution-page.tsx` | Replaced inline summary view with `handleFinishVisit` → `/treatment-summary` navigation; removed `TreatmentSummaryView` and `CompleteVisitModal` usage; added "Finish Visit" and "Go to Billing" buttons |

## Billing Status

- Billing route `/billing` exists as a **placeholder only**
- No Billing module has been implemented
- Completed procedures are marked `billingEligible: true` in state
- TODO: Implement full Billing module with itemized charges and payment processing