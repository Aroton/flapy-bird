(function() {
  const Game = (window.Game = window.Game || {});

  let lastTime = 0;
  let running = false;

  function frame(ts) {
    if (!running) return;
    if (!lastTime) lastTime = ts;
    let dt = (ts - lastTime) / 1000;
    lastTime = ts;
    // Clamp dt to avoid giant steps on tab switch
    if (dt > 0.05) dt = 0.05;

    if (typeof Game.update === 'function') Game.update(dt);
    if (typeof Game.render === 'function') Game.render();

    requestAnimationFrame(frame);
  }

  Game.Loop = {
    start() {
      if (running) return;
      running = true;
      lastTime = 0;
      requestAnimationFrame(frame);
    },
    stop() { running = false; }
  };
})();
