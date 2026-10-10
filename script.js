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
  }, 3000);
}

function updateBootTime() {
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  if (h < 10) h = '0' + h;
  if (m < 10) m = '0' + m;
  document.getElementById('boot-time').innerText = h + ':' + m;
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('boot-date').innerText = days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate();
}

function dismissBoot() {
  document.getElementById('boot').classList.add('hidden');
  document.body.classList.add('booted');
}

function powerOff() {
  saveState();
  closeQuickSettings();
  closeStartMenu();
  document.querySelectorAll('.window.open, .window.minimized').forEach(function (w) {
    w.classList.remove('open', 'minimized');
  });
  openWindows = {};
  minimizedWindows = {};
  updateTaskbar();
  document.body.classList.remove('booted');
  setTimeout(function () {
    document.getElementById('boot').classList.remove('hidden');
    updateBootTime();
  }, 250);
}

function updateClock() {
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  if (h < 10) h = '0' + h;
  if (m < 10) m = '0' + m;
  var dd = d.getDate();
  var mm = d.getMonth() + 1;
  var yy = d.getFullYear();
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  document.getElementById('tray-time').innerText = h + ':' + m;
  document.getElementById('tray-date').innerText = dd + '/' + mm + '/' + yy;
}

function renderDesktopIcons() {
  var container = document.getElementById('desktop-icons');
  container.innerHTML = '';
  var col = 0, row = 0;
  var iconIndex = 0;
  for (var id in APPS) {
    var app = APPS[id];
    if (!app.showDesktop) continue;
    if (!iconPositions[id]) {
      iconPositions[id] = { x: gridPadding + col * gridSize, y: gridPadding + row * gridSize };
      row++;
      if (row > 5) { row = 0; col++; }
    }
    var div = document.createElement('div');
    div.className = 'icon';
    div.id = 'di-' + id;
    div.style.left = iconPositions[id].x + 'px';
    div.style.top = iconPositions[id].y + 'px';
    div.style.animationDelay = (iconIndex * 0.045) + 's';
    div.innerHTML = '<div class="ic">' + app.icon + '</div><span>' + app.name + '</span>';
    iconIndex++;

    (function (appId, el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        if (selectedIcon && selectedIcon !== el) selectedIcon.classList.remove('selected');
        el.classList.add('selected');
        selectedIcon = el;
      });
      el.addEventListener('dblclick', function (e) {
        e.stopPropagation();
        el.classList.remove('selected');
        selectedIcon = null;
        openWin(appId, el);
      });
      el.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (selectedIcon && selectedIcon !== el) selectedIcon.classList.remove('selected');
        el.classList.add('selected');
        selectedIcon = el;
        showIconContextMenu(e.clientX, e.clientY, appId);
      });
      makeIconDraggable(el, appId);
    })(id, div);

    container.appendChild(div);
  }
}

function makeIconDraggable(el, id) {
  var dragging = false;
  var startX = 0, startY = 0, startL = 0, startT = 0;
  el.addEventListener('mousedown', function (e) {
    if (e.target.closest('.icon') !== el) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startL = parseInt(el.style.left) || 0;
    startT = parseInt(el.style.top) || 0;
    e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    el.classList.add('dragging');
    el.style.left = (startL + e.clientX - startX) + 'px';
    el.style.top = (startT + e.clientY - startY) + 'px';
  });
  document.addEventListener('mouseup', function () {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    var x = parseInt(el.style.left);
    var y = parseInt(el.style.top);
    var snappedX = Math.round((x - gridPadding) / gridSize) * gridSize + gridPadding;
    var snappedY = Math.round((y - gridPadding) / gridSize) * gridSize + gridPadding;
    if (snappedX < gridPadding) snappedX = gridPadding;
    if (snappedY < gridPadding) snappedY = gridPadding;
    if (snappedY > window.innerHeight - 150) snappedY = Math.floor((window.innerHeight - 150 - gridPadding) / gridSize) * gridSize + gridPadding;
    el.style.left = snappedX + 'px';
    el.style.top = snappedY + 'px';
    iconPositions[id] = { x: snappedX, y: snappedY };
    saveState();
  });
}

function openWin(id, sourceEl) {
  var w = document.getElementById("win-" + id);
  if (!w) return;

  if (openWindows[id]) {
    w.style.zIndex = ++zTop;
    return;
  }

  if (minimizedWindows[id]) {
    w.style.zIndex = ++zTop;
    w.classList.remove('minimized');
    openWindows[id] = true;
    delete minimizedWindows[id];
    updateTaskbar();
    return;
  }

  w.classList.add('instant');

  var winW = w.offsetWidth;
  var winH = w.offsetHeight;

  if (!w.style.left || w.style.left.indexOf('%') !== -1 || !w.style.top) {
    w.style.left = ((window.innerWidth - winW) / 2) + 'px';
    w.style.top = ((window.innerHeight - winH) / 2) + 'px';
  }

  if (sourceEl) {
    var src = sourceEl.getBoundingClientRect();
    var winLeft = parseFloat(w.style.left);
    var winTop = parseFloat(w.style.top);
    var ox = ((src.left + src.width / 2) - winLeft) / winW * 100;
    var oy = ((src.top + src.height / 2) - winTop) / winH * 100;
    w.style.transformOrigin = ox + '% ' + oy + '%';
  } else {
    w.style.transformOrigin = '50% 50%';
  }

  void w.offsetWidth;
  w.classList.remove('instant');

  w.classList.add('open');
  w.style.zIndex = ++zTop;
  openWindows[id] = true;

  if (id === 'fileexplorer') feRender();
  if (id === 'store') renderStore();
  if (id === 'shell') setTimeout(function () { if (shellInput) shellInput.focus(); }, 100);

  closeStartMenu();
  closeQuickSettings();
  updateTaskbar();
}

function resetCalc() {
  current = "0"; prev = null; op = null; reset = false;
  updateScreen();
}

function resetNotepad() {
  document.getElementById('notepad-text').value = '';
  notepadCurrentFile = null;
  document.getElementById('notepad-title').innerText = 'Notepad';
}

function resetShell() {
  document.getElementById('shell-body').innerHTML = shellInitialHTML;
  shellInit();
}

function resetClock() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (swInterval) { clearInterval(swInterval); swInterval = null; }
  timerRemaining = 0;
  swSeconds = 0;
  alarms = [];
  document.getElementById('timer-start').innerText = 'Start';
  document.getElementById('sw-start').innerText = 'Start';
  document.getElementById('timer-h').value = '0';
  document.getElementById('timer-m').value = '1';
  document.getElementById('timer-s').value = '0';
  updateTimerDisplay();
  updateSwDisplay();
  renderAlarms();
}

function resetImageViewer() {
  document.getElementById('iv-image').src = '';
  ivZoomLevel = 1;
  document.getElementById('iv-image').style.transform = 'scale(1)';
  document.getElementById('iv-zoom-label').innerText = '100%';
}

function resetPaint() {
  var canvas = document.getElementById('paint-canvas');
  paintCtx.fillStyle = '#ffffff';
  paintCtx.fillRect(0, 0, canvas.width, canvas.height);
  paintCurrentTool = 'brush';
  document.getElementById('paint-brush').classList.add('active');
  document.getElementById('paint-eraser').classList.remove('active');
}

function resetBrowser() {
  browserHistory = [null];
  browserHistIndex = 0;
  showBrowserHome();
}

function resetFiles() {
  feCwd = '/home/user';
  feHistory = [];
  feSearchTerm = '';
  feShowHidden = false;
  document.getElementById('fe-search').value = '';
}

function closeWin(id) {
  var w = document.getElementById("win-" + id);
  if (!w) return;
  w.classList.remove('open', 'minimized');
  delete openWindows[id];
  delete minimizedWindows[id];
  updateTaskbar();
  saveState();

  if (id === 'calc') resetCalc();
  else if (id === 'notepad') resetNotepad();
  else if (id === 'shell') resetShell();
  else if (id === 'clock') resetClock();
  else if (id === 'imageviewer') resetImageViewer();
  else if (id === 'paint') resetPaint();
  else if (id === 'browser') resetBrowser();
  else if (id === 'fileexplorer') resetFiles();
}

function minWin(id) {
  var w = document.getElementById("win-" + id);
  if (!w) return;
  w.style.transition = 'none';
  w.style.transformOrigin = '50% 100%';
  void w.offsetWidth;
  w.style.transition = '';
  w.classList.add('minimized');
  delete openWindows[id];
  minimizedWindows[id] = true;
  updateTaskbar();
  saveState();
}

function maxWin(id) {
  var w = document.getElementById("win-" + id);
  if (!w) return;

  if (w.dataset.max == "1") {
    if (w.dataset.origW) w.style.width = w.dataset.origW;
    if (w.dataset.origH) w.style.height = w.dataset.origH;
    if (w.dataset.origL) w.style.left = w.dataset.origL;
    if (w.dataset.origT) w.style.top = w.dataset.origT;
    w.dataset.max = "0";
  } else {
    var cs = getComputedStyle(w);
    w.dataset.origW = cs.width;
    w.dataset.origH = cs.height;
    w.dataset.origL = cs.left;
    w.dataset.origT = cs.top;
    w.style.width = (window.innerWidth - 40) + 'px';
    w.style.height = (window.innerHeight - 100) + 'px';
    w.style.left = '20px';
    w.style.top = '20px';
    w.dataset.max = "1";
  }
  saveState();
}

function startDrag(e, id) {
  if (e.target.classList.contains("dot")) return;
  var w = document.getElementById(id);
  w.style.transition = 'none';
  var rect = w.getBoundingClientRect();
  dragTarget = w;
  dragTarget.style.zIndex = ++zTop;
  dragX = e.clientX - rect.left;
  dragY = e.clientY - rect.top;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragStartLeft = rect.left;
  dragStartTop = rect.top;
  dragStartW = rect.width;
  dragStartH = rect.height;
  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", endDrag);
}

function doDrag(e) {
  if (!dragTarget) return;
  dragTarget.style.left = (e.clientX - dragX) + "px";
  dragTarget.style.top = (e.clientY - dragY) + "px";

  // snap zone detection
  var edge = 30;
  var zone = null;
  if (e.clientX < edge) zone = 'left';
  else if (e.clientX > window.innerWidth - edge) zone = 'right';
  else if (e.clientY < edge) zone = 'max';

  if (zone !== snapZone) {
    snapZone = zone;
    showSnapPreview(zone);
  }
}

function showSnapPreview(zone) {
  var preview = document.getElementById('snap-preview');
  if (!preview) {
    preview = document.createElement('div');
    preview.id = 'snap-preview';
    preview.className = 'snap-preview';
    document.body.appendChild(preview);
  }
  if (!zone) {
    preview.classList.remove('show');
    return;
  }
  var w = window.innerWidth;
  var h = window.innerHeight;
  var left, top, width, height;
  if (zone === 'left') { left = 10; top = 10; width = w / 2 - 15; height = h - 90; }
  else if (zone === 'right') { left = w / 2 + 5; top = 10; width = w / 2 - 15; height = h - 90; }
  else if (zone === 'max') { left = 10; top = 10; width = w - 20; height = h - 90; }
  preview.style.left = left + 'px';
  preview.style.top = top + 'px';
  preview.style.width = width + 'px';
  preview.style.height = height + 'px';
  preview.classList.add('show');
}

function endDrag(e) {
  if (!dragTarget) {
    dragTarget = null;
    document.removeEventListener("mousemove", doDrag);
    document.removeEventListener("mouseup", endDrag);
    return;
  }

  var preview = document.getElementById('snap-preview');
  if (snapZone && preview) {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var left, top, width, height;
    if (snapZone === 'left') { left = 10; top = 10; width = w / 2 - 15; height = h - 90; }
    else if (snapZone === 'right') { left = w / 2 + 5; top = 10; width = w / 2 - 15; height = h - 90; }
    else if (snapZone === 'max') { left = 10; top = 10; width = w - 20; height = h - 90; }

    dragTarget.dataset.origW = dragStartW + 'px';
    dragTarget.dataset.origH = dragStartH + 'px';
    dragTarget.dataset.origL = dragStartLeft + 'px';
    dragTarget.dataset.origT = dragStartTop + 'px';
    dragTarget.dataset.max = snapZone === 'max' ? '1' : '0';

    dragTarget.style.left = left + 'px';
    dragTarget.style.top = top + 'px';
    dragTarget.style.width = width + 'px';
    dragTarget.style.height = height + 'px';
    showToast('Window snapped', snapZone === 'max' ? 'Maximized' : 'Snapped ' + snapZone);
  }

  if (preview) preview.classList.remove('show');
  snapZone = null;

  dragTarget.style.transition = '';
  dragTarget = null;
  document.removeEventListener("mousemove", doDrag);
  document.removeEventListener("mouseup", endDrag);
  saveState();
}

function startResize(e, id) {
  var w = document.getElementById(id);
  w.style.transition = 'none';
  resizeTarget = w;
  resizeTarget.style.zIndex = ++zTop;
  var rect = w.getBoundingClientRect();
  rsX = e.clientX; rsY = e.clientY;
  rsW = rect.width; rsH = rect.height;
  e.preventDefault();
  e.stopPropagation();
  document.addEventListener("mousemove", doResize);
  document.addEventListener("mouseup", endResize);
}

function doResize(e) {
  if (!resizeTarget) return;
  var w = rsW + (e.clientX - rsX);
  var h = rsH + (e.clientY - rsY);
  if (w < 240) w = 240;
  if (h < 140) h = 140;
  resizeTarget.style.width = w + "px";
  resizeTarget.style.height = h + "px";
}

function endResize() {
  if (resizeTarget) resizeTarget.style.transition = '';
  resizeTarget = null;
  document.removeEventListener("mousemove", doResize);
  document.removeEventListener("mouseup", endResize);
  saveState();
}

function updateTaskbar() {
  var taskbar = document.querySelector('.taskbar');

  document.querySelectorAll('.taskbar .tb-dynamic').forEach(function (btn) {
    var id = btn.dataset.appId;
    if (!openWindows[id] && !minimizedWindows[id]) {
      btn.classList.remove('visible');
      setTimeout(function () { btn.remove(); }, 360);
    }
  });

  for (var id in APPS) {
    if (pinnedApps.indexOf(id) !== -1) continue;
    if (openWindows[id] || minimizedWindows[id]) {
      if (!document.getElementById('tb-' + id)) {
        (function (appId) {
          var btn = document.createElement('button');
          btn.id = 'tb-' + appId;
          btn.className = 'tb-dynamic';
          btn.dataset.appId = appId;
          btn.title = APPS[appId].name;
          btn.onclick = function () { openWin(appId, this); };
          btn.innerHTML = APPS[appId].icon;
          taskbar.appendChild(btn);
          void btn.offsetWidth;
          btn.classList.add('visible');
        })(id);
      }
    }
  }

  for (var id in APPS) {
    var btn = document.getElementById('tb-' + id);
    if (!btn) continue;
    if (openWindows[id] || minimizedWindows[id]) btn.classList.add('running');
    else btn.classList.remove('running');
  }
}

function updateScreen() { document.getElementById("screen").innerText = current; }

function press(val) {
  if (reset) { current = val; reset = false; }
  else {
    if (val == "." && current.includes(".")) return;
    if (current == "0" && val != ".") current = val;
    else current = current + val;
  }
  updateScreen();
}

function pressOp(o) {
  if (op != null && !reset) calculate();
  prev = current;
  op = o;
  reset = true;
}

function calculate() {
  if (op == null || prev == null) return;
  var a = parseFloat(prev);
  var b = parseFloat(current);
  var r = 0;
  if (op == "+") r = a + b;
  else if (op == "-") r = a - b;
  else if (op == "*") r = a * b;
  else if (op == "/") {
    if (b == 0) { current = "Error"; updateScreen(); prev = null; op = null; reset = true; return; }
    r = a / b;
  }
  r = Math.round(r * 100000000) / 100000000;
  current = String(r);
  prev = null;
  op = null;
  reset = true;
  updateScreen();
}

function clearScreen() { current = "0"; prev = null; op = null; reset = false; updateScreen(); }

function backspace() {
  if (reset) { current = "0"; reset = false; }
  else { current = current.slice(0, -1); if (current == "") current = "0"; }
  updateScreen();
}

function setBg(value, el) {
  var layer = document.getElementById('bg-layer');
  if (value.indexOf('gradient') !== -1) {
    layer.style.backgroundImage = value;
    layer.style.backgroundColor = 'transparent';
  } else if (value.charAt(0) == "#") {
    layer.style.backgroundImage = "none";
    layer.style.backgroundColor = value;
  } else {
    layer.style.backgroundImage = "url('" + value + "')";
  }
  document.querySelectorAll(".bg-thumb, .color-swatch").forEach(function (t) { t.classList.remove("selected"); });
  if (el) el.classList.add("selected");
  saveState();
}

function importBg(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function (ev) {
    var dataUrl = ev.target.result;
    var thumb = document.createElement('div');
    thumb.className = 'bg-thumb';
    thumb.style.backgroundImage = 'url(' + dataUrl + ')';
    thumb.onclick = function () { setBg(dataUrl, thumb); };
    document.getElementById('theme-grid').appendChild(thumb);
    setBg(dataUrl, thumb);
    showToast('Wallpaper imported', file.name);
  };
  reader.readAsDataURL(file);
}

function setAccent(color, hover, el) {
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-hover', hover);
  document.querySelectorAll('.accent-swatch').forEach(function (s) { s.classList.remove('selected'); });
  if (el) el.classList.add('selected');
  saveState();
}

function toggleMode() {
  document.body.classList.toggle('light');
  saveState();
}

function toggleQuickSettings(e) {
  if (e) e.stopPropagation();
  document.getElementById('quick-settings').classList.toggle('open');
  closeStartMenu();
}

function closeQuickSettings() {
  document.getElementById('quick-settings').classList.remove('open');
}

function toggleTile(type) {
  var tile = document.getElementById('qs-' + type);
  if (!tile || tile.classList.contains('disabled')) return;

  qsState[type] = !qsState[type];
  tile.classList.toggle('active', qsState[type]);

  if (type === 'air') {
    if (qsState.air) {
      preAirWifi = qsState.wifi;
      preAirBt = qsState.bt;
      qsState.wifi = false;
      qsState.bt = false;
      document.getElementById('qs-wifi').classList.remove('active');
      document.getElementById('qs-bt').classList.remove('active');
      document.getElementById('qs-wifi').classList.add('disabled');
      document.getElementById('qs-bt').classList.add('disabled');
      document.body.classList.add('airplane-mode');
      showToast('Airplane mode', 'Wi-Fi and Bluetooth turned off');
    } else {
      qsState.wifi = preAirWifi;
      qsState.bt = preAirBt;
      document.getElementById('qs-wifi').classList.toggle('active', qsState.wifi);
      document.getElementById('qs-bt').classList.toggle('active', qsState.bt);
      document.getElementById('qs-wifi').classList.remove('disabled');
      document.getElementById('qs-bt').classList.remove('disabled');
      document.body.classList.remove('airplane-mode');
      showToast('Airplane mode off', 'Wi-Fi restored');
    }
  }

  if (type === 'night') {
    document.getElementById('night-overlay').classList.toggle('on', qsState.night);
  }

  if (type === 'battery') {
    document.body.classList.toggle('battery-saver', qsState.battery);
    if (qsState.battery) {
      document.getElementById('dim-overlay').style.opacity = 0.35;
      showToast('Battery saver on', 'Screen dimmed, animations disabled');
    } else {
      var slider = document.querySelector('.qs-slider input[type="range"]');
      setBrightness(slider ? slider.value : 100);
      showToast('Battery saver off', '');
    }
  }

  saveState();
}

function setBrightness(v) {
  if (qsState.battery) return;
  document.getElementById('dim-overlay').style.opacity = (100 - v) / 100 * 0.85;
}

function setVolume(v) { }

function renderStartApps(filter) {
  var container = document.getElementById('start-apps');
  container.innerHTML = '';
  var list = [];
  for (var id in APPS) {
    if (!filter || APPS[id].name.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
      list.push({ id: id, name: APPS[id].name, icon: APPS[id].icon });
    }
  }
  if (list.length === 0) {
    container.innerHTML = '<div class="start-empty">No apps found</div>';
    return;
  }
  list.forEach(function (app) {
    var div = document.createElement('div');
    div.className = 'start-app';
    div.innerHTML = '<div class="sa-icon">' + app.icon + '</div><div class="sa-label">' + app.name + '</div>';
    div.addEventListener('click', function (e) {
      e.stopPropagation();
      document.querySelectorAll('.start-app.selected').forEach(function (i) { i.classList.remove('selected'); });
      div.classList.add('selected');
    });
    div.addEventListener('dblclick', function (e) {
      e.stopPropagation();
      div.classList.remove('selected');
      openWin(app.id, div);
    });
    container.appendChild(div);
  });
}

function filterStartApps(v) { renderStartApps(v); }

function toggleStartMenu(e) {
  if (e) e.stopPropagation();
  var menu = document.getElementById('start-menu');
  menu.classList.toggle('open');
  closeQuickSettings();
  if (menu.classList.contains('open')) {
    renderStartApps('');
    document.getElementById('start-search-input').value = '';
    setTimeout(function () { document.getElementById('start-search-input').focus(); }, 100);
  }
}

function closeStartMenu() {
  document.getElementById('start-menu').classList.remove('open');
}

function showIconContextMenu(x, y, appId) {
  var menu = document.getElementById('ctx-menu');
  menu.innerHTML = '';
  addCtxItem(menu, 'Open', function () { openWin(appId); });
  addCtxItem(menu, 'Open in new position', function () {
    var w = document.getElementById('win-' + appId);
    if (w) {
      w.style.left = (Math.random() * (window.innerWidth - 400)) + 'px';
      w.style.top = (Math.random() * (window.innerHeight - 300)) + 'px';
    }
    openWin(appId);
  });
  menu.appendChild(document.createElement('div')).className = 'ctx-sep';
  addCtxItem(menu, 'Reset position', function () {
    iconPositions[appId] = null;
    renderDesktopIcons();
    saveState();
  });
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.classList.add('open');
}

function showDesktopContextMenu(x, y) {
  var menu = document.getElementById('ctx-menu');
  menu.innerHTML = '';
  addCtxItem(menu, 'Change wallpaper', function () { openWin('theme'); });
  addCtxItem(menu, 'Open Files', function () { openWin('fileexplorer'); });
  addCtxItem(menu, 'Open Shell', function () { openWin('shell'); });
  menu.appendChild(document.createElement('div')).className = 'ctx-sep';
  addCtxItem(menu, 'Refresh', function () { renderDesktopIcons(); showToast('Desktop refreshed', ''); });
  addCtxItem(menu, 'About LxgendOS', function () { showToast('LxgendOS v1.0', 'A web desktop by ghst'); });
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.classList.add('open');
}

function addCtxItem(menu, label, handler) {
  var item = document.createElement('div');
  item.className = 'ctx-item';
  item.textContent = label;
  item.onclick = function () { handler(); menu.classList.remove('open'); };
  menu.appendChild(item);
}

document.addEventListener('click', function (e) {
  var qs = document.getElementById('quick-settings');
  var tray = document.querySelector('.tray');
  if (qs.classList.contains('open') && !qs.contains(e.target) && !tray.contains(e.target)) qs.classList.remove('open');

  var sm = document.getElementById('start-menu');
  var startBtn = document.querySelector('.taskbar button[title="Start"]');
  if (sm.classList.contains('open') && !sm.contains(e.target) && !startBtn.contains(e.target)) sm.classList.remove('open');

  var ctx = document.getElementById('ctx-menu');
  if (ctx.classList.contains('open') && !ctx.contains(e.target)) ctx.classList.remove('open');

  if (!e.target.closest('.icon')) {
    if (selectedIcon) { selectedIcon.classList.remove('selected'); selectedIcon = null; }
  }
  if (!e.target.closest('.fe-item')) {
    document.querySelectorAll('.fe-item.selected').forEach(function (i) { i.classList.remove('selected'); });
  }
  if (!e.target.closest('.start-app')) {
    document.querySelectorAll('.start-app.selected').forEach(function (i) { i.classList.remove('selected'); });
  }
});

document.addEventListener('contextmenu', function (e) {
  if (e.target.closest('.window')) return;
  if (e.target.closest('.icon')) return;
  e.preventDefault();
  showDesktopContextMenu(e.clientX, e.clientY);
});

var feFS = {
  '/home/user': {
    type: 'folder',
    children: {
      'Documents': { type: 'folder', children: {
        'readme.txt': { type: 'file', content: 'LxgendOS — web desktop.\n\nType "help" in the Shell for a surprise.' },
        'todo.txt': { type: 'file', content: '1. Build LxgendOS\n2. Add more apps\n3. Ship it' }
      }},
      'Desktop': { type: 'folder', children: {
        'Calculator.lxg': { type: 'app', appId: 'calc' },
        'Notepad.lxg': { type: 'app', appId: 'notepad' },
        'Files.lxg': { type: 'app', appId: 'fileexplorer' },
        'Theme.lxg': { type: 'app', appId: 'theme' },
        'Shell.lxg': { type: 'app', appId: 'shell' },
        'Clock.lxg': { type: 'app', appId: 'clock' },
        'Paint.lxg': { type: 'app', appId: 'paint' },
        'Store.lxg': { type: 'app', appId: 'store' },
        'Browser.lxg': { type: 'app', appId: 'browser' }
      }},
      'Pictures': { type: 'folder', children: {
        'wallpapers': { type: 'folder', children: {
          'bg1.jpg': { type: 'image', src: 'BGs/bg1.jpg' },
          'bg2.jpg': { type: 'image', src: 'BGs/bg2.jpg' },
          'bg3.jpg': { type: 'image', src: 'BGs/bg3.jpg' },
          'bg4.jpg': { type: 'image', src: 'BGs/bg4.jpg' },
          'bg5.png': { type: 'image', src: 'BGs/bg5.png' }
        }}
      }},
      'Projects': { type: 'folder', children: { 'lxgendos': { type: 'folder', children: {
        'notes.txt': { type: 'file', content: 'LxgendOS project notes:\n- Windows 11 style\n- Blue accent\n- Inter font everywhere' }
      }}}},
      'welcome.txt': { type: 'file', content: 'Welcome to LxgendOS!\n\nDouble-click to open things.\nTry Ctrl+H in Files for a hidden folder.' }
    }
  },
  '/home/user/.hidden': {
    type: 'folder',
    hidden: true,
    children: {
      'easter_egg.txt': { type: 'file', content: 'You found the hidden folder.\n\nCongratulations.\n\nHere is your reward: nothing.\n\nBut you smiled, right?' }
    }
  }
};

var feCwd = '/home/user';
var feHistory = [];
var feSearchTerm = '';
var feShowHidden = false;

function feGetNode(path) {
  if (path === '/home/user') return feFS['/home/user'];
  if (path === '/home/user/.hidden') return feFS['/home/user/.hidden'];
  var parts = path.replace('/home/user', '').split('/').filter(Boolean);
  var node = feFS['/home/user'];
  for (var i = 0; i < parts.length; i++) {
    if (node.children && node.children[parts[i]]) node = node.children[parts[i]];
    else return null;
  }
  return node;
}

function feRender() {
  var list = document.getElementById('fe-list');
  var node = feGetNode(feCwd);
  document.getElementById('fe-path').innerText = feCwd;
  list.innerHTML = '';
  if (!node || node.type !== 'folder') {
    list.innerHTML = '<div class="fe-empty">Cannot open this location</div>';
    return;
  }
  var children = node.children || {};
  var keys = Object.keys(children);
  var shown = 0;
  keys.forEach(function (name) {
    var child = children[name];
    if (feSearchTerm && name.toLowerCase().indexOf(feSearchTerm.toLowerCase()) === -1) return;
    shown++;
    var div = document.createElement('div');
    div.className = 'fe-item';
    var icon;
    if (child.type === 'folder') icon = '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6a1 1 0 011-1h6l2 2h11a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" class="acc"/></svg>';
    else if (child.type === 'app') icon = '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" class="acc"/></svg>';
    else if (child.type === 'image') icon = '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" class="acc"/><circle cx="9" cy="10" r="2" fill="#fff"/><path d="M3 18l5-5 4 4 4-4 5 5" stroke="#fff" stroke-width="1.5" fill="none"/></svg>';
    else icon = '<svg viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#fff" class="acc-stroke" stroke-width="1.5"/></svg>';
    div.innerHTML = '<div class="fe-icon">' + icon + '</div><span>' + name + '</span>';

    div.addEventListener('click', function (e) {
      e.stopPropagation();
      document.querySelectorAll('.fe-item.selected').forEach(function (i) { i.classList.remove('selected'); });
      div.classList.add('selected');
    });
    div.addEventListener('dblclick', function (e) {
      e.stopPropagation();
      div.classList.remove('selected');
      if (child.type === 'folder') {
        feHistory.push(feCwd);
        feCwd = feCwd + '/' + name;
        feSearchTerm = '';
        document.getElementById('fe-search').value = '';
        feRender();
      } else if (child.type === 'app') {
        openWin(child.appId, div);
      } else if (child.type === 'image') {
        ivOpen(child.src);
      } else {
        openNotepadFile(name, child.content);
      }
    });
    div.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var menu = document.getElementById('ctx-menu');
      menu.innerHTML = '';
      addCtxItem(menu, 'Open', function () {
        div.dispatchEvent(new Event('dblclick'));
      });
      addCtxItem(menu, 'Delete', function () {
        if (confirm('Delete ' + name + '?')) {
          delete children[name];
          feRender();
          saveState();
          showToast('Deleted', name);
        }
      });
      if (child.type === 'file') {
        addCtxItem(menu, 'Rename', function () {
          var newName = prompt('New name:', name);
          if (newName && newName !== name) {
            children[newName] = children[name];
            delete children[name];
            feRender();
            saveState();
          }
        });
      }
      menu.style.left = e.clientX + 'px';
      menu.style.top = e.clientY + 'px';
      menu.classList.add('open');
    });
    list.appendChild(div);
  });

  if (feCwd === '/home/user' && feShowHidden) {
    var hiddenNode = feFS['/home/user/.hidden'];
    if (hiddenNode) {
      var div = document.createElement('div');
      div.className = 'fe-item';
      div.innerHTML = '<div class="fe-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M3 6a1 1 0 011-1h6l2 2h11a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" class="acc" opacity="0.5"/></svg></div><span style="opacity:0.6">.hidden</span>';
      div.addEventListener('click', function (e) { e.stopPropagation(); });
      div.addEventListener('dblclick', function () {
        feHistory.push(feCwd);
        feCwd = '/home/user/.hidden';
        feRender();
      });
      list.appendChild(div);
      shown++;
    }
  }
  if (shown === 0) list.innerHTML = '<div class="fe-empty">No items found</div>';
}

function feGoBack() {
  if (feHistory.length > 0) {
    feCwd = feHistory.pop();
    feSearchTerm = '';
    document.getElementById('fe-search').value = '';
    feRender();
  }
}

function feGoHome() {
  feCwd = '/home/user';
  feHistory = [];
  feSearchTerm = '';
  document.getElementById('fe-search').value = '';
  feRender();
}

function feSearch(term) { feSearchTerm = term; feRender(); }

function openNotepadFile(name, content) {
  document.getElementById('notepad-text').value = content || '';
  document.getElementById('notepad-title').innerText = 'Notepad - ' + name;
  var folder = findFileFolder(feFS['/home/user'], name, '/home/user');
  notepadCurrentFile = folder ? { name: name, folder: folder } : null;
  openWin('notepad');
}

function findFileFolder(node, name, path) {
  if (!node.children) return null;
  if (node.children[name] && node.children[name].type === 'file') return path;
  for (var k in node.children) {
    var child = node.children[k];
    if (child.type === 'folder') {
      var r = findFileFolder(child, name, path + '/' + k);
      if (r) return r;
    }
  }
  return null;
}

document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.key.toLowerCase() === 'h') {
    var fe = document.getElementById('win-fileexplorer');
    if (fe.classList.contains('open')) {
      e.preventDefault();
      feShowHidden = !feShowHidden;
      feRender();
    }
  }
});

function saveNotepad() {
  if (notepadCurrentFile) {
    var node = feGetNode(notepadCurrentFile.folder);
    if (node && node.children && node.children[notepadCurrentFile.name]) {
      node.children[notepadCurrentFile.name].content = document.getElementById('notepad-text').value;
      saveState();
      showToast('Saved', notepadCurrentFile.name);
      return;
    }
  }
  openSaveDialog();
}

function openSaveDialog() {
  var select = document.getElementById('save-folder');
  select.innerHTML = '';
  function walk(n, path) {
    if (n.type === 'folder') {
      var opt = document.createElement('option');
      opt.value = path;
      opt.innerText = path;
      select.appendChild(opt);
      if (n.children) {
        Object.keys(n.children).forEach(function (k) {
          if (n.children[k].type === 'folder') walk(n.children[k], path + '/' + k);
        });
      }
    }
  }
  walk(feFS['/home/user'], '/home/user');
  document.getElementById('save-name').value = '';
  document.getElementById('save-dialog').classList.add('open');
}

function closeSaveDialog() {
  document.getElementById('save-dialog').classList.remove('open');
}

function confirmSave() {
  var name = document.getElementById('save-name').value.trim();
  if (!name) { alert('Please enter a file name'); return; }
  if (!name.endsWith('.txt')) name += '.txt';
  var folder = document.getElementById('save-folder').value;
  var node = feGetNode(folder);
  if (!node || node.type !== 'folder') { alert('Cannot save here'); return; }
  if (!node.children) node.children = {};
  node.children[name] = { type: 'file', content: document.getElementById('notepad-text').value };
  notepadCurrentFile = { name: name, folder: folder };
  document.getElementById('notepad-title').innerText = 'Notepad - ' + name;
  closeSaveDialog();
  saveState();
  showToast('Saved', name);
  if (document.getElementById('win-fileexplorer').classList.contains('open')) feRender();
}

function shellInit() {
  shellInput = document.getElementById('shell-input');
  if (!shellInput) return;
  shellInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var cmd = this.value.trim();
      if (cmd) shellRun(cmd);
      this.value = '';
    }
  });
}

function shellWrite(text) {
  var body = document.getElementById('shell-body');
  var line = document.getElementById('shell-input-line');
  var div = document.createElement('div');
  div.textContent = text;
  body.insertBefore(div, line);
  body.scrollTop = body.scrollHeight;
}

function shellRun(cmd) {
  var body = document.getElementById('shell-body');
  var line = document.getElementById('shell-input-line');
  var prompt = document.createElement('div');
  prompt.className = 'shell-line';
  prompt.innerHTML = '<span class="shell-prompt">lxg&gt;</span><span>' + escHtml(cmd) + '</span>';
  body.insertBefore(prompt, line);

  var parts = cmd.split(' ');
  var c = parts[0].toLowerCase();
  var args = parts.slice(1);

  if (c === 'help') {
    shellWrite('Available commands:');
    shellWrite('  help          — this list');
    shellWrite('  ver           — version info');
    shellWrite('  whoami        — show current user');
    shellWrite('  pwd           — print working dir');
    shellWrite('  ls [path]     — list files');
    shellWrite('  cat <file>    — print a text file');
    shellWrite('  open <app>    — open app');
    shellWrite('  apps          — list all apps');
    shellWrite('  color <hex>   — change accent colour');
    shellWrite('  theme         — open theme app');
    shellWrite('  echo <text>   — repeat text');
    shellWrite('  date          — show today');
    shellWrite('  time          — show now');
    shellWrite('  clear         — clear screen');
    shellWrite('  reset         — wipe all saved data');
    shellWrite('  boot          — return to boot screen');
  } else if (c === 'ver') {
    shellWrite('LxgendOS Shell v1.0');
    shellWrite('Build: lxg-2026');
  } else if (c === 'whoami') {
    shellWrite('user');
  } else if (c === 'pwd') {
    shellWrite(feCwd);
  } else if (c === 'ls') {
    var path = args[0] || feCwd;
    if (path.charAt(0) !== '/') path = feCwd === '/home/user' ? '/home/user/' + path : feCwd + '/' + path;
    var node = feGetNode(path);
    if (!node || node.type !== 'folder') { shellWrite('ls: no such folder'); return; }
    var keys = Object.keys(node.children || {});
    if (keys.length === 0) shellWrite('(empty)');
    else keys.forEach(function (k) {
      var child = node.children[k];
      shellWrite((child.type === 'folder' ? '[dir]  ' : '       ') + k);
    });
  } else if (c === 'cat') {
    if (!args[0]) { shellWrite('cat: missing file name'); return; }
    var node = feGetNode(feCwd + '/' + args[0]);
    if (!node || node.type !== 'file') { shellWrite('cat: file not found'); return; }
    shellWrite(node.content);
  } else if (c === 'open') {
    if (!args[0]) { shellWrite('open: which app?'); return; }
    var appId = args[0].toLowerCase();
    var aliases = { 'calculator': 'calc', 'files': 'fileexplorer', 'file': 'fileexplorer', 'terminal': 'shell', 'image': 'imageviewer' };
    if (aliases[appId]) appId = aliases[appId];
    if (APPS[appId]) { openWin(appId); shellWrite('Opened ' + APPS[appId].name); }
    else shellWrite('open: unknown app "' + appId + '"');
  } else if (c === 'apps') {
    for (var id in APPS) shellWrite('  ' + id.padEnd(14) + APPS[id].name);
  } else if (c === 'color') {
    if (!args[0] || args[0].charAt(0) !== '#') { shellWrite('color: give a hex like #00ff00'); return; }
    setAccent(args[0], args[0], null);
    shellWrite('Accent set to ' + args[0]);
  } else if (c === 'theme') {
    openWin('theme');
    shellWrite('Opened Theme app');
  } else if (c === 'echo') {
    shellWrite(args.join(' '));
  } else if (c === 'date') {
    shellWrite(new Date().toDateString());
  } else if (c === 'time') {
    shellWrite(new Date().toLocaleTimeString());
  } else if (c === 'clear') {
    body.querySelectorAll('div').forEach(function (d) {
      if (d.id !== 'shell-input-line') d.remove();
    });
    return;
  } else if (c === 'reset') {
    localStorage.removeItem(storageKey);
    shellWrite('All saved data cleared.');
    showToast('Data cleared', 'Refresh to start fresh');
    return;
  } else if (c === 'boot') {
    powerOff();
    return;
  } else {
    shellWrite('lxg: unknown command "' + c + '". Try "help".');
  }
}

function escHtml(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function switchClockTab(el, tab) {
  document.querySelectorAll('.clock-tab').forEach(function (t) { t.classList.remove('active'); });
  document.querySelectorAll('.clock-content').forEach(function (c) { c.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('clock-tab-' + tab).classList.add('active');
}

function timerToggle() {
  var btn = document.getElementById('timer-start');
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    btn.innerText = 'Start';
    return;
  }
  if (timerRemaining <= 0) {
    var h = parseInt(document.getElementById('timer-h').value) || 0;
    var m = parseInt(document.getElementById('timer-m').value) || 0;
    var s = parseInt(document.getElementById('timer-s').value) || 0;
    timerRemaining = h * 3600 + m * 60 + s;
  }
  if (timerRemaining <= 0) return;
  btn.innerText = 'Pause';
  timerInterval = setInterval(function () {
    timerRemaining--;
    updateTimerDisplay();
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      document.getElementById('timer-start').innerText = 'Start';
      showToast('Timer done!', 'Time is up');
    }
  }, 1000);
}

function updateTimerDisplay() {
  var h = Math.floor(timerRemaining / 3600);
  var m = Math.floor((timerRemaining % 3600) / 60);
  var s = timerRemaining % 60;
  document.getElementById('timer-display').innerText = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function timerReset() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerRemaining = 0;
  document.getElementById('timer-start').innerText = 'Start';
  updateTimerDisplay();
}

function swToggle() {
  var btn = document.getElementById('sw-start');
  if (swInterval) {
    clearInterval(swInterval);
    swInterval = null;
    btn.innerText = 'Start';
    return;
  }
  btn.innerText = 'Pause';
  swInterval = setInterval(function () {
    swSeconds++;
    updateSwDisplay();
  }, 1000);
}

function updateSwDisplay() {
  var h = Math.floor(swSeconds / 3600);
  var m = Math.floor((swSeconds % 3600) / 60);
  var s = swSeconds % 60;
  document.getElementById('stopwatch-display').innerText = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function swReset() {
  if (swInterval) { clearInterval(swInterval); swInterval = null; }
  swSeconds = 0;
  document.getElementById('sw-start').innerText = 'Start';
  updateSwDisplay();
}

function addAlarm() {
  var t = document.getElementById('alarm-time').value;
  if (!t) return;
  alarms.push({ time: t, fired: false });
  renderAlarms();
}

function removeAlarm(i) {
  alarms.splice(i, 1);
  renderAlarms();
}

function renderAlarms() {
  var list = document.getElementById('alarm-list');
  list.innerHTML = '';
  if (alarms.length === 0) {
    list.innerHTML = '<div style="color:var(--text-dim);text-align:center;font-size:12px;padding:20px 0">No alarms set</div>';
    return;
  }
  alarms.forEach(function (a, i) {
    var div = document.createElement('div');
    div.className = 'alarm-item';
    div.innerHTML = '<span>' + a.time + '</span>';
    var btn = document.createElement('button');
    btn.innerText = '✕';
    btn.onclick = function () { removeAlarm(i); };
    div.appendChild(btn);
    list.appendChild(div);
  });
}

function ivOpen(src) {
  document.getElementById('iv-image').src = src;
  ivZoomLevel = 1;
  document.getElementById('iv-image').style.transform = 'scale(1)';
  document.getElementById('iv-zoom-label').innerText = '100%';
  openWin('imageviewer');
}

function ivZoom(delta) {
  ivZoomLevel += delta;
  if (ivZoomLevel < 0.2) ivZoomLevel = 0.2;
  if (ivZoomLevel > 5) ivZoomLevel = 5;
  document.getElementById('iv-image').style.transform = 'scale(' + ivZoomLevel + ')';
  document.getElementById('iv-zoom-label').innerText = Math.round(ivZoomLevel * 100) + '%';
}

function ivReset() {
  ivZoomLevel = 1;
  document.getElementById('iv-image').style.transform = 'scale(1)';
  document.getElementById('iv-zoom-label').innerText = '100%';
}

function paintInit() {
  var canvas = document.getElementById('paint-canvas');
  paintCtx = canvas.getContext('2d');
  paintCtx.fillStyle = '#ffffff';
  paintCtx.fillRect(0, 0, canvas.width, canvas.height);
  paintCtx.lineCap = 'round';
  paintCtx.lineJoin = 'round';

  canvas.addEventListener('mousedown', function (e) {
    paintDrawing = true;
    paintCtx.beginPath();
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var x = (e.clientX - rect.left) * scaleX;
    var y = (e.clientY - rect.top) * scaleY;
    paintCtx.moveTo(x, y);
  });

  canvas.addEventListener('mousemove', function (e) {
    if (!paintDrawing) return;
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var x = (e.clientX - rect.left) * scaleX;
    var y = (e.clientY - rect.top) * scaleY;
    var size = parseInt(document.getElementById('paint-size').value);
    paintCtx.lineWidth = size * scaleX;
    if (paintCurrentTool === 'eraser') paintCtx.strokeStyle = '#ffffff';
    else paintCtx.strokeStyle = document.getElementById('paint-color').value;
    paintCtx.lineTo(x, y);
    paintCtx.stroke();
  });

  document.addEventListener('mouseup', function () { paintDrawing = false; });
}

function paintTool(t) {
  paintCurrentTool = t;
  document.getElementById('paint-brush').classList.toggle('active', t === 'brush');
  document.getElementById('paint-eraser').classList.toggle('active', t === 'eraser');
}

function paintClear() {
  var canvas = document.getElementById('paint-canvas');
  paintCtx.fillStyle = '#ffffff';
  paintCtx.fillRect(0, 0, canvas.width, canvas.height);
}

function paintSave() {
  var canvas = document.getElementById('paint-canvas');
  var url = canvas.toDataURL('image/png');
  var a = document.createElement('a');
  a.href = url;
  a.download = 'lxgend-paint.png';
  a.click();
  showToast('Paint saved', 'Check your downloads');
}

var storeApps = [
  { id: 'web', name: 'Web Browser', desc: 'Browse the web', icon: '🌐' },
  { id: 'music', name: 'Music Player', desc: 'Coming soon', icon: '🎵', disabled: true },
  { id: 'mail', name: 'Mail', desc: 'Coming soon', icon: '✉️', disabled: true },
  { id: 'code', name: 'Code Editor', desc: 'Coming soon', icon: '💻', disabled: true },
  { id: 'video', name: 'Video Player', desc: 'Coming soon', icon: '🎬', disabled: true },
  { id: 'photos', name: 'Photos', desc: 'Coming soon', icon: '🖼️', disabled: true }
];

function renderStore() {
  var grid = document.getElementById('store-grid');
  grid.innerHTML = '';
  storeApps.forEach(function (app) {
    var card = document.createElement('div');
    card.className = 'store-card';
    card.innerHTML = '<div class="sc-icon">' + app.icon + '</div><div class="sc-info"><div class="sc-name">' + app.name + '</div><div class="sc-desc">' + app.desc + '</div></div>';
    var b = document.createElement('button');
    b.className = 'sc-btn' + (app.disabled ? ' installed' : '');
    b.innerText = app.disabled ? 'Coming soon' : 'Open';
    b.onclick = function () {
      if (app.disabled) return;
      if (app.id === 'web') { closeWin('store'); openWin('browser'); }
    };
    card.appendChild(b);
    grid.appendChild(card);
  });
}

function navigateTo(url) {
  var frame = document.getElementById('browser-frame');
  var home = document.getElementById('browser-home');
  home.style.display = 'none';
  frame.style.display = 'block';
  frame.src = url;
  document.getElementById('browser-url').value = url;
}

function showBrowserHome() {
  document.getElementById('browser-home').style.display = 'flex';
  document.getElementById('browser-frame').style.display = 'none';
  document.getElementById('browser-frame').src = 'about:blank';
  document.getElementById('browser-url').value = '';
}

function browserGo(input) {
  input = (input || '').trim();
  if (!input) return;
  var url;
  if (input.match(/^https?:\/\//)) url = input;
  else if (input.match(/^[\w-]+\.(com|org|net|io|dev|co|edu|gov|in|gg|xyz|app|site|me|tv)(\/.*)?$/i)) url = 'https://' + input;
  else url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(input);

  navigateTo(url);

  browserHistory = browserHistory.slice(0, browserHistIndex + 1);
  browserHistory.push(url);
  browserHistIndex = browserHistory.length - 1;
}

function browserBack() {
  if (browserHistIndex <= 0) return;
  browserHistIndex--;
  var url = browserHistory[browserHistIndex];
  if (url === null) showBrowserHome();
  else navigateTo(url);
}

function browserForward() {
  if (browserHistIndex >= browserHistory.length - 1) return;
  browserHistIndex++;
  var url = browserHistory[browserHistIndex];
  if (url === null) showBrowserHome();
  else navigateTo(url);
}

function browserReload() {
  var frame = document.getElementById('browser-frame');
  if (frame.style.display !== 'none' && frame.src && frame.src !== 'about:blank') {
    var src = frame.src;
    frame.src = 'about:blank';
    setTimeout(function () { frame.src = src; }, 30);
  }
}

// ---- startup ----
updateBootTime();
applySavedState();
updateClock();
renderDesktopIcons();
renderStartApps('');
shellInit();
paintInit();
renderAlarms();
if (!qsState.wifi) document.getElementById('qs-wifi').classList.remove('active');
if (!qsState.bt) document.getElementById('qs-bt').classList.remove('active');

var loadingEl = document.getElementById('loading');
var bootEl = document.getElementById('boot');
bootEl.style.visibility = 'hidden';
setTimeout(function () { loadingEl.classList.add('active'); }, 100);
setTimeout(function () {
  loadingEl.classList.add('hidden');
  bootEl.style.visibility = '';
  setTimeout(function () { loadingEl.style.display = 'none'; }, 700);
}, 2200);

setInterval(updateClock, 1000);

setInterval(function () {
  var d = new Date();
  var h = String(d.getHours()).padStart(2, '0');
  var m = String(d.getMinutes()).padStart(2, '0');
  var s = String(d.getSeconds()).padStart(2, '0');
  var lc = document.getElementById('live-clock');
  if (lc) lc.innerText = h + ':' + m + ':' + s;
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var ld = document.getElementById('live-date');
  if (ld) ld.innerText = days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();

  var timeStr = h + ':' + m;
  for (var i = 0; i < alarms.length; i++) {
    if (alarms[i].time === timeStr && !alarms[i].fired) {
      alarms[i].fired = true;
      showToast('Alarm!', alarms[i].time);
    }
  }
}, 1000);

// autosave on any window focus
document.addEventListener('mouseup', function () {
  setTimeout(saveState, 200);
});