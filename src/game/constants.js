(function() {
  const Game = (window.Game = window.Game || {});

  Game.Colors = {
    sky: '#8ed0f9',
    skyLight: '#ffffff',
    ground: '#d0b36a',
    groundDark: '#c0a45a',
    pipe: '#5dd46b',
    pipeDark: '#43b953',
    bird: '#f6c344',
    birdDark: '#e0a92b',
    beak: '#f08030'
  };

  Game.Config = {
    groundHeight: 100,

    bird: {
      x: 140,
      radius: 14,
      gravity: 1800,       // px/s^2
      flapImpulse: -450,   // px/s
      maxVel: 900,
      tiltUp: -0.35,
      tiltDown: 0.8,
      tiltLerp: 6
    },

    pipes: {
      speed: 180,           // px/s
      width: 68,
      gap: 170,
      minGap: 140,
      spawnEvery: 1.35,     // seconds
      firstDelay: 0.8
    },

    difficulty(score) {
      // Slight ramp: speed up and narrow gap as score rises
      const base = this.pipes;
      const speed = Math.min(base.speed + score * 6, 300);
      const gap = Math.max(base.gap - score * 3, base.minGap);
      return { speed, gap };
    }
  };
})();
