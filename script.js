// 1. Setup 12 Hero's Journey Cards (Beowulf & Pop Culture Pairs)
const cardsData = [
  // Stage 1: Call to Adventure
  { id: 1, label: "Beowulf's Bravery: Call to Adventure", step: "1" },
  { id: 1, label: "Hrothgar asks Beowulf to defeat Grendel (Like Spider-Man answering the call)", step: "1" },

  // Stage 2: Crossing the Threshold
  { id: 2, label: "Heroic Determination: Crossing Threshold", step: "2" },
  { id: 2, label: "Sails to Geatland to enter foreign territory (Like Katniss entering the Arena)", step: "2" },

  // Stage 3: Tests & Allies
  { id: 3, label: "Loyalty & Comrades: Tests & Allies", step: "3" },
  { id: 3, label: "Wiglaf stands by Beowulf (Like Samwise Gamgee backing Frodo)", step: "3" },

  // Stage 4: The Ordeal
  { id: 4, label: "Superhuman Strength: The Ordeal", step: "4" },
  { id: 4, label: "Battles Grendel's Mother in underwater lair (Like Batman facing his central trial)", step: "4" },

  // Stage 5: The Ultimate Treasure
  { id: 5, label: "Selfless Sacrifice: The Treasure", step: "5" },
  { id: 5, label: "Defeats the Dragon and claims the golden hoard for his kingdom", step: "5" },

  // Stage 6: The Return
  { id: 6, label: "Legacy & Honor: The Return", step: "6" },
  { id: 6, label: "Honored with a grand barrow by the sea, inspiring future generations", step: "6" }
];

let flippedCards = [];
let moves = 0;
let secondsElapsed = 0;
let timerInterval = null;
let hasDropped = false;
let messageTimeout = null;
let selectedCardForMobile = null;

function showMessage(text, type) {
  const msgBox = document.getElementById("statusMessage");
  if (!msgBox) return;

  if (messageTimeout) clearTimeout(messageTimeout);

  msgBox.innerText = text;
  msgBox.className = `status-message ${type} show`;

  if (type === "error") {
    messageTimeout = setTimeout(() => msgBox.classList.remove("show"), 3000);
  }
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
    const secs = String(secondsElapsed % 60).padStart(2, "0");
    const timerElem = document.getElementById("timer");
    if (timerElem) timerElem.innerText = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateMoves() {
  moves++;
  const moveElem = document.getElementById("moveCount");
  if (moveElem) moveElem.innerText = moves;
}

function triggerDevHack() {
  // 1. Flip & match all cards
  document.querySelectorAll(".card").forEach((card) => {
    card.classList.add("flipped", "matched");
    card.innerText = card.dataset.label;
  });

  // 2. Auto-fill all timeline slots
  document.querySelectorAll(".slot").forEach((slot) => {
    const slotStep = slot.dataset.step;
    const matchingCards = cardsData.filter(c => c.step === slotStep);

    slot.querySelectorAll(".slot-item").forEach(el => el.remove());

    matchingCards.forEach((card) => {
      const itemTag = document.createElement("div");
      itemTag.className = "slot-item";
      itemTag.innerText = `✅ ${card.label}`;
      slot.appendChild(itemTag);
    });

    slot.dataset.filled = "2";
    slot.classList.add("correct");
  });

  // 3. Complete Game State
  stopTimer();
  document.querySelectorAll(".slot").forEach(s => s.classList.add("victory-slot"));

  if (typeof confetti === "function") {
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
  }

  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  showMessage(`🏆 VICTORY! Completed in ${moves} moves & ${mins}m ${secs}s! 🏆`, "victory");
}

function initGame() {
  const grid = document.getElementById("cardGrid");
  const timelineGrid = document.getElementById("timeline");
  if (!grid || !timelineGrid) return;

  // Render 6 Timeline Slots
  timelineGrid.innerHTML = "";
  const stageNames = [
    "1. Call to Adventure",
    "2. Crossing Threshold",
    "3. Tests & Allies",
    "4. The Ordeal",
    "5. The Treasure",
    "6. The Return"
  ];

  stageNames.forEach((name, idx) => {
    const slot = document.createElement("div");
    slot.classList.add("slot");
    slot.dataset.step = String(idx + 1);
    slot.dataset.filled = "0";
    slot.innerHTML = `<span class="stage-title">${name}</span>`;
    
    // Tap slot to place selected mobile card
    slot.addEventListener("click", () => handleSlotTap(slot));
    timelineGrid.appendChild(slot);
  });

  // Fisher-Yates Shuffle
  const shuffledCards = [...cardsData];
  for (let i = shuffledCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
  }

  grid.innerHTML = "";
  shuffledCards.forEach((data) => {
    const card = document.createElement("div");
    card.classList.add("card", "flipped");
    card.dataset.id = data.id;
    card.dataset.step = data.step;
    card.dataset.label = data.label;
    card.innerText = data.label;

    card.addEventListener("click", () => handleCardClick(card));
    grid.appendChild(card);
  });

  // Preview Phase
  showMessage("👀 Memorize the card locations!", "highlight");

  setTimeout(() => {
    document.querySelectorAll(".card").forEach((card) => {
      card.classList.remove("flipped");
      card.innerText = "?";
    });
    showMessage("Find the matching concept pairs!", "success");
    startTimer();
  }, 4000);

  // Card Flip Logic
  function handleCardClick(card) {
    if (card.classList.contains("matched")) {
      handleMobileCardSelect(card);
      return;
    }

    if (flippedCards.length === 2 || card.classList.contains("flipped")) {
      return;
    }

    card.classList.add("flipped");
    card.innerText = card.dataset.label;
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      updateMoves();
      checkMatch();
    }
  }

  function handleMobileCardSelect(card) {
    document.querySelectorAll(".card").forEach(c => c.classList.remove("selected-card"));
    selectedCardForMobile = card;
    card.classList.add("selected-card");
    showMessage(`Selected: "${card.dataset.label}". Now tap a timeline slot below!`, "highlight");
  }

  function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.id === card2.dataset.id) {
      card1.classList.add("matched");
      card2.classList.add("matched");
      flippedCards = [];

      const allMatched = document.querySelectorAll(".card.matched").length === cardsData.length;
      if (allMatched) {
        document.querySelectorAll(".card.matched").forEach(card => {
          makeDraggable(card);
          card.classList.add("pulse");
        });
        showMessage("👇 ALL MATCHED! Tap or drag cards into each timeline stage! 👇", "highlight");
      } else {
        showMessage("Pair matched! Keep finding the rest.", "success");
      }
    } else {
      card1.classList.add("wrong");
      card2.classList.add("wrong");
      showMessage("Not a match! Try again.", "error");

      setTimeout(() => {
        card1.classList.remove("flipped", "wrong");
        card2.classList.remove("flipped", "wrong");
        card1.innerText = "?";
        card2.innerText = "?";
        flippedCards = [];
      }, 1000);
    }
  }

  function makeDraggable(card) {
    card.setAttribute("draggable", "true");
    card.addEventListener("dragstart", (e) => {
      document.querySelectorAll(".card.pulse").forEach(c => c.classList.remove("pulse"));
      e.dataTransfer.setData("text/plain", card.dataset.step);
      e.dataTransfer.setData("cardLabel", card.dataset.label);
    });
  }

  function handleSlotTap(slot) {
    if (!selectedCardForMobile) return;

    const cardStep = selectedCardForMobile.dataset.step;
    const cardLabel = selectedCardForMobile.dataset.label;

    processPlacement(slot, cardStep, cardLabel);
    selectedCardForMobile.classList.remove("selected-card");
    selectedCardForMobile = null;
  }

  function processPlacement(slot, cardStep, cardLabel) {
    let count = parseInt(slot.dataset.filled || "0", 10);
    if (count >= 2) {
      showMessage("⚠️ This stage already has 2 cards!", "error");
      return;
    }

    const slotStep = slot.dataset.step;
    const existingItems = Array.from(slot.querySelectorAll(".slot-item")).map(el => el.innerText);
    if (existingItems.includes(`✅ ${cardLabel}`)) {
      showMessage("⚠️ You already placed this exact card here!", "error");
      return;
    }

    if (cardStep === slotStep) {
      count++;
      slot.dataset.filled = String(count);

      const itemTag = document.createElement("div");
      itemTag.className = "slot-item";
      itemTag.innerText = `✅ ${cardLabel}`;
      slot.appendChild(itemTag);

      if (count === 2) {
        slot.classList.add("correct");
        showMessage("Stage fully completed!", "success");
      } else {
        showMessage("1/2 cards placed for this stage!", "success");
      }
    } else {
      showMessage("❌ Wrong timeline stage! Try another slot.", "error");
    }

    const allSlotsFilled = Array.from(document.querySelectorAll(".slot")).every(s => s.dataset.filled === "2");
    if (allSlotsFilled) {
      stopTimer();
      document.querySelectorAll(".slot").forEach(s => s.classList.add("victory-slot"));

      if (typeof confetti === "function") {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      }

      const mins = Math.floor(secondsElapsed / 60);
      const secs = secondsElapsed % 60;
      showMessage(`🏆 VICTORY! Completed in ${moves} moves & ${mins}m ${secs}s! 🏆`, "victory");
    }
  }

  // Desktop Drag Over & Drop
  document.querySelectorAll(".slot").forEach(slot => {
    slot.addEventListener("dragover", (e) => e.preventDefault());
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      const cardStep = e.dataTransfer.getData("text/plain");
      const cardLabel = e.dataTransfer.getData("cardLabel");
      processPlacement(slot, cardStep, cardLabel);
    });
  });

  // Desktop Keyboard Shortcut (Shift + D)
  document.addEventListener("keydown", (e) => {
    if (e.shiftKey && (e.key === "D" || e.key === "d")) {
      triggerDevHack();
    }
  });

  // Mobile Secret Shortcut (Tap main title 5 times)
  const mainTitle = document.querySelector("h1");
  let tapCount = 0;
  let tapTimer = null;

  if (mainTitle) {
    mainTitle.addEventListener("click", () => {
      tapCount++;
      if (tapCount === 1) {
        tapTimer = setTimeout(() => {
          tapCount = 0;
        }, 2000);
      }

      if (tapCount >= 5) {
        clearTimeout(tapTimer);
        tapCount = 0;
        triggerDevHack();
      }
    });
  }

  // Reset Button
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => location.reload());
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}