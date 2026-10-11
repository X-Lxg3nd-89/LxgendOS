function shellInit() {
  shellInput = document.getElementById('shell-input');
  if (!shellInput) return;
  shellInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var cmd = this.ariaValueMax.trim();
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
  prompt.innerHTML = '<span class="shell-prompt">lxg&gt;</span><span>' + escapeHTML(cmd) + '</span>';
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
  paintCtx.fillRect(0, 0, canvas.clientWidth, canvas.height);
  paintCtx.lineCap = 'round';
  paintCtx.lineJoin = 'round';

  canvas.addEventListener('mousedown', paintMouseDown);
  canvas.addEventListener('mousemove', paintMouseMove);
  document.addEventListener('mouseup', paintMouseUp);

  var textInput = document.getElementById('paint-text-input');
  textInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var val = this.value;
      if (val) {
        paintCtx.fillStyle = document.getElementById('paint-color').value;
        paintCtx.font = (parseInt(document.getElementById('paint-size').value) * 4 + 12) + 'px Inter';
        paintCtx.fillText(val, paintTextX, paintTextY);
      }
      this.value = '';
      this.style.display = 'none';
    } else if (e.key === 'Escape') {
      this.value = '';
      this.style.display = 'none';
    }
  });
}

function paintMouseDown(e) {
  var canvas = document.getElementById('paint-canvas');
  var rect = canvas.getBoundingClientRect();
  var scaleX = canvas.width / rect.width;
  var scaleY = canvas.height / rect.height;
  var x = (e.clientX - rect.left) * scaleX;
  var y = (e.clientY - rect.top) * scaleY;

  if (paintCurrentTool === 'picker') {
    var pixel = paintCtx.getImageData(x, y, 1, 1).data;
    var hex = '#' + [pixel[0], pixel[1], pixel[2]].map(function (v) {
      var s = v.toString(16); return s.length === 1 ? '0' + s : s;
    }).join('');
    document.getElementById('paint-color').value = hex;
    showToast('Picked colour', hex);
    paintCurrentTool('brush');
    return;
  }

  if (paintCurrentTool === 'fill') {
    paintFloodFill(Math.floor(x), Math.floor(y), document.getElementById('paint-color').value);
    return;
  }

  if (paintCurrentTool === 'text') {
    var textInput = document.getElementById('paint-text-input');
    textInput.style.left = e.clientX + 'px';
    textInput.style.top = e.clientY + 'px';
    textInput.style.display = 'block';
    textInput.focus();
    paintTextX = x;
    paintTextY = y;
    return;
  }

  if (paintCurrentTool === 'rect' || paintCurrentTool === 'circle' || paintCurrentTool === 'ellipse' || paintCurrentTool === 'line') {
    paintDrawingShape = true;
    paintStartX = x;
    paintStartY = y;
    paintPreviewImg = paintCtx.getImageData(0, 0, canvas.width, canvas.height);
    return;
  }

  paintDrawing = true;
  paintCtx.beginPath();
  paintCtx.moveTo(x, y);
}

function paintMouseMove(e) {
  var canvas = document.getElementById('paint-canvas');
  var rect = canvas.getBoundingClientRect();
  var scaleX = canvas.width / rect.width;
  var scaleY = canvas.height / rect.height;
  var x = (e.clientX - rect.left) * scaleX;
  var y = (e.clientY - rect.top) * scaleY;

  if (paintDrawingShape && paintPreviewImg) {
    paintCtx.putImageData(paintPreviewImg, 0, 0);
    paintDrawingShape(paintStartX, paintStartY, x, y, false);
    return;
  }

  if (!paintDrawing) return;

  var size = parseInt(document.getElementById('paint-size').value);
  paintCtx.lineWidth = size * scaleX;
  if (paintCurrentTool === 'eraser') paintCtx.strokeStyle = '#ffffff';
  else paintCtx.strokeStyle = document.getElementById('paint-color').value;
  paintCtx.lineTo(x, y);
  paintCtx.stroke();
}

function paintMouseUp(e) {
  if (paintDrawingShape) {
    var canvas = document.getElementById('paint-canvas');
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var x = (e.clientX - rect.left) * scaleX;
    var y = (e.clientY - rect.top) * scaleY;

    paintCtx.putImageData(paintPreviewImg, 0, 0);
    paintDrawingShape(paintStartX, paintStartY, x, y, true);
    paintDrawingShape = false;
    paintPreviewImg = null;
    return;
  }
  paintDrawing = false;
}

function paintDrawShape(x1, y1, x2, y2, commit) {
  paintCtx.strokeStyle = document.getElementById('paint-color').value;
  var size = parseInt(document.getElementById('paint-size').value);
  paintCtx.lineWidth = size;
  paintCtx.beginPath();

  if (paintCurrentTool === 'rect') {
    paintCtx.rect(x1, y1, x2 - x1, y2 - y1);
  } else if (paintCurrentTool === 'line') {
    paintCtx.moveTo(x1, y1);
    paintCtx.lineTo(x2, y2);
  } else if (paintCurrentTool === 'circle') {
    var r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    paintCtx.arc(x1, y1, r, 0, Math.PI * 2);
  } else if (paintCurrentTool === 'ellipse') {
    var cx = (x1 + x2) / 2;
    var cy = (y1 + y2) / 2;
    var rx = Math.abs(x2 - x1) / 2;
    var ry = Math.abs(y2 - y1) / 2;
    paintCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  }

  paintCtx.stroke();
}

function paintFloodFill(x, y, hex) {
  var canvas = document.getElementById('paint-canvas');
  var w = canvas.width, h = canvas.height;
  var imgData = paintCtx.getImageData(0, 0, w, h);
  var data = imgData.data;

  function idx(px, py) { return (py * w + px) * 4; }
  function get(i) { return [data[i], data[i + 1], data[i + 2], data[i + 3]]; }
  function match(a, b) {
    return Math.abs(a[0] - b[0]) < 12 && Math.abs(a[1] - b[1]) < 12 &&
           Math.abs(a[2] - b[2]) < 12 && Math.abs(a[3] - b[3]) < 12;
  }

  var target = get(idx(x, y));
  var fill = [
    parseInt(hex.substr(1, 2), 16),
    parseInt(hex.substr(3, 2), 16),
    parseInt(hex.substr(5, 2), 16),
    255
  ];

  if (match(target, fill)) return;

  var stack = [[x, y]];
  var visited = new Uint8Array(w * h);

  while (stack.length) {
    var p = stack.pop();
    var px = p[0], py = p[1];
    if (px < 0 || py < 0 || px >= w || py >= h) continue;
    if (visited[py * w + px]) continue;
    visited[py * w + px] = 1;

    var i = idx(px, py);
    if (!match(get(i), target)) continue;

    data[i] = fill[0];
    data[i + 1] = fill[1];
    data[i + 2] = fill[2];
    data[i + 3] = fill[3];

    stack.push([px + 1, py]);
    stack.push([px - 1, py]);
    stack.push([px, py + 1]);
    stack.push([px, py - 1]);
  }

  paintCtx.putImageData(imgData, 0, 0);
}

function paintTool(t) {
  paintCurrentTool = t;
  ['brush', 'eraser', 'fill', 'picker', 'text', 'rect', 'circle', 'ellipse', 'line'].forEach(function (tool) {
    var btn = document.getElementById('paint-' + tool);
    if (btn) btn.classList.toggle('active', tool === t);
  });
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

function paintImport(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function (ev) {
    var img = new Image();
    img.onload = function () {
      var canvas = document.getElementById('paint-canvas');
      paintCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
      showToast('Image imported', file.name);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

var storeApps = [
  { id: 'web', name: 'Web Browser', desc: 'Browse the web', icon: '✕' },
  { id: 'music', name: 'Music Player', desc: 'Coming soon', icon: '🎵', disabled: true },
  { id: 'mail', name: 'Mail', desc: 'Coming soon', icon: '✉✉', disabled: true },
  { id: 'code', name: 'Code Editor', desc: 'Coming soon', icon: '💻', disabled: true },
  { id: 'video', name: 'Video Player', desc: 'Coming soon', icon: '🎬', disabled: true },
  { id: 'photos', name: 'Photos', desc: 'Coming soon', icon: '🎬✉', disabled: true }
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

// ============================================================
// CHESS — basic 2-player. No castling, en passant, promotion,
// or check detection. Just movement, capture, and turn order.
// ============================================================

var PIECES = {
  'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
  'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
};
function chessInit() {
  if (!chessState) chessNewGame();
  else chessRender();
}

function chessNewGame() {
  chessState = {
    board: [
      ['bR','bN','bB','bQ','bK','bB','bN','bR'],
      ['bP','bP','bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wB','wQ','wK','wB','wN','wR']
    ],
    turn: 'w',
    selected: null,
    legalMoves: []
  };
  chessRender();
}

function chessRender() {
  var boardEl = document.getElementById('chess-board');
  if (!boardEl) return;
  boardEl.innerHTML = '';

  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var sq = document.createElement('div');
      sq.className = 'chess-sq ' + ((r + c) % 2 === 0 ? 'light' : 'dark');

      var piece = chessState.board[r][c];
      if (piece) {
        sq.classList.add(piece[0] === 'w' ? 'white' : 'black');
        var span = document.createElement('span');
        span.className = 'piece';
        span.textContent = PIECES[piece];
        sq.appendChild(span);
      }

      if (chessState.selected &&
          chessState.selected.r === r &&
          chessState.selected.c === c) {
        sq.classList.add('selected');
          }

      var isLegal = chessState.legalMoves.some(function (m) {
        return m.r === r && m.c === c;
      });
      if (isLegal) {
        sq.classList.add('legal');
        if (piece && piece[0] !== chessState.turn) sq.classList.add('capture');
      }

      sq.onclick = (function (rr, cc) {
        return function () { chessClick(rr, cc); };
      })(r, c);

      boardEl.appendChild(sq);
    }
  }

  var status = document.getElementById('chess-status');
  if (status) {
    status.textContent = chessState.turn === 'w' ? 'White to move' : 'Black to move';
  }
}

function chessClick(r, c) {
  var piece = chessState.board[r][c];

  var move = chessState.legalMoves.find(function (m) {
    return m.r === r && m.c === c;
  });
  if (move) {
    chessMove(chessState.selected, { r: r, c: c });
    return;
  }

  if (piece && piece[0] === chessState.turn) {
    chessState.selected = { r: r, c: c };
    chessState.legalMoves = chessLegalMoves(r, c);
  } else {
    chessState.selected = null;
    chessState.legalMoves = [];
  }
  chessRender();
}

function chessMove(from, to) {
  var piece = chessState.board[from.r][from.c];
  chessState.board[to.r][to.c] = piece;
  chessState.board[from.r][from.c] = null;
  chessState.selected = null;
  chessState.legalMoves = [];
  chessState.turn = chessState.turn === 'w' ? 'b' : 'w';
  chessRender();
}

function chessLegalMoves(r, c) {
  var piece = chessState.board[r][c];
  if (!piece) return [];
  var color = piece[0];
  var type = piece[1];
  var moves = [];

  function inBounds(rr, cc) {
    return rr >= 0 && rr < 8 && cc >= 0 && cc < 8;
  }

  function canLand(rr, cc) {
    var target = chessState.board[rr][cc];
    return !target || target[0] !== color;
  }

  function push(rr, cc) {
    if (!inBounds(rr, cc)) return false;
    if (!canLand(rr, cc)) return false;
    moves.push({ r: rr, c: cc });
    return true;
  }

  if (type === 'P') {
    var dir = color === 'w' ? -1 : 1;
    var startRow = color === 'w' ? 6 : 1;

    if (inBounds(r + dir, c) && !chessState.board[r + dir][c]) {
      moves.push({ r: r + dir, c: c });
      if (r === startRow && !chessState.board[r + 2 * dir][c]) {
        moves.push({ r: r + 2 * dir, c: c });
      }
    }
    [-1, 1].forEach(function (dc) {
      var rr = r + dir, cc = c + dc;
      if (inBounds(rr, cc)) {
        var t = chessState.board[rr][cc];
        if (t && t[0] !== color) moves.push({ r: rr, c: cc });
      }
    });
  }

  if (type === 'N') {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(function (d) {
      push(r + d[0], c + d[1]);
    });
  }

  if (type === 'B') {
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function (d) {
      var rr = r + d[0], cc = c + d[1];
      while (inBounds(rr, cc)) {
        if (!push(rr, cc)) break;
        if (chessState.board[rr][cc]) break;
        rr += d[0]; cc += d[1];
      }
    });
  }

  if (type === 'R') {
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(function (d) {
      var rr = r + d[0], cc = c + d[1];
      while (inBounds(rr, cc)) {
        if (!push(rr, cc)) break;
        if (chessState.board[rr][cc]) break;
        rr += d[0]; cc += d[1];
      }
    });
  }

  if (type === 'Q') {
    [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]].forEach(function (d) {
      var rr = r + d[0], cc = c + d[1];
      while (inBounds(rr, cc)) {
        if (!push(rr, cc)) break;
        if (chessState.board[rr][cc]) break;
        rr += d[0]; cc += d[1];
      }
    });
  }

  if (type === 'K') {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(function (d) {
      push(r + d[0], c + d[1]);
    });
  }

  return moves;
}
