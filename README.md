# Mohegan Sun Events (demo)

A React Native app built with Expo (SDK 58), Expo Router and TypeScript. It lists upcoming Mohegan Sun events from the Mohegan Sun endpoint, lets you filter and search them, and simulates reserving tickets. Reservations are saved on the device and open without internet.

Ticket inventory and prices are **fictional**. No real tickets are sold or held.

## Run

Xcode is required for the iOS Simulator, and Android Studio is required for the Android Emulator. Alternatively, the app can run on a physical device using Expo Go.

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` for the iOS Simulator or `a` for the Android Emulator.

## Checks

```bash
npm run typecheck     # tsc --noEmit
npm test              # jest + React Native Testing Library
npm run lint          # expo lint
```

## Project structure

```
src/
  app/          Expo Router route files, each a one-line re-export of a screen or navigator
  assets/       app icons and images
  components/   shared UI used by more than one screen, plus generic building blocks
  hooks/        small reusable hooks
  navigation/   root stack and tab navigators
  screens/      one folder per screen; components used by a single screen live in its components/ folder
  services/     fetching and normalizing the events feed, demo ticket mapping
  store/        context providers: event catalog, filters, reservations
  types/        shared TypeScript types
  utils/        pure helpers and constants: dates, money, filters, reservations, theme, demo ticket data
```

## How it works

- **Events** come from `GET https://mohegansun.com/bin/mohegan/servlet/eventsearch?brandName=mohegansun` (no credentials, no pagination). Responses are validated and normalized in `src/services` so network shapes never reach the UI. Filtering and search run locally. `EXPO_PUBLIC_EVENTS_API_URL` overrides the endpoint.
- **Offline.** If the feed can't be loaded, the Events screen shows an error with a retry. Saved tickets never depend on the network.
- **Reservations** are stored as a single JSON array in AsyncStorage (`src/store/ReservationsContext.tsx`). Writes are paused if the saved data can't be read, so existing tickets are never overwritten.
- **Reservation cutoff.** Reservations close when an event starts. A production deployment could enforce an earlier cutoff, such as 24 hours before the event. The demo uses the start time so test data stays available.
- **Event Feed** The event feed is an endpoint from the Mohegan Sun website. There is no documented public contract.

## Scope

- Build a working mobile prototype inspired by the Mohegan Sun website. The application should allow users to browse an event calendar, view event details, and reserve tickets.

## Known limitations

- Tested in the iOS Simulator and Android Emulator through Expo Go. Release builds and physical Android devices have not been tested.
- On Android, the date picker accent color comes from the `@react-native-community/datetimepicker` config plugin in `app.json`. Expo Go ignores plugins, so it shows the default blue there. The brand color needs a development build to verify.
- Android cannot read back a single AsyncStorage value larger than about 2MB. A reservation is roughly 500 bytes, so the limit would take thousands of tickets to reach.
- The ideal way to handle offline tickets would be to add them to the user's iPhone wallet or Google Wallet. This requires signing credentials that are out of scope for this demo.

## Design choices

- I did not i18n any of the strings. I did notice that is important for Mohegan Sun, as you support a separate language.
- A user can cancel a reservation up to the minute before the event starts. This was intentional only for the demo. Initially, I had the limitation of 24 hours prior to the event starting. I decided to change that for the sake of having testable data.
- I did not add E2E tests to this repo. I did, however, create REGRESSION.md that can be run with Claude. I prompted it to place the findings in REGRESSION_REPORT.md. I do not think AI is a replacement for E2E tests. But I did have fun exploring this as a new, personal work flow. I used Sonnet 5.5. I wanted to test how accurate it was and how much usage it would take on my claude plan. Full regression on 3 devices (iPhone 17 Pro, Pixel 9 Pro, Pixel 9 Pro Fold; iPhone fold unavailable): about 42% of one session’s 1M-token context window.
- The commit history was purposefully created to demonstrate how I create PRs and how I personally like to work. Small commits, small projects, and small PRs. The naming convention is inspired by the Lean community, but I did not give detailed commit bodies. I do not tend to do detailed commit bodies. My PRs descriptions tend to be more of a mix of this README (from Scope down), and include screenshots and/or videos when appropriate.
- I intentionally made the filter button appear after you scroll past the initial filter. I thought this is a nice UX for filtering large lists like this.
- Folder organization was intentionally created to mimic how I discussed it in the initial interview. Common components are at a higher level and each screen has its own component. BottomSheet is a good example of a component that would need to move from screen/feature level to common, if it were implemented in a larger app.
- No app assets for stores were created for this demo, as that seemed out of scope.
- Offline ticket access was verified on a physical iPhone using Expo Go. I created a demo reservation, reloaded the app through Metro while connected, enabled Airplane Mode, and confirmed the ticket remained accessible in My Tickets. Physical Android testing has not been performed.