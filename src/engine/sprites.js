(function() {
  const Game = (window.Game = window.Game || {});

  // Sprite animation system
  function SpriteAnimation(frames, frameRate = 10) {
    this.frames = frames; // Array of image URLs
    this.frameRate = frameRate; // Frames per second
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.images = [];
    this.loaded = false;
    this.loadedCount = 0;
    
    // Load all frame images
    this.loadFrames();
  }

  SpriteAnimation.prototype.loadFrames = function() {
    for (let i = 0; i < this.frames.length; i++) {
      const img = new Image();
      img.onload = () => {
        this.loadedCount++;
        if (this.loadedCount === this.frames.length) {
          this.loaded = true;
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load sprite frame: ${this.frames[i]}`);
      };
      img.src = this.frames[i];
      this.images.push(img);
    }
  };

  SpriteAnimation.prototype.update = function(dt) {
    if (!this.loaded || this.frames.length === 0) return;
    
    this.frameTimer += dt;
    const frameDuration = 1 / this.frameRate;
    
    if (this.frameTimer >= frameDuration) {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.frameTimer = 0;
    }
  };

  SpriteAnimation.prototype.getCurrentImage = function() {
    if (!this.loaded || this.images.length === 0) return null;
    return this.images[this.currentFrame];
  };

  SpriteAnimation.prototype.reset = function() {
    this.currentFrame = 0;
    this.frameTimer = 0;
  };

  // Sprite manager for handling multiple animations
  const SpriteManager = {
    animations: {},
    
    createAnimation: function(name, frames, frameRate = 10) {
      this.animations[name] = new SpriteAnimation(frames, frameRate);
      return this.animations[name];
    },
    
    getAnimation: function(name) {
      return this.animations[name];
    },
    
    updateAll: function(dt) {
      for (let name in this.animations) {
        this.animations[name].update(dt);
      }
    }
  };

  Game.SpriteAnimation = SpriteAnimation;
  Game.SpriteManager = SpriteManager;
})();