(function() {
  const Game = (window.Game = window.Game || {});

  let ctx;
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function beep(freq = 600, time = 0.05, type = 'square', gain = 0.05) {
    try {
      const a = ac();
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = gain;
      o.connect(g).connect(a.destination);
      o.start();
      o.stop(a.currentTime + time);
    } catch (e) {
      // ignore if audio not allowed yet
    }
  }

  Game.Audio = {
    flap() { beep(700, 0.06, 'square', 0.06); },
    score() { beep(900, 0.08, 'triangle', 0.05); },
    hit() { beep(120, 0.2, 'sine', 0.07); }
  };
})();
