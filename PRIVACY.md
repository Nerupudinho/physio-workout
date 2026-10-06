# Privacy Policy

**Mobility Workout** is a free, open-source app that respects your privacy.

## Data Collection

**This app collects no data.** There are:

- No analytics or tracking scripts
- No cookies (except those your browser may create internally)
- No network requests to external servers
- No advertisements

## Local Storage

The app stores the following data **locally on your device only**, using the browser's `localStorage` API:

| Data | Purpose |
|------|---------|
| `pref_hold_sec` | Your preferred hold duration (in seconds) |
| `pref_reps_<exercise>` | Customized rep counts per exercise |
| `mobility_log` | History of completed exercises (up to 500 entries) |

This data never leaves your device. You can clear it at any time through your browser's settings (Clear site data).

## Speech Synthesis

The app uses your device's built-in **Web Speech API** (`speechSynthesis`) to announce exercises and count reps aloud. This is processed entirely on your device — no audio is recorded or transmitted.

## Service Worker

A service worker caches the app's files locally so it works offline. The service worker only caches files from this app; it does not access or cache any external resources.

## Third-Party Services

None. This app makes no network requests after the initial page load.

## Contact

If you have questions about this privacy policy, please open an issue on the [GitHub repository](https://github.com/Nerupudinho/physio-workout).
