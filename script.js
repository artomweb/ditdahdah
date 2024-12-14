let allCharacters = [
  { char: "Q", type: "letter", error: 255, active: true },
  { char: "7", type: "number", error: 255, active: true },
  { char: "Z", type: "letter", error: 255, active: true },
  { char: "G", type: "letter", error: 255, active: true },
  { char: "0", type: "number", error: 255, active: false },
  { char: "9", type: "number", error: 255, active: false },
  { char: "8", type: "number", error: 255, active: false },
  { char: "O", type: "letter", error: 255, active: false },
  { char: "1", type: "number", error: 255, active: false },
  { char: "J", type: "letter", error: 255, active: false },
  { char: "P", type: "letter", error: 255, active: false },
  { char: "W", type: "letter", error: 255, active: false },
  { char: ".", type: "symbol", error: 255, active: false },
  { char: "L", type: "letter", error: 255, active: false },
  { char: "R", type: "letter", error: 255, active: false },
  { char: "A", type: "letter", error: 255, active: false },
  { char: "M", type: "letter", error: 255, active: false },
  { char: "6", type: "number", error: 255, active: false },
  { char: "B", type: "letter", error: 255, active: false },
  { char: "/", type: "symbol", error: 255, active: false },
  { char: "X", type: "letter", error: 255, active: false },
  { char: "D", type: "letter", error: 255, active: false },
  { char: "=", type: "symbol", error: 255, active: false },
  { char: "Y", type: "letter", error: 255, active: false },
  { char: "C", type: "letter", error: 255, active: false },
  { char: "K", type: "letter", error: 255, active: false },
  { char: "N", type: "letter", error: 255, active: false },
  { char: "2", type: "number", error: 255, active: false },
  { char: "3", type: "number", error: 255, active: false },
  { char: "?", type: "symbol", error: 255, active: false },
  { char: "F", type: "letter", error: 255, active: false },
  { char: "U", type: "letter", error: 255, active: false },
  { char: "4", type: "number", error: 255, active: false },
  { char: "5", type: "number", error: 255, active: false },
  { char: "V", type: "letter", error: 255, active: false },
  { char: "H", type: "letter", error: 255, active: false },
  { char: "S", type: "letter", error: 255, active: false },
  { char: "I", type: "letter", error: 255, active: false },
  { char: "T", type: "letter", error: 255, active: false },
  { char: "E", type: "letter", error: 255, active: false },
];

let statsPage = document.getElementById("stats");
let settingsPage = document.getElementById("settings");
let learnPage = document.getElementById("learn");

let allScores = [];
let sessionScores = [];

function saveAllScores() {
  sessionScores.forEach((sessionScore) => {
    let found = false;
    // Loop through allScores to find a matching score
    allScores = allScores.map((existingScore) => {
      if (existingScore === sessionScore) {
        found = true;
        return sessionScore; // Update the existing score (or handle error updates if needed)
      }
      return existingScore;
    });
  });
  localStorage.setItem("allScores", JSON.stringify(allScores));
}

function loadSessionCharacters() {
  const allScoresStore = JSON.parse(localStorage.getItem("allScores"));
  if (allScoresStore) {
    console.log("has allScores");
    allScores = allScoresStore;
  } else {
    console.log("no allScores");
    // Default to initial characters if nothing is saved
    allScores = allCharacters;
  }
}

const ctx = document.getElementById("characterChart");

const characterChart = new Chart(ctx, {
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

function updateChart() {
  characterChart.data.labels = sessionScores.map((e) => e.char);
  characterChart.data.datasets[0].data = sessionScores.map((e) => e.error);
  characterChart.data.datasets[0].backgroundColor = sessionScores.map((e) =>
    e.active ? "LightSkyBlue" : "WhiteSmoke"
  );
  console.log(characterChart.data.datasets[0].backgroundColor);
  characterChart.update();
}

ctx.onclick = function (event) {
  const points = characterChart.getElementsAtEventForMode(event, "nearest", {
    intersect: true,
  });

  if (points.length) {
    const index = points[0].index;
    const clickedCharacter = sessionScores[index];
    console.log("Character clicked:", clickedCharacter);
    if (m.getRemaining() > 0) {
      m.stop();
    }
    m.play(clickedCharacter.char);
  }
};

document.addEventListener("DOMContentLoaded", function (event) {
  const urlParams = new URLSearchParams(window.location.hash.slice(1));
  const stats = urlParams.get("stats");
  const settings = urlParams.get("settings");

  if (settings != null) {
    showSection("settings");
  } else if (stats != null) {
    showSection("stats");
  } else {
    showSection("learn");
  }

  const savedSettings = JSON.parse(localStorage.getItem("userSettings")) || {};

  // Set checkbox states based on saved values
  if (savedSettings.Numbers !== undefined) {
    Numbers.checked = savedSettings.Numbers;
  }
  if (savedSettings.Symbols !== undefined) {
    Symbols.checked = savedSettings.Symbols;
  }

  // Set slider values based on saved values
  if (savedSettings.pitch !== undefined) {
    pitchSlider.value = savedSettings.pitch;
  }
  if (savedSettings.speed !== undefined) {
    speedSlider.value = savedSettings.speed;
  }

  m.setFreq(+pitchSlider.value);

  loadSessionCharacters();
  updateSessionChars();
  updateChart();
  saveAllScores();
});

function updateSessionChars() {
  sessionScores = allScores.filter((e) => {
    return (
      e.type == "letter" ||
      (Numbers.checked && e.type == "number") ||
      (Symbols.checked && e.type == "symbol")
    );
  });
}
function showSection(sectionId) {
  window.location.hash = "#" + sectionId;
  const sections = document.querySelectorAll("div[id]");
  sections.forEach((section) => {
    section.classList.add("opacity-0", "hidden"); // Hide all sections
    section.classList.remove("opacity-100"); // Ensure it's fully hidden
  });

  const targetSection = document.getElementById(sectionId);
  targetSection.classList.remove("hidden"); // Make visible
  setTimeout(() => targetSection.classList.add("opacity-100"), 10); // Fade in
}

let m = new jscw({ wpm: 25 });

const inputs = document.querySelectorAll("input");
const Numbers = document.getElementById("Numbers");
const Symbols = document.getElementById("Symbols");
const speedSlider = document.getElementById("speed");
const pitchSlider = document.getElementById("pitch");

inputs.forEach((input) => {
  if (input.type === "checkbox") {
    input.addEventListener("change", updateCharsList); // Only needs to update on checkbox change
  } else if (input.type === "range") {
    input.addEventListener("input", handleSliderInput);

    // Handle click on slider
    input.addEventListener("mousedown", handleSliderInput);
  }
});

function handleSliderInput(event) {
  const target = event.target;
  if (target.name === "pitch") {
    if (m.getRemaining() > 0) {
      m.stop();
    }
    m.setFreq(+pitchSlider.value);
    m.play(" o");
  } else if (target.name === "speed") {
    // Add any speed-related logic here
    console.log(`Speed updated to: ${speedSlider.value}`);
    if (m.getRemaining() > 0) {
      m.stop();
    }
    m.setWpm(+speedSlider.value);
    m.play(" o");
  }
  updateLocalStorage();
}

function updateCharsList() {
  sessionScores = allScores.filter((e) => {
    return (
      e.type == "letter" ||
      (Numbers.checked && e.type == "number") ||
      (Symbols.checked && e.type == "symbol")
    );
  });
  console.log(sessionScores);
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

document.getElementById("userKeyInput").addEventListener("click", () => {
  console.log(selectCharacter(sessionScores));
  const thisChar = selectCharacter(sessionScores);
  if (m.getRemaining() > 0) {
    m.stop();
  }
  m.play(thisChar);
  currentChar = thisChar;
});

let currentChar = "";

document.getElementById("userKeyInput").addEventListener("keydown", (event) => {
  const inputField = document.getElementById("userKeyInput");
  const cursorPosition = inputField.selectionStart; // Get the current cursor position
  let char = event.key;
  console.log(event);
  char = char.toUpperCase();

  // Check if the pressed key is a letter, number, or punctuation
  if (
    char.length === 1 &&
    allCharacters.map((character) => character.char).includes(char)
  ) {
    // If it's a letter or a number or punctuation, convert it to uppercase
    event.preventDefault();

    console.log(char, currentChar);

    if (char == currentChar) {
      updateCharacterError(currentChar, false);

      const thisChar = selectCharacter(sessionScores);
      if (m.getRemaining() > 0) {
        m.stop();
      }
      m.play(thisChar);
      currentChar = thisChar;
      inputField.value = "";
    } else {
      updateCharacterError(currentChar, true);
      // if (m.getRemaining() > 0) {
      //   m.stop();
      // }
      // m.play(currentChar);
      const currentValue = inputField.value;
      inputField.value =
        currentValue.slice(0, cursorPosition) +
        char +
        currentValue.slice(cursorPosition);

      // Restore the cursor position
      inputField.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
    }

    // Prevent the default action of entering the character
    saveAllScores();
    // Insert the uppercase character at the current cursor position
  } else {
    event.preventDefault();
    return;
  }
});

function updateCharacterError(char, isError) {
  // Find the character object by its char value
  const character = sessionScores.find((c) => c.char === char);

  if (character) {
    // If there was an error, decrement the error count
    if (isError) {
      console.log("INCORRECT");
      character.error = Math.min(255, character.error + 15); // Ensure error count doesn't go below 0
    } else {
      console.log("CORRECT");
      character.error = Math.max(0, character.error - 20);
    }

    // Unlock next character if the current character's error count reaches a certain threshold
    if (character.error <= 50) {
      // Example threshold of error <= 200
      unlockNextCharacter(char);
      // character.error += Math.min(255, character.error + 125);
    }
    updateChart();
  }
}

function unlockNextCharacter() {
  // Loop to find the next character that isn't in the session
  for (let i = 0; i < sessionScores.length; i++) {
    const nextCharacter = sessionScores[i];

    // Check if the character isn't in the session
    if (!nextCharacter.active) {
      // Unlock the next character
      nextCharacter.active = true; // Set to true to unlock it for the session
      console.log(`Character ${nextCharacter.char} is now unlocked!`);
      return; // Exit after unlocking the next available character
    }
  }

  // If no more characters are available, print a message
  console.log("No more characters to unlock in the session.");
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

  return null; // In case no letter is selected (should not happen if data is valid)
}
