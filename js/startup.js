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