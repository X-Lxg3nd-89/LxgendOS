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

setTimeout(function () {
  loadingEl.classList.add('hidden');
  bootEl.style.visibility = '';
  setTimeout(function () { loadingEl.style.display = 'none'; }, 600);
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

document.addEventListener('mouseup', function () {
  setTimeout(saveState, 200);
});