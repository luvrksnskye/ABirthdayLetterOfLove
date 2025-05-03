document.addEventListener('DOMContentLoaded', function() {
  const continueSound = new Audio('assets/sound-effects/continue.ogg');
  const goBackSound = new Audio('assets/sound-effects/go-back.ogg');
  const knockSound = new Audio('assets/sound-effects/knock.mp3');
  const doorOpenSound = document.getElementById('door-open-sound');
  const letterOpenSound = document.getElementById('letter-open-sound');
  const letterCloseSound = document.getElementById('letter-close-sound');
  const backgroundMusic = document.getElementById('background-music');
  const blackOverlay = document.querySelector('.black-overlay');
  const mainContent = document.querySelector('.main-content');
  const whiteSpaceContainer = document.querySelector('.white-space-container');
  const dialogueContainer = document.getElementById('dialogue-container');
  const outsideImg = document.querySelector('.outside');
  const leaveDialogueBox = document.getElementById('leave-dialogue-box');
  const loveLetter = document.getElementById('love-letter');
  const closeLetterBtn = document.getElementById('close-letter');
  const birthdayMemo = document.getElementById('birthday-memo');
  const closeMemoBtn = document.getElementById('close-memo');

  backgroundMusic.volume = 0.1;
  let doorClickCount = 0;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function enableAudio() {

    const silentSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
    silentSound.play().then(() => {
      silentSound.pause();
    }).catch(e => {
      console.log("Silent sound couldn't play:", e);
    });
  }

  document.addEventListener('touchstart', enableAudio, { once: true });
  document.addEventListener('click', enableAudio, { once: true });

  function startBackgroundMusic() {
    backgroundMusic.play().catch(e => console.log("Background music couldn't autoplay:", e));
  }

  function triggerConfetti() {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000000 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      const colors = ['#ff577f', '#ff884b', '#ffd384', '#fff9b0', '#a6f6ff', '#9e7cf4', '#5f8eed'];

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: colors
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: colors
      });
    }, 250);
  }

  setTimeout(function() {
    document.querySelector('.landing-animation').classList.add('animation-complete');
    setTimeout(function() {
      const doorContainer = document.querySelector('.door-container');
      doorContainer.style.opacity = '1';
      setTimeout(function() {
        const dialogueBox = document.getElementById('dialogue-box');
        dialogueBox.classList.remove('hidden');
        dialogueBox.style.opacity = '1';

        const optionsBox = document.querySelector('.options-container'); 
        if (optionsBox) {
          optionsBox.style.opacity = '0';
          optionsBox.style.transition = 'opacity 1s ease-in-out';
          setTimeout(() => {
            optionsBox.style.opacity = '1';
          }, 500);
        }

        setupNavigation();
      }, 1000);
    }, 1500);
  }, 5000); 

  const door = document.querySelector('.door');
  door.addEventListener('click', function() {
    knockSound.play();
    startBackgroundMusic();
    doorClickCount++;
    if (doorClickCount >= 5) {
      dialogueContainer.style.opacity = '1';
    }
  });

  door.addEventListener('touchend', function(e) {
    e.preventDefault(); 
    knockSound.play();
    startBackgroundMusic();
    doorClickCount++;
    if (doorClickCount >= 5) {
      dialogueContainer.style.opacity = '1';
    }
  });

  function setupNavigation() {
    const options = document.querySelectorAll('#dialogue-box .option');
    let selectedIndex = 0;

    document.addEventListener('keydown', function(e) {
      startBackgroundMusic();
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goBackSound.play();
        if (selectedIndex > 0) {
          options[selectedIndex].classList.remove('selected');
          selectedIndex--;
          options[selectedIndex].classList.add('selected');
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goBackSound.play();
        if (selectedIndex < options.length - 1) {
          options[selectedIndex].classList.remove('selected');
          selectedIndex++;
          options[selectedIndex].classList.add('selected');
        }
      } else if (e.key === 'Enter') {
        continueSound.play();
        handleSelection(options[selectedIndex].dataset.action);
      }
    });

    options.forEach((option, index) => {
      option.addEventListener('mouseover', function() {
        options[selectedIndex].classList.remove('selected');
        selectedIndex = index;
        option.classList.add('selected');
      });

      option.addEventListener('click', function() {
        startBackgroundMusic();
        continueSound.play();
        handleSelection(option.dataset.action);
      });

      option.addEventListener('touchstart', function() {
        startBackgroundMusic();

      });

      option.addEventListener('touchend', function(e) {
        e.preventDefault(); 
        continueSound.play();
        handleSelection(option.dataset.action);
      });
    });
  }

  function handleSelection(action) {
    if (action === 'continue') {
      console.log('Opening the door...');
      openDoor();
    } else if (action === 'back') {
      console.log('Doing nothing...');
    }
  }

  function openDoor() {
    doorOpenSound.play();

    blackOverlay.style.visibility = 'visible';
    blackOverlay.style.opacity = '1';

    setTimeout(() => {
      mainContent.style.display = 'none';
      dialogueContainer.style.display = 'none';

      whiteSpaceContainer.style.display = 'flex';
      document.querySelector('.white-space').style.display = 'block';
      outsideImg.style.display = 'block';

      setTimeout(() => {
        blackOverlay.style.opacity = '0';
        setTimeout(() => {
          blackOverlay.style.visibility = 'hidden';
        }, 2000);
      }, 500);
    }, 2000);
  }

  const whiteSpaceItems = document.querySelectorAll('.white-space-item');
  whiteSpaceItems.forEach(item => {
    item.addEventListener('click', function() {
      console.log(`Clicked on ${this.alt}`);

      if (this.alt === 'Sketchbook') {
        letterOpenSound.play();
        loveLetter.style.display = 'block';
      }

      if (this.alt === 'Laptop') {
        birthdayMemo.style.display = 'block';
        triggerConfetti();
      }
    });

    item.addEventListener('touchend', function(e) {
      e.preventDefault();
      console.log(`Touched on ${this.alt}`);

      if (this.alt === 'Sketchbook') {
        letterOpenSound.play();
        loveLetter.style.display = 'block';
      }

      if (this.alt === 'Laptop') {
        birthdayMemo.style.display = 'block';
        triggerConfetti();
      }
    });
  });

  closeLetterBtn.addEventListener('click', function() {
    letterCloseSound.play();
    loveLetter.style.display = 'none';
  });

  closeLetterBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    letterCloseSound.play();
    loveLetter.style.display = 'none';
  });

  closeMemoBtn.addEventListener('click', function() {
    birthdayMemo.style.display = 'none';
  });

  closeMemoBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    birthdayMemo.style.display = 'none';
  });

  outsideImg.addEventListener('click', function() {
    leaveDialogueBox.style.display = 'block';
    setupLeaveNavigation();
  });

  outsideImg.addEventListener('touchend', function(e) {
    e.preventDefault();
    leaveDialogueBox.style.display = 'block';
    setupLeaveNavigation();
  });

  function setupLeaveNavigation() {
    const leaveOptions = document.querySelectorAll('#leave-dialogue-box .option');
    let selectedIndex = 0;

    function handleLeaveKeyDown(e) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goBackSound.play();
        if (selectedIndex > 0) {
          leaveOptions[selectedIndex].classList.remove('selected');
          selectedIndex--;
          leaveOptions[selectedIndex].classList.add('selected');
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goBackSound.play();
        if (selectedIndex < leaveOptions.length - 1) {
          leaveOptions[selectedIndex].classList.remove('selected');
          selectedIndex++;
          leaveOptions[selectedIndex].classList.add('selected');
        }
      } else if (e.key === 'Enter') {
        continueSound.play();
        handleLeaveSelection(leaveOptions[selectedIndex].dataset.action);
      }
    }

    document.addEventListener('keydown', handleLeaveKeyDown);

    leaveOptions.forEach((option, index) => {
      option.addEventListener('mouseover', function() {
        leaveOptions[selectedIndex].classList.remove('selected');
        selectedIndex = index;
        option.classList.add('selected');
      });

      option.addEventListener('click', function() {
        continueSound.play();
        handleLeaveSelection(option.dataset.action);
      });

      option.addEventListener('touchend', function(e) {
        e.preventDefault();
        continueSound.play();
        handleLeaveSelection(option.dataset.action);
      });
    });

    function handleLeaveSelection(action) {
      if (action === 'leave') {
        leaveDialogueBox.style.display = 'none';

        outsideImg.src = "assets/outside.gif";

        setTimeout(() => {
          window.location.href = "../index.html";
        }, 2000);
      } else if (action === 'stay') {
        leaveDialogueBox.style.display = 'none';
        document.removeEventListener('keydown', handleLeaveKeyDown);
      }
    }
  }
});