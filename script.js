(() => {
  "use strict";

  // Google Form connection. Keep these unchanged unless the Google Form is remade.
  const FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdhiEs37WrysQ9UEknb6yLq8ODyCldSse4USzK9vPoOuGZ1wQ/formResponse";
  const ENTRY_TERMS = "entry.2070359010";
  const ENTRY_PLAN = "entry.1939768528";
  const ENTRY_FOOD = "entry.712544132";
  const ENTRY_PREFERENCES = "entry.1629934258";
  const ENTRY_FINAL_NOTE = "entry.461994123";

  const WORD_CLOUD_DURATION = 6200;

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
  let wordCloudStarted = false;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function activeStep() {
    const active = $(".screen.active");
    return active ? Number(active.dataset.step) : 0;
  }

  function updateProgress(step) {
    const progress = $("#progressText");
    if (progress) progress.textContent = `${step + 1} / ${screens.length}`;
  }

  function goTo(step) {
    const nextStep = Math.max(0, Math.min(step, screens.length - 1));

    screens.forEach((screen) => {
      screen.classList.toggle("active", Number(screen.dataset.step) === nextStep);
    });

    updateProgress(nextStep);

    if (nextStep === 1 && !wordCloudStarted) {
      wordCloudStarted = true;
      startWordCloud();
    }

    window.scrollTo(0, 0);
  }

  function startWordCloud() {
    const stage = $("#wordStage");
    const cloud = $("#wordCloud");
    const note = $("#screenTwoContent");
    if (!stage || !cloud || !note) return;

    cloud.innerHTML = "";
    note.classList.add("waiting");
    note.classList.remove("show");
    stage.classList.remove("hide");
    const colors = ["pink", "gold", "white"];

    cloudWords.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = `cloud-word ${colors[index % colors.length]}`;
      span.textContent = word;
      span.style.left = `${4 + Math.random() * 70}%`;
      span.style.top = `${4 + Math.random() * 82}%`;
      span.style.fontSize = `${0.72 + Math.random() * 0.28}rem`;
      span.style.animationDelay = `${Math.random() * 0.95}s`;
      cloud.appendChild(span);
    });

    window.setTimeout(() => {
      stage.classList.add("hide");
      note.classList.remove("waiting");
      note.classList.add("show");
    }, WORD_CLOUD_DURATION);
  }

  function setupNextButtons() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-next]");
      if (!button || button.disabled) return;
      event.preventDefault();

      const screen = button.closest(".screen");
      const step = screen ? Number(screen.dataset.step) : activeStep();
      goTo(step + 1);
    });
  }

  function setupTerms() {
    const cards = $$(".reveal-card");
    const next = $("#termsNext");
    const hint = $("#termsHint");
    const opened = new Set();

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        card.classList.add("open");
        opened.add(card.dataset.card);

        if (opened.has("dos") && opened.has("donts")) {
          state.terms = "DO’S and DON’TS opened and accepted 🎀";
          if (next) {
            next.disabled = false;
            next.classList.remove("disabled");
          }
          if (hint) hint.textContent = "Fine. Terms unlocked, troublemaker 🎀";
        }
      });
    });
  }

  function setupChoices() {
    $$(".option-card").forEach((button) => {
      button.addEventListener("click", () => {
        button.classList.toggle("selected");
        const groupEl = button.closest("[data-choice-group]");
        if (!groupEl) return;
        const groupName = groupEl.dataset.choiceGroup;
        state[groupName] = $$(".option-card.selected", groupEl).map((item) => item.dataset.value);
      });
    });
  }

  async function submitForm() {
    const submit = $("#submitBtn");
    const status = $("#submitStatus");

    state.preferences = ($("#preferences")?.value || "").trim();
    state.finalNote = ($("#finalNote")?.value || "").trim();

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Sending it to me... ✨";
    }
    if (status) status.textContent = "One second, Miss Therapist 🎀";

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
      await fetch(FORM_ACTION_URL, { method: "POST", mode: "no-cors", body: formData });
      goTo(screens.length - 1);
    } catch (error) {
      console.error(error);
      if (status) status.textContent = "Something glitched. Try once more ✨";
      if (submit) {
        submit.disabled = false;
        submit.textContent = "Send it to me ✨";
      }
    }
  }

  function setupSubmit() {
    const submit = $("#submitBtn");
    if (submit) submit.addEventListener("click", submitForm);
  }

  document.addEventListener("DOMContentLoaded", () => {
    screens = $$(".screen");
    setupNextButtons();
    setupTerms();
    setupChoices();
    setupSubmit();
    goTo(0);
  });
})();
