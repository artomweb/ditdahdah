const speedSlider = document.getElementById("speed");
const toneSlider = document.getElementById("tone");

var m = new jscw({ wpm: 25 });

m.setFreq(+toneSlider.value);
m.setWpm(+speedSlider.value);

currentlyPlaying = false;
m.onFinished = function () {
  currentlyPlaying = false;
  if ((!currentlyPlaying && isToneSliding) || (!currentlyPlaying && isSpeedSliding)) {
    m.setFreq(+toneSlider.value);
    m.setWpm(+speedSlider.value);
    m.play(" o");
    currentlyPlaying = true;
  }
};

currentWpm = 25;

let isToneSliding = false;
let isSpeedSliding = false;

// m.onPlay = function () { alert("Player started"); }

// Get the slider input element

// Function to be executed while slider is being dragged
function updateWpmSlider() {
  console.log(m.wpm);

  if (currentlyPlaying) {
    m.stop();
  }

  //   if (!currentlyPlaying) {
  m.setWpm(+speedSlider.value);
  m.play(" o");
  currentlyPlaying = true;
  //   }

  // Add your code to be executed while slider is being dragged here
  // For example, you can update a chart, perform calculations, etc.
}

speedSlider.addEventListener("input", updateWpmSlider);

speedSlider.addEventListener("mousedown", () => {
  m.setWpm(+speedSlider.value);
  m.play(" o");
  currentlyPlaying = true;
  isSpeedSliding = true;
});
speedSlider.addEventListener("mouseup", () => {
  isSpeedSliding = false;
  m.stop();
  m.setWpm(+speedSlider.value);
  m.play(" o");
});

// Function to be executed while slider is being dragged
function updateToneSlider() {
  console.log(m.wpm);

  if (currentlyPlaying) {
    m.stop();
  }

  //   if (!currentlyPlaying) {
  m.setFreq(+toneSlider.value);
  m.play(" o");
  currentlyPlaying = true;
  //   }

  // Add your code to be executed while slider is being dragged here
  // For example, you can update a chart, perform calculations, etc.
}

toneSlider.addEventListener("input", updateToneSlider);
toneSlider.addEventListener("mousedown", () => {
  m.setFreq(+toneSlider.value);
  m.play(" o");
  currentlyPlaying = true;
  isToneSliding = true;
});
toneSlider.addEventListener("mouseup", () => {
  isToneSliding = false;
  m.stop();
  m.setFreq(+toneSlider.value);
  m.play(" o");
});
