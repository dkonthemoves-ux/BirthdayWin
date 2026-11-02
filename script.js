/**
 * WIN'S SPECIAL ADVENTURE: A JOURNEY THROUGH TEYVAT AND BEYOND
 * Pure Vanilla JavaScript implementation with Web Audio API Synthesizer,
 * Particle Physics Canvas, and Interactive Birthday Quests.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. WEB AUDIO API SYNTHESIZER (Completely Self-Contained, No External Files)
  // =========================================================================
  let audioCtx = null;
  let bgmGainNode = null;
  let sfxGainNode = null;
  let isBgmPlaying = false;
  let isSfxMuted = false;
  let bgmInterval = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();

        bgmGainNode = audioCtx.createGain();
        bgmGainNode.gain.setValueAtTime(0.22, audioCtx.currentTime);
        bgmGainNode.connect(audioCtx.destination);

        sfxGainNode = audioCtx.createGain();
        sfxGainNode.gain.setValueAtTime(0.35, audioCtx.currentTime);
        sfxGainNode.connect(audioCtx.destination);
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play a soft, pleasant chime note with exponential decay
  function playSynthTone(freq, type = 'sine', duration = 0.8, gainNode = sfxGainNode, delay = 0) {
    if (!audioCtx || isSfxMuted) return;
    try {
      const startTime = audioCtx.currentTime + delay;
      const osc = audioCtx.createOscillator();
      const noteGain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      noteGain.gain.setValueAtTime(0.001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.4, startTime + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(noteGain);
      noteGain.connect(gainNode || audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  // Sound Effects
  const SFX = {
    playChestOpen() {
      if (!audioCtx || isSfxMuted) return;
      const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      chord.forEach((freq, idx) => {
        playSynthTone(freq, 'triangle', 1.2, sfxGainNode, idx * 0.08);
      });
    },

    playPop() {
      if (!audioCtx || isSfxMuted) return;
      playSynthTone(880, 'sine', 0.25, sfxGainNode);
    },

    playBloom() {
      if (!audioCtx || isSfxMuted) return;
      const notes = [659.25, 783.99, 987.77, 1174.66]; // E5, G5, B5, D6
      notes.forEach((freq, idx) => {
        playSynthTone(freq, 'sine', 0.6, sfxGainNode, idx * 0.06);
      });
    },

    playAchievement() {
      if (!audioCtx || isSfxMuted) return;
      // Genshin style crisp achievement fanfare (G, B, D, G)
      const fanfare = [392.00, 493.88, 587.33, 783.99, 987.77];
      fanfare.forEach((freq, idx) => {
        playSynthTone(freq, 'triangle', 0.9, sfxGainNode, idx * 0.07);
      });
    },

    playQuestComplete() {
      if (!audioCtx || isSfxMuted) return;
      // Grand celebratory Genshin quest chime
      const chords = [
        { freqs: [440, 554.37, 659.25], time: 0 },
        { freqs: [493.88, 622.25, 739.99], time: 0.15 },
        { freqs: [587.33, 739.99, 880.00], time: 0.32 },
        { freqs: [880, 1108.73, 1318.51], time: 0.52 }
      ];
      chords.forEach(c => {
        c.freqs.forEach(f => {
          playSynthTone(f, 'sine', 1.6, sfxGainNode, c.time);
        });
      });
    },

    playGiftBurst() {
      if (!audioCtx || isSfxMuted) return;
      const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1174.66, 1318.51, 1567.98];
      arpeggio.forEach((f, i) => {
        playSynthTone(f, 'sine', 1.4, sfxGainNode, i * 0.06);
      });
    },

    playShutter() {
      if (!audioCtx || isSfxMuted) return;
      playSynthTone(1200, 'triangle', 0.08, sfxGainNode, 0);
      playSynthTone(1800, 'sine', 0.15, sfxGainNode, 0.04);
    }
  };

  // Ethereal Genshin-style BGM Generator (Peaceful Kalimba / Celesta Lydian Melody)
  const bgmNotes = [
    // Tranquil peaceful progression (C major / A minor pentatonic / Lydian)
    392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50
  ];

  let bgmStep = 0;
  function scheduleBgmNote() {
    if (!isBgmPlaying || !audioCtx) return;

    // Gentle flowing melodic patterns
    const melodyPattern = [
      0, 2, 4, 2, 5, 4, 2, 3,
      4, 5, 7, 5, 4, 2, 1, 0,
      2, 4, 6, 4, 3, 2, 4, 2
    ];

    const noteIdx = melodyPattern[bgmStep % melodyPattern.length];
    const freq = bgmNotes[noteIdx % bgmNotes.length];

    // Bell/Kalimba soft bell tone
    try {
      const startTime = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = (bgmStep % 4 === 0) ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Very soft, gentle envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.16, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(bgmGainNode);

      osc.start(startTime);
      osc.stop(startTime + 1.3);

      // Bass drone every 8 steps
      if (bgmStep % 8 === 0) {
        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(130.81, startTime); // C3
        bassGain.gain.setValueAtTime(0.001, startTime);
        bassGain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.2);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.8);

        bassOsc.connect(bassGain);
        bassGain.connect(bgmGainNode);
        bassOsc.start(startTime);
        bassOsc.stop(startTime + 3.0);
      }
    } catch (e) {
      console.warn('BGM scheduling error:', e);
    }

    bgmStep++;
  }

  function startBgm() {
    initAudioContext();
    if (isBgmPlaying) return;
    isBgmPlaying = true;
    updateBgmButtonUI();
    bgmInterval = setInterval(scheduleBgmNote, 420); // ~71 BPM tranquil flow
  }

  function pauseBgm() {
    isBgmPlaying = false;
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
    updateBgmButtonUI();
  }

  function toggleBgm() {
    if (isBgmPlaying) {
      pauseBgm();
    } else {
      startBgm();
    }
  }

  function toggleSfx() {
    isSfxMuted = !isSfxMuted;
    const sfxStatus = document.getElementById('sfx-status');
    const sfxBtn = document.getElementById('sfx-toggle');
    if (sfxStatus) sfxStatus.textContent = isSfxMuted ? 'MUTED' : 'ON';
    if (sfxBtn) sfxBtn.classList.toggle('muted', isSfxMuted);
    if (!isSfxMuted) SFX.playPop();
  }

  function updateBgmButtonUI() {
    const musicStatus = document.getElementById('music-status');
    const musicBtn = document.getElementById('music-toggle');
    if (musicStatus) musicStatus.textContent = isBgmPlaying ? 'PLAYING' : 'PAUSED';
    if (musicBtn) musicBtn.classList.toggle('playing', isBgmPlaying);
  }

  // =========================================================================
  // 2. AMBIENT PARTICLES CANVAS (Petals, Fireflies & Confetti)
  // =========================================================================
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  let width = 0;
  let height = 0;
  const particles = [];
  const confettiParticles = [];

  function resizeCanvas() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Petal & Firefly Particle Class
  class AmbientParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height - height * 0.2;
      this.isPetal = Math.random() > 0.45; // 55% flower petals, 45% glowing fireflies
      
      if (this.isPetal) {
        this.size = 8 + Math.random() * 9;
        this.speedY = 0.8 + Math.random() * 1.4;
        this.speedX = Math.random() * 1.2 - 0.4;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.04;
        this.oscillationSpeed = 0.02 + Math.random() * 0.03;
        this.oscillationDistance = 20 + Math.random() * 40;
        this.phase = Math.random() * Math.PI * 2;
        this.color = Math.random() > 0.4 ? 'rgba(255, 182, 193, 0.75)' : 'rgba(224, 187, 255, 0.75)';
      } else {
        // Firefly
        this.size = 2 + Math.random() * 3.5;
        this.speedY = (Math.random() - 0.5) * 0.6;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.alpha = 0.3 + Math.random() * 0.7;
        this.alphaSpeed = 0.02 + Math.random() * 0.03;
        this.color = '#ffd700';
      }
    }

    update() {
      if (this.isPetal) {
        this.y += this.speedY;
        this.phase += this.oscillationSpeed;
        this.x += Math.sin(this.phase) * 0.8 + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 20 || this.x < -30 || this.x > width + 30) {
          this.y = -20;
          this.x = Math.random() * width;
        }
      } else {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha += this.alphaSpeed;

        if (this.alpha <= 0.2 || this.alpha >= 0.95) {
          this.alphaSpeed = -this.alphaSpeed;
        }

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
    }

    draw(c) {
      if (this.isPetal) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);
        c.fillStyle = this.color;
        c.beginPath();
        c.moveTo(0, 0);
        c.bezierCurveTo(this.size * 0.6, -this.size * 0.8, this.size, 0, 0, this.size);
        c.bezierCurveTo(-this.size, 0, -this.size * 0.6, -this.size * 0.8, 0, 0);
        c.fill();
        c.restore();
      } else {
        c.save();
        c.globalAlpha = Math.max(0, this.alpha);
        c.fillStyle = this.color;
        c.shadowColor = '#ffd700';
        c.shadowBlur = 8;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }
  }

  // Initialize Particles (moderate amount for silky smooth 60fps)
  const particleCount = window.innerWidth < 768 ? 24 : 45;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new AmbientParticle());
  }

  // Celebration Confetti Explosion
  function triggerCelebrationBurst(originX, originY, count = 70) {
    const colors = ['#f472b6', '#c084fc', '#38bdf8', '#ffd700', '#4ade80', '#fb923c'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 11;
      confettiParticles.push({
        x: originX || width / 2,
        y: originY || height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        alpha: 1,
        gravity: 0.22,
        decay: 0.012 + Math.random() * 0.01
      });
    }
  }

  // Animation Loop
  function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Draw ambient petals & fireflies
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    // Draw active confetti bursts
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const cf = confettiParticles[i];
      cf.x += cf.vx;
      cf.y += cf.vy;
      cf.vy += cf.gravity;
      cf.rotation += cf.rotSpeed;
      cf.alpha -= cf.decay;

      if (cf.alpha <= 0) {
        confettiParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, cf.alpha);
      ctx.translate(cf.x, cf.y);
      ctx.rotate((cf.rotation * Math.PI) / 180);
      ctx.fillStyle = cf.color;
      ctx.fillRect(-cf.size / 2, -cf.size / 2, cf.size, cf.size * 0.6);
      ctx.restore();
    }

    requestAnimationFrame(animateParticles);
  }
  requestAnimationFrame(animateParticles);

  // =========================================================================
  // 3. INTRO SCREEN LOGIC & TRANSITION
  // =========================================================================
  const introScreen = document.getElementById('intro-screen');
  const btnEnter = document.getElementById('btn-enter');
  const introChest = document.getElementById('intro-chest');
  let hasEntered = false;

  function enterAdventure() {
    if (hasEntered) return;
    hasEntered = true;

    initAudioContext();
    SFX.playChestOpen();

    // Chest lid open animation
    const chestBox = introChest ? introChest.querySelector('.chest-box') : null;
    if (chestBox) chestBox.classList.add('opened');

    // Confetti & petal burst from chest
    const rect = introChest ? introChest.getBoundingClientRect() : { left: width / 2, top: height / 2 };
    triggerCelebrationBurst(rect.left + 70, rect.top + 50, 90);

    // Softly start BGM after slight delay
    setTimeout(() => {
      startBgm();
    }, 600);

    // Dismiss intro screen
    setTimeout(() => {
      if (introScreen) {
        introScreen.classList.add('dismissed');
      }
    }, 850);
  }

  if (btnEnter) btnEnter.addEventListener('click', enterAdventure);
  if (introChest) {
    introChest.addEventListener('click', enterAdventure);
    introChest.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        enterAdventure();
      }
    });
  }

  // Audio Buttons
  const musicToggle = document.getElementById('music-toggle');
  const sfxToggle = document.getElementById('sfx-toggle');

  if (musicToggle) musicToggle.addEventListener('click', toggleBgm);
  if (sfxToggle) sfxToggle.addEventListener('click', toggleSfx);

  // =========================================================================
  // 4. WAYPOINT FLOATING NAVIGATION & PROGRESS
  // =========================================================================
  const navToggle = document.getElementById('nav-toggle');
  const floatingNav = document.getElementById('floating-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollProgressBar = document.getElementById('scroll-progress');

  if (navToggle && floatingNav) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      floatingNav.classList.toggle('open');
      SFX.playPop();
    });

    document.addEventListener('click', (e) => {
      if (!floatingNav.contains(e.target)) {
        floatingNav.classList.remove('open');
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (floatingNav) floatingNav.classList.remove('open');
      SFX.playPop();
    });
  });

  // Track Reading Progress Bar and Active Nav Section
  const trackedSections = document.querySelectorAll('header[id], section[id], footer[id]');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollProgressBar) {
      scrollProgressBar.style.width = scrollPercent + '%';
    }

    // Active Section highlight in navigation
    let currentId = '';
    trackedSections.forEach(section => {
      const top = section.offsetTop - 180;
      if (scrollTop >= top) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-target') === currentId);
    });
  });

  // =========================================================================
  // CENTRAL MODAL MANAGER & SCROLL LOCK
  // =========================================================================
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    const remainingActive = document.querySelectorAll('.genshin-modal-overlay.active');
    if (remainingActive.length === 0) {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    }
  }

  // =========================================================================
  // 5. GENSHIN IMPACT SECTION – ARCHON QUEST INTERACTION
  // =========================================================================
  const objectiveItems = document.querySelectorAll('.objective-item');
  const btnClaimQuest = document.getElementById('btn-claim-quest');
  const questModal = document.getElementById('quest-modal');
  const btnCloseQuestModal = document.getElementById('btn-close-quest-modal');
  const btnCloseQuestIcon = document.getElementById('btn-close-quest-icon');

  objectiveItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('completed');
      const isDone = item.classList.contains('completed');
      const statusLabel = item.querySelector('.obj-status');
      if (statusLabel) {
        statusLabel.textContent = isDone ? 'Done! ✨' : 'Ready';
      }
      SFX.playPop();
    });
  });

  if (btnClaimQuest) {
    btnClaimQuest.addEventListener('click', (e) => {
      // Mark all objectives completed if not yet
      objectiveItems.forEach(item => {
        item.classList.add('completed');
        const statusLabel = item.querySelector('.obj-status');
        if (statusLabel) statusLabel.textContent = 'Done! ✨';
      });

      // Sound fanfare & Confetti
      SFX.playQuestComplete();
      const rect = btnClaimQuest.getBoundingClientRect();
      triggerCelebrationBurst(rect.left + rect.width / 2, rect.top, 100);

      // Open Genshin quest completion modal
      setTimeout(() => {
        if (questModal) openModal(questModal);
      }, 350);
    });
  }

  if (btnCloseQuestModal && questModal) {
    btnCloseQuestModal.addEventListener('click', () => {
      closeModal(questModal);
      SFX.playPop();
    });
  }

  if (btnCloseQuestIcon && questModal) {
    btnCloseQuestIcon.addEventListener('click', () => {
      closeModal(questModal);
      SFX.playPop();
    });
  }

  // =========================================================================
  // 6. FLOWER GARDEN INTERACTIVITY
  // =========================================================================
  const btnBlooms = document.querySelectorAll('.btn-bloom');
  const flowerCards = document.querySelectorAll('.flower-card');

  btnBlooms.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.flower-card');
      const rect = btn.getBoundingClientRect();

      SFX.playBloom();
      triggerCelebrationBurst(rect.left + rect.width / 2, rect.top, 35);

      if (card) {
        card.style.transform = 'translateY(-12px) scale(1.04)';
        setTimeout(() => {
          card.style.transform = '';
        }, 500);
      }
    });
  });

  // Touch/hover effects on the master bouquet SVG
  const masterBouquet = document.getElementById('interactive-bouquet');
  if (masterBouquet) {
    masterBouquet.addEventListener('click', (e) => {
      SFX.playBloom();
      triggerCelebrationBurst(e.clientX, e.clientY, 40);
    });
  }

  // =========================================================================
  // 7. REAL-LIFE ADVENTURE CARDS (3D TILT EFFECT)
  // =========================================================================
  const adventureCards = document.querySelectorAll('.adventure-card');

  adventureCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });

    card.addEventListener('click', () => {
      SFX.playPop();
    });
  });

  // =========================================================================
  // 8. ADVENTURE ACHIEVEMENTS SYSTEM
  // =========================================================================
  const achievementCards = document.querySelectorAll('.achievement-card');
  const primoTotalEl = document.getElementById('primo-total');
  let currentPrimos = 0;

  achievementCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('unlocked')) return;

      card.classList.add('unlocked');
      const badge = card.querySelector('.achieve-badge-status');
      const btn = card.querySelector('.btn-claim-single');

      if (badge) badge.textContent = 'Unlocked! ✦';
      if (btn) btn.textContent = 'Claimed ✔';

      currentPrimos += 10;
      if (primoTotalEl) primoTotalEl.textContent = currentPrimos;

      SFX.playAchievement();
      const rect = card.getBoundingClientRect();
      triggerCelebrationBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
    });
  });

  // =========================================================================
  // 9. PERSONALIZED BIRTHDAY LETTER (WAX SEAL & UNWRAP)
  // =========================================================================
  const waxSeal = document.getElementById('wax-seal');
  const parchmentLetter = document.getElementById('parchment-letter');
  let letterOpened = false;

  if (waxSeal && parchmentLetter) {
    waxSeal.addEventListener('click', () => {
      SFX.playBloom();
      waxSeal.style.transform = 'scale(1.25) rotate(20deg)';
      waxSeal.style.opacity = '0.7';

      const sealText = waxSeal.querySelector('.seal-text');
      if (sealText) sealText.textContent = 'OPENED';

      // Pulse letter parchment
      parchmentLetter.style.boxShadow = '0 0 35px rgba(245, 199, 96, 0.5), inset 0 0 40px rgba(245, 199, 96, 0.15)';
      const rect = waxSeal.getBoundingClientRect();
      triggerCelebrationBurst(rect.left + 34, rect.top + 34, 50);

      letterOpened = true;
    });

    waxSeal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        waxSeal.click();
      }
    });
  }

  // =========================================================================
  // 10. INTERACTIVE BIRTHDAY GIFT BOX
  // =========================================================================
  const giftBox = document.getElementById('birthday-gift-box');
  const giftRevealModal = document.getElementById('gift-reveal-modal');
  const btnClaimRewardFinal = document.getElementById('btn-claim-reward-final');
  const btnCloseGiftModal = document.getElementById('btn-close-gift-modal');
  let giftOpened = false;

  if (giftBox) {
    giftBox.addEventListener('click', () => {
      if (giftOpened) {
        if (giftRevealModal) openModal(giftRevealModal);
        return;
      }
      giftOpened = true;
      giftBox.classList.add('opened');

      SFX.playGiftBurst();
      const rect = giftBox.getBoundingClientRect();
      triggerCelebrationBurst(rect.left + 85, rect.top + 80, 120);

      // Open reward modal after burst
      setTimeout(() => {
        if (giftRevealModal) openModal(giftRevealModal);
      }, 400);
    });

    giftBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        giftBox.click();
      }
    });
  }

  if (btnClaimRewardFinal && giftRevealModal) {
    btnClaimRewardFinal.addEventListener('click', () => {
      SFX.playQuestComplete();
      triggerCelebrationBurst(width / 2, height / 2, 100);
      closeModal(giftRevealModal);

      // Smooth scroll to the farewell conclusion
      const farewell = document.getElementById('farewell');
      if (farewell) {
        setTimeout(() => {
          farewell.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    });
  }

  if (btnCloseGiftModal && giftRevealModal) {
    btnCloseGiftModal.addEventListener('click', () => {
      closeModal(giftRevealModal);
      SFX.playPop();
    });
  }

  // =========================================================================
  // 11. TRAVELER'S PHOTO STUDIO & CAMERA LOGIC
  // =========================================================================
  const PHOTO_DESTINATIONS = {
    mondstadt: {
      name: "Mondstadt – Windrise",
      title: "Birthday in Mondstadt",
      imgSrc: "images/bg_mondstadt.jpg",
      fileName: "Win_Birthday_Mondstadt.png",
      accentColor: "#10b981",
      secondaryColor: "#ffd166",
      decor: "dandelion"
    },
    fontaine: {
      name: "Fontaine – Court of Fontaine",
      title: "A Royal Day in Fontaine",
      imgSrc: "images/bg_fontaine.jpg",
      fileName: "Win_Birthday_Fontaine.png",
      accentColor: "#0ea5e9",
      secondaryColor: "#ffd700",
      decor: "bubbles"
    },
    inazuma: {
      name: "Inazuma – Grand Narukami Shrine",
      title: "Under the Sakura in Inazuma",
      imgSrc: "images/bg_inazuma.jpg",
      fileName: "Win_Birthday_Inazuma.png",
      accentColor: "#ec4899",
      secondaryColor: "#d8b4fe",
      decor: "sakura"
    },
    sumeru: {
      name: "Sumeru – Garden of Wishes",
      title: "A Birthday in Sumeru",
      imgSrc: "images/bg_sumeru.jpg",
      fileName: "Win_Birthday_Sumeru.png",
      accentColor: "#22c55e",
      secondaryColor: "#facc15",
      decor: "leaves"
    }
  };

  let currentDestKey = 'mondstadt';
  let currentCameraStream = null;
  let facingMode = 'user'; // front-facing camera default
  let currentComposedBlob = null;
  let currentComposedDataUrl = null;

  const cameraModal = document.getElementById('camera-modal');
  const cameraVideo = document.getElementById('camera-video');
  const btnCloseCamera = document.getElementById('btn-close-camera');
  const btnSwitchCamera = document.getElementById('btn-switch-camera');
  const btnCapturePhoto = document.getElementById('btn-capture-photo');
  const cameraSelectedDestLabel = document.getElementById('camera-selected-dest-label');
  const cameraErrorBox = document.getElementById('camera-error-box');
  const cameraErrorMsg = document.getElementById('camera-error-msg');
  const btnRetryCamera = document.getElementById('btn-retry-camera');
  const cameraFileInput = document.getElementById('camera-file-input');
  const cameraFallbackFile = document.getElementById('camera-fallback-file');
  const cameraProcessingSpinner = document.getElementById('camera-processing-spinner');
  const cameraShutterFlash = document.getElementById('camera-shutter-flash');

  const photoResultModal = document.getElementById('photo-result-modal');
  const btnCloseResultModal = document.getElementById('btn-close-result-modal');
  const resultComposedImage = document.getElementById('result-composed-image');
  const btnDownloadPhoto = document.getElementById('btn-download-photo');
  const btnRetakePhoto = document.getElementById('btn-retake-photo');
  const btnChooseOtherBg = document.getElementById('btn-choose-other-bg');
  const compositionCanvas = document.getElementById('composition-canvas');

  // Destination Card Clicks
  const btnStartCams = document.querySelectorAll('.btn-start-cam');
  const destCards = document.querySelectorAll('.dest-card');

  btnStartCams.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const destKey = btn.getAttribute('data-bg') || 'mondstadt';
      openCameraModal(destKey);
    });
  });

  destCards.forEach(card => {
    card.addEventListener('click', () => {
      const destKey = card.getAttribute('data-bg') || 'mondstadt';
      openCameraModal(destKey);
    });
  });

  function openCameraModal(destKey) {
    currentDestKey = destKey || 'mondstadt';
    const dest = PHOTO_DESTINATIONS[currentDestKey];

    if (cameraSelectedDestLabel) {
      cameraSelectedDestLabel.textContent = `Destination: ${dest.name}`;
    }

    if (cameraErrorBox) cameraErrorBox.style.display = 'none';
    if (cameraProcessingSpinner) cameraProcessingSpinner.style.display = 'none';
    if (cameraModal) openModal(cameraModal);

    SFX.playPop();
    startCameraStream();
  }

  function startCameraStream() {
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showCameraError("Camera access is not supported by your current browser. You can choose a photo from your gallery instead!");
      return;
    }

    const constraints = {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 960 }
      },
      audio: false
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        currentCameraStream = stream;
        if (cameraVideo) {
          cameraVideo.srcObject = stream;
          cameraVideo.play().catch(e => console.warn('Video play error:', e));
        }
        if (cameraErrorBox) cameraErrorBox.style.display = 'none';
      })
      .catch(err => {
        console.warn('Camera getUserMedia error:', err);
        showCameraError("Camera access was not granted or is unavailable on this device. You can choose a photo from your device or retry.");
      });
  }

  function stopCameraStream() {
    if (currentCameraStream) {
      currentCameraStream.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      currentCameraStream = null;
    }
    if (cameraVideo) {
      cameraVideo.srcObject = null;
    }
  }

  function showCameraError(msg) {
    if (cameraErrorMsg) cameraErrorMsg.textContent = msg;
    if (cameraErrorBox) cameraErrorBox.style.display = 'block';
  }

  if (btnCloseCamera) {
    btnCloseCamera.addEventListener('click', () => {
      stopCameraStream();
      if (cameraModal) closeModal(cameraModal);
      SFX.playPop();
    });
  }

  if (btnSwitchCamera) {
    btnSwitchCamera.addEventListener('click', () => {
      facingMode = (facingMode === 'user') ? 'environment' : 'user';
      if (cameraVideo) {
        cameraVideo.style.transform = (facingMode === 'user') ? 'scaleX(-1)' : 'scaleX(1)';
      }
      SFX.playPop();
      startCameraStream();
    });
  }

  if (btnRetryCamera) {
    btnRetryCamera.addEventListener('click', () => {
      if (cameraErrorBox) cameraErrorBox.style.display = 'none';
      startCameraStream();
    });
  }

  // File Upload Handlers (for gallery uploads or camera fallbacks)
  [cameraFileInput, cameraFallbackFile].forEach(input => {
    if (input) {
      input.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx2 = canvas.getContext('2d');
            ctx2.drawImage(img, 0, 0);

            stopCameraStream();
            if (cameraProcessingSpinner) cameraProcessingSpinner.style.display = 'flex';
            processAndComposite(canvas);
          };
          img.src = loadEvt.target.result;
        };
        reader.readAsDataURL(file);
        // Reset file input so same file can be selected again
        input.value = '';
      });
    }
  });

  // Capture Button Click
  if (btnCapturePhoto) {
    btnCapturePhoto.addEventListener('click', () => {
      if (!cameraVideo || !cameraVideo.videoWidth) return;

      // Shutter sound & visual flash
      SFX.playShutter();
      if (cameraShutterFlash) {
        cameraShutterFlash.classList.add('flash-active');
        setTimeout(() => cameraShutterFlash.classList.remove('flash-active'), 400);
      }

      // Draw snapshot from video to offscreen canvas
      const snapCanvas = document.createElement('canvas');
      const w = cameraVideo.videoWidth || 640;
      const h = cameraVideo.videoHeight || 480;
      snapCanvas.width = w;
      snapCanvas.height = h;
      const sCtx = snapCanvas.getContext('2d');

      // If front camera, un-mirror so Win looks natural
      if (facingMode === 'user') {
        sCtx.translate(w, 0);
        sCtx.scale(-1, 1);
      }
      sCtx.drawImage(cameraVideo, 0, 0, w, h);

      stopCameraStream();
      if (cameraProcessingSpinner) cameraProcessingSpinner.style.display = 'flex';

      // Slight timeout to let spinner render
      setTimeout(() => {
        processAndComposite(snapCanvas);
      }, 80);
    });
  }

  // Person Segmentation & Photo Composition Engine
  function processAndComposite(selfieCanvas) {
    const dest = PHOTO_DESTINATIONS[currentDestKey] || PHOTO_DESTINATIONS.mondstadt;
    const bgImg = new Image();

    bgImg.onload = () => {
      // Check if MediaPipe SelfieSegmentation is available
      if (window.SelfieSegmentation) {
        try {
          const segmenter = new window.SelfieSegmentation({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
          });
          segmenter.setOptions({ modelSelection: 1 });

          segmenter.onResults(results => {
            renderFinalComposition(selfieCanvas, results.segmentationMask, bgImg, dest);
          });

          segmenter.send({ image: selfieCanvas }).catch(err => {
            console.warn('MediaPipe send error, applying graceful portrait cutout:', err);
            renderFinalComposition(selfieCanvas, null, bgImg, dest);
          });
        } catch (e) {
          console.warn('MediaPipe initialization fallback:', e);
          renderFinalComposition(selfieCanvas, null, bgImg, dest);
        }
      } else {
        // Graceful portrait cutout fallback
        renderFinalComposition(selfieCanvas, null, bgImg, dest);
      }
    };

    bgImg.onerror = () => {
      // Fallback if background image load fails
      renderFinalComposition(selfieCanvas, null, null, dest);
    };

    bgImg.src = dest.imgSrc;
  }

  // Master Canvas Drawing Function
  function renderFinalComposition(selfieCanvas, maskCanvas, bgImg, dest) {
    const canvas = compositionCanvas || document.createElement('canvas');
    const width = 1200;
    const height = 900; // 4:3 high-definition ratio
    canvas.width = width;
    canvas.height = height;
    const c = canvas.getContext('2d');

    // 1. Draw Background Image or procedural fallback
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      c.drawImage(bgImg, 0, 0, width, height);
    } else {
      // Scenic gradient fallback
      const grad = c.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#fbcfe8');
      grad.addColorStop(0.5, '#c084fc');
      grad.addColorStop(1, '#38bdf8');
      c.fillStyle = grad;
      c.fillRect(0, 0, width, height);
    }

    // Gentle ambient environmental tint
    c.fillStyle = 'rgba(255, 240, 245, 0.08)';
    c.fillRect(0, 0, width, height);

    // 2. Prepare Extracted Person
    const cutoutCanvas = document.createElement('canvas');
    cutoutCanvas.width = selfieCanvas.width;
    cutoutCanvas.height = selfieCanvas.height;
    const cutCtx = cutoutCanvas.getContext('2d');

    if (maskCanvas) {
      // Pixel-perfect MediaPipe segmentation cutout
      cutCtx.drawImage(selfieCanvas, 0, 0);
      cutCtx.globalCompositeOperation = 'destination-in';
      cutCtx.drawImage(maskCanvas, 0, 0, selfieCanvas.width, selfieCanvas.height);
      cutCtx.globalCompositeOperation = 'source-over';
    } else {
      // Elegant feathered oval portrait framing fallback
      cutCtx.drawImage(selfieCanvas, 0, 0);
      cutCtx.globalCompositeOperation = 'destination-in';
      const radGrad = cutCtx.createRadialGradient(
        selfieCanvas.width / 2, selfieCanvas.height * 0.45, selfieCanvas.width * 0.25,
        selfieCanvas.width / 2, selfieCanvas.height * 0.45, selfieCanvas.width * 0.48
      );
      radGrad.addColorStop(0, 'rgba(0,0,0,1)');
      radGrad.addColorStop(0.85, 'rgba(0,0,0,0.95)');
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');
      cutCtx.fillStyle = radGrad;
      cutCtx.fillRect(0, 0, selfieCanvas.width, selfieCanvas.height);
      cutCtx.globalCompositeOperation = 'source-over';
    }

    // 3. Composite Person onto Destination Scenery
    // Scale person to look natural in front of scenery
    const personTargetHeight = height * 0.76;
    const personRatio = cutoutCanvas.width / cutoutCanvas.height;
    const personTargetWidth = personTargetHeight * personRatio;
    const personX = (width - personTargetWidth) / 2;
    const personY = height - personTargetHeight + 20;

    // Subtle drop shadow behind person for realistic integration
    c.save();
    c.shadowColor = 'rgba(0, 0, 0, 0.45)';
    c.shadowBlur = 35;
    c.shadowOffsetX = 0;
    c.shadowOffsetY = 12;
    c.drawImage(cutoutCanvas, personX, personY, personTargetWidth, personTargetHeight);
    c.restore();

    // 4. Region-Specific Particle Accents
    drawRegionAccents(c, width, height, dest.decor);

    // 5. Genshin Impact Decorative Frame & Gold Filigree
    drawGenshinFrame(c, width, height, dest);

    // 6. Render Typography directly onto the downloadable Canvas
    drawBirthdayTypography(c, width, height, dest);

    // Convert to Image & Blob
    currentComposedDataUrl = canvas.toDataURL('image/png');
    if (resultComposedImage) {
      resultComposedImage.src = currentComposedDataUrl;
    }

    canvas.toBlob(blob => {
      currentComposedBlob = blob;
    }, 'image/png');

    // Close camera modal, hide spinner, open photo result modal
    if (cameraProcessingSpinner) cameraProcessingSpinner.style.display = 'none';
    if (cameraModal) closeModal(cameraModal);
    if (photoResultModal) openModal(photoResultModal);

    SFX.playQuestComplete();
    triggerCelebrationBurst(window.innerWidth / 2, window.innerHeight / 2, 90);
  }

  // Draw floating particles based on destination
  function drawRegionAccents(c, w, h, decorType) {
    c.save();
    const count = 28;

    if (decorType === 'sakura') {
      // Inazuma pink sakura petals
      for (let i = 0; i < count; i++) {
        const px = (Math.sin(i * 137.5) * 0.5 + 0.5) * w;
        const py = ((i * 37) % h);
        const size = 10 + (i % 8) * 2;
        const rot = (i * 45) * Math.PI / 180;
        c.save();
        c.translate(px, py);
        c.rotate(rot);
        c.fillStyle = (i % 2 === 0) ? 'rgba(255, 182, 193, 0.78)' : 'rgba(255, 209, 220, 0.85)';
        c.beginPath();
        c.moveTo(0, 0);
        c.bezierCurveTo(size * 0.6, -size * 0.8, size, 0, 0, size);
        c.bezierCurveTo(-size, 0, -size * 0.6, -size * 0.8, 0, 0);
        c.fill();
        c.restore();
      }
    } else if (decorType === 'dandelion') {
      // Mondstadt dandelions & golden sparkles
      for (let i = 0; i < count; i++) {
        const px = ((i * 47) % w);
        const py = ((i * 59) % h);
        c.fillStyle = 'rgba(255, 255, 255, 0.85)';
        c.beginPath();
        c.arc(px, py, 3 + (i % 4), 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(255, 215, 0, 0.7)';
        c.beginPath();
        c.arc(px + 12, py - 8, 2, 0, Math.PI * 2);
        c.fill();
      }
    } else if (decorType === 'bubbles') {
      // Fontaine glowing water bubbles & motes
      for (let i = 0; i < count; i++) {
        const px = ((i * 53) % w);
        const py = ((i * 71) % h);
        const r = 5 + (i % 9) * 2;
        c.strokeStyle = 'rgba(125, 211, 252, 0.75)';
        c.lineWidth = 2;
        c.fillStyle = 'rgba(224, 242, 254, 0.25)';
        c.beginPath();
        c.arc(px, py, r, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      }
    } else {
      // Sumeru glowing Dendro motes & leaves
      for (let i = 0; i < count; i++) {
        const px = ((i * 61) % w);
        const py = ((i * 43) % h);
        c.fillStyle = 'rgba(134, 239, 172, 0.8)';
        c.shadowColor = '#86efac';
        c.shadowBlur = 8;
        c.beginPath();
        c.arc(px, py, 3 + (i % 4), 0, Math.PI * 2);
        c.fill();
      }
    }
    c.restore();
  }

  // Draw Genshin-style decorative borders & gold filigree
  function drawGenshinFrame(c, w, h, dest) {
    c.save();

    // Inner gold border line
    const pad = 24;
    c.strokeStyle = '#ffd700';
    c.lineWidth = 3;
    c.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

    // Subtle second thin line
    c.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    c.lineWidth = 1;
    c.strokeRect(pad + 6, pad + 6, w - (pad + 6) * 2, h - (pad + 6) * 2);

    // Corner filigree ornaments
    const corners = [
      { x: pad + 2, y: pad + 2, rot: 0 },
      { x: w - pad - 2, y: pad + 2, rot: 90 },
      { x: w - pad - 2, y: h - pad - 2, rot: 180 },
      { x: pad + 2, y: h - pad - 2, rot: 270 }
    ];

    corners.forEach(cr => {
      c.save();
      c.translate(cr.x, cr.y);
      c.rotate((cr.rot * Math.PI) / 180);
      c.fillStyle = '#ffd700';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(26, 0);
      c.lineTo(26, 5);
      c.lineTo(5, 5);
      c.lineTo(5, 26);
      c.lineTo(0, 26);
      c.closePath();
      c.fill();

      // Corner diamond gem
      c.beginPath();
      c.moveTo(12, 12);
      c.lineTo(17, 8);
      c.lineTo(22, 12);
      c.lineTo(17, 16);
      c.closePath();
      c.fillStyle = dest.accentColor;
      c.fill();
      c.strokeStyle = '#fff';
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    });

    c.restore();
  }

  // Draw elegant typography on canvas
  function drawBirthdayTypography(c, w, h, dest) {
    c.save();

    // 1. Top Location Badge Pill
    const pillW = 340;
    const pillH = 38;
    const pillX = (w - pillW) / 2;
    const pillY = 38;

    c.fillStyle = 'rgba(15, 23, 42, 0.78)';
    c.beginPath();
    c.roundRect(pillX, pillY, pillW, pillH, 19);
    c.fill();
    c.strokeStyle = '#ffd700';
    c.lineWidth = 1.5;
    c.stroke();

    c.font = 'bold 15px Cinzel, serif';
    c.fillStyle = '#fef08a';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(`✦ ${dest.name.toUpperCase()} ✦`, w / 2, pillY + pillH / 2);

    // 2. Bottom Shaded Banner Gradient for Text Readability
    const bannerGrad = c.createLinearGradient(0, h - 140, 0, h);
    bannerGrad.addColorStop(0, 'rgba(15, 5, 25, 0)');
    bannerGrad.addColorStop(0.3, 'rgba(15, 5, 25, 0.65)');
    bannerGrad.addColorStop(1, 'rgba(15, 5, 25, 0.92)');
    c.fillStyle = bannerGrad;
    c.fillRect(0, h - 140, w, 140);

    // 3. Main Title: "Happy Birthday, Win! ♡"
    c.shadowColor = 'rgba(0, 0, 0, 0.85)';
    c.shadowBlur = 12;
    c.shadowOffsetY = 3;

    c.font = '900 42px Cinzel, serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    const goldGrad = c.createLinearGradient(w / 2 - 250, 0, w / 2 + 250, 0);
    goldGrad.addColorStop(0, '#ffffff');
    goldGrad.addColorStop(0.3, '#ffd700');
    goldGrad.addColorStop(0.7, '#f59e0b');
    goldGrad.addColorStop(1, '#ffffff');
    c.fillStyle = goldGrad;
    c.fillText("Happy Birthday, Win! ♡", w / 2, h - 75);

    // 4. Subtitle: "Your Adventure Continues..."
    c.font = 'italic 20px "Playfair Display", serif';
    c.fillStyle = '#fbcfe8';
    c.shadowBlur = 8;
    c.fillText("Your Adventure Continues...", w / 2, h - 38);

    c.restore();
  }

  // Result Modal Button Handlers
  if (btnCloseResultModal) {
    btnCloseResultModal.addEventListener('click', () => {
      if (photoResultModal) closeModal(photoResultModal);
      SFX.playPop();
    });
  }

  if (btnRetakePhoto) {
    btnRetakePhoto.addEventListener('click', () => {
      if (photoResultModal) closeModal(photoResultModal);
      openCameraModal(currentDestKey);
    });
  }

  if (btnChooseOtherBg) {
    btnChooseOtherBg.addEventListener('click', () => {
      if (photoResultModal) closeModal(photoResultModal);
      const studioSec = document.getElementById('photo-studio');
      if (studioSec) {
        studioSec.scrollIntoView({ behavior: 'smooth' });
      }
      SFX.playPop();
    });
  }

  if (btnDownloadPhoto) {
    btnDownloadPhoto.addEventListener('click', () => {
      const dest = PHOTO_DESTINATIONS[currentDestKey] || PHOTO_DESTINATIONS.mondstadt;
      SFX.playPop();

      // Mobile Web Share API support when available
      if (navigator.share && currentComposedBlob) {
        const file = new File([currentComposedBlob], dest.fileName, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: "Win's Birthday Adventure",
            text: `Happy Birthday, Win! ♡ Memory from ${dest.name}`
          }).catch(err => {
            console.log('Share dismissed, triggering direct download:', err);
            triggerDirectDownload(dest.fileName);
          });
          return;
        }
      }

      // Standard browser download
      triggerDirectDownload(dest.fileName);
    });
  }

  function triggerDirectDownload(fileName) {
    if (!currentComposedDataUrl) return;
    const a = document.createElement('a');
    a.href = currentComposedDataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerCelebrationBurst(window.innerWidth / 2, window.innerHeight / 2, 40);
  }

  // Close modals on overlay backdrop click
  [questModal, giftRevealModal, cameraModal, photoResultModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          if (modal === cameraModal) stopCameraStream();
          closeModal(modal);
        }
      });
    }
  });

  // ESC key to close open modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (questModal && questModal.classList.contains('active')) closeModal(questModal);
      if (giftRevealModal && giftRevealModal.classList.contains('active')) closeModal(giftRevealModal);
      if (cameraModal && cameraModal.classList.contains('active')) {
        stopCameraStream();
        closeModal(cameraModal);
      }
      if (photoResultModal && photoResultModal.classList.contains('active')) closeModal(photoResultModal);
    }
  });

  console.log("Win's Special Adventure & Traveler's Photo Studio initialized successfully! ✦");
})();

