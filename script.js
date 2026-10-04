// calculator variables
var current = "0";
var previous = null;
var operator = null;
var reset = false;

// show on screen
function updateScreen() {
  document.getElementById("screen").innerText = current;
}

// open calculator
function openCalc() {
  document.getElementById("calc").classList.add("open");
}

// close calculator
function closeCalc() {
  document.getElementById("calc").classList.remove("open");
}

// number or dot press
function press(val) {
  if (reset) {
    current = val;
    reset = false;
  } else {
    if (val === "." && current.includes(".")) return;
    if (current === "0" && val !== ".") {
      current = val;
    } else {
      current = current + val;
    }
  }
  updateScreen();
}

// operator press
function pressOp(op) {
  if (operator !== null && !reset) {
    calculate();
  }
  previous = current;
  operator = op;
  reset = true;
}

// equals
function calculate() {
  if (operator === null || previous === null) return;
  var a = parseFloat(previous);
  var b = parseFloat(current);
  var result = 0;
  if (operator === "+") result = a + b;
  if (operator === "-") result = a - b;
  if (operator === "*") result = a * b;
  if (operator === "/") {
    if (b === 0) {
      current = "Error";
      updateScreen();
      previous = null;
      operator = null;
      reset = true;
      return;
    }
    result = a / b;
  }
  result = Math.round(result * 100000000) / 100000000;
  current = String(result);
  previous = null;
  operator = null;
  reset = true;
  updateScreen();
}

// clear
function clearScreen() {
  current = "0";
  previous = null;
  operator = null;
  reset = false;
  updateScreen();
}

// backspace
function backspace() {
  if (reset) {
    current = "0";
    reset = false;
  } else {
    current = current.slice(0, -1);
    if (current === "") current = "0";
  }
  updateScreen();
}

// simple clock
function updateClock() {
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  var ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  if (m < 10) m = "0" + m;
  document.getElementById("clock").innerText = h + ":" + m + " " + ampm;
}
updateClock();
setInterval(updateClock, 1000);

// open calculator on load
window.onload = function() {
  openCalc();
};
