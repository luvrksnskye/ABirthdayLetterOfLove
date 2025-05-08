document.addEventListener('DOMContentLoaded', function() {

    const landingAnimation = document.getElementById('landing-animation');
    const startButton = document.getElementById('start-button');
    const blackOverlay = document.createElement('div'); 
    blackOverlay.id = 'black-overlay';
    blackOverlay.className = 'black-overlay';
    document.body.appendChild(blackOverlay);

    const videoScreen = document.getElementById('video-screen');
    const introVideo = document.getElementById('intro-video');
    const skipButton = document.getElementById('skip-button');
    const loadingScreen = document.getElementById('loading-screen');
    const buttonClickSound = document.getElementById('button-click');
    const backgroundMusic = document.getElementById('background-music');
    const musicToggle = document.getElementById('music-toggle');
    const pianoSprite = document.getElementById('piano-sprite');

    let musicEnabled = true; 
    let audioInitialized = false;

    function initialize() {

        document.body.style.opacity = '1';
        landingAnimation.style.display = 'flex';
        videoScreen.style.display = 'none';
        loadingScreen.style.display = 'none';
        blackOverlay.style.opacity = '0';

        backgroundMusic.volume = 0.5;
        buttonClickSound.volume = 0.5;
        if (introVideo) introVideo.volume = 0.5;

        setupEventListeners();

        setTimeout(() => {
            landingAnimation.style.opacity = '1';
        }, 100);

        musicToggle.textContent = "MUSIC: ON";

        setTimeout(() => {
            initAudio();
            updateMusicState();
        }, 200);
    }

    function setupEventListeners() {

        musicToggle.addEventListener('click', function() {
            playSound(buttonClickSound);
            initAudio();
            musicEnabled = !musicEnabled;
            updateMusicState();
        });

        startButton.addEventListener('click', function() {
            playSound(buttonClickSound);
            initAudio();
            fadeOutMusic();
            startSequence();
        });

        if (skipButton) {
            skipButton.addEventListener('click', function() {
                playSound(buttonClickSound);
                skipVideo();
            });
        }

        document.addEventListener('keydown', function(event) {
            if (event.code === 'Space' && videoScreen.style.display === 'block') {
                playSound(buttonClickSound);
                skipVideo();
            }
        });

        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('keydown', initAudio, { once: true });
    }

    function initAudio() {
        if (audioInitialized) return;
        audioInitialized = true;

        if (backgroundMusic.context) {
            backgroundMusic.context.resume();
        }

        updateMusicState();
    }

    function updateMusicState() {
        musicToggle.textContent = musicEnabled ? "MUSIC: ON" : "MUSIC: OFF";

        try {
            if (musicEnabled) {
                backgroundMusic.play().catch(e => {
                    console.error("Music play error:", e);
                    musicEnabled = false;
                    musicToggle.textContent = "MUSIC: OFF";
                });
            } else {
                backgroundMusic.pause();
            }
        } catch (e) {
            console.error("Music error:", e);
        }
    }

    function fadeOutMusic() {
        if (!musicEnabled || !backgroundMusic) return;

        const fadeInterval = 50; 
        const fadeStep = 0.05; 
        const originalVolume = backgroundMusic.volume;

        const fadeOutTimer = setInterval(() => {
            if (backgroundMusic.volume > fadeStep) {
                backgroundMusic.volume -= fadeStep;
            } else {
                clearInterval(fadeOutTimer);
                backgroundMusic.pause();
                backgroundMusic.volume = originalVolume; 
            }
        }, fadeInterval);
    }

    function playSound(sound) {
        if (!sound) return;

        try {
            sound.currentTime = 0;
            sound.play().catch(e => console.error("Sound error:", e));
        } catch (e) {
            console.error("Sound play error:", e);
        }
    }

    function startSequence() {

        blackOverlay.style.opacity = '1';
        blackOverlay.style.pointerEvents = 'auto';

        setTimeout(() => {
            landingAnimation.style.display = 'none';
            videoScreen.style.display = 'block';

            setTimeout(() => {
                videoScreen.style.opacity = '1';
                blackOverlay.style.opacity = '0';
                blackOverlay.style.pointerEvents = 'none';

                if (introVideo) {
                    introVideo.play().catch(e => {
                        console.error("Video play error:", e);
                        skipVideo();
                    });

                    introVideo.addEventListener('ended', finishIntroSequence, { once: true });
                } else {
                    skipVideo();
                }
            }, 500);
        }, 1000);
    }

    function skipVideo() {
        if (introVideo) {
            introVideo.pause();
            introVideo.currentTime = 0;
        }
        finishIntroSequence();
    }

    function finishIntroSequence() {
        blackOverlay.style.opacity = '1';
        blackOverlay.style.pointerEvents = 'auto';

        setTimeout(() => {
            if (videoScreen) {
                videoScreen.style.display = 'none';
                videoScreen.style.opacity = '0';
            }

            loadingScreen.style.display = 'flex';
            loadingScreen.style.opacity = '1';

            pianoSprite.classList.remove('hidden');

            setTimeout(() => {
                blackOverlay.style.opacity = '0';
                blackOverlay.style.pointerEvents = 'none';

                setTimeout(() => {
                    pianoSprite.style.opacity = '1';
                }, 500);

                setTimeout(() => {
                    window.location.href = 'for-my-cute-bf/index.html';
                }, 5000);
            }, 500);
        }, 1000);
    }

    initialize();

    const startButtonContainer = document.querySelector('.option[data-action="start"]');
    const musicToggleContainer = document.querySelector('.toggle-container');

    const musicHandCursor = musicToggleContainer.querySelector('.hand-cursor');
    if (musicHandCursor) {

        musicHandCursor.className = 'animated-hand-cursor';

        musicHandCursor.style.animation = 'handAnimation 2s ease-in-out infinite';
    }

    const selectableButtons = [
        { element: startButton, container: startButtonContainer },
        { element: musicToggle, container: musicToggleContainer }
    ];

    let currentSelectedIndex = 0; 

    function selectButton(index) {

        selectableButtons.forEach((item, i) => {
            if (i === 0) { 
                const startHandCursor = item.container.querySelector('.animated-hand-cursor');
                if (startHandCursor) startHandCursor.style.visibility = 'hidden';
            } else { 
                const musicHandCursor = item.container.querySelector('.animated-hand-cursor');
                if (musicHandCursor) musicHandCursor.style.visibility = 'hidden';
            }
        });

        if (index === 0) { 
            const startHandCursor = selectableButtons[index].container.querySelector('.animated-hand-cursor');
            if (startHandCursor) startHandCursor.style.visibility = 'visible';
        } else { 
            const musicHandCursor = selectableButtons[index].container.querySelector('.animated-hand-cursor');
            if (musicHandCursor) musicHandCursor.style.visibility = 'visible';
        }

        currentSelectedIndex = index;
    }

    selectButton(currentSelectedIndex);

    document.addEventListener('keydown', function(event) {

        if (landingAnimation.style.display === 'none') {
            return;
        }

        switch(event.code) {
            case 'ArrowUp':
            case 'ArrowDown':
                playSound(buttonClickSound);

                currentSelectedIndex = currentSelectedIndex === 0 ? 1 : 0;
                selectButton(currentSelectedIndex);
                break;

            case 'Enter':
                event.preventDefault();
                playSound(buttonClickSound);

                if (currentSelectedIndex === 0) {

                    initAudio();
                    fadeOutMusic();
                    startSequence();
                } else {

                    initAudio();
                    musicEnabled = !musicEnabled;
                    updateMusicState();
                }
                break;
        }
    });
});