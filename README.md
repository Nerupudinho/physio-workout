# Mobility Workout

A progressive web app (PWA) for guided mobility and physio exercises with voice coaching.

**Live app (after Pages is enabled):** https://nerupudinho.github.io/physio-workout/

## What It Does

Mobility Workout guides you through a series of stretching and mobility exercises with:

- **Voice-guided workouts** — The app announces each exercise, counts reps aloud, and cues side switches using your device's speech synthesis
- **Automatic rep counting** — Displays current rep with a visual hold timer for each movement
- **Bilateral exercise support** — Automatically prompts you to switch sides for exercises that work both left and right
- **Customizable settings** — Adjust rep counts and hold duration (1–30 seconds) per exercise
- **Workout history** — Tracks completed exercises with dates, stored locally on your device
- **Screen wake lock** — Keeps your screen on during workouts so you can follow along hands-free

### Included Exercises

1. Knee to Chest
2. Supine Spinal Twist
3. Prone Spinal Twist
4. Open Book
5. Arm Arc
6. Lunge Side Stretch
7. Hip Airplanes
8. Cat-Cow
9. Child's Pose - Cobra

## How to Use

1. **Open the app** in a browser or install it as a PWA
2. **Tap an exercise** to view details and customize reps/hold time
3. **Start Full Routine** to run through all exercises, or start a single exercise from its detail screen
4. **Follow the voice cues** — the app announces each rep and tells you when to hold and switch sides
5. **Pause or skip** at any time using the on-screen controls
6. **View history** by tapping the clock icon to see past workouts

## Installation

### As a PWA (Recommended)

1. Visit the app URL in Chrome, Safari, or another PWA-capable browser
2. Look for the "Install" or "Add to Home Screen" prompt
3. The app works offline once installed

### Run Locally

```bash
# Clone the repository
git clone https://github.com/Nerupudinho/physio-workout.git
cd physio-workout

# Serve with any static server, for example:
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:8000` (or whichever port your server uses).

## Privacy

This app runs entirely in your browser. No data is sent to any server. See [PRIVACY.md](PRIVACY.md) for details.

## License

[MIT](LICENSE) © 2026 Sree Sai Ganesh A
