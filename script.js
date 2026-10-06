function bootClockTick() {
  var rightNow = new Date();
  var hr = rightNow.getHours();
  var mn = rightNow.getMinutes();
  if (hr < 10) hr = '0' + hr;
  if (mn < 10) mn = '0' + mn;
  document.getElementById('boot-time').innerText = hr + ':' + mn;

  var dayRoll = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var monthRoll = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('boot-date').innerText = dayRoll[rightNow.getDay()] + ', ' + monthRoll[rightNow.getMonth()] + ' ' + rightNow.getDate();
}
bootClockTick();

function skipTheBoot() {
  document.getElementById('boot').classList.add('hidden');
}

function shutItDown() {
  popQuickPanelClosed();
  popStartMenuClosed();
  document.querySelectorAll('.window').forEach(function (w) {
    w.classList.remove('open');
  });
  document.getElementById('boot').classList.remove('hidden');
  bootClockTick();
}

var beegNumber = "0";
var stashedNumber = null;
var mathSign = null;
var startOver = false;

function refreshNumber() {
  document.getElementById("screen").innerText = beegNumber;
}

function tapNumber(digit) {
  if (startOver) {
    beegNumber = digit;
    startOver = false;
  } else {
    if (digit == "." && beegNumber.includes(".")) return;
    if (beegNumber == "0" && digit != ".") {
      beegNumber = digit;
    } else {
      beegNumber += digit;
    }
  }
  refreshNumber();
}

function tapMathSign(sign) {
  if (mathSign != null && !startOver) mathMagic();
  stashedNumber = beegNumber;
  mathSign = sign;
  startOver = true;
}

function mathMagic() {
  if (mathSign == null || stashedNumber == null) return;

  var lefty = parseFloat(stashedNumber), righty = parseFloat(beegNumber);
  var answer = 0;

  if (mathSign == "+") answer = lefty + righty;
  else if (mathSign == "-") answer = lefty - righty;
  else if (mathSign == "*") answer = lefty * righty;
  else if (mathSign == "/") {
    if (righty == 0) {
      beegNumber = "Error";
      refreshNumber();
      stashedNumber = null; mathSign = null;
      startOver = true;
      return;
    }
    answer = lefty / righty;
  }

  answer = Math.round(answer * 100000000) / 100000000;
  beegNumber = String(answer);
  stashedNumber = null;
  mathSign = null;
  startOver = true;
  refreshNumber();
}

function nukeIt() {
  beegNumber = "0"; stashedNumber = null; mathSign = null; startOver = false;
  refreshNumber();
}

function oopsDelete() {
  if (startOver) {
    beegNumber = "0";
    startOver = false;
  } else {
    beegNumber = beegNumber.slice(0, -1);
    if (beegNumber == "") beegNumber = "0";
  }
  refreshNumber();
}

var stackHeight = 10;

function summonWindow(id) {
  var win = document.getElementById("win-" + id);
  win.classList.add("open");
  win.style.zIndex = ++stackHeight;

  if (id === 'fileexplorer') drawTheFiles();
  if (id === 'store') stockTheShelves();
  if (id === 'shell') bootShellInput();

  popStartMenuClosed();
  popQuickPanelClosed();
}

function poofWindow(id) {
  document.getElementById("win-" + id).classList.remove("open");
}

function hideAway(id) { document.getElementById("win-" + id).classList.remove("open") }

function bigifyWindow(id) {
  var el = document.getElementById("win-" + id);

  if (el.dataset.max == "1") {
    el.style.width = "";
    el.style.height = "";
    el.style.left = "50%";
    el.style.top = "50%";
    el.style.transform = "translate(-50%, -50%)";
    el.dataset.max = "0";
  } else {
    el.style.width = "90vw";   el.style.height = "80vh";
    el.style.left = "5vw";     el.style.top = "10vh";
    el.style.transform = "none";
    el.dataset.max = "1";
  }
}

var draggedWindow = null;
var mouseDx = 0, mouseDy = 0;

function grabWindow(e, id) {
  if (e.target.classList.contains("dot")) return;

  draggedWindow = document.getElementById(id);
  draggedWindow.style.zIndex = ++stackHeight;

  var box = draggedWindow.getBoundingClientRect();
  draggedWindow.style.transform = "none";
  draggedWindow.style.left = box.left + "px";
  draggedWindow.style.top = box.top + "px";

  mouseDx = e.clientX - box.left;
  mouseDy = e.clientY - box.top;

  document.addEventListener("mousemove", yankWindow);
  document.addEventListener("mouseup", dropWindow);
}

function yankWindow(e) {
  if (!draggedWindow) return;
  draggedWindow.style.left = (e.clientX - mouseDx) + "px";
  draggedWindow.style.top  = (e.clientY - mouseDy) + "px";
}

function dropWindow() {
  draggedWindow = null;
  document.removeEventListener("mousemove", yankWindow);
  document.removeEventListener("mouseup", dropWindow);
}

var whosSelected = null;

function iconWackyClick(evt, me, appId) {
  evt.stopPropagation();

  if (me.classList.contains('selected')) {
    me.classList.remove('selected');
    whosSelected = null;
    summonWindow(appId);
  } else {
    if (whosSelected && whosSelected !== me) whosSelected.classList.remove('selected');
    me.classList.add('selected');
    whosSelected = me;
  }
}

function paintTheWall(value, el) {
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

function grabImageFromDisk(e) {
  var f = e.target.files[0];
  if (!f) return;

  var rd = new FileReader();
  rd.onload = function (ev) {
    var url = ev.target.result;
    var thumb = document.createElement('div');
    thumb.className = 'bg-thumb';
    thumb.style.backgroundImage = 'url(' + url + ')';
    thumb.onclick = function () { paintTheWall(url, thumb); };

    document.getElementById('theme-grid').appendChild(thumb);
    paintTheWall(url, thumb);
  };
  rd.readAsDataURL(f);
}

function recolorEverything(color, hover, el) {
  var root = document.documentElement;
  root.style.setProperty('--accent', color);
  root.style.setProperty('--accent-hover', hover);

  document.querySelectorAll('.accent-swatch').forEach(function (s) { s.classList.remove('selected'); });
  if (el) el.classList.add('selected');
}

function flipLightSwitch() {
  document.body.classList.toggle('light');
}

function tickTockTick() {
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
tickTockTick();
setInterval(tickTockTick, 1000);

function popQuickPanel(e) {
  if (e) e.stopPropagation();
  document.getElementById('quick-settings').classList.toggle('open');
  popStartMenuClosed();
}

function popQuickPanelClosed() {
  document.getElementById('quick-settings').classList.remove('open');
}

function clickyToggle(el) { el.classList.toggle('active'); }

function dimTheLights(v) {
  var overlay = document.getElementById('dim-overlay');
  var amt = (100 - v) / 100 * 0.85;
  overlay.style.opacity = amt;
}

function louderOrQuieter(v) {
  // no audio yet
}

var appCrew = [
  { id: 'calc',         name: 'Calculator' },
  { id: 'notepad',      name: 'Notepad' },
  { id: 'fileexplorer', name: 'Files' },
  { id: 'shell',        name: 'Shell' },
  { id: 'store',        name: 'Store' },
  { id: 'clock',        name: 'Clock' },
  { id: 'paint',        name: 'Paint' },
  { id: 'theme',        name: 'Theme' },
  { id: 'imageviewer',  name: 'Image Viewer' }
];

function appIcon(id) {
  if (id === 'calc') return '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" class="acc"/><rect x="6" y="5" width="12" height="4" rx="1" fill="#fff"/></svg>';
  if (id === 'notepad') return '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" fill="#fff" class="acc-stroke" stroke-width="1.5"/><line x1="8" y1="8" x2="16" y2="8" stroke="#888" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="#888" stroke-width="1.5" stroke-linecap="round"/></svg>';
  if (id === 'fileexplorer') return '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6a1 1 0 011-1h6l2 2h11a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" class="acc"/></svg>';
  if (id === 'shell') return '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" class="acc"/><path d="M6 10l3 2-3 2M12 14h6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';
  if (id === 'store') return '<svg viewBox="0 0 24 24" fill="none"><path d="M4 8h16l-2 12H6L4 8z" class="acc"/><path d="M8 8V6a4 4 0 018 0v2" stroke="currentColor" stroke-width="2" fill="none"/></svg>';
  if (id === 'clock') return '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" class="acc-stroke" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
  if (id === 'paint') return '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 000 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1.1.9-2 2-2h2c2.8 0 5-2.2 5-5 0-4.9-4.5-8.5-10-8.5z" class="acc"/></svg>';
  if (id === 'theme') return '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" fill="none" class="acc-stroke" stroke-width="2"/><path d="M12 4v8 8" class="acc-stroke" stroke-width="2"/></svg>';
  if (id === 'imageviewer') return '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" class="acc"/><circle cx="9" cy="10" r="2" fill="#fff"/><path d="M3 18l5-5 4 4 4-4 5 5" stroke="#fff" stroke-width="1.5" fill="none"/></svg>';
  return '';
}

function fillStartMenu(filter) {
  var box = document.getElementById('start-apps');
  box.innerHTML = '';

  var matches = appCrew.filter(function (a) {
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

    item.addEventListener('click', function (evt) {
      evt.stopPropagation();
      if (item.classList.contains('selected')) {
        item.classList.remove('selected');
        summonWindow(app.id);
      } else {
        document.querySelectorAll('.start-app.selected').forEach(function (i) { i.classList.remove('selected'); });
        item.classList.add('selected');
      }
    });

    box.appendChild(item);
  });
}

function popStartMenu(e) {
  if (e) e.stopPropagation();

  var menu = document.getElementById('start-menu');
  menu.classList.toggle('open');
  popQuickPanelClosed();

  if (menu.classList.contains('open')) {
    fillStartMenu('');
    document.getElementById('start-search-input').value = '';
    setTimeout(function () {
      document.getElementById('start-search-input').focus();
    }, 50);
  }
}

function popStartMenuClosed() {
  document.getElementById('start-menu').classList.remove('open');
}

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

  if (!e.target.closest('.icon') && whosSelected) {
    whosSelected.classList.remove('selected');
    whosSelected = null;
  }

  if (!e.target.closest('.fe-item')) {
    document.querySelectorAll('.fe-item.selected').forEach(function (i) { i.classList.remove('selected'); });
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

var folderKingdom = {
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
          'images': {
            type: 'folder',
            children: {
              'im1.png': { type: 'image', src: 'images/im1.png' },
              'im2.png': { type: 'image', src: 'images/im2.png' },
              'im3.png': { type: 'image', src: 'images/im3.png' }
            }
          },
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
        content: 'Welcome to LxgendOS!\n\nThis is your first file. Open it, edit it, save it.\n\nTry browsing into the folders. There are some pictures in Pictures/images.'
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

var whereAmI = '/home/user';
var backTrail = [];
var whatchaLookingFor = '';
var peekabooMode = false;

function findThatFolder(path) {
  if (path === '/home/user') return folderKingdom['/home/user'];
  if (path === '/home/user/.hidden') return folderKingdom['/home/user/.hidden'];

  var bits = path.replace('/home/user', '').split('/').filter(Boolean);
  var n = folderKingdom['/home/user'];

  for (var i = 0; i < bits.length; i++) {
    if (n.children && n.children[bits[i]]) n = n.children[bits[i]];
    else return null;
  }
  return n;
}

function makeAnIconFile() {
  return '<svg viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#fff" class="acc-stroke" stroke-width="1.5"/></svg>';
}

function makeAnIconFolder() {
  return '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6a1 1 0 011-1h6l2 2h11a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" class="acc"/></svg>';
}

function makeAnIconImage() {
  return '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" class="acc"/><circle cx="9" cy="10" r="2" fill="#fff"/><path d="M3 18l5-5 4 4 4-4 5 5" stroke="#fff" stroke-width="1.5" fill="none"/></svg>';
}

function openThisThing(child, name) {
  if (child.type === 'folder') {
    backTrail.push(whereAmI);
    whereAmI = whereAmI + '/' + name;
    whatchaLookingFor = '';
    document.getElementById('fe-search').value = '';
    drawTheFiles();
  }
  else if (child.type === 'image') {
    showThePicture(child.src);
  }
  else {
    openInNotepadThing(name, child.content);
  }
}

function drawTheFiles() {
  var listEl = document.getElementById('fe-list');
  var here = findThatFolder(whereAmI);
  document.getElementById('fe-path').innerText = whereAmI;
  listEl.innerHTML = '';

  if (!here || here.type !== 'folder') {
    listEl.innerHTML = '<div class="fe-empty">Cannot open this location</div>';
    return;
  }

  var kids = here.children || {};
  var names = Object.keys(kids);

  if (whatchaLookingFor && whereAmI === '/home/user') {
    var hits = [];

    function goDeeper(node, path) {
      if (node.children) {
        Object.keys(node.children).forEach(function (nm) {
          var c = node.children[nm];
          var cPath = path + '/' + nm;
          if (nm.toLowerCase().indexOf(whatchaLookingFor.toLowerCase()) !== -1) {
            hits.push({ name: nm, path: cPath, node: c });
          }
          if (c.type === 'folder') goDeeper(c, cPath);
        });
      }
    }

    goDeeper(here, '/home/user');
    if (peekabooMode && folderKingdom['/home/user/.hidden']) {
      goDeeper(folderKingdom['/home/user/.hidden'], '/home/user/.hidden');
    }

    if (hits.length === 0) {
      listEl.innerHTML = '<div class="fe-empty">No matches</div>';
      return;
    }

    hits.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'fe-item';

      var ico = r.node.type === 'folder'
        ? makeAnIconFolder()
        : (r.node.type === 'image' ? makeAnIconImage() : makeAnIconFile());

      row.innerHTML = '<div class="fe-icon">' + ico + '</div><span>' + r.path + '</span>';
      row.onclick = function (evt) {
        evt.stopPropagation();
        if (row.classList.contains('selected')) {
          row.classList.remove('selected');
          openThisThing(r.node, r.name);
        } else {
          document.querySelectorAll('.fe-item.selected').forEach(function (i) { i.classList.remove('selected'); });
          row.classList.add('selected');
        }
      };
      listEl.appendChild(row);
    });
    return;
  }

  var count = 0;
  names.forEach(function (name) {
    var child = kids[name];
    if (whatchaLookingFor && name.toLowerCase().indexOf(whatchaLookingFor.toLowerCase()) === -1) return;
    count++;

    var div = document.createElement('div');
    div.className = 'fe-item';

    var icon = child.type === 'folder'
      ? makeAnIconFolder()
      : (child.type === 'image' ? makeAnIconImage() : makeAnIconFile());

    div.innerHTML = '<div class="fe-icon">' + icon + '</div><span>' + name + '</span>';
    div.onclick = function (evt) {
      evt.stopPropagation();
      if (div.classList.contains('selected')) {
        div.classList.remove('selected');
        openThisThing(child, name);
      } else {
        document.querySelectorAll('.fe-item.selected').forEach(function (i) { i.classList.remove('selected'); });
        div.classList.add('selected');
      }
    };
    listEl.appendChild(div);
  });

  if (whereAmI === '/home/user' && peekabooMode) {
    var hid = folderKingdom['/home/user/.hidden'];
    if (hid) {
      var div = document.createElement('div');
      div.className = 'fe-item';
      div.innerHTML = '<div class="fe-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M3 6a1 1 0 011-1h6l2 2h11a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" class="acc" opacity="0.5"/></svg></div><span style="opacity:0.6">.hidden</span>';
      div.onclick = function (evt) {
        evt.stopPropagation();
        if (div.classList.contains('selected')) {
          div.classList.remove('selected');
          backTrail.push(whereAmI);
          whereAmI = '/home/user/.hidden';
          drawTheFiles();
        } else {
          document.querySelectorAll('.fe-item.selected').forEach(function (i) { i.classList.remove('selected'); });
          div.classList.add('selected');
        }
      };
      listEl.appendChild(div);
      count++;
    }
  }

  if (count === 0) listEl.innerHTML = '<div class="fe-empty">No items found</div>';
}

function goBackInTime() {
  if (backTrail.length > 0) {
    whereAmI = backTrail.pop();
    whatchaLookingFor = '';
    document.getElementById('fe-search').value = '';
    drawTheFiles();
  }
}

function beamMeHome() {
  whereAmI = '/home/user';
  backTrail = [];
  whatchaLookingFor = '';
  document.getElementById('fe-search').value = '';
  drawTheFiles();
}

function huntForFiles(term) {
  whatchaLookingFor = term;
  drawTheFiles();
}

var currentlyOpened = null;

function openInNotepadThing(name, content) {
  document.getElementById('notepad-text').value = content || '';
  document.getElementById('notepad-title').innerText = 'Notepad - ' + name;

  var parent = whereDoYouLive(folderKingdom['/home/user'], name, '/home/user');
  currentlyOpened = parent ? { name: name, folder: parent } : null;

  summonWindow('notepad');
}

function whereDoYouLive(node, name, path) {
  if (!node.children) return null;
  if (node.children[name] && node.children[name].type === 'file') return path;

  for (var k in node.children) {
    var child = node.children[k];
    if (child.type === 'folder') {
      var found = whereDoYouLive(child, name, path + '/' + k);
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
      peekabooMode = !peekabooMode;
      drawTheFiles();
    }
  }
});

function saveTheNote() {
  if (currentlyOpened) {
    var n = findThatFolder(currentlyOpened.folder);
    if (n && n.children && n.children[currentlyOpened.name]) {
      n.children[currentlyOpened.name].content = document.getElementById('notepad-text').value;
      return;
    }
  }
  askWhereToSave();
}

function askWhereToSave() {
  var sel = document.getElementById('save-folder');
  sel.innerHTML = '';

  function wander(n, path) {
    if (n.type === 'folder') {
      var opt = document.createElement('option');
      opt.value = path;
      opt.innerText = path;
      sel.appendChild(opt);

      if (n.children) {
        Object.keys(n.children).forEach(function (k) {
          if (n.children[k].type === 'folder') wander(n.children[k], path + '/' + k);
        });
      }
    }
  }
  wander(folderKingdom['/home/user'], '/home/user');

  document.getElementById('save-name').value = '';
  document.getElementById('save-dialog').classList.add('open');
}

function poofSaveDialog() {
  document.getElementById('save-dialog').classList.remove('open');
}

function actuallySaveIt() {
  var fname = document.getElementById('save-name').value.trim();
  if (!fname) { alert('Please enter a file name'); return; }
  if (!fname.endsWith('.txt')) fname += '.txt';

  var folderPath = document.getElementById('save-folder').value;
  var target = findThatFolder(folderPath);

  if (!target || target.type !== 'folder') { alert('Cannot save here'); return; }
  if (!target.children) target.children = {};

  target.children[fname] = {
    type: 'file',
    content: document.getElementById('notepad-text').value
  };

  currentlyOpened = { name: fname, folder: folderPath };
  document.getElementById('notepad-title').innerText = 'Notepad - ' + fname;
  poofSaveDialog();

  if (document.getElementById('win-fileexplorer').classList.contains('open')) drawTheFiles();
}

var pictureZoom = 1;

function showThePicture(src) {
  document.getElementById('iv-image').src = src;
  pictureZoom = 1;
  document.getElementById('iv-image').style.transform = 'scale(1)';
  document.getElementById('iv-zoom-label').innerText = '100%';
  summonWindow('imageviewer');
}

function zoomThePicture(delta) {
  pictureZoom += delta;
  if (pictureZoom < 0.2) pictureZoom = 0.2;
  if (pictureZoom > 5) pictureZoom = 5;
  document.getElementById('iv-image').style.transform = 'scale(' + pictureZoom + ')';
  document.getElementById('iv-zoom-label').innerText = Math.round(pictureZoom * 100) + '%';
}

function resetTheZoom() {
  pictureZoom = 1;
  document.getElementById('iv-image').style.transform = 'scale(1)';
  document.getElementById('iv-zoom-label').innerText = '100%';
}

/* ============ SHELL ============ */
var shellInputEl = null;

function bootShellInput() {
  shellInputEl = document.getElementById('shell-input');
  if (!shellInputEl) return;
  if (shellInputEl.dataset.wired === 'yes') {
    setTimeout(function () { shellInputEl.focus(); }, 50);
    return;
  }
  shellInputEl.dataset.wired = 'yes';
  shellInputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var cmd = this.value.trim();
      if (cmd) runShellCommand(cmd);
      this.value = '';
    }
  });
  setTimeout(function () { shellInputEl.focus(); }, 50);
}

function writeToShell(text) {
  var body = document.getElementById('shell-body');
  var line = document.getElementById('shell-input-line');
  var div = document.createElement('div');
  div.textContent = text;
  body.insertBefore(div, line);
  body.scrollTop = body.scrollHeight;
}

function escapeMyHtml(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function runShellCommand(cmd) {
  var body = document.getElementById('shell-body');
  var line = document.getElementById('shell-input-line');

  var prompt = document.createElement('div');
  prompt.className = 'shell-line';
  prompt.innerHTML = '<span class="shell-prompt">lxg&gt;</span><span>' + escapeMyHtml(cmd) + '</span>';
  body.insertBefore(prompt, line);

  var parts = cmd.split(' ');
  var c = parts[0].toLowerCase();
  var args = parts.slice(1);

  if (c === 'help') {
    writeToShell('Available commands:');
    writeToShell('  help          — this list');
    writeToShell('  ver           — version info');
    writeToShell('  whoami        — show current user');
    writeToShell('  pwd           — print working dir');
    writeToShell('  ls [path]     — list files in current/path');
    writeToShell('  cat <file>    — print a text file');
    writeToShell('  open <app>    — open app (calc, notepad, shell, etc.)');
    writeToShell('  apps          — list all apps');
    writeToShell('  color <hex>   — change accent colour');
    writeToShell('  theme         — open theme app');
    writeToShell('  echo <text>   — repeat text');
    writeToShell('  date          — show today');
    writeToShell('  time          — show now');
    writeToShell('  clear         — clear screen');
    writeToShell('  boot          — return to boot screen');
  } else if (c === 'ver') {
    writeToShell('LxgendOS Shell v1.0');
    writeToShell('Build: lxg-2025');
  } else if (c === 'whoami') {
    writeToShell('user');
  } else if (c === 'pwd') {
    writeToShell(whereAmI);
  } else if (c === 'ls') {
    var path = args[0] || whereAmI;
    if (path.charAt(0) !== '/') {
      path = whereAmI === '/home/user' ? '/home/user/' + path : whereAmI + '/' + path;
    }
    var node = findThatFolder(path);
    if (!node || node.type !== 'folder') { writeToShell('ls: no such folder'); return; }
    var keys = Object.keys(node.children || {});
    if (keys.length === 0) writeToShell('(empty)');
    else keys.forEach(function (k) {
      var child = node.children[k];
      writeToShell((child.type === 'folder' ? '[dir]  ' : '       ') + k);
    });
  } else if (c === 'cat') {
    if (!args[0]) { writeToShell('cat: missing file name'); return; }
    var node = findThatFolder(whereAmI + '/' + args[0]);
    if (!node || node.type !== 'file') { writeToShell('cat: file not found'); return; }
    writeToShell(node.content);
  } else if (c === 'open') {
    if (!args[0]) { writeToShell('open: which app?'); return; }
    var appId = args[0].toLowerCase();
    var aliases = { 'calculator': 'calc', 'files': 'fileexplorer', 'file': 'fileexplorer', 'terminal': 'shell', 'image': 'imageviewer' };
    if (aliases[appId]) appId = aliases[appId];
    var found = null;
    for (var i = 0; i < appCrew.length; i++) if (appCrew[i].id === appId) found = appCrew[i];
    if (found) { summonWindow(appId); writeToShell('Opened ' + found.name); }
    else writeToShell('open: unknown app "' + appId + '"');
  } else if (c === 'apps') {
    appCrew.forEach(function (a) { writeToShell('  ' + a.id.padEnd(14) + a.name); });
  } else if (c === 'color') {
    if (!args[0] || args[0].charAt(0) !== '#') { writeToShell('color: give a hex like #00ff00'); return; }
    recolorEverything(args[0], args[0], null);
    writeToShell('Accent set to ' + args[0]);
  } else if (c === 'theme') {
    summonWindow('theme');
    writeToShell('Opened Theme app');
  } else if (c === 'echo') {
    writeToShell(args.join(' '));
  } else if (c === 'date') {
    writeToShell(new Date().toDateString());
  } else if (c === 'time') {
    writeToShell(new Date().toLocaleTimeString());
  } else if (c === 'clear') {
    body.querySelectorAll('div').forEach(function (d) {
      if (d.id !== 'shell-input-line') d.remove();
    });
    return;
  } else if (c === 'boot') {
    shutItDown();
    return;
  } else {
    writeToShell('lxg: unknown command "' + c + '". Try "help".');
  }
}

/* ============ STORE ============ */
var storeShelf = [
  { id: 'tictactoe', name: 'Tic Tac Toe', desc: 'Classic 3x3 game', icon: '⭕' },
  { id: 'chess', name: 'Chess', desc: 'Local 2-player chess', icon: '♞' },
  { id: 'web', name: 'Web Browser', desc: 'Coming soon', icon: '🌐', disabled: true },
  { id: 'music', name: 'Music Player', desc: 'Coming soon', icon: '🎵', disabled: true },
  { id: 'mail', name: 'Mail', desc: 'Coming soon', icon: '✉️', disabled: true },
  { id: 'code', name: 'Code Editor', desc: 'Coming soon', icon: '💻', disabled: true }
];

function stockTheShelves() {
  var grid = document.getElementById('store-grid');
  grid.innerHTML = '';
  storeShelf.forEach(function (app) {
    var card = document.createElement('div');
    card.className = 'store-card';
    card.innerHTML =
      '<div class="sc-icon">' + app.icon + '</div>' +
      '<div class="sc-info">' +
        '<div class="sc-name">' + app.name + '</div>' +
        '<div class="sc-desc">' + app.desc + '</div>' +
      '</div>';
    var b = document.createElement('button');
    b.className = 'sc-btn' + (app.disabled ? ' installed' : '');
    b.innerText = app.disabled ? 'Coming soon' : 'Install';
    card.appendChild(b);
    grid.appendChild(card);
  });
}

/* ============ CLOCK ============ */
function switchClockTab(el, tab) {
  document.querySelectorAll('.clock-tab').forEach(function (t) { t.classList.remove('active'); });
  document.querySelectorAll('.clock-content').forEach(function (c) { c.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('clock-tab-' + tab).classList.add('active');
}

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
  for (var i = 0; i < alarmSquad.length; i++) {
    if (alarmSquad[i].time === timeStr && !alarmSquad[i].fired) {
      alarmSquad[i].fired = true;
      alert('Alarm! ' + alarmSquad[i].time);
    }
  }
}, 1000);

var timerTick = null;
var timerLeftover = 0;

function timerToggle() {
  var btn = document.getElementById('timer-start');
  if (timerTick) {
    clearInterval(timerTick);
    timerTick = null;
    btn.innerText = 'Start';
    return;
  }
  if (timerLeftover <= 0) {
    var h = parseInt(document.getElementById('timer-h').value) || 0;
    var m = parseInt(document.getElementById('timer-m').value) || 0;
    var s = parseInt(document.getElementById('timer-s').value) || 0;
    timerLeftover = h * 3600 + m * 60 + s;
  }
  if (timerLeftover <= 0) return;
  btn.innerText = 'Pause';
  timerTick = setInterval(function () {
    timerLeftover--;
    paintTimerDisplay();
    if (timerLeftover <= 0) {
      clearInterval(timerTick);
      timerTick = null;
      document.getElementById('timer-start').innerText = 'Start';
      alert('Timer done!');
    }
  }, 1000);
}

function paintTimerDisplay() {
  var h = Math.floor(timerLeftover / 3600);
  var m = Math.floor((timerLeftover % 3600) / 60);
  var s = timerLeftover % 60;
  document.getElementById('timer-display').innerText =
    String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function timerReset() {
  if (timerTick) { clearInterval(timerTick); timerTick = null; }
  timerLeftover = 0;
  document.getElementById('timer-start').innerText = 'Start';
  paintTimerDisplay();
}

var swTick = null;
var swCount = 0;

function swToggle() {
  var btn = document.getElementById('sw-start');
  if (swTick) {
    clearInterval(swTick);
    swTick = null;
    btn.innerText = 'Start';
    return;
  }
  btn.innerText = 'Pause';
  swTick = setInterval(function () {
    swCount++;
    paintSwDisplay();
  }, 1000);
}

function paintSwDisplay() {
  var h = Math.floor(swCount / 3600);
  var m = Math.floor((swCount % 3600) / 60);
  var s = swCount % 60;
  document.getElementById('stopwatch-display').innerText =
    String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function swReset() {
  if (swTick) { clearInterval(swTick); swTick = null; }
  swCount = 0;
  document.getElementById('sw-start').innerText = 'Start';
  paintSwDisplay();
}

var alarmSquad = [];

function addAlarm() {
  var t = document.getElementById('alarm-time').value;
  if (!t) return;
  alarmSquad.push({ time: t, fired: false });
  paintAlarms();
}

function removeAlarm(i) {
  alarmSquad.splice(i, 1);
  paintAlarms();
}

function paintAlarms() {
  var list = document.getElementById('alarm-list');
  if (!list) return;
  list.innerHTML = '';
  if (alarmSquad.length === 0) {
    list.innerHTML = '<div style="color:var(--text-dim);text-align:center;font-size:12px;padding:20px 0">No alarms set</div>';
    return;
  }
  alarmSquad.forEach(function (a, i) {
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

/* ============ PAINT ============ */
var paintBrush = null;
var paintIsDrawing = false;
var paintWhichTool = 'brush';

function bootPaint() {
  var canvas = document.getElementById('paint-canvas');
  if (!canvas) return;
  paintBrush = canvas.getContext('2d');
  paintBrush.fillStyle = '#ffffff';
  paintBrush.fillRect(0, 0, canvas.width, canvas.height);
  paintBrush.lineCap = 'round';
  paintBrush.lineJoin = 'round';

  canvas.addEventListener('mousedown', function (e) {
    paintIsDrawing = true;
    paintBrush.beginPath();
    var rect = canvas.getBoundingClientRect();
    paintBrush.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  });

  canvas.addEventListener('mousemove', function (e) {
    if (!paintIsDrawing) return;
    var rect = canvas.getBoundingClientRect();
    var size = parseInt(document.getElementById('paint-size').value);
    paintBrush.lineWidth = size;
    if (paintWhichTool === 'eraser') paintBrush.strokeStyle = '#ffffff';
    else paintBrush.strokeStyle = document.getElementById('paint-color').value;
    paintBrush.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    paintBrush.stroke();
  });

  document.addEventListener('mouseup', function () { paintIsDrawing = false; });
}

function paintTool(t) {
  paintWhichTool = t;
  document.getElementById('paint-brush').classList.toggle('active', t === 'brush');
  document.getElementById('paint-eraser').classList.toggle('active', t === 'eraser');
}

function paintClear() {
  var canvas = document.getElementById('paint-canvas');
  paintBrush.fillStyle = '#ffffff';
  paintBrush.fillRect(0, 0, canvas.width, canvas.height);
}

function paintSave() {
  var canvas = document.getElementById('paint-canvas');
  var url = canvas.toDataURL('image/png');
  var a = document.createElement('a');
  a.href = url;
  a.download = 'lxgend-paint.png';
  a.click();
}

/* ============ INIT ============ */
fillStartMenu('');
bootPaint();
paintAlarms();