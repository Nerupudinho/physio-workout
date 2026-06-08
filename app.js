'use strict';

// ─── EXERCISE DATA ───────────────────────────────────────────────────────────

const EXERCISES = [
  {
    id: 'knee-to-chest',
    name: 'Knee to Chest',
    desc: 'Lie on your back. Pull one leg close to your chest and hold for 3 seconds. Do both sides.',
    type: 'reps',
    reps: 10,
    bilateral: true,
  },
  {
    id: 'supine-twist',
    name: 'Supine Spinal Twist',
    desc: 'Lie on your back. Raise one leg and cross it to the opposite side. Arms spread wide. Hold 3 seconds. Both sides.',
    type: 'reps',
    reps: 10,
    bilateral: true,
  },
  {
    id: 'prone-twist',
    name: 'Prone Spinal Twist',
    desc: 'Lie face down. Raise your bent knee and bring it to the opposite side. Hold 3 seconds. Both sides.',
    type: 'reps',
    reps: 10,
    bilateral: true,
  },
  {
    id: 'open-book',
    name: 'Open Book',
    desc: 'Lie on your side, legs stacked. Arms out together. Open your chest by taking the top arm across your body. Hold. Both sides.',
    type: 'reps',
    reps: 10,
    bilateral: true,
  },
  {
    id: 'arm-arc',
    name: 'Arm Arc',
    desc: 'Side-lying. Trace your top arm in an arc over your head, opening and closing your chest. Both sides.',
    type: 'reps',
    reps: 10,
    bilateral: true,
  },
  {
    id: 'lunge-side-stretch',
    name: 'Lunge Side Stretch',
    desc: 'Step into a lunge. If right leg is forward, raise your right arm overhead and bend sideways to stretch the hip. Hold for 3 seconds. Do both sides.',
    type: 'reps',
    reps: 7,
    bilateral: true,
  },
  {
    id: 'hip-airplanes',
    name: 'Hip Airplanes',
    desc: 'Single-leg stance. Lean torso forward over planted leg, back leg straight. Rotate hips in toward planted leg, then out to the side. Controlled movement. Both sides.',
    type: 'reps',
    reps: 9,
    bilateral: true,
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow',
    desc: 'On hands and knees. Arch your back up (cat), then dip it down (cow). Flow slowly and breathe through each rep.',
    type: 'reps',
    reps: 8,
    bilateral: false,
  },
  {
    id: 'childs-pose',
    name: "Child's Pose - Cobra",
    desc: 'Sit back on your heels. Stretch arms forward, forehead on the ground. Flow in and out with your breath.',
    type: 'reps',
    reps: 8,
    bilateral: false,
  },
];

const WORD_FOR = ['','one','two','three','four','five','six','seven','eight','nine','ten'];
const HOLD_CIRC = 2 * Math.PI * 34; // r=34 → ~213.6

// ─── PREFERENCES ─────────────────────────────────────────────────────────────

function getHoldSec() {
  return parseInt(localStorage.getItem('pref_hold_sec') || '5', 10);
}
function setHoldSec(v) {
  localStorage.setItem('pref_hold_sec', String(Math.max(1, Math.min(30, v))));
}
function getReps(exId, defaultReps) {
  const v = localStorage.getItem(`pref_reps_${exId}`);
  return v ? parseInt(v, 10) : defaultReps;
}
function setReps(exId, v, defaultReps) {
  const min = 1, max = defaultReps * 3;
  localStorage.setItem(`pref_reps_${exId}`, String(Math.max(min, Math.min(max, v))));
}

// ─── STATE ───────────────────────────────────────────────────────────────────

const S = {
  queue: [],
  qi: 0,
  ex: null,
  side: 'right',
  sidesLeft: 0,
  rep: 0,
  set: 1,
  holdLeft: 0,      // seconds remaining in current hold
  holdInterval: null,
  paused: false,
  pendingFn: null,  // function to call on resume if paused mid-hold
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + name).classList.add('active');
}

// ─── TTS ─────────────────────────────────────────────────────────────────────

function speak(text) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.92;
  u.pitch = 1.05;
  u.volume = 1;
  window.speechSynthesis.speak(u);
}

// ─── HOME ────────────────────────────────────────────────────────────────────

function renderHome() {
  $('exercise-list').innerHTML = EXERCISES.map((ex, i) => {
    const sets = ex.sets || 1;
    const repsStr = sets > 1 ? `${sets}×${ex.reps} reps` : `${ex.reps} reps`;
    const sides = ex.bilateral ? ' · both sides' : '';
    return `
      <div class="exercise-card" data-id="${ex.id}">
        <div class="ex-num">${i + 1}</div>
        <div class="ex-info">
          <div class="ex-name">${ex.name}</div>
          <div class="ex-meta">${repsStr}${sides}</div>
        </div>
        <span class="ex-arrow">›</span>
      </div>`;
  }).join('');
  $('exercise-list').querySelectorAll('.exercise-card').forEach(c => {
    c.addEventListener('click', () => showDetail(c.dataset.id));
  });
}

// ─── DETAIL ──────────────────────────────────────────────────────────────────

function showDetail(id) {
  const ex = EXERCISES.find(e => e.id === id);
  if (!ex) return;

  $('detail-name').textContent = ex.name;
  $('detail-description').textContent = ex.desc;

  // Populate steppers
  let currentReps = getReps(ex.id, ex.reps);
  let currentHold = getHoldSec();

  const repsEl = $('reps-val');
  const holdEl = $('hold-val');
  repsEl.textContent = currentReps;
  holdEl.textContent = currentHold;

  $('reps-minus').onclick = () => {
    currentReps = Math.max(1, currentReps - 1);
    repsEl.textContent = currentReps;
    setReps(ex.id, currentReps, ex.reps);
  };
  $('reps-plus').onclick = () => {
    currentReps = Math.min(ex.reps * 3, currentReps + 1);
    repsEl.textContent = currentReps;
    setReps(ex.id, currentReps, ex.reps);
  };
  $('hold-minus').onclick = () => {
    currentHold = Math.max(1, currentHold - 1);
    holdEl.textContent = currentHold;
    setHoldSec(currentHold);
  };
  $('hold-plus').onclick = () => {
    currentHold = Math.min(30, currentHold + 1);
    holdEl.textContent = currentHold;
    setHoldSec(currentHold);
  };

  $('btn-start-exercise').onclick = () => startWorkout([id]);
  showScreen('detail');
}

// ─── WORKOUT ENGINE ──────────────────────────────────────────────────────────

function startWorkout(ids) {
  S.queue = ids;
  S.qi = 0;
  S.paused = false;
  showScreen('workout');
  loadExercise();
}

function loadExercise() {
  clearHold();
  window.speechSynthesis.cancel();

  const ex = EXERCISES.find(e => e.id === S.queue[S.qi]);
  if (!ex) { finishWorkout(); return; }

  const savedReps = getReps(ex.id, ex.reps);
  const savedHold = getHoldSec();

  S.ex = { ...ex, reps: savedReps, holdSec: savedHold };
  S.rep = 0;
  S.set = 1;
  S.side = 'right';
  S.sidesLeft = ex.bilateral ? 2 : 1;
  S.paused = false;

  $('workout-name').textContent = ex.name;
  $('workout-progress').textContent = `${S.qi + 1} / ${S.queue.length}`;
  $('btn-pause').textContent = 'Pause';
  $('rep-current').textContent = '0';
  $('rep-total').textContent = savedReps;
  $('hold-overlay').classList.add('hidden');
  $('ui-reps').classList.remove('hidden');

  if (ex.bilateral) {
    setSideBadge('RIGHT SIDE');
  } else {
    $('workout-side').classList.add('hidden');
  }
  updateSetBadge();

  const sets = ex.sets || 1;
  const setsNote = sets > 1 ? ` ${sets} sets of ${savedReps}.` : ` ${savedReps} reps.`;
  const intro = ex.bilateral
    ? `${ex.name}. Right side.${setsNote}`
    : `${ex.name}.${setsNote}`;

  setInstruction('Get ready…');
  speak(intro);
  setTimeout(() => runRep(1), 2500);
}

// ─── AUTO COUNT ──────────────────────────────────────────────────────────────

function runRep(n) {
  if (S.paused) {
    S.pendingFn = () => runRep(n);
    return;
  }

  S.rep = n;
  $('rep-current').textContent = n;
  setInstruction('');
  speak(WORD_FOR[n] || String(n));

  $('hold-overlay').classList.remove('hidden');
  beginHold(S.ex.holdSec, () => {
    $('hold-overlay').classList.add('hidden');
    if (n >= S.ex.reps) {
      sideComplete();
    } else {
      runRep(n + 1);
    }
  });
}

function sideComplete() {
  const totalSets = S.ex.sets || 1;
  if (S.set < totalSets) {
    S.set++;
    S.rep = 0;
    $('rep-current').textContent = '0';
    updateSetBadge();
    speak(`Set ${S.set}.`);
    setTimeout(() => runRep(1), 1500);
    return;
  }
  S.set = 1;
  S.sidesLeft--;
  if (S.sidesLeft > 0) {
    S.side = 'left';
    S.rep = 0;
    setSideBadge('LEFT SIDE');
    $('rep-current').textContent = '0';
    updateSetBadge();
    speak('Switch to left side.');
    setTimeout(() => runRep(1), 2500);
  } else {
    exerciseComplete();
  }
}

// ─── HOLD COUNTDOWN ──────────────────────────────────────────────────────────

function beginHold(seconds, onDone) {
  S.holdLeft = seconds;
  updateHoldUI(seconds, seconds);

  S.holdInterval = setInterval(() => {
    if (S.paused) return;
    S.holdLeft--;
    updateHoldUI(S.holdLeft, seconds);
    if (S.holdLeft <= 0) {
      clearHold();
      onDone();
    }
  }, 1000);
}

function updateHoldUI(left, total) {
  $('hold-count').textContent = Math.max(left, 0);
  const elapsed = total - left;
  const offset = HOLD_CIRC - (elapsed / total) * HOLD_CIRC;
  $('hold-ring-arc').style.strokeDashoffset = Math.max(offset, 0);
}

function clearHold() {
  clearInterval(S.holdInterval);
  S.holdInterval = null;
}

// ─── EXERCISE / WORKOUT COMPLETE ─────────────────────────────────────────────

function exerciseComplete() {
  logExercise();
  S.qi++;
  if (S.qi >= S.queue.length) {
    finishWorkout();
  } else {
    speak('Next.');
    setTimeout(loadExercise, 1500);
  }
}

function finishWorkout() {
  clearHold();
  window.speechSynthesis.cancel();
  const n = S.queue.length;
  $('complete-summary').textContent = `${n} exercise${n !== 1 ? 's' : ''} completed. Well done!`;
  showScreen('complete');
  speak('Workout complete. Great job!');
}

// ─── BADGE HELPERS ───────────────────────────────────────────────────────────

function setSideBadge(text) {
  const b = $('workout-side');
  b.textContent = text;
  b.classList.remove('hidden');
}

function updateSetBadge() {
  const totalSets = S.ex ? (S.ex.sets || 1) : 1;
  const badge = $('workout-set');
  if (totalSets > 1) {
    badge.textContent = `SET ${S.set} / ${totalSets}`;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function setInstruction(text) {
  $('workout-instruction').textContent = text;
}

// ─── LOG ─────────────────────────────────────────────────────────────────────

function logExercise() {
  const ex = S.ex;
  const sets = ex.sets || 1;
  const sides = ex.bilateral ? ' × 2 sides' : '';
  const value = sets > 1 ? `${sets}×${ex.reps} reps${sides}` : `${ex.reps} reps${sides}`;
  const entry = {
    id: ex.id,
    name: ex.name,
    date: new Date().toISOString().split('T')[0],
    value,
  };
  try {
    const log = JSON.parse(localStorage.getItem('mobility_log') || '[]');
    log.unshift(entry);
    localStorage.setItem('mobility_log', JSON.stringify(log.slice(0, 500)));
  } catch (_) {}
}

function getLog() {
  try { return JSON.parse(localStorage.getItem('mobility_log') || '[]'); } catch { return []; }
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────

function renderHistory() {
  const log = getLog();
  const container = $('history-list');
  if (!log.length) {
    container.innerHTML = '<p class="empty-state">No workouts logged yet.<br>Complete a session to see your history.</p>';
    return;
  }
  const byDate = {};
  log.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  container.innerHTML = Object.entries(byDate).map(([date, entries]) => `
    <div class="history-day">
      <div class="history-day-label">${fmtDate(date)}</div>
      ${entries.map(e => `
        <div class="history-row">
          <span>${e.name}</span>
          <span class="history-val">${e.value}</span>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function fmtDate(d) {
  const today = new Date().toISOString().split('T')[0];
  if (d === today) return 'Today';
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (d === yesterday) return 'Yesterday';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ─── PAUSE / SKIP / STOP ─────────────────────────────────────────────────────

function togglePause() {
  S.paused = !S.paused;
  $('btn-pause').textContent = S.paused ? 'Resume' : 'Pause';
  if (S.paused) {
    window.speechSynthesis.cancel();
    setInstruction('Paused');
  } else {
    setInstruction('');
    if (S.pendingFn) {
      const fn = S.pendingFn;
      S.pendingFn = null;
      fn();
    }
    // If we're mid-hold, the interval will resume on its own (paused check)
  }
}

function skipCurrent() {
  clearHold();
  window.speechSynthesis.cancel();
  S.pendingFn = null;
  S.qi++;
  if (S.qi >= S.queue.length) finishWorkout();
  else loadExercise();
}

function stopWorkout() {
  if (!confirm('Stop workout?')) return;
  clearHold();
  window.speechSynthesis.cancel();
  S.ex = null;
  S.pendingFn = null;
  renderHome();
  showScreen('home');
}

// ─── INIT ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderHome();

  $('btn-history').addEventListener('click', () => { renderHistory(); showScreen('history'); });
  $('btn-start-all').addEventListener('click', () => startWorkout(EXERCISES.map(e => e.id)));
  $('btn-back-detail').addEventListener('click', () => showScreen('home'));
  $('btn-back-history').addEventListener('click', () => showScreen('home'));
  $('btn-home').addEventListener('click', () => { renderHome(); showScreen('home'); });
  $('btn-stop-workout').addEventListener('click', stopWorkout);
  $('btn-pause').addEventListener('click', togglePause);
  $('btn-skip').addEventListener('click', skipCurrent);

  if ('wakeLock' in navigator) {
    const acquireWakeLock = async () => {
      try { await navigator.wakeLock.request('screen'); } catch (_) {}
    };
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) acquireWakeLock();
    });
    acquireWakeLock();
  }
});
