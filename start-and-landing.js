document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const landingAnimation = document.getElementById('landing-animation');
    const startButton = document.getElementById('start-button');
    const blackOverlay = document.createElement('div'); // Create overlay dynamically
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
    
    // State variables
    let musicEnabled = false;
    let audioInitialized = false;

    // Initialize everything
    function initialize() {
        // Set initial states
        document.body.style.opacity = '1';
        landingAnimation.style.display = 'flex';
        videoScreen.style.display = 'none';
        loadingScreen.style.display = 'none';
        blackOverlay.style.opacity = '0';
        
        // Prepare audio elements
        backgroundMusic.volume = 0.5;
        buttonClickSound.volume = 0.5;
        if (introVideo) introVideo.volume = 0.5;
        
        // Set up event listeners
        setupEventListeners();
        
        // Fade in landing animation
        setTimeout(() => {
            landingAnimation.style.opacity = '1';
        }, 100);
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Music toggle
        musicToggle.addEventListener('click', function() {
            playSound(buttonClickSound);
            initAudio();
            musicEnabled = !musicEnabled;
            updateMusicState();
        });

        // Start button
        startButton.addEventListener('click', function() {
            playSound(buttonClickSound);
            initAudio();
            startSequence();
        });

        // Skip button
        if (skipButton) {
            skipButton.addEventListener('click', function() {
                playSound(buttonClickSound);
                skipVideo();
            });
        }

        // Spacebar to skip
        document.addEventListener('keydown', function(event) {
            if (event.code === 'Space' && videoScreen.style.display === 'block') {
                playSound(buttonClickSound);
                skipVideo();
            }
        });

        // Initial audio unlock
        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('keydown', initAudio, { once: true });
    }

    // Initialize audio system
    function initAudio() {
        if (audioInitialized) return;
        audioInitialized = true;
        
        // Resume audio context if suspended
        if (backgroundMusic.context) {
            backgroundMusic.context.resume();
        }
        
        // Update music state if enabled
        if (musicEnabled) {
            updateMusicState();
        }
    }

    // Update music playback state
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

    // Play sound helper
    function playSound(sound) {
        if (!sound) return;
        
        try {
            sound.currentTime = 0;
            sound.play().catch(e => console.error("Sound error:", e));
        } catch (e) {
            console.error("Sound play error:", e);
        }
    }

    // Start the main sequence
    function startSequence() {
        // Fade to black
        blackOverlay.style.opacity = '1';
        blackOverlay.style.pointerEvents = 'auto';

        setTimeout(() => {
            landingAnimation.style.display = 'none';
            videoScreen.style.display = 'block';
            
            setTimeout(() => {
                videoScreen.style.opacity = '1';
                blackOverlay.style.opacity = '0';
                blackOverlay.style.pointerEvents = 'none';
                
                // Play video
                if (introVideo) {
                    introVideo.play().catch(e => {
                        console.error("Video play error:", e);
                        skipVideo();
                    });
                    
                    // Handle video end
                    introVideo.addEventListener('ended', finishIntroSequence, { once: true });
                } else {
                    skipVideo();
                }
            }, 500);
        }, 1000);
    }

    // Skip video
    function skipVideo() {
        if (introVideo) {
            introVideo.pause();
            introVideo.currentTime = 0;
        }
        finishIntroSequence();
    }

    // Finish the sequence
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
            
            // Show the piano sprite
            pianoSprite.classList.remove('hidden');
            
            setTimeout(() => {
                blackOverlay.style.opacity = '0';
                blackOverlay.style.pointerEvents = 'none';
                
                // Fade in the piano sprite
                setTimeout(() => {
                    pianoSprite.style.opacity = '1';
                }, 500);
                
                setTimeout(() => {
                    window.location.href = 'for-my-cute-bf/index.html';
                }, 5000);
            }, 500);
        }, 1000);
    }

    // Start everything
    initialize();
});