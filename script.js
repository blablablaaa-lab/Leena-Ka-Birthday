/*
  JavaScript for the birthday website.
  It handles:
  1. Moving between screens
  2. Word cloud animation
  3. Opening DO'S and DON'TS cards
  4. Selecting multiple choice cards
  5. Sending answers to Google Forms
*/

// -------------------------------
// Google Form connection
// -------------------------------
const FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdhiEs37WrysQ9UEknb6yLq8ODyCldSse4USzK9vPoOuGZ1wQ/formResponse";

const ENTRY_TERMS = "entry.2070359010";
const ENTRY_PLAN = "entry.1939768528";
const ENTRY_FOOD = "entry.712544132";
const ENTRY_PREFERENCES = "entry.1629934258";
const ENTRY_FINAL_NOTE = "entry.461994123";

// -------------------------------
// Website state
// -------------------------------
const state = {
  terms: "",
  plan: [],
  food: [],
  preferences: "",
  finalNote: ""
};

const screens = Array.from(document.querySelectorAll(".screen"));
const progressText = document.getElementById("progressText");
let currentScreenIndex = 0;
let wordCloudStarted = false;

// -------------------------------
// Screen switching
// -------------------------------
function showScreen(index) {
  screens.forEach((screen, screenIndex) => {
    screen.classList.toggle("active", screenIndex === index);
  });

  currentScreenIndex = index;
  progressText.textContent = `${index + 1} / ${screens.length}`;

  // Start the word cloud only when Screen 2 opens.
  const activeScreenNumber = screens[index].dataset.screen;
  if (activeScreenNumber === "2" && !wordCloudStarted) {
    wordCloudStarted = true;
    startWordCloud();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// All normal next buttons.
document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.disabled) return;
    showScreen(Math.min(currentScreenIndex + 1, screens.length - 1));
  });
});

// -------------------------------
// Word cloud animation
// -------------------------------
const cloudWords = [
  "pretty", "charming", "cute", "dangerous", "angel", "devil", "soft", "chaotic",
  "flirty", "innocent", "not-so-innocent", "khubsurat", "خوبصورت", "جميلة", "noor", "نور",
  "adorable", "dramatic", "troublemaker", "menace", "sweet", "soft-hearted", "bold",
  "mysterious", "funny", "witty", "sharp", "confusing", "pretty desi girl", "elegant",
  "playful", "shy", "not actually shy", "hidden gem", "sunshine", "moonlight", "main-character",
  "soft chaos", "pretty eyes", "cute bangs", "dangerous smile", "flirt expert", "innocent face",
  "matcha bully", "Miss Therapist", "ADHD twin", "slight OCD", "music taste", "food twin",
  "humor twin", "Architect", "Bartender", "pink bow", "dark playlist", "unfairly pretty",
  "suspiciously sweet", "chaotic angel", "dangerous cutie", "shy-but-not-shy", "sweet menace",
  "tiny feet", "big attitude", "acts innocent", "noted"
];

function startWordCloud() {
  const cloud = document.getElementById("wordCloud");
  const note = document.getElementById("complimentNote");

  cloud.innerHTML = "";

  cloudWords.forEach((word, index) => {
    const span = document.createElement("span");
    span.className = "cloud-word";
    span.textContent = word;

    // Random positions inside the word cloud box.
    span.style.left = `${Math.random() * 72}%`;
    span.style.top = `${Math.random() * 82}%`;

    // Different sizes make it look more natural.
    const size = 0.78 + Math.random() * 0.46;
    span.style.fontSize = `${size}rem`;

    // Slight delay so the words don't all appear at once.
    span.style.animationDelay = `${Math.random() * 1.15}s`;

    cloud.appendChild(span);
  });

  // After a few seconds, hide the cloud and show the note.
  setTimeout(() => {
    cloud.classList.add("hide");
    note.classList.add("show");
  }, 4300);
}

// -------------------------------
// DO'S and DON'TS reveal behavior
// -------------------------------
const revealCards = document.querySelectorAll(".reveal-card");
const termsNext = document.getElementById("termsNext");
const termsHint = document.getElementById("termsHint");
const openedTerms = new Set();

revealCards.forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.add("open");
    openedTerms.add(card.dataset.reveal);

    if (openedTerms.has("dos") && openedTerms.has("donts")) {
      termsNext.disabled = false;
      termsNext.classList.remove("disabled");
      termsHint.textContent = "Fine. Terms unlocked, Miss Allrounder 🎀";
      state.terms = "DO’S and DON’TS opened and accepted 🎀";
    }
  });
});

// -------------------------------
// Multiple selection choice cards
// -------------------------------
document.querySelectorAll(".option-card").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("selected");

    const group = button.closest("[data-choice-group]").dataset.choiceGroup;
    const selectedValues = Array.from(
      document.querySelectorAll(`[data-choice-group="${group}"] .option-card.selected`)
    ).map((selectedButton) => selectedButton.dataset.value);

    state[group] = selectedValues;
  });
});

// -------------------------------
// Submit answers to Google Forms
// -------------------------------
const submitBtn = document.getElementById("submitBtn");
const submitStatus = document.getElementById("submitStatus");

submitBtn.addEventListener("click", async () => {
  state.preferences = document.getElementById("preferences").value.trim();
  state.finalNote = document.getElementById("finalNote").value.trim();

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending your holy words... ✨";
  submitStatus.textContent = "One second, Miss Therapist 🎀";

  const formData = new FormData();

  // Terms accepted.
  formData.append(ENTRY_TERMS, state.terms || "Terms accepted 🎀");

  // Checkbox questions: append the same entry ID once for each selected option.
  state.plan.forEach((choice) => formData.append(ENTRY_PLAN, choice));
  state.food.forEach((choice) => formData.append(ENTRY_FOOD, choice));

  // Paragraph questions.
  formData.append(ENTRY_PREFERENCES, state.preferences);
  formData.append(ENTRY_FINAL_NOTE, state.finalNote);

  // Keep a local backup in this browser too, just in case.
  localStorage.setItem("birthdayWebsiteLastSubmission", JSON.stringify({
    ...state,
    submittedAt: new Date().toISOString()
  }));

  try {
    // no-cors is needed because Google Forms does not return CORS headers.
    await fetch(FORM_ACTION_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });

    showScreen(screens.length - 1);
  } catch (error) {
    console.error("Google Form submission failed:", error);
    submitStatus.textContent = "Something blocked the submit. Try again in a second 💗";
    submitBtn.disabled = false;
    submitBtn.textContent = "Bless me with your words ✨";
  }
});
