const startPauseBtn = document.getElementById('startPause');
const resetBtn = document.getElementById('reset');
const modeBtn = document.getElementById('mode');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const status = document.getElementById('status');
const focusTimeInput = document.getElementById('focusTime');
const breakTimeInput = document.getElementById('breakTime');
const progressRing = document.querySelector('.progress-ring__circle');

const radius = progressRing.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

let isRunning = false;
let isFocusMode = true;
let timeLeft;
let interval;
let totalTime;

progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
progressRing.style.strokeDashoffset = circumference;

// Create an audio instance with your sound file
const audio = new Audio('https://store-screenapp-production.storage.googleapis.com/vid/67cc450488fdbc7fee22c120/9ad656c7-da8f-4f9c-9446-79e959dd4e82.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=GOOG1EINEQV5X2QGY62PSZMBMUR7IGGVLKNDB6ABP5GL6O6FKO76DWA2IE3SB%2F20250308%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20250308T132423Z&X-Amz-Expires=604800&X-Amz-Signature=2d7a8425eb909a72fbf9daff5f5fb8566b0a06584c0e01e645ef0a191e93ccae&X-Amz-SignedHeaders=host&response-content-type=attachment%3B%20filename%3D%229ad656c7-da8f-4f9c-9446-79e959dd4e82.mp3%22%3B%20filename%2A%3D%20UTF-8%27%27alarm_clock_short_6402.mp3.mp3%3B#t=0,');

function notifyUser() {
  // Play the alert sound
  audio.play();

  // Stop the sound after 3 seconds (3000 milliseconds)
  setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 3000);

  if (Notification.permission === 'granted') {
    new Notification(isFocusMode ? 'Break Time!' : 'Focus Time!', {
      body: `Time to switch to ${isFocusMode ? 'break' : 'focus'} mode!`
    });
  }
}

// Initialize timer
function initTimer() {
  totalTime = (isFocusMode ? focusTimeInput.value : breakTimeInput.value) * 60;
  timeLeft = totalTime;
  updateDisplay();
  setProgress(100);
}

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  minutesDisplay.textContent = String(minutes).padStart(2, '0');
  secondsDisplay.textContent = String(seconds).padStart(2, '0');
  status.textContent = isFocusMode ? 'Focus Time' : 'Break Time';
}

function setProgress(percent) {
  const offset = circumference - (percent / 100 * circumference);
  progressRing.style.strokeDashoffset = offset;
}

function toggleTimer() {
  if (isRunning) {
    clearInterval(interval);
    isRunning = false;
    startPauseBtn.textContent = '▶ Resume';
  } else {
    isRunning = true;
    startPauseBtn.textContent = '⏸ Pause';
    interval = setInterval(() => {
      timeLeft--;
      const progress = (timeLeft / totalTime) * 100;
      setProgress(progress);
      updateDisplay();
      
      if (timeLeft <= 0) {
        clearInterval(interval);
        isRunning = false;
        notifyUser();
        toggleMode();
      }
    }, 1000);
  }
}

function toggleMode() {
  isFocusMode = !isFocusMode;
  initTimer();
  startPauseBtn.textContent = '▶ Start'; // Reset button text to start
  if (isRunning) toggleTimer();
}

// Event Listeners
startPauseBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', () => {
  clearInterval(interval);
  isRunning = false;
  startPauseBtn.textContent = '▶ Start';
  initTimer();
});
modeBtn.addEventListener('click', toggleMode);

focusTimeInput.addEventListener('change', () => {
  if (!isRunning && isFocusMode) initTimer();
});
breakTimeInput.addEventListener('change', () => {
  if (!isRunning && !isFocusMode) initTimer();
});

// Request notification permission
if (Notification.permission !== 'denied') {
  Notification.requestPermission();
}

// Initialize
initTimer();
