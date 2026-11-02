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
  // 5. GENSHIN IMPACT SECTION – ARCHON QUEST INTERACTION
  // =========================================================================
  const objectiveItems = document.querySelectorAll('.objective-item');
  const btnClaimQuest = document.getElementById('btn-claim-quest');
  const questModal = document.getElementById('quest-modal');
  const btnCloseQuestModal = document.getElementById('btn-close-quest-modal');

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
        if (questModal) questModal.classList.add('active');
      }, 350);
    });
  }

  if (btnCloseQuestModal && questModal) {
    btnCloseQuestModal.addEventListener('click', () => {
      questModal.classList.remove('active');
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
  let giftOpened = false;

  if (giftBox) {
    giftBox.addEventListener('click', () => {
      if (giftOpened) {
        if (giftRevealModal) giftRevealModal.classList.add('active');
        return;
      }
      giftOpened = true;
      giftBox.classList.add('opened');

      SFX.playGiftBurst();
      const rect = giftBox.getBoundingClientRect();
      triggerCelebrationBurst(rect.left + 85, rect.top + 80, 120);

      // Open reward modal after burst
      setTimeout(() => {
        if (giftRevealModal) giftRevealModal.classList.add('active');
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
      giftRevealModal.classList.remove('active');

      // Smooth scroll to the farewell conclusion
      const farewell = document.getElementById('farewell');
      if (farewell) {
        setTimeout(() => {
          farewell.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    });
  }

  // Close modals on overlay backdrop click
  [questModal, giftRevealModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  });

  // ESC key to close open modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (questModal) questModal.classList.remove('active');
      if (giftRevealModal) giftRevealModal.classList.remove('active');
    }
  });

  console.log("Win's Special Adventure initialized successfully! ✦");
})();
