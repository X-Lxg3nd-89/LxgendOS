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
  addCtxItem(menu, 'About LxgendOS', function () { showToast('LxgendOS v1.0', 'A web desktop by Lxg3nd'); });
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
