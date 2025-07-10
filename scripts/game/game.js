class Game {
  constructor() {
    this.staticObjects = [];
    this.gameplayObjects = [];
    this.gameBoxNode = document.querySelector(".field");
    this.level = new GameLevel(
      this.gameBoxNode,
      this.staticObjects,
      this.gameplayObjects
    );
  }

  init() {
    this.level.init();
    this.level.run();
  }
}

window.Game = Game;
