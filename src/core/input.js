(function() {
  const Game = (window.Game = window.Game || {});

  const Input = (Game.Input = {
    _flap: false,
    _pause: false,
    consumeFlap() {
      if (this._flap) { this._flap = false; return true; }
      return false;
    },
    consumePause() {
      if (this._pause) { this._pause = false; return true; }
      return false;
    }
  });

  function onKeyDown(e) {
    if (e.repeat) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      Input._flap = true;
    } else if (e.code === 'KeyP' || e.code === 'Escape') {
      Input._pause = true;
    }
  }

  function onMouseDown(e) {
    if (e.button === 0) Input._flap = true;
  }

  function onTouchStart(e) {
    Input._flap = true;
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
  }

  // Determine best global target to avoid undefined in sandboxed contexts
  const globalTarget = (typeof window !== 'undefined' && window) || (typeof self !== 'undefined' && self) || null;

  if (globalTarget && typeof globalTarget.addEventListener === 'function') {
    globalTarget.addEventListener('keydown', onKeyDown);
    globalTarget.addEventListener('mousedown', onMouseDown);
    globalTarget.addEventListener('touchstart', onTouchStart, { passive: false });
  }
})();
