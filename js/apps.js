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
