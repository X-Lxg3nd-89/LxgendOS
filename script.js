var current = "0";
var prev = null;
var op = null;
var reset = false;

function updateScreen() {
  document.getElementById("screen").innerText = current;
}

function openCalc() {
  document.getElementById("calc").classList.add("open");
}

function closeCalc() {
  document.getElementById("calc").classList.remove("open");
}

function press(val) {
  if (reset) {
    current = val;
    reset = false;
  } else {
    if (val == "." && current.includes(".")) return;
    if (current == "0" && val != ".") {
      current = val;
    } else {
      current = current + val;
    }
  }
  updateScreen();
}

function pressOp(o) {
  if (op != null && !reset) {
    calculate();
  }
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

window.onload = function() {
  openCalc();
  makeDraggable(document.getElementById("calc"));
};

function makeDraggable(el) {
  var bar = el.querySelector(".calc-title");
  var dragging = false;
  var sx = 0;
  var sy = 0;
  var sl = 0;
  var st = 0;

  bar.addEventListener("mousedown", function(e) {
    if (e.target.classList.contains("close-btn")) return;

    dragging = true;
    var rect = el.getBoundingClientRect();
    el.style.transform = "none";
    el.style.left = rect.left + "px";
    el.style.top = rect.top + "px";

    sx = e.clientX;
    sy = e.clientY;
    sl = rect.left;
    st = rect.top;

    e.preventDefault();
  });

  document.addEventListener("mousemove", function(e) {
    if (!dragging) return;
    var dx = e.clientX - sx;
    var dy = e.clientY - sy;
    el.style.left = (sl + dx) + "px";
    el.style.top = (st + dy) + "px";
  });

  document.addEventListener("mouseup", function() {
    dragging = false;
  });
}