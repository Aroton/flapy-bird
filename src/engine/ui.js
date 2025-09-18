(function() {
  const Game = (window.Game = window.Game || {});
  const R = () => Game.Renderer;

  Game.UI = {
    drawMenu() {
      R().drawCenteredText('FLAPPY CLONE', Game.height * 0.34, 48, '#ffffff');
      R().drawCenteredText('Tap / Click / Space to Flap', Game.height * 0.46, 22, '#ffffff');
      R().drawCenteredText('Press P to Pause', Game.height * 0.52, 18, '#ffffffaa');
    },
    drawGameOver(score, best) {
      R().drawCenteredText('Game Over', Game.height * 0.36, 44, '#ffffff');
      R().drawCenteredText(`Score: ${score}`, Game.height * 0.46, 26, '#ffffff');
      R().drawCenteredText(`Best: ${best}`, Game.height * 0.52, 20, '#ffffffaa');
      R().drawCenteredText('Tap / Space to retry', Game.height * 0.6, 20, '#ffffff');
    }
  };
})();
