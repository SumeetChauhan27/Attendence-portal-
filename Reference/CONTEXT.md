# Project Context (Summary of Work Done)

## 1. Teacher Dashboard UI Redesign
- Clean 3-column teacher layout with a larger “Attendance Session” card.
- “Create Class” and “Add Student” moved into modals.
- Added student search + compact list.
- Added current/next session panel and status pill.
- Added collapsible “Past Sessions” section.
- Follow-up UX polish: simplified 2-column layout, compact header, stronger primary session card,
  subtle secondary actions, and reduced visual noise.
- Past sessions list and student list now scroll to avoid layout shifts.

Files:
- `app/src/App.tsx`
- `app/src/styles.css`

## 2. Timetable Auto-Logic (Manual for Testing)
- Added `app/src/timetable.ts` with full timetable (day, time, subject, batch, room, type).
- Utilities: `getCurrentSlot`, `getNextSlot`, `getSlotsForDay`, `isLunchTime`, `getEntryForBatch`.
- Auto-prefill subject + timing based on slot selection.
- System time disabled; manual day/time selection only.

Files:
- `app/src/timetable.ts`
- `app/src/App.tsx`

## 3. Slot Selection UI (Clean Modal)
- Teacher selects day (Mon–Fri) → modal opens with slots for that day.
- Clicking a slot auto-fills the session and closes modal.

Files:
- `app/src/App.tsx`
- `app/src/styles.css`

## 4. Past Sessions + Attendance Details
- Backend: endpoint to fetch sessions with present counts.
- Teacher can view past sessions in collapsible panel.
- Each past session has “View” → modal shows present students.

Backend:
- `server/src/db.js`
- `server/src/index.js`

Frontend:
- `app/src/api.ts`
- `app/src/App.tsx`
- `app/src/styles.css`

## 5. Student “My Attendance”
- “My Attendance” button in student header.
- Modal shows summary table:
  - Lecture, Time, Count, Present, Percentage
- Room numbers removed from student view.

Files:
- `app/src/App.tsx`
- `app/src/styles.css`
- `server/src/index.js`
- `server/src/db.js`
- `app/src/api.ts`

## 6. Teacher View of Student Attendance
- “Attendance” button next to each student in teacher list.
- Modal shows summary (Lecture, Time, Count, Present, %).
- Attendance percentage badge next to each student name.

Backend:
- `server/src/db.js`
- `server/src/index.js`

Frontend:
- `app/src/api.ts`
- `app/src/App.tsx`
- `app/src/styles.css`

## Important Behavior
- Attendance opening blocked outside schedule or during lunch (confirmation popup).
- System time not used; manual day/time drives slot selection.
- Export JSON removed (data remains in app).
