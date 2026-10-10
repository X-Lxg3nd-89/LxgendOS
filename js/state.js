var APPS = {
  calc: { name: 'Calculator', showDesktop: true, icon: '<svg viewBox="0 0 48 48" fill="none"><rect x="8" y="6" width="32" height="36" rx="4" class="acc"/><rect x="12" y="12" width="24" height="8" rx="2" fill="#fff"/></svg>' },
  notepad: { name: 'Notepad', showDesktop: true, icon: '<svg viewBox="0 0 48 48" fill="none"><rect x="10" y="6" width="28" height="36" rx="3" fill="#fff" class="acc-stroke" stroke-width="2"/></svg>' },
  fileexplorer: { name: 'Files', showDesktop: true, icon: '<svg viewBox="0 0 48 48" fill="none"><path d="M6 12a2 2 0 012-2h12l4 4h18a2 2 0 012 2v22a2 2 0 01-2 2H8a2 2 0 01-2-2V12z" class="acc"/></svg>' },
  theme: { name: 'Theme', showDesktop: true, icon: '<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="16" fill="none" class="acc-stroke" stroke-width="3"/><path d="M24 8v16 16" class="acc-stroke" stroke-width="3"/></svg>' },
  shell: { name: 'Shell', showDesktop: true, icon: '<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="10" width="36" height="28" rx="3" class="acc"/><path d="M14 20l6 4-6 4M24 28h10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>' },
  clock: { name: 'Clock', showDesktop: true, icon: '<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="none" class="acc-stroke" stroke-width="3"/><path d="M24 12v12l7 5" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/></svg>' },
  imageviewer: { name: 'Image Viewer', showDesktop: true, icon: '<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="8" width="36" height="32" rx="3" class="acc"/><circle cx="17" cy="20" r="4" fill="#fff"/><path d="M6 34l10-10 8 8 8-8 10 10" stroke="#fff" stroke-width="2.5" fill="none"/></svg>' },
  paint: { name: 'Paint', showDesktop: true, icon: '<svg viewBox="0 0 48 48" fill="none"><path d="M24 4a20 20 0 000 40c2.2 0 4-1.8 4-4 0-1-.4-2-1-2.6-.6-.8-1-1.6-1-2.4 0-2.2 1.8-4 4-4h4c5.6 0 10-4.4 10-10 0-9.8-9-17-20-17z" class="acc"/></svg>' },
  store: { name: 'Store', showDesktop: true, icon: '<svg viewBox="0 0 48 48" fill="none"><path d="M8 16h32l-4 24H12L8 16z" class="acc"/><path d="M16 16V12a8 8 0 0116 0v4" stroke="currentColor" stroke-width="3" fill="none"/></svg>' },
  browser: { name: 'Browser', showDesktop: true, icon: '<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="none" class="acc-stroke" stroke-width="3"/><path d="M6 24h36M24 6a30 30 0 010 36M24 6a30 30 0 000 36" stroke="currentColor" stroke-width="2" fill="none"/></svg>' }
};

var pinnedApps = ['fileexplorer', 'store', 'browser', 'clock', 'notepad', 'shell'];
var shellInitialHTML = document.getElementById('shell-body').innerHTML;

var zTop = 10;
var openWindows = {};
var minimizedWindows = {};
var dragTarget = null;
var dragX = 0, dragY = 0;
var dragStartLeft = 0, dragStartTop = 0;
var dragStartW = 0, dragStartH = 0;
var dragStartX = 0, dragStartY = 0;
var snapZone = null;
var resizeTarget = null;
var rsX = 0, rsY = 0, rsW = 0, rsH = 0;
var gridSize = 100;
var gridPadding = 20;
var iconPositions = {};
var selectedIcon = null;
var current = "0";
var prev = null;
var op = null;
var reset = false;
var notepadCurrentFile = null;
var shellInput = null;
var ivZoomLevel = 1;
var paintCtx = null;
var paintDrawing = false;
var paintCurrentTool = 'brush';

var timerInterval = null;
var timerRemaining = 0;
var swInterval = null;
var swSeconds = 0;
var alarms = [];

var browserHistory = [null];
var browserHistIndex = 0;

var qsState = {
  wifi: true,
  bt: true,
  air: false,
  night: false,
  battery: false
};
var preAirWifi = true;
var preAirBt = true;

var storageKey = 'lxgendos-state-v1';

function saveState() {
  try {
    var state = {
      fs: feFS,
      wallpaper: document.getElementById('bg-layer').style.backgroundImage || '',
      bgColor: document.getElementById('bg-layer').style.backgroundColor || '',
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      accentHover: getComputedStyle(document.documentElement).getPropertyValue('--accent-hover').trim(),
      light: document.body.classList.contains('light'),
      iconPositions: iconPositions,
      qsState: qsState,
      preAirWifi: preAirWifi,
      preAirBt: preAirBt,
      windowPositions: {}
    };
    for (var id in openWindows) {
      var w = document.getElementById('win-' + id);
      if (!w) continue;
      state.windowPositions[id] = {
        left: w.style.left, top: w.style.top,
        width: w.style.width, height: w.style.height
      };
    }
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (e) { /* quota or private mode */ }
}

function loadState() {
  try {
    var raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function applySavedState() {
  var s = loadState();
  if (!s) return;

  if (s.fs) feFS = s.fs;
  if (s.wallpaper && s.wallpaper !== 'none') {
    document.getElementById('bg-layer').style.backgroundImage = s.wallpaper;
  }
  if (s.bgColor && s.bgColor !== 'rgba(0, 0, 0, 0)') {
    document.getElementById('bg-layer').style.backgroundColor = s.bgColor;
  }
  if (s.accent) {
    document.documentElement.style.setProperty('--accent', s.accent);
    document.documentElement.style.setProperty('--accent-hover', s.accentHover || s.accent);
  }
  if (s.light) document.body.classList.add('light');
  if (s.iconPositions) iconPositions = s.iconPositions;
  if (s.qsState) {
    qsState = s.qsState;
    if (qsState.air) document.body.classList.add('airplane-mode');
    if (qsState.night) document.getElementById('night-overlay').classList.add('on');
    if (qsState.battery) {
      document.body.classList.add('battery-saver');
      document.getElementById('dim-overlay').style.opacity = 0.35;
    }
    if (!qsState.wifi) document.getElementById('qs-wifi').classList.remove('active');
    if (!qsState.bt) document.getElementById('qs-bt').classList.remove('active');
    if (qsState.air) {
      document.getElementById('qs-air').classList.add('active');
      document.getElementById('qs-wifi').classList.add('disabled');
      document.getElementById('qs-bt').classList.add('disabled');
      document.getElementById('qs-wifi').classList.remove('active');
      document.getElementById('qs-bt').classList.remove('active');
    }
    if (qsState.night) document.getElementById('qs-night').classList.add('active');
    if (qsState.battery) document.getElementById('qs-battery').classList.add('active');
  }
  if (s.preAirWifi !== undefined) preAirWifi = s.preAirWifi;
  if (s.preAirBt !== undefined) preAirBt = s.preAirBt;
  if (s.windowPositions) {
    for (var id in s.windowPositions) {
      var w = document.getElementById('win-' + id);
      if (!w) continue;
      var p = s.windowPositions[id];
      if (p.left) w.style.left = p.left;
      if (p.top) w.style.top = p.top;
      if (p.width) w.style.width = p.width;
      if (p.height) w.style.height = p.height;
    }
  }
}

function showToast(title, body) {
  var container = document.getElementById('toast-container');
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = '<div class="toast-title">' + title + '</div>' + (body ? '<div class="toast-body">' + body + '</div>' : '');
  container.appendChild(toast);
  setTimeout(function () {
    toast.classList.add('fade-out');
    setTimeout(function () { toast.remove(); }, 320);
  }, 10000);
}