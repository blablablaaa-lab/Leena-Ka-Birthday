(() => {
  "use strict";

  // Google Form connection. Do not change unless you remake the Google Form.
  const FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdhiEs37WrysQ9UEknb6yLq8ODyCldSse4USzK9vPoOuGZ1wQ/formResponse";

  const ENTRY_TERMS = "entry.2070359010";
  const ENTRY_PLAN = "entry.1939768528";
  const ENTRY_FOOD = "entry.712544132";
  const ENTRY_PREFERENCES = "entry.1629934258";
  const ENTRY_FINAL_NOTE = "entry.461994123";

  const WORD_CLOUD_DURATION = 6500;

  const cloudWords = [
    "pretty", "beautiful", "cute", "charming", "soft-hearted", "sweet",
    "angel", "devil", "shaytan", "red flag", "flirty", "chaotic",
    "soft", "dangerous", "hidden menace", "innocent face", "not-so-innocent",
    "cute girl", "pretty bangs", "pink girl", "amazing playlist", "troublemaker",
    "therapist", "matcha bully", "Kuchu Puchu", "tiny feet", "big attitude",
    "hidden gem", "romantasy-coded", "dangerous with jokes", "acts innocent",
    "sweet smile", "cute smile", "pretty eyes", "soft girl", "funny girl",
    "chaotic angel", "sweet menace", "magic girl", "cute disaster", "good taste",
    "music taste", "glowy", "elegant", "moonlight", "sunshine",
    "خوبصورت", "پیاری", "حسین", "دلکش", "نازک", "معصوم",
    "شرارتی", "فتنہ", "پری", "نور", "چاند", "جلوہ",
    "نخرے والی", "جادوئی", "قیامت", "شیطان"
  ];

  const state = {
    terms: "",
    plan: [],
    food: [],
    preferences: "",
    finalNote: ""
  };

  let screens = [];
  let currentScreenIndex = 0;
  let wordCloudStarted = false;

  function byId(id) {
    return document.getElementById(id);
  }

  function updateProgress() {
    const progressText = byId("progressText");
    if (progressText) {
      progressText.textContent = `${currentScreenIndex + 1} / ${screens.length}`;
    }
  }

  function showScreen(index) {
    if (!screens.length) return;

    const safeIndex = Math.max(0, Math.min(index, screens.length - 1));

    screens.forEach((screen, screenIndex) => {
      screen.classList.toggle("active", screenIndex === safeIndex);
    });

    currentScreenIndex = safeIndex;
    updateProgress();

    const activeScreenNumber = screens[safeIndex].dataset.screen;
    if (activeScreenNumber === "2" && !wordCloudStarted) {
      wordCloudStarted = true;
      startWordCloud();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startWordCloud() {
    const cloud = byId("wordCloud");
    const note = byId("complimentNote");
    if (!cloud || !note) return;

    cloud.innerHTML = "";
    cloud.classList.remove("hide");
    note.classList.remove("show");

    const colorClasses = ["pink", "gold", "white"];

    cloudWords.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = `cloud-word ${colorClasses[index % colorClasses.length]}`;
      span.textContent = word;

      // Keep words away from the very edge so they stay readable on phones.
      span.style.left = `${6 + Math.random() * 72}%`;
      span.style.top = `${7 + Math.random() * 78}%`;
      span.style.fontSize = `${0.72 + Math.random() * 0.32}rem`;
      span.style.animationDelay = `${Math.random() * 1.2}s`;

      cloud.appendChild(span);
    });

    window.setTimeout(() => {
      cloud.classList.add("hide");
      note.classList.add("show");
    }, WORD_CLOUD_DURATION);
  }

  function setupNavigation() {
    document.addEventListener("click", (event) => {
      const nextButton = event.target.closest("[data-next]");
      if (!nextButton) return;
      if (nextButton.disabled) return;
      event.preventDefault();
      showScreen(currentScreenIndex + 1);
    });
  }

  function setupTermsCards() {
    const revealCards = Array.from(document.querySelectorAll(".reveal-card"));
    const termsNext = byId("termsNext");
    const termsHint = byId("termsHint");
    const opened = new Set();

    revealCards.forEach((card) => {
      card.addEventListener("click", () => {
        card.classList.add("open");
        opened.add(card.dataset.reveal);

        if (opened.has("dos") && opened.has("donts")) {
          if (termsNext) {
            termsNext.disabled = false;
            termsNext.classList.remove("disabled");
          }

          if (termsHint) {
            termsHint.textContent = "Fine. Terms unlocked, troublemaker 🎀";
          }

          state.terms = "DO’S and DON’TS opened and accepted 🎀";
        }
      });
    });
  }

  function setupChoiceCards() {
    const optionCards = Array.from(document.querySelectorAll(".option-card"));

    optionCards.forEach((button) => {
      button.addEventListener("click", () => {
        button.classList.toggle("selected");

        const groupWrapper = button.closest("[data-choice-group]");
        if (!groupWrapper) return;

        const group = groupWrapper.dataset.choiceGroup;
        const selectedValues = Array.from(groupWrapper.querySelectorAll(".option-card.selected"))
          .map((selectedButton) => selectedButton.dataset.value);

        state[group] = selectedValues;
      });
    });
  }

  async function submitToGoogleForm() {
    const submitBtn = byId("submitBtn");
    const submitStatus = byId("submitStatus");

    state.preferences = (byId("preferences")?.value || "").trim();
    state.finalNote = (byId("finalNote")?.value || "").trim();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending it to me... ✨";
    }

    if (submitStatus) {
      submitStatus.textContent = "One second, Miss Therapist 🎀";
    }

    const formData = new FormData();
    formData.append(ENTRY_TERMS, state.terms || "Terms accepted 🎀");

    state.plan.forEach((choice) => formData.append(ENTRY_PLAN, choice));
    state.food.forEach((choice) => formData.append(ENTRY_FOOD, choice));

    formData.append(ENTRY_PREFERENCES, state.preferences);
    formData.append(ENTRY_FINAL_NOTE, state.finalNote);

    localStorage.setItem("birthdayWebsiteLastSubmission", JSON.stringify({
      ...state,
      submittedAt: new Date().toISOString()
    }));

    try {
      await fetch(FORM_ACTION_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData
      });

      showScreen(screens.length - 1);
    } catch (error) {
      console.error("Google Form submission failed:", error);

      if (submitStatus) {
        submitStatus.textContent = "Something glitched. Try once more ✨";
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send it to me ✨";
      }
    }
  }

  function setupSubmit() {
    const submitBtn = byId("submitBtn");
    if (!submitBtn) return;

    submitBtn.addEventListener("click", (event) => {
      event.preventDefault();
      submitToGoogleForm();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    screens = Array.from(document.querySelectorAll(".screen"));
    currentScreenIndex = Math.max(0, screens.findIndex((screen) => screen.classList.contains("active")));

    if (currentScreenIndex === -1) currentScreenIndex = 0;

    setupNavigation();
    setupTermsCards();
    setupChoiceCards();
    setupSubmit();
    showScreen(currentScreenIndex);
  });
})();
