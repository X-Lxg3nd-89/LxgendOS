
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
  }
  else {
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
  }
  else {
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
  { id: 'theme',        name: 'Theme' },
  { id: 'imageviewer',  name: 'Image Viewer' }
];

function appIcon(id) {
  if (id === 'calc') return '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" class="acc"/><rect x="6" y="5" width="12" height="4" rx="1" fill="#fff"/></svg>';
  if (id === 'notepad') return '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" fill="#fff" class="acc-stroke" stroke-width="1.5"/><line x1="8" y1="8" x2="16" y2="8" stroke="#888" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="#888" stroke-width="1.5" stroke-linecap="round"/></svg>';
  if (id === 'fileexplorer') return '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6a1 1 0 011-1h6l2 2h11a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" class="acc"/></svg>';
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
  menundefined.classList.add('open');
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
            content: 'LxgendOS — a web based desktop.
Built by Lxg3nd.

Type "help" anywhere for a surprise.'
          },
          'todo.txt': {
            type: 'file',
            content: '1. Build LxgendOS
2. Add more apps
3. Ship it'
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
                content: 'LxgendOS project notes:
- Nothing...'
              }
              }
            }
          }
        },
      'welcome.txt': {
        type: 'file',
        content: 'Welcome to LxgendOS!

This is your first file. Open it, edit it, save it.

Try browsing into the folders. There are some pictures in Pictures/images.'
      }
      }
      },

  '/home/user/.hidden': {
    type: 'folder',
    hidden: true,
    children: {
      'easter_egg.txt': {
        type: 'file',
        content: 'You found the hidden folder.

Congratulations.Add
Here is your reward: nothing. 

JK comment it if you found this!'
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
      } else {        document.querySelectorAll('.fe-item.selected').forEach(function (i) { i.classList.remove('selected'); });
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
    var fe