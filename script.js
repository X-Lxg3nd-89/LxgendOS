
var current = "0";
var prev = null;
var op = null;
var reset = false;

function updateScreen() {
  document.getElementById("screen").innerText = current;
}

function press(val) {
  if (reset) {
    current = val;
    reset = false;
  } else {
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
    if (b == 0) {
      current = "Error";
      updateScreen();
      prev = null;
      op = null;
      reset = true;
      return;
    }
    r = a / b;
  }

  r = Math.round(r * 100000000) / 100000000;
  current = String(r);
  prev = null;
  op = null;
  reset = true;
  updateScreen();
}

function clearScreen() {
  current = "0";
  prev = null;
  op = null;
  reset = false;
  updateScreen();
}

function backspace() {
  if (reset) {
    current = "0";
    reset = false;
  } else {
    current = current.slice(0, -1);
    if (current == "") current = "0";
  }
  updateScreen();
}

var zTop = 10;

function openWin(id) {
  var w = document.getElementById("win-" + id);
  w.classList.add("open");
  w.style.zIndex = ++zTop;
}

function closeWin(id) {
  document.getElementById("win-" + id).classList.remove("open");
}

function minWin(id) {
  document.getElementById("win-" + id).classList.remove("open");
}

function maxWin(id) {
  var w = document.getElementById("win-" + id);

  if (w.dataset.max == "1") {
    w.style.width = "";
    w.style.height = "";
    w.style.left = "50%";
    w.style.top = "50%";
    w.style.transform = "translate(-50%, -50%)";
    w.dataset.max = "0";
  } else {
    w.style.width = "90vw";
    w.style.height = "80vh";
    w.style.left = "5vw";
    w.style.top = "10vh";
    w.style.transform = "none";
    w.dataset.max = "1";
  }
}

var dragTarget = null;
var dragX = 0;
var dragY = 0;

function startDrag(e, id) {
  if (e.target.classList.contains("dot")) return;

  dragTarget = document.getElementById(id);
  dragTarget.style.zIndex = ++zTop;

  var rect = dragTarget.getBoundingClientRect();
  dragTarget.style.transform = "none";
  dragTarget.style.left = rect.left + "px";
  dragTarget.style.top = rect.top + "px";

  dragX = e.clientX - rect.left;
  dragY = e.clientY - rect.top;

  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", endDrag);
}

function doDrag(e) {
  if (!dragTarget) return;
  dragTarget.style.left = (e.clientX - dragX) + "px";
  dragTarget.style.top = (e.clientY - dragY) + "px";
}

function endDrag() {
  dragTarget = null;
  document.removeEventListener("mousemove", doDrag);
  document.removeEventListener("mouseup", endDrag);
}

function setBg(value, el) {
  if (value.charAt(0) == "#") {
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = value;
  } else {
    document.body.style.backgroundImage = "url('" + value + "')";
  }

  document.querySelectorAll(".bg-thumb").forEach(function (t) {
    t.classList.remove("selected");
  });

  if (el) el.classList.add("selected");
}

function setMode(mode) {
  document.body.classList.remove("light");
  if (mode == "light") document.body.classList.add("light");

  document.getElementById("mode-dark").classList.toggle("active", mode == "dark");
  document.getElementById("mode-light").classList.toggle("active", mode == "light");
}

function updateClock() {
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  var ap = h >= 12 ? "PM" : "AM";

  h = h % 12;
  if (h == 0) h = 12;
  if (m < 10) m = "0" + m;

  document.getElementById("clock").innerText = h + ":" + m + " " + ap;
}

updateClock();
setInterval(updateClock, 1000);

window.onload = function () {
  openWin("calc");
};