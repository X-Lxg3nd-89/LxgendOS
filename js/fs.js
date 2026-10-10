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
