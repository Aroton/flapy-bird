(function() {
  const Game = (window.Game = window.Game || {});

  const Entities = (Game.Entities = {
    pipes: [],
    timeSinceSpawn: 0,
    started: false,
    groundOffset: 0,

    reset() {
      this.pipes.length = 0;
      this.timeSinceSpawn = 0;
      this.started = false;
      this.groundOffset = 0;
    },

    spawnPipe(gap, speed) {
      const w = Game.Config.pipes.width;
      const marginTop = 40;
      const marginBottom = Game.Config.groundHeight + 40;
      const minCenter = marginTop + gap / 2;
      const maxCenter = Game.height - marginBottom - gap / 2;
      const center = Math.random() * (maxCenter - minCenter) + minCenter;
      const gapTop = Math.floor(center - gap / 2);
      const gapBottom = Math.floor(center + gap / 2);
      this.pipes.push({ x: Game.width + 40, width: w, gapTop, gapBottom, speed, scored: false });
    },

    update(dt, diff) {
      const base = Game.Config.pipes;
      const speed = diff.speed;

      this.groundOffset += speed * dt;

      // Spawning
      this.timeSinceSpawn += dt;
      const spawnEvery = base.spawnEvery;
      if (!this.started) {
        if (this.timeSinceSpawn >= base.firstDelay) {
          this.spawnPipe(diff.gap, speed);
          this.started = true;
          this.timeSinceSpawn = 0;
        }
      } else if (this.timeSinceSpawn >= spawnEvery) {
        this.spawnPipe(diff.gap, speed);
        this.timeSinceSpawn = 0;
      }

      // Move and prune
      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const p = this.pipes[i];
        p.x -= speed * dt;
        if (p.x + p.width < -10) this.pipes.splice(i, 1);
      }
    },

    collides(bird) {
      const r = bird.radius;
      const gx = 0, gy = Game.height - Game.Config.groundHeight, gw = Game.width, gh = Game.Config.groundHeight;
      if (circleRect(bird.x, bird.y, r, gx, gy, gw, gh)) return true;
      for (let i = 0; i < this.pipes.length; i++) {
        const p = this.pipes[i];
        // top pipe
        if (circleRect(bird.x, bird.y, r, p.x, 0, p.width, p.gapTop)) return true;
        // bottom pipe
        const h2 = Game.height - p.gapBottom - Game.Config.groundHeight;
        if (circleRect(bird.x, bird.y, r, p.x, p.gapBottom, p.width, h2)) return true;
      }
      return false;
    },

    render() {
      for (let i = 0; i < this.pipes.length; i++) Game.Renderer.drawPipe(this.pipes[i]);
      Game.Renderer.drawGround(this.groundOffset);
    }
  });

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
  function circleRect(cx, cy, cr, rx, ry, rw, rh) {
    const closestX = clamp(cx, rx, rx + rw);
    const closestY = clamp(cy, ry, ry + rh);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy <= cr * cr;
  }
})();
