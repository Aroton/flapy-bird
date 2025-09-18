(function() {
  const Game = (window.Game = window.Game || {});

  const R = (Game.Renderer = {
    // Screen shake variables
    shakeX: 0,
    shakeY: 0,
    shakeIntensity: 0,
    shakeDecay: 0.9,

    // Flash effect variables
    flashAlpha: 0,
    flashColor: '#ff0000',

    clear() {
      const ctx = Game.ctx; if (!ctx) return;
      ctx.fillStyle = Game.Colors.sky;
      ctx.fillRect(0, 0, Game.width, Game.height);
    },

    // Apply screen shake and flash effects
    applyScreenEffects() {
      const ctx = Game.ctx; if (!ctx) return;
      
      // Screen shake
      if (this.shakeIntensity > 0.1) {
        this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
        this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
        this.shakeIntensity *= this.shakeDecay;
        ctx.translate(this.shakeX, this.shakeY);
      } else {
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;
      }

      // Flash effect
      if (this.flashAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = this.flashAlpha;
        ctx.fillStyle = this.flashColor;
        ctx.fillRect(-this.shakeX, -this.shakeY, Game.width, Game.height);
        ctx.restore();
        this.flashAlpha *= 0.85; // Fade out flash
      }
    },

    // Trigger screen shake
    shake(intensity = 20) {
      this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    },

    // Trigger screen flash
    flash(color = '#ff0000', alpha = 0.6) {
      this.flashColor = color;
      this.flashAlpha = Math.max(this.flashAlpha, alpha);
    },

    drawBackground() {
      const ctx = Game.ctx; if (!ctx) return;
      // Simple clouds bands
      ctx.fillStyle = Game.Colors.sky;
      ctx.fillRect(0, 0, Game.width, Game.height);
      ctx.fillStyle = Game.Colors.skyLight;
      for (let i = 0; i < 6; i++) {
        const y = (i * Game.height) / 6;
        ctx.globalAlpha = 0.05;
        ctx.fillRect(0, y, Game.width, 20);
      }
      ctx.globalAlpha = 1;
    },

    drawGround(offsetX) {
      const ctx = Game.ctx; if (!ctx) return;
      const h = 100;
      const y = Game.height - h;
      ctx.fillStyle = Game.Colors.ground;
      ctx.fillRect(0, y, Game.width, h);
      // scrolling pattern
      ctx.fillStyle = Game.Colors.groundDark;
      const stripeW = 24;
      let x = -((offsetX % stripeW) + stripeW);
      for (; x < Game.width + stripeW; x += stripeW) {
        ctx.fillRect(x, y, stripeW / 2, 8);
      }
    },

    drawPipe(pipe) {
      const ctx = Game.ctx; if (!ctx) return;
      const w = pipe.width;
      ctx.fillStyle = Game.Colors.pipe;
      // top
      ctx.fillRect(pipe.x, 0, w, pipe.gapTop);
      // bottom
      ctx.fillRect(pipe.x, pipe.gapBottom, w, Game.height - pipe.gapBottom - 100);
      // lip accents
      ctx.fillStyle = Game.Colors.pipeDark;
      ctx.fillRect(pipe.x, pipe.gapTop - 8, w, 8);
      ctx.fillRect(pipe.x, pipe.gapBottom, w, 8);
    },

    // Draw animated player character
    drawPlayer(player) {
      const ctx = Game.ctx; if (!ctx) return;
      
      // Don't draw player if it's in death animation
      if (player.deathEffect && player.deathEffect.active) return;
      
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);
      
      // Add hurt flash effect
      if (player.hurtFlash && player.hurtFlash > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(player.hurtFlash * 20) * 0.5;
      }
      
      // Draw sprite if animation is loaded
      if (player.animation && player.animation.loaded) {
        const currentImage = player.animation.getCurrentImage();
        if (currentImage) {
          const width = player.spriteWidth * player.scale;
          const height = player.spriteHeight * player.scale;
          
          // Draw sprite centered
          ctx.drawImage(
            currentImage,
            -width / 2,
            -height / 2,
            width,
            height
          );
        } else {
          // Fallback to simple shape while loading
          this.drawFallbackPlayer(ctx, player);
        }
      } else {
        // Fallback to simple shape while loading
        this.drawFallbackPlayer(ctx, player);
      }
      
      ctx.restore();
    },

    // Fallback drawing method while sprites load
    drawFallbackPlayer(ctx, player) {
      // Draw a simple punching figure as placeholder
      ctx.fillStyle = '#8B4513'; // Brown color
      
      // Body
      ctx.fillRect(-8, -16, 16, 24);
      
      // Head
      ctx.beginPath();
      ctx.arc(0, -20, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Punching arm
      ctx.fillRect(8, -8, 12, 6);
      
      // Other arm
      ctx.fillRect(-12, -6, 8, 4);
      
      // Legs
      ctx.fillRect(-6, 8, 4, 12);
      ctx.fillRect(2, 8, 4, 12);
    },

    // Keep drawBird for compatibility
    drawBird(bird) {
      this.drawPlayer(bird);
    },

    // Draw spectacular death particles
    drawParticles(particles) {
      const ctx = Game.ctx; if (!ctx) return;
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.save();
        
        // Fade out over time
        ctx.globalAlpha = p.life / p.maxLife;
        
        // Different rendering for different particle types
        switch (p.type) {
          case 'fragment':
          case 'feather':
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 2, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case 'spark':
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
            ctx.stroke();
            break;
            
          case 'debris':
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            break;
            
          case 'smoke':
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        
        ctx.restore();
      }
    },

    drawScore(score) {
      const ctx = Game.ctx; if (!ctx) return;
      ctx.fillStyle = '#00000044';
      ctx.fillRect(16, 16, 96, 44);
      ctx.fillStyle = '#fff';
      ctx.font = '28px system-ui, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(String(score), 24, 24);
    },

    drawCenteredText(text, y, size = 32, color = '#fff') {
      const ctx = Game.ctx; if (!ctx) return;
      ctx.fillStyle = color;
      ctx.font = `${size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, Game.width / 2, y);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  });
})();