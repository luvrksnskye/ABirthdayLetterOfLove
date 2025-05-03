const dialogBox = document.getElementById('dialog-box');
const dialogHeader = document.querySelector('.dialog-header');
const dialogueContainer = document.getElementById('dialogue-container');
const optionsContainer = document.getElementById('options');
const characterImage = document.getElementById('character-image');
const options = document.querySelectorAll('.option');
const backgroundMusic = document.getElementById('background-music');
const wakeupAnimation = document.querySelector('.wakeup-animation');
const loadingScreen = document.getElementById('loading-screen');
const verificationOverlay = document.getElementById('verification-overlay');
const verificationInput = document.getElementById('verification-input');
const verificationButton = document.getElementById('verification-button');

const textSounds = [
  document.getElementById('text0'),
  document.getElementById('text1'),
  document.getElementById('text2'),
  document.getElementById('text3'),
  document.getElementById('text4')
];
const menuMoveSound = document.getElementById('menu_move');
const menuSelectSound = document.getElementById('menu_select');
const continueSound = new Audio('assets/sound-effects/continue.ogg');
const goBackSound = new Audio('assets/sound-effects/go-back.ogg');

textSounds.forEach(sound => sound.volume = 0.1);
menuMoveSound.volume = 0.1;
menuSelectSound.volume = 0.1;
backgroundMusic.volume = 0.4;

const expressions = {
  neutral: "assets/Skye-neutral.png",
  sad: "assets/Skye-sad.png",
  happy: "assets/Skye-happy.png",
  angry: "assets/Skye-angry.png",
  worried: "assets/Skye-worried.png",
  confused: "assets/Skye-confused.png",
  nerves: "assets/Skye-nerves.png"
};

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

let isBoyfriend = false;

let seenDialogs = {
  boyfriend: new Set(),
  nonBoyfriend: new Set(),
  skye: new Set()
};

let skyeAttempts = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function playTextSound() {
  const randomIndex = Math.floor(Math.random() * textSounds.length);
  const sound = textSounds[randomIndex].cloneNode();
  sound.play();
}

function playMenuMoveSound() {
  menuMoveSound.currentTime = 0;
  menuMoveSound.play();
}

function playMenuSelectSound() {
  menuSelectSound.currentTime = 0;
  menuSelectSound.play();
}

function enableAudio() {
  const silentSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
  silentSound.play().then(() => {
    silentSound.pause();
  }).catch(e => {
    console.log("Silent sound couldn't play:", e);
  });
}

function playBackgroundMusic() {
  if (backgroundMusic.paused) {
    backgroundMusic.play().catch(e => {
      console.log("Audio playback was prevented:", e);
    });
  }
}

function hasAchievement(namespace, achievementName) {
  return localStorage.getItem(`${namespace}:${achievementName}`) === 'true';
}

function unlockAchievement(namespace, achievementName) {
  if (hasAchievement(namespace, achievementName)) return; 

  localStorage.setItem(`${namespace}:${achievementName}`, 'true');

  if (typeof showToast === "function") {
    showToast(namespace, achievementName);
  }
}

async function showToast(namespace, achievementName) {
  await waitForAchievementData();

  const achievementData = window.achievementData;
  if (!achievementData || !achievementData[namespace] || !achievementData[namespace].achievements[achievementName]) {
    console.error(`Achievement ${namespace}:${achievementName} not found`);
    return;
  }

  const achievement = achievementData[namespace].achievements[achievementName];
  const templateId = `toast-template-${namespace}`;

  if (!document.getElementById(templateId)) {

    const styleId = `toast-style-${namespace}`;
    if (!document.getElementById(styleId)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.id = styleId;
      link.href = achievementData[namespace].style;
      document.head.appendChild(link);
    }

    const response = await fetch(achievementData[namespace].template, {cache: "no-store"});
    const templateData = await response.text();
    document.body.insertAdjacentHTML("beforeend", `<template id="${templateId}">${templateData}</template>`);
  }

  const template = document.getElementById(templateId);
  const clone = template.content.cloneNode(true);

  const toast = clone.querySelector(".achievement-toast");
  const toastIcon = clone.querySelector(".toast-icon");
  const toastTitle = clone.querySelector(".toast-title");
  const toastDescription = clone.querySelector(".toast-description");

  if (achievement.class) toast.className += " " + achievement.class;
  toastIcon.src = achievement.icon;
  toastTitle.textContent = achievement.title;
  toastDescription.textContent = achievement.description;

  const sfx = achievement.sfx || achievementData[namespace].sfx;
  if (sfx) {
    const sound = new Audio(sfx);
    sound.volume = 0.3;
    sound.play().catch(e => console.log("Could not play achievement sound:", e));
  }

  let toastsContainer = document.getElementById('achievement-toasts');
  if (!toastsContainer) {
    toastsContainer = document.createElement('div');
    toastsContainer.id = 'achievement-toasts';
    toastsContainer.style.position = 'fixed';
    toastsContainer.style.bottom = '20px';
    toastsContainer.style.right = '20px';
    toastsContainer.style.zIndex = '9999';
    document.body.appendChild(toastsContainer);
  }

  toastsContainer.appendChild(clone);

  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.addEventListener('animationend', () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      });
      toast.style.animationName = 'hide';
    }
  }, 5000);
}

function waitForAchievementData(checkInterval = 100) {
  return new Promise((resolve) => {
    if ("achievementData" in window)
      resolve();

    const interval = setInterval(() => {
      if ("achievementData" in window) {
        clearInterval(interval);
        resolve();
      }
    }, checkInterval);
  });
}

const initialDialogue = { text: "Wait... who are you?", expression: "nerves" };

const boyfriendDialogues = [
  { text: "<wave>OHHH!!!</wave>", expression: "happy"},
  { text: "<wave>HII!!!</wave> How are you??", expression: "happy"},
  { text: "I have a gift for you, its your birthday after all!", expression: "happy" },
  { text: "I hope you slept well. I've been planning this for weeks!", expression: "happy" },
  { text: "You know how much I care about you, right?", expression: "neutral" },
  { text: "I wanted to make today special in every way possible.", expression: "happy" },
  { text: "Sometimes I worry I don't show you enough how much you mean to me...", expression: "sad" },
  { text: "But today is all about celebrating <wave>YOU!</wave>", expression: "happy" },
  { text: "I've prepared something I think you'll really like.", expression: "happy" },
  { text: "I put my whole heart into it.", expression: "neutral" },
  { text: "Ready to see your birthday surprise?", expression: "happy", isFinal: true }
];

const nonBoyfriendDialogues = [
  { text: "You are not my boyfriend, so what are you doing here?", expression: "confused" },
  { text: "...", expression: "neutral" },
  { text: "I'm <wave>joking!!!</wave> Anyone can visit this site.", expression: "happy"},
  { text: "This is actually a birthday gift I made for my boyfriend.", expression: "happy" },
  { text: "It's a special interactive experience just for him!", expression: "happy" },
  { text: "But since you're here, you can check it out too.", expression: "neutral" },
  { text: "Just don't tell him you saw it first, okay?", expression: "worried" },
  { text: "Anyway, thanks for visiting!", expression: "happy" },
  { text: "Oh! And remember, if you want to customize your experience, you can check out the website settings. The option for that should be here...", expression: "worried" },
  { text: "Huh... Somewhere. If it's not added, it's because I haven't added it yet or I'm still working on it. Javascript can be a pain.", expression: "nerves" },
  { text: "Let's continue to the main gift!", expression: "happy", isFinal: true }
];

const skyeDialogues = [
  { text: "Huh... No. That's me.", expression: "confused" },
  { text: "I'm the one talking to you right now!", expression: "angry" },
  { text: "Did you think this was some kind of test about me?", expression: "worried" },
  { text: "Well... it's not.", expression: "nerves" },
  { text: "Try typing something else please.", expression: "nerves", isVerification: true }
];

const skyeDialogues2 = [
  { text: "Seriously? I just told you that's me.", expression: "confused" },
  { text: "Why would you type my name again?", expression: "worried" },
  { text: "This isn't some kind of password system where you guess my name.", expression: "nerves" },
  { text: "Please try something else.", expression: "nerves", isVerification: true }
];

const skyeDialogues3 = [
  { text: "Okay, now you're just messing with me.", expression: "angry" },
  { text: "Let me be VERY clear...", expression: "angry" },
  { text: "My name is Skye. I am Skye. You get it?", expression: "angry" },
  { text: "Try. Something. Else.", expression: "angry", isVerification: true }
];

const skyeDialoguesFinal = [
  { text: "...", expression: "confused" },
  { text: "*sigh*", expression: "sad" },
  { text: "You know what? Fine.", expression: "nerves" },
  { text: "This is clearly going nowhere.", expression: "nerves" },
  { text: "I give up. You can enter.", expression: "sad" },
  { text: "Whatever, let's just continue...", expression: "sad", isFinal: true }
];

let dialogues = [];
let currentDialogueIndex = 0;

function checkDialogMaster() {

  if (skyeAttempts >= 3) {
    unlockAchievement("general", "dialog-master");
  }
}

function parseTagsHTML(text) {
  const result = {
    filtered: text,
    tags: []
  };

   const tagPatterns = [
    { name: "color", pattern: /\{color:([^}]+)\}(.*?)\{\/color\}/g },
    { name: "size", pattern: /\{size:([^}]+)\}(.*?)\{\/size\}/g },
    { name: "wave", pattern: /<wave>(.*?)<\/wave>/g },
    { name: "pause", pattern: /\{pause\}/g },
    { name: "hidename", pattern: /\{hidename\}/g },
    { name: "hidetail", pattern: /\{hidetail\}/g },
    { name: "setname", pattern: /\{setname:([^}]+)\}/g }
  ];

  tagPatterns.forEach(({ name, pattern }) => {
    let match;
    let offset = 0;

    let processedText = result.filtered;

    result.filtered = "";

    while ((match = pattern.exec(processedText)) !== null) {

      result.filtered += processedText.substring(offset, match.index);

      const tag = {
        name: name,
        start: result.filtered.length,
        data: {}
      };

      if (name === "wave") {

        result.filtered += match[1];

        tag.end = result.filtered.length;
      } else if (name === "color" || name === "size") {

        const value = match[1];
        tag.data[value] = true;

        result.filtered += match[2];

        tag.end = result.filtered.length;
      } else if (name === "pause" || name === "hidename" || name === "hidetail") {

        tag.end = tag.start;
      } else if (name === "setname") {

        const value = match[1];
        tag.data[value] = true;
        tag.end = tag.start;
      }

      result.tags.push(tag);

      offset = match.index + match[0].length;
    }

    result.filtered += processedText.substring(offset);
  });

  return result;
}

async function animateDialogBox() {
  dialogBox.classList.remove('next');

  const dialogOpeningAnimation = dialogBox.animate([
    {transform: 'scaleY(0)'},
    {transform: 'scaleY(1)'}
  ], {
    duration: 150,
    iterations: 1,
    easing: "ease-in-out"
  });

  return new Promise(resolve => dialogOpeningAnimation.addEventListener("finish", resolve, {once: true}));
}

async function closeDialogBox() {

  const dialogClosingAnimation = dialogBox.animate([
    {transform: 'scaleY(1)'},
    {transform: 'scaleY(0)'}
  ], {
    duration: 150,
    iterations: 1,
    easing: "ease-in-out"
  });

  return new Promise(resolve => dialogClosingAnimation.addEventListener("finish", resolve, {once: true}));
}

async function typeText(text, expressionType = 'happy', effects = null) {
  characterImage.src = expressions[expressionType];

  document.querySelector('body').classList.add("dialog-darken");
  await animateDialogBox();

  dialogBox.innerHTML = '';
  dialogBox.classList.remove('next');

  const parsedDialog = parseTagsHTML(text);
  const characters = parsedDialog.filtered.split('');

  const letters = [];
  characters.forEach(char => {
    if (char === "\n") {
      const br = document.createElement("br");
      dialogBox.appendChild(br);
      letters.push(br);
      return;
    }

    const span = document.createElement("span");
    span.textContent = char;
    span.style.opacity = 0;
    span.style.lineHeight = "1em";
    span.style.verticalAlign = "middle";
    dialogBox.appendChild(span);
    letters.push(span);
  });

  let activeEffects = {};
  for (let i = 0; i < letters.length; i++) {
    for (let tag of parsedDialog.tags) {

      if (i === tag.start) {
        if (activeEffects.hasOwnProperty(tag.name)) {
          activeEffects[tag.name].unshift(tag.data);
        } else {
          activeEffects[tag.name] = [tag.data];
        }
      }

      if (i === tag.end) {
        if (activeEffects.hasOwnProperty(tag.name)) {
          activeEffects[tag.name].shift();
          if (activeEffects[tag.name].length <= 0)
            delete activeEffects[tag.name];
        }
      }
    }

    for (const tagName in activeEffects) {
      const tagData = activeEffects[tagName][0];
      switch (tagName) {
        case "size":
          letters[i].style.fontSize = Object.keys(tagData)[0] + "em";
          break;
        case "color":
          let color;
          if (tagData.snack ?? false) color = "#51C059";
          if (tagData.key ?? false) color = "#AE58CB";
          if (tagData.toy ?? false) color = "#FF9232";
          if (tagData.skill ?? false) color = "#5E92FA";
          if (tagData.location ?? false) color = "#5AE0D8";
          if (tagData.weapon ?? false) color = "#AE58CB";
          if (tagData.charm ?? false) color = "#C263E2";
          if (!color) color = Object.keys(tagData)[0];
          letters[i].style.color = color;
          break;
        case "wave":
          letters[i].classList.add("text-wave");
          letters[i].style.animationDelay = (-10000 + i * 50) + "ms";
          break;
      }
    }
  }

  if (effects) {
    letters.forEach((letter, index) => {
      letter.className = effects.className;
      if (effects.className.includes('text-wave')) {
        letter.style.animationDelay = (-10000 + index * 50) + "ms";
      }
    });
  }

  for (let i = 0; i < letters.length; i++) {

    const pauseTag = parsedDialog.tags.find(tag => tag.name === "pause" && tag.start === i);
    if (pauseTag) {
      dialogBox.classList.add("next");

      await new Promise(resolve => {
        const handler = () => {
          dialogBox.removeEventListener('click', handler);
          resolve();
        };
        dialogBox.addEventListener('click', handler);
      });
      dialogBox.classList.remove("next");
    }

    letters[i].style.opacity = 1;
    if (i % 3 === 0) {
      playTextSound();
    }

    await sleep(30);
  }

  dialogBox.classList.add('next');
  optionsContainer.style.display = 'block';
}

let selectedIndex = 0;

function selectOption(index) {
  options.forEach(option => option.classList.remove('selected'));
  options[index].classList.add('selected');
  selectedIndex = index;
  playMenuMoveSound();
}

async function loadAchievementData() {
  try {
    const response = await fetch('./achievements.json');
    const data = await response.json();
    window.achievementData = data;
  } catch (error) {
    console.error("Could not load achievements data:", error);
  }
}

async function navigateDialogue(action) {
  if (action === 'continue') {
    continueSound.play();

    if (isBoyfriend) {
      seenDialogs.boyfriend.add(currentDialogueIndex);
    } else if (dialogues === skyeDialogues || dialogues === skyeDialogues2 || dialogues === skyeDialogues3 || dialogues === skyeDialoguesFinal) {
      seenDialogs.skye.add(currentDialogueIndex);
    } else {
      seenDialogs.nonBoyfriend.add(currentDialogueIndex);
    }

    checkDialogMaster();

    const currentDialogue = dialogues[currentDialogueIndex];
    const isLastDialog = currentDialogueIndex >= dialogues.length - 1;

    if (isLastDialog) {
      if (currentDialogue.isVerification) {

        await closeDialogBox();
        document.querySelector('body').classList.remove("dialog-darken");
        verificationOverlay.style.display = 'block';
        verificationInput.value = ''; 
        verificationInput.focus();
      } else if (currentDialogue.isFinal) {

        await closeDialogBox();
        document.querySelector('body').classList.remove("dialog-darken");
        window.location.href = "index.html";
      } else {

        currentDialogueIndex = 0;
        await closeDialogBox();
        displayCurrentDialogue();
      }
    } else {

      currentDialogueIndex++;
      await closeDialogBox();
      displayCurrentDialogue();
    }
  } else if (action === 'back') {
    goBackSound.play();

    if (currentDialogueIndex > 0) {
      currentDialogueIndex--;
      await closeDialogBox();
      displayCurrentDialogue();
    }
  }
}

function displayCurrentDialogue() {
  const dialogue = dialogues[currentDialogueIndex];
  typeText(dialogue.text, dialogue.expression, dialogue.effects);
}

function processVerification() {
  const userInput = verificationInput.value.trim();
  verificationOverlay.style.display = 'none';

  if (userInput.toLowerCase() === "regre") {
    isBoyfriend = true;
    dialogues = boyfriendDialogues;
    currentDialogueIndex = 0;
    displayCurrentDialogue();
  } else if (userInput.toLowerCase() === "skye") {
    isBoyfriend = false;
    skyeAttempts++;

    if (skyeAttempts === 1) {
      dialogues = skyeDialogues;
    } else if (skyeAttempts === 2) {
      dialogues = skyeDialogues2;
    } else if (skyeAttempts === 3) {
      dialogues = skyeDialogues3;
    } else {

      dialogues = skyeDialoguesFinal;

      unlockAchievement("general", "dialog-master");
    }

    currentDialogueIndex = 0;
    displayCurrentDialogue();
  } else {
    isBoyfriend = false;
    dialogues = nonBoyfriendDialogues;
    currentDialogueIndex = 0;
    displayCurrentDialogue();
  }
}

async function initSequence() {
  await sleep(5000);

  loadingScreen.style.opacity = 0;

  await sleep(1000);

  loadingScreen.style.display = 'none';

  wakeupAnimation.classList.add('active');

  await sleep(3000);

  typeText(initialDialogue.text, initialDialogue.expression);

  await sleep(1500);
  verificationOverlay.style.display = 'block';
}

function addAnimationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .dialog-darken {
      background-color: rgba(0, 0, 0, 0.5);
    }

    .text-wave {
      display: inline-block;
      animation: waveAnimation 1s ease-in-out infinite;
    }

    @keyframes waveAnimation {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .shake {
      animation: shakeAnimation 0.5s ease-in-out;
    }

    @keyframes shakeAnimation {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    #dialog-box {
      transform-origin: center bottom;
    }

    #achievement-toasts {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    @keyframes hide {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(100%); }
    }
  `;
  document.head.appendChild(style);
}

function initAchievementSystem() {

  if (!document.getElementById('achievement-toasts')) {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'achievement-toasts';
    document.body.appendChild(toastContainer);
  }

  loadAchievementData();
}

document.body.style.opacity = 0;

document.addEventListener('touchstart', enableAudio, { once: true });
document.addEventListener('click', enableAudio, { once: true });

document.addEventListener('touchstart', playBackgroundMusic, { once: true });
document.addEventListener('click', playBackgroundMusic, { once: true });

document.addEventListener('keydown', (event) => {
  if (verificationOverlay.style.display !== 'none') {
    if (event.key === 'Enter') {
      processVerification();
    }
    return;
  }

  switch (event.key) {
    case 'ArrowUp':
      if (selectedIndex > 0) {
        selectOption(selectedIndex - 1);
      }
      break;
    case 'ArrowDown':
      if (selectedIndex < options.length - 1) {
        selectOption(selectedIndex + 1);
      }
      break;
    case 'Enter':
    case 'z':
    case ' ':
      const selectedOption = document.querySelector('.option.selected');
      if (selectedOption) {
        navigateDialogue(selectedOption.dataset.action);
      }
      break;
  }
});

options.forEach((option, index) => {
  option.addEventListener('click', () => {
    selectOption(index);
    navigateDialogue(option.dataset.action);
  });

  option.addEventListener('mouseover', () => {
    selectOption(index);
  });

  option.addEventListener('touchstart', (e) => {
    selectOption(index);
  });

  option.addEventListener('touchend', (e) => {
    e.preventDefault();
    navigateDialogue(option.dataset.action);
  });
});

verificationButton.addEventListener('click', processVerification);
verificationInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    processVerification();
  }
});

window.addEventListener('load', () => {

  addAnimationStyles();

  initAchievementSystem();

  unlockAchievement("general", "new-visitor");

  document.body.style.opacity = 1;
  initSequence();
});