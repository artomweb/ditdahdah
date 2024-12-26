import { jscw } from "./jscwlib.js";
import { Chart, LinearScale, CategoryScale } from "chart.js";

import {
  BarWithErrorBarsController,
  BarWithErrorBar,
} from "chartjs-chart-error-bars";

Chart.register(
  BarWithErrorBarsController,
  BarWithErrorBar,
  LinearScale,
  CategoryScale
);

const characters = [
  "Q",
  "7",
  "Z",
  "G",
  "0",
  "9",
  "8",
  "O",
  "1",
  "J",
  "P",
  "W",
  ".",
  "L",
  "R",
  "A",
  "M",
  "6",
  "B",
  "/",
  "X",
  "D",
  "=",
  "Y",
  "C",
  "K",
  "N",
  "2",
  "3",
  "?",
  "F",
  "U",
  "4",
  "5",
  "V",
  "H",
  "S",
  "I",
  "T",
  "E",
];
const activeChars = ["Q", "7", "Z", "G"];

let answerBox = document.getElementById("answerBox");

let currentChar = "";
let allScores = [];
let chartData = [];
let replayInterval;
let currentCharAttempts = 0;
let charStartTime = 0;
let waitForGuess = 3000;

document
  .getElementById("learn-btn")
  .addEventListener("click", () => showSection("learn"));
document
  .getElementById("settings-btn")
  .addEventListener("click", () => showSection("settings"));
document
  .getElementById("stats-btn")
  .addEventListener("click", () => showSection("stats"));
document
  .getElementById("resetChars-btn")
  .addEventListener("click", () => resetChars());
document
  .getElementById("resetScores-btn")
  .addEventListener("click", () => resetScores());

// When the page loads
function handleNavigation() {
  const urlParams = new URLSearchParams(window.location.hash.slice(1)); // Get the URL params
  const stats = urlParams.get("stats");
  const settings = urlParams.get("settings");

  // Show the appropriate section based on the URL param
  if (settings != null) {
    showSection("settings");
  } else if (stats != null) {
    showSection("stats");
  } else {
    showSection("learn");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Load user settings from local storage
  const savedSettings = JSON.parse(localStorage.getItem("userSettings")) || {};
  console.log(savedSettings);
  Numbers.checked = savedSettings.Numbers || false;
  Symbols.checked = savedSettings.Symbols || false;
  pitchSlider.value = savedSettings.pitch || pitchSlider.value;
  speedSlider.value = savedSettings.speed || speedSlider.value;

  loadSessionCharacters(); // Load saved character scores

  updateCharsList(); // Update character list and chart data
  saveAllScores(); // Save initial scores to local storage
  handleNavigation(); // Handle navigation logic based on hash

  // Apply saved settings to Morse code object
  m.setFreq(+pitchSlider.value);
  m.setWpm(+speedSlider.value);
});

// Update stats page visuals
function updateStatsPage() {
  mistakesChart.data.labels = chartData.map((e) => e.char);

  mistakesChart.data.datasets[0].backgroundColor = chartData.map((e) => {
    if (e.mistakes > 0 && !e.active) {
      return "PowderBlue"; // Set to LightCyan if mistakes > 0 but not active
    } else if (e.active) {
      return "LightSkyBlue"; // Active characters
    } else {
      return "WhiteSmoke"; // Default for inactive characters with no mistakes
    }
  });

  responseTimeChart.data.labels = chartData.map((e) => e.char);
  responseTimeChart.data.datasets[0].backgroundColor = chartData.map((e) => {
    if (!e.active && e.avgResponseTime > 0) {
      return "PowderBlue"; // Set to LightCyan if avgResponseTime > 0
    } else if (e.active) {
      return "LightSkyBlue"; // Active characters
    } else {
      return "WhiteSmoke"; // Default for inactive characters
    }
  });

  const mistakes = chartData.map((char) => char.mistakes);

  const avgResponseTimes = chartData.map((char) => {
    const attempts = char.last50ResponseTimes || [];

    const avgResponseTime = char.avgResponseTime;

    // If attempts array is empty, set min and max to zero
    const yMin = attempts.length > 0 ? Math.min(...attempts) : 0;
    const yMax = attempts.length > 0 ? Math.max(...attempts) : 0;

    if (avgResponseTime) {
      // Create the dataset in the format with y, yMin, and yMax
      return {
        y: avgResponseTime, // Use the average response time for `y`
        yMin, // Set the minimum response time (or zero if avg is zero)
        yMax, // Set the maximum response time (or zero if avg is zero)
      };
    } else {
      return {
        y: avgResponseTime, // Use the average response time for `y`
      };
    }
  });

  mistakesChart.data.datasets[0].data = mistakes;
  responseTimeChart.data.datasets[0].data = avgResponseTimes;

  mistakesChart.update();
  responseTimeChart.update();
}

function saveAllScores() {
  console.log("save all scores", allScores);
  localStorage.setItem("allScores", JSON.stringify(allScores));
}

function loadSessionCharacters() {
  allScores = JSON.parse(localStorage.getItem("allScores")) || [];

  if (allScores.length === 0) {
    allScores = characters.map((char) => ({
      char,
      type: isNaN(char) ? "letter" : "number", // Determines type based on whether it's a number or letter
      error: 255,
      active: activeChars.includes(char), // Set active to true if the character is in the activeChars array
      avgResponseTime: 0,
      mistakes: 0,
      attempts: 0,
    }));
    console.log("all scores init", allScores);
  }
}

function updateChart() {
  characterChart.data.labels = chartData.map((e) => e.char);
  characterChart.data.datasets[0].data = chartData.map((e) => e.error);
  characterChart.data.datasets[0].backgroundColor = chartData.map((e) =>
    e.active ? "LightSkyBlue" : "WhiteSmoke"
  );
  characterChart.update();
}

function showSection(sectionId) {
  if (sectionId === "stats") {
    updateStatsPage();
  }
  window.location.hash = "#" + sectionId;
  const sections = document.querySelectorAll(".section");

  sections.forEach((section) => {
    section.classList.add("opacity-0", "hidden"); // Hide all sections
    section.classList.remove("opacity-100"); // Ensure it's fully hidden
  });

  const targetSection = document.getElementById(sectionId);
  targetSection.classList.remove("hidden"); // Make visible
  setTimeout(() => targetSection.classList.add("opacity-100"), 10); // Fade in
  setTimeout(() => window.scrollTo(0, 0), 20);
}

let m = new jscw({ wpm: 25 });

const Numbers = document.getElementById("Numbers");
const Symbols = document.getElementById("Symbols");
const speedSlider = document.getElementById("speed");
const pitchSlider = document.getElementById("pitch");

// Setup input listeners
[Numbers, Symbols, pitchSlider, speedSlider].forEach((input) => {
  if (input.type === "checkbox") {
    input.addEventListener("change", updateCharsList);
  } else if (input.type === "range") {
    input.addEventListener("input", handleSliderInput);
    input.addEventListener("mousedown", handleSliderInput);
  } else if (input.type === "select-one") {
    input.addEventListener("change", selectOneChange);
  }
});

function selectOneChange() {
  updateStatsPage();
  updateLocalStorage();
}

function resetChars() {
  console.log("resetChars");
  allScores.forEach((char) => {
    char.error = 255;
    if (["Q", "7", "Z", "G"].includes(char.char)) {
      char.active = true;
    } else {
      char.active = false;
    }
  });

  console.log(allScores);

  saveAllScores();
  updateCharsList(); // Update character list and chart data

  showToast("Characters Reset!");
}

function resetScores() {
  // Loop through each character in chartData and reset their scores
  allScores.forEach((char) => {
    // Clear the lastAttempts array
    char.last50Mistakes = [];
    char.last50ResponseTimes = [];

    char.avgResponseTime = 0;
    char.mistakes = 0;
    char.attempts = 0;
  });
  saveAllScores();
  updateCharsList(); // Update character list and chart data
  showToast("Scores Reset!");
}

// Handle slider input changes
function handleSliderInput(event) {
  const { name, value } = event.target;
  if (m.getRemaining() > 0) m.stop();

  if (name === "pitch") {
    m.setFreq(+value);
  } else if (name === "speed") {
    m.setWpm(+value);
  }
  m.play(" o");
  updateLocalStorage();
}

function updateCharsList() {
  chartData = allScores.filter((e) => {
    return (
      e.type == "letter" ||
      (Numbers.checked && e.type == "number") ||
      (Symbols.checked && e.type == "symbol")
    );
  });
  console.log(chartData);
  updateChart();
  updateLocalStorage();
}

function updateLocalStorage() {
  const settings = {
    Numbers: Numbers.checked,
    Symbols: Symbols.checked,
    pitch: pitchSlider.value,
    speed: speedSlider.value,
  };
  localStorage.setItem("userSettings", JSON.stringify(settings));
}

// Handle focus on answer box
answerBox.addEventListener("focus", () => {
  answerBox.value = "";
  currentChar = selectCharacter(chartData);
  console.log(currentChar);
  if (m.getRemaining() > 0) m.stop();
  m.play(currentChar);
  charStartTime = Date.now();
  currentCharAttempts = 0;
  replayInterval = setInterval(
    () => repeatMorseCode(currentChar),
    waitForGuess
  );
});

function repeatMorseCode(char) {
  if (m.getRemaining() > 0) m.stop();
  m.play(char);
  charStartTime = new Date().getTime();
  answerBox.value = answerBox.value += char;
  currentCharAttempts++;
}

answerBox.addEventListener("blur", () => {
  if (m.getRemaining() > 0) m.stop();
  clearTimeout(replayInterval);
});

// Handle key presses in the answer box
answerBox.addEventListener("keydown", (event) => {
  const char = event.key.toUpperCase();
  event.preventDefault();
  if (!allScores.some((c) => c.char === char)) return;

  const character = allScores.find((c) => c.char === currentChar);
  if (char === currentChar) {
    handleCorrectAnswer(character);
  } else {
    character.mistakes++;
    currentCharAttempts++;
    updateLastAttempts(character, { mistakes: 1 });
  }
  saveAllScores();
});

// Handle correct answer logic
function handleCorrectAnswer(character) {
  const responseTime = Math.max(
    Math.min(Date.now() - charStartTime - m.getLength() * 1000, waitForGuess),
    100
  ); // It is possible to guess before the character has finished playing

  console.log("responseTime: " + responseTime);

  if (responseTime < 0) {
    console.error("Response time is negative");
  }
  if (currentCharAttempts == 0) {
    character.attempts++;
    character.avgResponseTime =
      (character.avgResponseTime * (character.attempts - 1) + responseTime) /
      character.attempts;
    console.log("is first attempt: " + character.avgResponseTime);
    updateLastAttempts(character, { responseTime });
  }

  updateCharacterError(currentChar, currentCharAttempts > 0);
  clearInterval(replayInterval);

  saveAllScores();

  currentChar = selectCharacter(chartData);

  m.stop();
  setTimeout(() => m.play(currentChar), 300);
  charStartTime = Date.now();
  replayInterval = setInterval(
    () => repeatMorseCode(currentChar),
    waitForGuess
  );
  answerBox.value = "";
  console.log("cleared answer box");
}

function updateLastAttempts(character, attempt) {
  if (!character.last50ResponseTimes) {
    character.last50ResponseTimes = [];
  }

  if (!character.last50Mistakes) {
    character.last50Mistakes = [];
  }

  if (attempt.responseTime) {
    character.last50ResponseTimes.push(attempt.responseTime);
  } else if (attempt.mistakes) {
    character.last50Mistakes.push(attempt.mistakes);
  }

  // Add the new attempt to the lastAttempts array

  // Keep only the last 50 attempts
  if (character.last50ResponseTimes.length > 50) {
    character.last50ResponseTimes.shift();
  }

  if (character.last50Mistakes.length > 50) {
    character.last50Mistakes.shift();
  }
}

// Update character error rate
function updateCharacterError(char, isError) {
  console.log("character error", char, isError);
  const character = allScores.find((c) => c.char === char);
  if (!character) return;

  character.error = isError
    ? Math.min(255, character.error + 15)
    : Math.max(
        0,
        Math.round(character.error - Math.max(5, character.error / 10))
      );

  if (areAllScoresBelowThreshold(100)) unlockNextCharacter();
  updateChart();

  currentCharAttempts = 0;
}

// Check if all active characters have low error scores
function areAllScoresBelowThreshold(threshold) {
  return chartData.every((char) => !char.active || char.error < threshold);
}

function unlockNextCharacter() {
  const nextChar = chartData.find((c) => !c.active);
  if (nextChar) {
    nextChar.active = true;
    updateChart();
  }
}

function selectCharacter(letters) {
  let sum = 0;
  let activeLetters = [];

  // Step 1: Collect active letters (those with active = true)
  for (let letter of letters) {
    if (letter.active) {
      activeLetters.push(letter);
      sum += letter.error + 1; // Accumulate error values +1 for each active letter
    }
  }

  // Step 2: Generate a random number between 0 and sum
  let randomValue = Math.random() * sum;

  // Step 3: Select a letter based on the accumulated error probabilities
  for (let letter of activeLetters) {
    randomValue -= letter.error + 1;
    if (randomValue <= 0) {
      return letter.char; // Return the character of the selected letter
    }
  }

  return null; // In case no letter is selected
}

const characterChartCtx = document.getElementById("characterChart");
const responseTimeChartCtx = document.getElementById("responseTimeChart");
const mistakesChartCtx = document.getElementById("mistakesChart");

characterChartCtx.onclick = (event) => chartClickHandler(event, characterChart);
responseTimeChartCtx.onclick = (event) =>
  chartClickHandler(event, responseTimeChart);
mistakesChartCtx.onclick = (event) => chartClickHandler(event, mistakesChart);

// Define click handler
function chartClickHandler(event, chartInstance) {
  const points = chartInstance.getElementsAtEventForMode(event, "nearest", {
    intersect: true,
  });

  if (points.length) {
    const index = points[0].index;
    const clickedCharacter = chartData[index];
    console.log("Character clicked:", clickedCharacter);

    if (m.getRemaining() > 0) {
      m.stop();
    }
    m.play(clickedCharacter.char);
  }
}

const characterChart = new Chart(characterChartCtx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        data: [],
        borderWidth: 0,
      },
    ],
  },
  options: {
    animation: {
      duration: 0,
    },
    responsive: true,
    aspectRatio: 1,
    maintainAspectRatio: false,
    scales: {
      y: {
        display: false,
        ticks: {
          beginAtZero: true,
          max: 255,
        },
      },
      x: {
        ticks: {
          autoSkip: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          title: function (tooltipItems) {
            const character = tooltipItems[0].label; // Get the character from the label
            const morseCode = m.alphabet[character] || ""; // Get the Morse code for that character
            // Add spaces between each . and -
            const spacedMorseCode = morseCode.split("").join(" ");

            return `${character}: ${spacedMorseCode}`;
          },
          label: function (tooltipItem) {
            // Optionally, add more information to the tooltip label if needed
            return `Value: ${tooltipItem.raw}`;
          },
        },
      },
    },
    interaction: { mode: "index" },
    onHover: function (e) {
      const points = this.getElementsAtEventForMode(
        e,
        "index",
        { axis: "x", intersect: true },
        false
      );

      if (points.length) e.native.target.style.cursor = "pointer";
      else e.native.target.style.cursor = "default";
    },
  },
});

const responseTimeChart = new Chart(responseTimeChartCtx, {
  type: BarWithErrorBarsController.id,
  data: {
    labels: [],
    datasets: [
      {
        data: [],
        borderWidth: 0,
      },
    ],
  },
  options: {
    animation: {
      duration: 0,
    },
    responsive: true,
    aspectRatio: 1,
    maintainAspectRatio: false,
    scales: {
      y: {},
      x: {
        ticks: {
          autoSkip: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        // intersect: false,
        enabled: true,
        callbacks: {
          title: function (tooltipItems) {
            const character = tooltipItems[0].label; // Get the character from the label
            const morseCode = m.alphabet[character] || ""; // Get the Morse code for that character
            // Add spaces between each . and -
            const spacedMorseCode = morseCode.split("").join(" ");

            return `${character}: ${spacedMorseCode}`;
          },
          label: function (tooltipItem) {
            console.log(tooltipItem.raw.y);
            // Optionally, add more information to the tooltip label if needed
            return `Value: ${Math.round(tooltipItem.raw.y)} ms`;
          },
        },
      },
    },
    interaction: { mode: "index" },
    onHover: function (e) {
      const points = this.getElementsAtEventForMode(
        e,
        "nearest",
        { intersect: true },
        true
      );

      // console.log(points);

      if (points.length) e.native.target.style.cursor = "pointer";
      else e.native.target.style.cursor = "default";
    },
  },
});

const mistakesChart = new Chart(mistakesChartCtx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        data: [],
        borderWidth: 0,
      },
    ],
  },
  options: {
    animation: {
      duration: 0,
    },
    responsive: true,
    aspectRatio: 1,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          callback: function (value) {
            if (value % 1 === 0) {
              return value;
            }
          },
        },
      },
      x: {
        ticks: {
          autoSkip: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          title: function (tooltipItems) {
            const character = tooltipItems[0].label; // Get the character from the label
            const morseCode = m.alphabet[character] || ""; // Get the Morse code for that character
            // Add spaces between each . and -
            const spacedMorseCode = morseCode.split("").join(" ");

            return `${character}: ${spacedMorseCode}`;
          },
          label: function (tooltipItem) {
            // Optionally, add more information to the tooltip label if needed
            return `Value: ${Math.round(tooltipItem.raw)}`;
          },
        },
      },
    },
    interaction: { mode: "index" },
    onHover: function (e) {
      const points = this.getElementsAtEventForMode(
        e,
        "nearest",
        { intersect: true },
        true
      );

      // console.log(points);

      if (points.length) e.native.target.style.cursor = "pointer";
      else e.native.target.style.cursor = "default";
    },
  },
});
function showToast(message) {
  // Create the alert element
  const alertDiv = document.createElement("div");
  alertDiv.setAttribute("role", "alert");
  alertDiv.classList.add(
    "alert",
    // "alert-success",
    "transition-opacity",
    "opacity-100",
    "duration-500"
  );

  // Create the SVG element
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("class", "h-6 w-6 shrink-0 stroke-current");
  svg.setAttribute("fill", "none");
  svg.setAttribute("viewBox", "0 0 24 24");

  // Create the path element inside the SVG
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("d", "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z");

  // Append the path to the SVG
  svg.appendChild(path);

  // Create the span element and set the custom text
  const span = document.createElement("span");
  span.textContent = message;

  // Append the SVG and span to the alert div
  alertDiv.appendChild(svg);
  alertDiv.appendChild(span);

  // Add alert to the container
  const container = document.getElementById("toast-container");
  container.appendChild(alertDiv);

  // Set timeout to fade out the alert after 3 seconds
  setTimeout(() => {
    alertDiv.classList.remove("opacity-100");
    alertDiv.classList.add("opacity-0");
  }, 3000);

  // Remove the alert from the DOM after the fade-out transition is complete (500ms after opacity is 0)
  setTimeout(() => {
    alertDiv.remove();
  }, 3500); // Match the fade-out timing, 3000ms + 500ms for the transition
}
