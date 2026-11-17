# Mohegan Sun Events — Simulator Regression

**Role:** Read-only QA tester. Walk through the app like a user while the developer observes. Test existing behavior; do not implement, repair, or expand anything.

## Rules

- **Do not modify project files, tests, configuration, dependencies, or Git history.** Do not install packages, run auto-fixes, or commit changes.
- **Do not take screenshots, record video, export evidence, or create test artifacts.** Observe the simulator directly and report results in your final response only.
- Run `npm run typecheck`, `npm run lint`, and `npm test`. Then launch the existing Expo app using its documented command and test on the available iOS simulator and Android emulator. Do not change configuration to enable a test.
- Use **whatever real events and demo ticket listings are currently available**. Do not depend on Metallica, a fixed event count, a particular venue/section, or fixed prices. For reservations, select any event with available demo tickets and any available listing.
- Perform actions using visible UI controls, and **verify the resulting screen before continuing**. An entirely tappable event card is a valid way to open details; a dedicated “View Event” button is not required.
- Treat missing upstream descriptions and prices on event-detail pages as acceptable. Demo ticket prices appear on the selection screen. The featured carousel may be independent of event-list filters.
- Use the app's **Cancel reservation** flow to remove reservations created during testing. Do not clear unrelated data or alter existing user reservations.
- Test only behavior accessible in the simulators. **Do not attempt Airplane Mode, network or device-clock manipulation, fabricated API responses, invented deep links, native-wallet testing, or development-build-only appearance checks.** Physical-device offline verification is outside this suite.
- Report **PASS**, **FAIL**, or **NOT RUN** for each scenario, separately by platform. PASS means the actions were performed and the result was observed; a genuine mismatch is FAIL. If a scenario cannot be completed, report NOT RUN and why. **Never mark an unexecuted scenario PASS.** Do not propose or make fixes.

## 0. Automated checks

**GIVEN** the repository is ready for testing  
**WHEN** `npm run typecheck`, `npm run lint`, and `npm test` are run  
**THEN** each command completes successfully  
**AND** the report states the actual test counts, without hardcoded expectations.

## 1. Discover events

**GIVEN** the app is open on **Events** with internet access  
**WHEN** the live event list finishes loading  
**THEN** event cards show recognizable titles, dates, categories, and a way to open their details  
**WHEN** I open any event and return  
**THEN** the event list remains usable.

**GIVEN** the event list is visible  
**WHEN** I pull down to refresh  
**THEN** the refresh indicator finishes  
**AND** the screen remains usable with updated results or a clear error message.

## 2. Search and filters

**GIVEN** the event list contains searchable results  
**WHEN** I search for part of a currently visible event title  
**THEN** matching events appear  
**WHEN** I enter a deliberately unlikely search term  
**THEN** a clear empty state appears  
**WHEN** I clear the search or use **Clear all filters**  
**THEN** the unfiltered list returns.

**GIVEN** the inline filters are visible  
**WHEN** I select any available venue, event type, or category  
**THEN** the active filter is reflected in the results and filter indicators  
**WHEN** I apply another compatible filter, if available  
**THEN** the results reflect both selections (or show a valid empty state)  
**WHEN** I remove one filter  
**THEN** the remaining selection stays active  
**WHEN** I clear all filters  
**THEN** the filters reset.

**GIVEN** an inline filter has been applied  
**WHEN** I scroll past the inline filter area  
**THEN** the header filter action becomes available  
**WHEN** I open it  
**THEN** the sheet shows the same applied selections and provides the existing venue, type, category, and Events/Promotions controls  
**WHEN** I dismiss the sheet without applying changes  
**THEN** the applied filters remain unchanged  
**WHEN** I scroll back to the inline filters  
**THEN** the header filter action hides.

## 3. Date range

**GIVEN** the date filter displays **All Upcoming Dates**  
**WHEN** I open it and select start and end dates around an event visible in the current feed  
**THEN** the list shows only events within that inclusive range  
**WHEN** I clear the date range  
**THEN** the filter returns to **All Upcoming Dates** and the upcoming list returns.

**AND** on iOS I use the existing inline date controls; on Android I use the separate native Start and End dialogs. Platform-native presentation differences are expected.

## 4. Choose and review tickets

**GIVEN** I can open any event with available demo ticket inventory  
**WHEN** I choose tickets and select any available section/row listing  
**THEN** I can choose a quantity up to that listing's remaining inventory, with no global four-ticket cap  
**WHEN** I choose a valid quantity and open **Review Reservation**  
**THEN** the event, listing, quantity, subtotal, fees, and total match what I selected  
**AND** the displayed money calculations are correct.

**GIVEN** a listing is selected  
**WHEN** I increase quantity to its available maximum  
**THEN** I cannot exceed the available inventory  
**AND** proceeding without a valid ticket selection is prevented.

## 5. Confirm, cancel, and restore inventory

**GIVEN** a valid demo reservation is on the review screen  
**WHEN** I confirm it once  
**THEN** a demo confirmation is displayed  
**AND** the reservation appears in **My Tickets** with matching details  
**AND** the selected inventory decreases by the reserved quantity.

**GIVEN** my new reservation appears in **My Tickets**  
**WHEN** I open it and tap **Cancel reservation**  
**THEN** I see a confirmation alert  
**WHEN** I choose **Keep reservation**  
**THEN** it remains saved  
**WHEN** I open the cancellation alert again and confirm cancellation  
**THEN** the reservation disappears from active tickets  
**AND** the previously reserved inventory becomes available again when I revisit that listing.

## 6. Persistence across relaunch

**GIVEN** I have created a new demo reservation using the app  
**WHEN** I fully close and relaunch the app without changing network settings  
**THEN** the reservation still appears in **My Tickets** with readable details  
**WHEN** I cancel that test reservation  
**THEN** it is removed from active tickets.

## 7. Basic cross-platform usability

**GIVEN** the app is running on the selected simulator or emulator  
**WHEN** I navigate from Events to event details, ticket selection, and review, then return  
**THEN** navigation works without crashes or obscured actions  
**AND** the header, tabs, and bottom actions do not overlap device safe areas  
**AND** the selected tab is visually distinguishable from the inactive tab.

Repeat the core Events → Details → Tickets journey on **both iOS and Android**. Run the reservation and cancellation scenarios on both where practical; do not infer one platform's result from the other.

## Report

Give a concise table **for each platform**:

| Scenario | Result | What you observed |
| --- | --- | --- |
| Automated checks | PASS / FAIL / NOT RUN | Commands and actual counts |
| Live events and refresh | PASS / FAIL / NOT RUN | Event chosen and refresh behavior |
| Search and filters | PASS / FAIL / NOT RUN | Filters tried and results |
| Date range | PASS / FAIL / NOT RUN | Dates and filtered behavior |
| Ticket selection and totals | PASS / FAIL / NOT RUN | Listing, quantity, and total |
| Confirm / cancel / inventory | PASS / FAIL / NOT RUN | Reservation and inventory outcome |
| Persistence after relaunch | PASS / FAIL / NOT RUN | Ticket recovered or not |
| Navigation and layout | PASS / FAIL / NOT RUN | Screens checked |

For a **FAIL**, state the reproduction steps and expected versus actual result. For **NOT RUN**, state the reason. Conclude with **“All executed scenarios passed”** only when that is accurate, and separately identify any unexecuted coverage. **Do not take screenshots, make recordings, create evidence files, or change code.**
