(function() {
  const Game = (window.Game = window.Game || {});

  function init() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');

    Game.canvas = canvas;
    Game.ctx = ctx;
    Game.width = canvas.width;   // logical width
    Game.height = canvas.height; // logical height

    // Device pixel ratio scaling for crisp rendering
    function setupDPR() {
      const dpr = Math.max(1, Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1));
      Game.dpr = dpr;
      // Set backing store size and scale context to work in logical units
      canvas.width = Math.floor(Game.width * dpr);
      canvas.height = Math.floor(Game.height * dpr);
      canvas.style.width = Game.width + 'px';
      canvas.style.height = Game.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setupDPR();

    const globalTarget = (typeof window !== 'undefined' && window) || (typeof self !== 'undefined' && self) || null;
    if (globalTarget && typeof globalTarget.addEventListener === 'function') {
      globalTarget.addEventListener('resize', setupDPR);
    }

    return true;
  }

  if (!init()) {
    // If canvas isn't available yet, wait for DOM readiness
    if (document && typeof document.addEventListener === 'function') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    }
  }
})();
