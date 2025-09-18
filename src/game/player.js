(function() {
  const Game = (window.Game = window.Game || {});

  function Player() {
    const c = Game.Config.bird; // Keep using bird config for physics
    this.x = c.x;
    this.y = Game.height / 2;
    this.vy = 0;
    this.radius = c.radius;
    this.angle = 0;
    this.alive = true;
    this.hurtFlash = 0;
    this.deathEffect = null;
    
    // Sprite animation setup
    this.spriteWidth = 64; // Estimated sprite size
    this.spriteHeight = 64;
    this.scale = 1.0;
    
    // Create punching animation
    this.setupAnimation();
  }

  Player.prototype.setupAnimation = function() {
    // Define the punching man animation frames
    const punchingFrames = [
      'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/e40b3d0f-9890-47e4-a303-4557665bbfa8/library/frames/Man%20punching_frame_1.png',
      'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/e40b3d0f-9890-47e4-a303-4557665bbfa8/library/frames/Man_punching_frame_1.png',
      'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/e40b3d0f-9890-47e4-a303-4557665bbfa8/library/frames/Man_punching_frame_2.png',
      'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/e40b3d0f-9890-47e4-a303-4557665bbfa8/library/frames/Man_punching_frame_3.png',
      'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/e40b3d0f-9890-47e4-a303-4557665bbfa8/library/frames/Man_punching_frame_4.png',
      'https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/e40b3d0f-9890-47e4-a303-4557665bbfa8/library/frames/Man_punching_frame_5.png'
    ];
    
    // Create animation at 8 FPS for smooth punching
    this.animation = Game.SpriteManager.createAnimation('punching', punchingFrames, 8);
  };

  Player.prototype.reset = function() {
    const c = Game.Config.bird;
    this.x = c.x;
    this.y = Game.height / 2;
    this.vy = 0;
    this.angle = 0;
    this.alive = true;
    this.hurtFlash = 0;
    this.deathEffect = null;
    
    // Reset animation
    if (this.animation) {
      this.animation.reset();
    }
  };

  // Create spectacular death effect
  Player.prototype.createDeathEffect = function() {
    const particles = [];
    const colors = ['#ff4444', '#ff8844', '#ffff44', '#44ff44', '#4444ff', '#ff44ff', '#ffffff'];
    
    // Explosive fragments (character parts)
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15 + Math.random() * 0.5;
      const speed = 100 + Math.random() * 150;
      particles.push({
        type: 'fragment',
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: 3 + Math.random() * 4,
        color: '#8B4513', // Brown for character fragments
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 1.0,
        maxLife: 1.0,
        gravity: 200
      });
    }
    
    // Colorful sparks
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 200 + Math.random() * 300;
      particles.push({
        type: 'spark',
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.8,
        maxLife: 0.8,
        gravity: 100
      });
    }
    
    // Debris chunks
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 120;
      particles.push({
        type: 'debris',
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: 4 + Math.random() * 6,
        color: '#654321',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 15,
        life: 1.2,
        maxLife: 1.2,
        gravity: 300
      });
    }
    
    // Smoke puffs
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 50;
      particles.push({
        type: 'smoke',
        x: this.x + (Math.random() - 0.5) * 20,
        y: this.y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        size: 8 + Math.random() * 12,
        color: `rgba(100, 100, 100, ${0.3 + Math.random() * 0.4})`,
        life: 1.5,
        maxLife: 1.5,
        gravity: -20,
        expansion: 1.02
      });
    }
    
    this.deathEffect = {
      active: true,
      particles: particles,
      timer: 0,
      duration: 2.0,
      slowMotion: true,
      slowMotionFactor: 0.3
    };
    
    // Trigger screen effects
    if (Game.Renderer) {
      Game.Renderer.shake(30);
      Game.Renderer.flash('#ff0000', 0.8);
    }
  };

  // Update death effect particles
  Player.prototype.updateDeathEffect = function(dt) {
    if (!this.deathEffect || !this.deathEffect.active) return;
    
    const effect = this.deathEffect;
    
    if (effect.slowMotion) {
      dt *= effect.slowMotionFactor;
    }
    
    effect.timer += dt;
    
    for (let i = effect.particles.length - 1; i >= 0; i--) {
      const p = effect.particles[i];
      
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      
      if (p.rotationSpeed) {
        p.rotation += p.rotationSpeed * dt;
      }
      
      if (p.expansion) {
        p.size *= Math.pow(p.expansion, dt * 60);
      }
      
      p.life -= dt;
      
      if (p.life <= 0) {
        effect.particles.splice(i, 1);
      }
    }
    
    if (effect.timer < 0.5 && Math.random() < 0.1) {
      const flashColors = ['#ff0000', '#ff4400', '#ffff00', '#ffffff'];
      Game.Renderer.flash(flashColors[Math.floor(Math.random() * flashColors.length)], 0.3);
    }
    
    if (effect.timer >= effect.duration || effect.particles.length === 0) {
      effect.active = false;
      effect.slowMotion = false;
    }
  };

  Player.prototype.update = function(dt) {
    const c = Game.Config.bird;
    
    // Update hurt flash
    if (this.hurtFlash > 0) {
      this.hurtFlash -= dt * 3;
    }
    
    // Update sprite animation
    if (this.animation) {
      this.animation.update(dt);
    }
    
    // Update death effect if active
    if (this.deathEffect) {
      this.updateDeathEffect(dt);
      
      if (this.deathEffect.active) {
        return;
      }
    }
    
    if (!this.alive) return;

    // Input - flap makes the character punch!
    if (Game.Input.consumeFlap()) {
      this.vy = c.flapImpulse;
      this.angle = c.tiltUp;
      
      // Reset animation to start punch sequence
      if (this.animation) {
        this.animation.reset();
      }
      
      if (Game.Audio) Game.Audio.flap();
    }

    // Physics
    this.vy += c.gravity * dt;
    if (this.vy > c.maxVel) this.vy = c.maxVel;
    this.y += this.vy * dt;

    // Tilt towards down while falling
    const target = this.vy > 0 ? c.tiltDown : c.tiltUp;
    this.angle += (target - this.angle) * Math.min(1, c.tiltLerp * dt);

    // Clamp to top
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = 0;
    }
  };

  Player.prototype.render = function() {
    // Render the animated character
    Game.Renderer.drawPlayer(this);
    
    // Render death effect particles
    if (this.deathEffect && this.deathEffect.active) {
      Game.Renderer.drawParticles(this.deathEffect.particles);
    }
  };

  // Trigger death with spectacular effects
  Player.prototype.die = function() {
    this.alive = false;
    this.hurtFlash = 1.0;
    this.createDeathEffect();
  };

  // Keep Bird as alias for compatibility
  Game.Bird = Player;
  Game.Player = Player;
})();