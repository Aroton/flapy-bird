(function() {
  const Game = (window.Game = window.Game || {});

  // Safe storage that falls back to memory in sandboxed environments
  const Storage = {
    _memory: {},
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return this._memory[key] || null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        this._memory[key] = value;
      }
    }
  };

  let bird; 
  let score = 0;
  let best = Number(Storage.get('flappy_best') || 0);
  let paused = false;
  let started = false;
  let deathTimer = 0; // Timer for death sequence

  function setState(s) { Game.state = s; }

  function resetGame() {
    if (!bird) bird = new Game.Bird();
    bird.reset();
    Game.Entities.reset();
    score = 0;
    paused = false;
    deathTimer = 0;
    
    // Reset screen effects
    if (Game.Renderer) {
      Game.Renderer.shakeIntensity = 0;
      Game.Renderer.flashAlpha = 0;
    }
  }

  function startGameWithFlap() {
    resetGame();
    setState('play');
    // immediate flap to feel snappy
    bird.vy = Game.Config.bird.flapImpulse;
    bird.angle = Game.Config.bird.tiltUp;
    if (Game.Audio) Game.Audio.flap();
  }

  Game.update = function(dt) {
    // Update sprite animations
    if (Game.SpriteManager) {
      Game.SpriteManager.updateAll(dt);
    }

    if (Game.Input.consumePause() && Game.state === 'play') paused = !paused;

    const R = Game.Renderer;
    switch (Game.state) {
      case undefined:
      case 'menu': {
        if (Game.Input.consumeFlap()) {
          startGameWithFlap();
          return;
        }
        // Gentle idle bob
        if (!bird) bird = new Game.Bird();
        const t = (performance.now() % 2000) / 2000;
        bird.y = Game.height / 2 + Math.sin(t * Math.PI * 2) * 8;
        bird.angle = Math.sin(t * Math.PI * 2) * 0.1;
        break;
      }
      case 'play': {
        if (paused) break;
        const diff = Game.Config.difficulty(score);
        Game.Entities.update(dt, diff);
        bird.update(dt);

        // Scoring when bird passes pipes
        for (let i = 0; i < Game.Entities.pipes.length; i++) {
          const p = Game.Entities.pipes[i];
          if (!p.scored && p.x + p.width < bird.x - bird.radius) {
            p.scored = true;
            score++;
            if (Game.Audio) Game.Audio.score();
          }
        }

        // Collision detection
        if (Game.Entities.collides(bird)) {
          // Trigger spectacular death effect
          bird.die();
          if (Game.Audio) Game.Audio.hit();
          best = Math.max(best, score);
          Storage.set('flappy_best', String(best));
          setState('dying'); // New dying state for death animation
          deathTimer = 0;
        }
        break;
      }
      case 'dying': {
        // Continue updating bird for death effects
        bird.update(dt);
        deathTimer += dt;
        
        // Transition to game over after death effect completes
        if (!bird.deathEffect || !bird.deathEffect.active || deathTimer > 3.0) {
          setState('gameover');
        }
        break;
      }
      case 'gameover': {
        if (Game.Input.consumeFlap()) {
          startGameWithFlap();
        }
        break;
      }
    }
  };

  Game.render = function() {
    const R = Game.Renderer;
    
    // Apply screen effects (shake, flash) before drawing
    const ctx = Game.ctx;
    if (ctx) {
      ctx.save();
      R.applyScreenEffects();
    }
    
    R.drawBackground();
    
    if (Game.state === 'menu' || Game.state === 'play' || Game.state === 'dying' || Game.state === 'gameover') {
      Game.Entities.render();
      if (bird) bird.render();
    }
    
    if (Game.state === 'play' || Game.state === 'dying') {
      R.drawScore(score);
      if (paused) {
        R.drawCenteredText('Paused', Game.height * 0.4, 36, '#ffffff');
        R.drawCenteredText('Press P to resume', Game.height * 0.48, 20, '#ffffff');
      }
    } else if (Game.state === 'menu') {
      Game.UI.drawMenu();
    } else if (Game.state === 'gameover') {
      R.drawScore(score);
      Game.UI.drawGameOver(score, best);
    }
    
    // Restore context after screen effects
    if (ctx) {
      ctx.restore();
    }
  };

  // Kick things off when canvas/context are ready
  function tryStart() {
    if (started) return;
    if (Game && Game.canvas && Game.ctx) {
      started = true;
      resetGame();
      setState('menu');
      Game.Loop.start();
    } else {
      // If DOM not ready yet, listen, otherwise retry shortly
      if (document && document.readyState === 'loading' && typeof document.addEventListener === 'function') {
        document.addEventListener('DOMContentLoaded', tryStart, { once: true });
      } else {
        setTimeout(tryStart, 0);
      }
    }
  }

  tryStart();
})();