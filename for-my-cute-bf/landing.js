document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const landingAnimation = document.getElementById('landing-animation');
    const startButton = document.getElementById('start-button');
    const blackOverlay = document.getElementById('black-overlay');
    const videoScreen = document.getElementById('video-screen');
    const introVideo = document.getElementById('intro-video');
    const skipButton = document.getElementById('skip-button');
    const loadingScreen = document.getElementById('loading-screen');
    const buttonClickSound = document.getElementById('button-click');
    const wakeupAnimation = document.querySelector('.wakeup-animation');
    const initialDialogue = { text: "Wait... who are you?", expression: "nerves" };
    const verificationOverlay = document.getElementById('verification-overlay');
  
    // Original elements that should be hidden initially
    document.body.style.opacity = 0;
  
    // Start sequence when button is clicked
    startButton.addEventListener('click', startSequence);
  
    // Skip video with button or spacebar
    skipButton.addEventListener('click', skipVideo);
    document.addEventListener('keydown', function(event) {
      if (event.code === 'Space' && videoScreen.style.display === 'block') {
        skipVideo();
      }
    });
  
    // Function to asynchronously sleep
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    // Start sequence function
    function startSequence() {
      // Play click sound if available
      if (buttonClickSound) {
        buttonClickSound.currentTime = 0;
        buttonClickSound.play().catch(e => console.log("Couldn't play sound:", e));
      }
  
      // Fade to black
      blackOverlay.style.opacity = '1';
      blackOverlay.style.pointerEvents = 'auto';
  
      // After fade to black completes, show video
      setTimeout(function() {
        // Hide landing animation
        landingAnimation.style.display = 'none';
        
        // Show video screen
        videoScreen.style.display = 'block';
        
        // Fade in video screen
        setTimeout(function() {
          videoScreen.style.opacity = '1';
          
          // Fade out black overlay
          blackOverlay.style.opacity = '0';
          blackOverlay.style.pointerEvents = 'none';
          
          // Play video
          introVideo.play().catch(e => {
            console.log("Couldn't autoplay video:", e);
            // If autoplay fails, provide manual option
            skipVideo();
          });
          
          // When video ends, start the main experience
          introVideo.addEventListener('ended', function() {
            finishIntroSequence();
          });
        }, 500);
      }, 1000);
    }
  
    // Skip video function
    function skipVideo() {
      introVideo.pause();
      finishIntroSequence();
    }
  
    // Finish intro sequence and start main experience
    async function finishIntroSequence() {
      // Fade to black again
      blackOverlay.style.opacity = '1';
      blackOverlay.style.pointerEvents = 'auto';
      
      // After fade completes, start the main experience
      setTimeout(async function() {
        // Hide video screen
        videoScreen.style.display = 'none';
        videoScreen.style.opacity = '0';
        
        // Show body content
        document.body.style.opacity = 1;
        
        // Start the original loading and wake-up sequence
        await startMainExperience();
        
        // Fade out black overlay
        setTimeout(function() {
          blackOverlay.style.opacity = '0';
          blackOverlay.style.pointerEvents = 'none';
        }, 500);
      }, 1000);
    }
  
    // Function to start the main experience (similar to original initSequence)
    async function startMainExperience() {
      await sleep(5000);
  
      if (loadingScreen) {
        loadingScreen.style.opacity = 0;
        await sleep(1000);
        loadingScreen.style.display = 'none';
      }
  
      wakeupAnimation.classList.add('active');
      await sleep(3000);
  
      if (typeof typeText === 'function') {
        typeText(initialDialogue.text, initialDialogue.expression);
        await sleep(1500);
        if (verificationOverlay) {
          verificationOverlay.style.display = 'block';
        }
      }
    }
  });
