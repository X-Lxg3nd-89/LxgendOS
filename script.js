function updateBootTime() {
  var now = new Date();
  var hrs = now.getHours();
  var mins = now.getMinutes();
  if (hrs < 10) hrs = '0' + hrs;
  if (mins < 10) mins = '0' + mins;
  document.getElementById('boot-time').innerText = hrs + ':' + mins;

  var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('boot-date').innerText = dayNames[now.getDay()] + ', ' + monthNames[now.getMonth()] + ' ' + now.getDate();
}
updateBootTime();

function dismissBoot() {
  document.getElementById('boot').classList.add('hidden');
}

function powerOff() {
  closeQuickSettings();
  closeStartMenu();
  document.querySelectorAll('.window').forEach(function (w) {
    w.classList.remove('open');
  });
  document.getElementById('boot').classList.remove('hidden');
  updateBootTime();
}


/* calculator stuff */
var cur = "0";
var prevVal = null;
var operator = null;
var resetNext = false;

function updateScreen() {
  document.getElementById("screen").innerText = cur;
}

function press(val) {
  if (resetNext) {
    cur = val;
    resetNext = false;
  } else {
    if (val == "." && cur.includes(".")) return;

    if (cur == "0" && val != ".") {
      cur = val;
    } else {
      cur += val;
    }
  }
  updateScreen();
}

function pressOp(o) {
  if (operator != null && !resetNext) calculate();
  prevVal = cur;
  operator = o;
  resetNext = true;
}

function calculate() {
  if (operator == null || prevVal == null) return;

  var a = parseFloat(prevVal), b = parseFloat(cur);
  var res = 0;

  switch (operator) {
    case "+": res = a + b; break;
    case "-": res = a - b; break;
    case "*": res = a * b; break;
    case "/":
      if (b == 0) {
        cur = "Error";
        updateScreen();
        prevVal = null; operator = null;
        resetNext = true;
        return;
      }
      res = a / b;
      break;
  }

  // avoid 0.1 + 0.2 nonsense
  res = Math.round(res * 100000000) / 100000000;
  cur = String(res);
  prevVal = null;
  operator = null;
  resetNext = true;
  updateScreen();
}

function clearScreen() {
  cur = "0"; prevVal = null; operator = null; resetNext = false;
  updateScreen();
}

function backspace() {
  if (resetNext) {
    cur = "0";
    resetNext = false;
  }
  else {
    cur = cur.slice(0, -1);
    if (cur == "") cur = "0";
  }
  updateScreen();
}


var topZ = 10;

function openWin(id) {
  var win = document.getElementById("win-" + id);
  win.classList.add("open");
  win.style.zIndex = ++topZ;

  if (id === 'fileexplorer') feRender();

  closeStartMenu();
  closeQuickSettings();
}

function closeWin(id) {
  document.getElementById("win-" + id).classList.remove("open");
}

function minWin(id) { document.getElementById("win-" + id).classList.remove("open") }

function maxWin(id) {
  var el = document.getElementById("win-" + id);

  if (el.dataset.max == "1") {
    // put it back
    el.style.width = "";
    el.style.height = "";
    el.style.left = "50%";
    el.style.top = "50%";
    el.style.transform = "translate(-50%, -50%)";
    el.dataset.max = "0";
  }
  else {
    el.style.width = "90vw";   el.style.height = "80vh";
    el.style.left = "5vw";     el.style.top = "10vh";
    el.style.transform = "none";
    el.dataset.max = "1";
  }
}


var dragging = null;
var offX = 0, offY = 0;

function startDrag(e, id) {
  if (e.target.classList.contains("dot")) return;

  dragging = document.getElementById(id);
  dragging.style.zIndex = ++topZ;

  var box = dragging.getBoundingClientRect();
  dragging.style.transform = "none";
  dragging.style.left = box.left + "px";
  dragging.style.top = box.top + "px";

  offX = e.clientX - box.left;
  offY = e.clientY - box.top;

  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", endDrag);
}

function doDrag(e) {
  if (!dragging) return;
  dragging.style.left = (e.clientX - offX) + "px";
  dragging.style.top  = (e.clientY - offY) + "px";
}

function endDrag() {
  dragging = null;
  document.removeEventListener("mousemove", doDrag);
  document.removeEventListener("mouseup", endDrag);
}


/* THEME */
function setBg(value, el) {
  const layer = document.getElementById('bg-layer');

  if (value.charAt(0) == "#") {
    layer.style.backgroundImage = "none";
    layer.style.backgroundColor = value;
  } else {
    layer.style.backgroundImage = "url('" + value + "')";
  }

  document.querySelectorAll(".bg-thumb, .color-swatch").forEach(function (t) {
    t.classList.remove("selected");
  });
  if (el) el.classList.add("selected");
}

function importBg(e) {
  var f = e.target.files[0];
  if (!f) return;

  var rd = new FileReader();
  rd.onload = function (ev) {
    var url = ev.target.result;
    var thumb = document.createElement('div');
    thumb.className = 'bg-thumb';
    thumb.style.backgroundImage = 'url(' + url + ')';
    thumb.onclick = function () { setBg(url, thumb); };

    document.getElementById('theme-grid').appendChild(thumb);
    setBg(url, thumb);
  };
  rd.readAsDataURL(f);
}

function setAccent(color, hover, el) {
  var root = document.documentElement;
  root.style.setProperty('--accent', color);
  root.style.setProperty('--accent-hover', hover);

  document.querySelectorAll('.accent-swatch').forEach(function (s) { s.classList.remove('selected'); });
  if (el) el.classList.add('selected');
}

function toggleMode() {
  document.body.classList.toggle('light');
}


// taskbar clock
function updateClock() {
  var t = new Date();
  var hh = t.getHours(), min = t.getMinutes();
  if (hh < 10) hh = '0' + hh;
  if (min < 10) min = '0' + min;

  var day = t.getDate();
  var mon = t.getMonth() + 1;
  var year = t.getFullYear();
  if (day < 10) day = '0' + day;
  if (mon < 10) mon = '0' + mon;

  document.getElementById('tray-time').innerText = hh + ':' + min;
  document.getElementById('tray-date').innerText = day + '/' + mon + '/' + year;
}
updateClock();
setInterval(updateClock, 1000);


/* quick settings */
function toggleQuickSettings(e) {
  if (e) e.stopPropagation();
  document.getElementById('quick-settings').classList.toggle('open');
  closeStartMenu();
}

function closeQuickSettings() {
  document.getElementById('quick-settings').classList.remove('open');
}

function toggleTile(el) { el.classList.toggle('active'); }

function setBrightness(v) {
  var overlay = document.getElementById('dim-overlay');
  var amt = (100 - v) / 100 * 0.85;
  overlay.style.opacity = amt;
}

function setVolume(v) {
  // nothing
}


/* START MENU */
var apps = [
  { id: 'calc',         name: 'Calculator' },
  { id: 'notepad',      name: 'Notepad' },
  { id: 'fileexplorer', name: 'Files' },
  { id: 'theme',        name: 'Theme' }
];

function appIcon(id) {
  if (id === 'calc') return '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" class="acc"/><rect x="6" y="5" width="12" height="4" rx="1" fill="#fff"/></svg>';
  if (id === 'notepad') return '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" fill="#fff" class="acc-stroke" stroke-width="1.5"/><line x1="8" y1="8" x2="16" y2="8" stroke="#888" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="#888" stroke-width="1.5" stroke-linecap="round"/></svg>';
  if (id === 'fileexplorer') return '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6a1 1 0 011-1h6l2 2h11a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" class="acc"/></svg>';
  if (id === 'theme') return '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" fill="none" class="acc-stroke" stroke-width="2"/><path d="M12 4v8 8" class="acc-stroke" stroke-width="2"/></svg>';
  return '';
}

function renderStartApps(filter) {
  var box = document.getElementById('start-apps');
  box.innerHTML = '';

  var matches = apps.filter(function (a) {
    return !filter || a.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
  });

  if (matches.length === 0) {
    box.innerHTML = '<div class="start-empty">No apps found</div>';
    return;
  }

  matches.forEach(function (app) {
    var item = document.createElement('div');
    item.className = 'start-app';
    item.innerHTML = '<div class="sa-icon">' + appIcon(app.id) + '</div><div class="sa-label">' + app.name + '</div>';
    item.onclick = function () { openWin(app.id); };
    box.appendChild(item);
  });
}

function filterStartApps(v) { renderStartApps(v) }

function toggleStartMenu(e) {
  if (e) e.stopPropagation();

  var menu = document.getElementById('start-menu');
  menu.classList.toggle('open');
  closeQuickSettings();

  if (menu.classList.contains('open')) {
    renderStartApps('');
    document.getElementById('start-search-input').value = '';
    setTimeout(function () {
      document.getElementById('start-search-input').focus();
    }, 50);
  }
}

function closeStartMenu() {
  document.getElementById('start-menu').classList.remove('open');
}


// close stuff when you click somewhere else
document.addEventListener('click', function (e) {
  var qs = document.getElementById('quick-settings');
  var tray = document.querySelector('.tray');
  if (qs.classList.contains('open') && !qs.contains(e.target) && !tray.contains(e.target)) {
    qs.classList.remove('open');
  }

  var startMenu = document.getElementById('start-menu');
  var startBtn = document.querySelector('.taskbar button[title="Start"]');
  if (startMenu.classList.contains('open') && !startMenu.contains(e.target) && !startBtn.contains(e.target)) {
    startMenu.classList.remove('open');
  }

  var ctxMenu = document.getElementById('ctx-menu');
  if (ctxMenu.classList.contains('open') && !ctxMenu.contains(e.target)) {
    ctxMenu.classList.remove('open');
  }
});

document.addEventListener('contextmenu', function (e) {
  if (e.target.closest('.window')) return;
  e.preventDefault();

  var menu = document.getElementById('ctx-menu');
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.classList.add('open');
});


var fileSystem = {
  '/home/user': {
    type: 'folder',
    children: {
      'Documents': {
        type: 'folder',
        children: {
          'readme.txt': {
            type: 'file',
            content: 'LxgendOS — a web based desktop.\nBuilt by Lxg3nd.\n\nType "help" anywhere for a surprise.'
          },
          'todo.txt': {
            type: 'file',
            content: '1. Build LxgendOS\n2. Add more apps\n3. Ship it'
          }
        }
      },
      'Pictures': {
        type: 'folder',
        children: {
          'wallpapers': { type: 'folder', children: {} }
        }
      },
      'Projects': {
        type: 'folder',
        children: {
          'lxgendos': {
            type: 'folder',
            children: {
              'notes.txt': {
                type: 'file',
                content: 'LxgendOS project notes:\n- Nothing...'
              }
            }
          }
        }
      },
      'welcome.txt': {
        type: 'file',
        content: 'Welcome to LxgendOS!\n\nThis is your first file. Open it, edit it, save it.\n\nTry browsing into the folders.'
      }
    }
  },

  '/home/user/.hidden': {
    type: 'folder',
    hidden: true,
    children: {
      'easter_egg.txt': {
        type: 'file',
        content: 'You found the hidden folder.\n\nCongratulations.\n\nHere is your reward: nothing. \n\nJK comment it if you found this!'
      }
    }
  }
};

var cwd = '/home/user';
var navStack = [];
var searchQ = '';
var showHidden = false;

function feGetNode(path) {
  if (path === '/home/user') return fileSystem['/home/user'];
  if (path === '/home/user/.hidden') return fileSystem['/home/user/.hidden'];

  var bits = path.replace('/home/user', '').split('/').filter(Boolean);
  var n = fileSystem['/home/user'];

  for (var i = 0; i < bits.length; i++) {
    if (n.children && n.children[bits[i]]) n = n.children[bits[i]];
    else return null;
  }
  return n;
}

function feRender() {
  var listEl = document.getElementById('fe-list');
  var here = feGetNode(cwd);
  document.getElementById('fe-path').innerText = cwd;
  listEl.innerHTML = '';

  if (!here || here.type !== 'folder') {
    listEl.innerHTML = '<div class="fe-empty">Cannot open this location</div>';
    return;
  }

  var kids = here.children || {};
  var names = Object.keys(kids);

  if (searchQ && cwd === '/home/user') {
    var hits = [];

    function walk(node, path) {
      if (node.children) {
        Object.keys(node.children).forEach(function (nm) {
          var c = node.children[nm];
          var cPath = path + '/' + nm;
          if (nm.toLowerCase().indexOf(searchQ.toLowerCase()) !== -1) {
            hits.push({ name: nm, path: cPath, node: c });
          }
          if (c.type === 'folder') walk(c, cPath);
        });
      }
    }

    walk(here, '/home/user');
    if (showHidden && fileSystem['/home/user/.hidden']) {
      walk(fileSystem['/home/user/.hidden'], '/home/user/.hidden');
    }

    if (hits.length === 0) {
      listEl.innerHTML = '<div class="fe-empty">No matches</div>';
      return;
    }

    hits.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'fe-item';

      var ico = r.node.type === 'folder'
        ? '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6a1 1 0 011-1h6l2 2h11a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" class="acc"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#fff" class="acc-stroke" stroke-width="1.5"/></svg>';

      row.innerHTML = '<div class="fe-icon">' + ico + '</div><span>' + r.path + '</span>';
      row.onclick = function () {
        if (r.node.type === 'folder') {
          navStack.push(cwd);
          cwd = r.path;
          searchQ = '';
          document.getElementById('fe-search').value = '';
          feRender();
        }
        else {
          openNotepadFile(r.name, r.node.content);
        }
      };
      listEl.appendChild(row);
    });
    return;
  }

  var count = 0;
  names.forEach(function (name) {
    var child = kids[name];
    if (searchQ && name.toLowerCase().indexOf(searchQ.toLowerCase()) === -1) return;
    count++;

    var div = document.createElement('div');
    div.className = 'fe-item';

    var icon = child.type === 'folder'
      ? '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6a1 1 0 011-1h6l2 2h11a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" class="acc"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#fff" class="acc-stroke" stroke-width="1.5"/></svg>';

    div.innerHTML = '<div class="fe-icon">' + icon + '</div><span>' + name + '</span>';
    div.onclick = function () {
      if (child.type === 'folder') {
        navStack.push(cwd);
        cwd = cwd + '/' + name;
        searchQ = '';
        document.getElementById('fe-search').value = '';
        feRender();
      } else {
        openNotepadFile(name, child.content);
      }
    };
    listEl.appendChild(div);
  });

  if (cwd === '/home/user' && showHidden) {
    var hid = fileSystem['/home/user/.hidden'];
    if (hid) {
      var div = document.createElement('div');
      div.className = 'fe-item';
      div.innerHTML = '<div class="fe-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M3 6a1 1 0 011-1h6l2 2h11a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" class="acc" opacity="0.5"/></svg></div><span style="opacity:0.6">.hidden</span>';
      div.onclick = function () {
        navStack.push(cwd);
        cwd = '/home/user/.hidden';
        feRender();
      };
      listEl.appendChild(div);
      count++;
    }
  }

  if (count === 0) listEl.innerHTML = '<div class="fe-empty">No items found</div>';
}

function feGoBack() {
  if (navStack.length > 0) {
    cwd = navStack.pop();
    searchQ = '';
    document.getElementById('fe-search').value = '';
    feRender();
  }
}

function feGoHome() {
  cwd = '/home/user';
  navStack = [];
  searchQ = '';
  document.getElementById('fe-search').value = '';
  feRender();
}

function feSearch(term) {
  searchQ = term;
  feRender();
}


var curFile = null;

function openNotepadFile(name, content) {
  document.getElementById('notepad-text').value = content || '';
  document.getElementById('notepad-title').innerText = 'Notepad - ' + name;

  var parent = findFileFolder(fileSystem['/home/user'], name, '/home/user');
  curFile = parent ? { name: name, folder: parent } : null;

  openWin('notepad');
}

function findFileFolder(node, name, path) {
  if (!node.children) return null;
  if (node.children[name] && node.children[name].type === 'file') return path;

  for (var k in node.children) {
    var child = node.children[k];
    if (child.type === 'folder') {
      var found = findFileFolder(child, name, path + '/' + k);
      if (found) return found;
    }
  }
  return null;
}

document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.key.toLowerCase() === 'h') {
    var fe = document.getElementById('win-fileexplorer');
    if (fe.classList.contains('open')) {
      e.preventDefault();
      showHidden = !showHidden;
      feRender();
    }
  }
});


function saveNotepad() {
  if (curFile) {
    var n = feGetNode(curFile.folder);
    if (n && n.children && n.children[curFile.name]) {
      n.children[curFile.name].content = document.getElementById('notepad-text').value;
      return;
    }
  }
  openSaveDialog();
}

function openSaveDialog() {
  var sel = document.getElementById('save-folder');
  sel.innerHTML = '';

  function walk(n, path) {
    if (n.type === 'folder') {
      var opt = document.createElement('option');
      opt.value = path;
      opt.innerText = path;
      sel.appendChild(opt);

      if (n.children) {
        Object.keys(n.children).forEach(function (k) {
          if (n.children[k].type === 'folder') walk(n.children[k], path + '/' + k);
        });
      }
    }
  }
  walk(fileSystem['/home/user'], '/home/user');

  document.getElementById('save-name').value = '';
  document.getElementById('save-dialog').classList.add('open');
}

function closeSaveDialog() {
  document.getElementById('save-dialog').classList.remove('open');
}

function confirmSave() {
  var fname = document.getElementById('save-name').value.trim();
  if (!fname) { alert('Please enter a file name'); return; }
  if (!fname.endsWith('.txt')) fname += '.txt';

  var folderPath = document.getElementById('save-folder').value;
  var target = feGetNode(folderPath);

  if (!target || target.type !== 'folder') { alert('Cannot save here'); return; }
  if (!target.children) target.children = {};

  target.children[fname] = {
    type: 'file',
    content: document.getElementById('notepad-text').value
  };

  curFile = { name: fname, folder: folderPath };
  document.getElementById('notepad-title').innerText = 'Notepad - ' + fname;
  closeSaveDialog();

  if (document.getElementById('win-fileexplorer').classList.contains('open')) feRender();
}

renderStartApps('');