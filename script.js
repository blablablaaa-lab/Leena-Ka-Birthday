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
  "pretty", "beautiful", "cute", "charming", "soft-hearted", "sweet", "angel", "devil",
  "shaytan", "red flag", "flirty", "chaotic", "soft", "dangerous", "hidden menace",
  "innocent face", "not-so-innocent", "cute girl", "pretty bangs", "cute girl with pretty bangs",
  "pink girl", "amazing playlist", "troublemaker", "therapist", "patient", "ADHD twin",
  "matcha bully", "Kuchu Puchu", "tiny feet", "big attitude", "hidden gem", "romantasy-coded",
  "dangerous with jokes", "acts innocent", "sweet smile", "cute smile", "pretty eyes", "soft girl",
  "funny girl", "chaotic angel", "sweet menace", "magic girl", "cute disaster", "good taste",
  "music taste", "humor twin", "خوبصورت", "پیاری", "حسین", "دلکش", "نازک", "معصوم",
  "شرارتی", "فتنہ", "پری", "نور", "چاند", "جلوہ", "نخرے والی", "جادوئی", "قیامت", "شیطان"
];

function startWordCloud() {
  const cloud = document.getElementById("wordCloud");
  const note = document.getElementById("complimentNote");

  cloud.innerHTML = "";

  cloudWords.forEach((word) => {
    const span = document.createElement("span");
    span.className = "cloud-word";
    span.textContent = word;

    // Random positions inside the word cloud box.
    span.style.left = `${Math.random() * 72}%`;
    span.style.top = `${Math.random() * 82}%`;

    // Different sizes make it look more natural.
    const size = 0.76 + Math.random() * 0.44;
    span.style.fontSize = `${size}rem`;

    // Slight delay so the words don't all appear at once.
    span.style.animationDelay = `${Math.random() * 1.35}s`;

    cloud.appendChild(span);
  });

  // Let the words stay longer, then fade into the note.
  setTimeout(() => {
    cloud.classList.add("hide");
    note.classList.add("show");
  }, 6500);
}

// -------------------------------
// DO'S and DON'TS reveal behavior
// -------------------------------
const revealCards = document.querySelectorAll(".reveal-card");
const termsNext = document.getElementById("termsNext");
const termsHint = document.getElementById("termsHint");
const termsBottom = document.getElementById("termsBottom");
const openedTerms = new Set();

revealCards.forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.add("open");
    openedTerms.add(card.dataset.reveal);

    if (openedTerms.has("dos") && openedTerms.has("donts")) {
      termsNext.disabled = false;
      termsNext.classList.remove("disabled");
      termsHint.textContent = "Fine. Terms unlocked, Miss Allrounder 🎀";
      if (termsBottom) {
        termsBottom.classList.add("show");
      }
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
  submitBtn.textContent = "Sending it to me... ✨";
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
    submitBtn.textContent = "Send it to me ✨";
  }
});
