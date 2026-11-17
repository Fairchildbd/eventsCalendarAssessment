# Regression Report

Run date: 2026-11-17. Source: `REGRESSION.md`. App run in Expo Go.

## Automated checks (all devices)

PASS: `npm run typecheck`, `npm run lint` and `npm test` (12 suites, 160 tests).

## iPhone 17 Pro

### Passing

- Live events: cards show titles, dates and categories, and an event opens and returns to a usable list
- Venue filter: Mohegan Sun Arena applied (32 results), and removing the chip restored 418 results
- Header filter action appears with an active-filter badge after scrolling past the inline filters
- Ticket selection: review is disabled until a listing is chosen, quantity is capped at the listing maximum (6), and subtotal, fees and total are correct
- Review: event, listing (Sec 106 Row E), quantity (2) and total ($259.88) match the selection
- Confirm: demo confirmation shown (DEMO-7VMB9K) and the reservation appears in My Tickets with matching details
- Cancel: "Keep reservation" keeps it, and "Cancel reservation" removes it
- Persistence: reservation was still in My Tickets after force-quit and relaunch
- Navigation and layout: Events → Details → Tickets → Review → Confirmation → My Tickets, with no overlap of safe areas and a distinguishable selected tab

### Failing

None.

## Pixel 9 Pro

### Passing

- Live events and refresh (Updated 1:39 PM to 1:41 PM)
- Search: "Showcase" returns 1 result, an unlikely term shows "No events match these filters", and Clear all filters restores 418 results
- Filters: venue + type combine (4 results), removing one keeps the other, header filter sheet shows the same selections and Cancel leaves them unchanged, and the header action hides back at the top
- Date range: Nov 24 start and end dialogs show only events on that date, and clearing returns "All Upcoming Dates" (418 results)
- Ticket selection and totals: Sec 109 Row H, quantity capped at 8, 3 tickets = $329.82
- Confirm / cancel / inventory: DEMO-D2RL7R in My Tickets, inventory 8 → 5, "Keep" retained it, cancel removed it, inventory back to 8
- Persistence after relaunch
- Navigation and layout

### Failing

None.

## Pixel 9 Pro Fold (unfolded)

### Passing

- Live events and refresh (Updated 1:48 PM)
- Search: "Showcase" returns 1 result, an unlikely term shows the empty state, and Clear all filters restores the list
- Filters: venue + type combine (4 results), removing one keeps the other, header filter sheet matches and Cancel leaves it unchanged, and the header action hides at the top
- Date range: Nov 24 filters correctly and clearing restores 418 results
- Ticket selection and totals: Sec 106 Row E, quantity capped at 6, 2 tickets = $259.88
- Confirm / cancel / inventory: DEMO-6Q6FDK in My Tickets, inventory 6 → 4, "Keep" retained it, cancel removed it, inventory back to 6
- Persistence after relaunch
- Navigation and layout

### Failing

None.

Scenarios that were not executed are omitted from this report.

---

Full regression on 3 devices (iPhone 17 Pro, Pixel 9 Pro, Pixel 9 Pro Fold): about 34% of one session’s 1M-token context window. All tests took 30 minutes and 46 seconds to run.
