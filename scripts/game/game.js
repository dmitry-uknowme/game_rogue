class Game {
  constructor() {
    this.staticObjects = [];
    this.gameplayObjects = [];
    this.gameBoxNode = document.querySelector(".field");

    this.level = new GameLevel(
      this.gameBoxNode,
      // this.staticObjects,
      // this.gameplayObjects,
      this.showWinOverlay.bind(this),
      this.showLoseOverlay.bind(this),
      this.updateEnemiesInfo.bind(this)
    );
    this.currentLevel = 1;
    this.everyLevelRate = 1.1;
    this.updateLevelInfo();
  }

  init() {
    this.level.start();
    // window.level = this.level;
    // this.level.init();
    // this.level.run();
  }

  updateEnemiesInfo(enemiesLeft) {
    const enemiesLeftInfo = document.querySelector("#enemiesLeftInfo");
    enemiesLeftInfo.innerText = enemiesLeft;
  }
  updateLevelInfo() {
    const currentLevelInfo = document.querySelector("#currentLevelInfo ");
    currentLevelInfo.innerText = this.currentLevel;
  }

  getLevelSettings(level) {
    return new GameLevelSettings(
      5, // ROOMS_COUNT_MIN
      10, // ROOMS_COUNT_MAX
      3, // ROOM_SIZE_MIN
      8, // ROOM_SIZE_MAX
      3, // PATH_COUNT_MIN
      5, // PATH_COUNT_MAX
      Math.floor(10 * this.everyLevelRate ** (level - 1)), // EFFECT_HEAL_MIN
      Math.floor(2 * this.everyLevelRate ** (level - 1)), // EFFECT_STRONG_MIN
      Math.floor(10 * this.everyLevelRate ** (level - 1)) // ENEMIES_COUNT_MIN
    );
  }

  showWinOverlay() {
    const overlayNode = document.querySelector(".overlay_win");
    overlayNode.classList.add("visible");
    const nextButton = overlayNode.querySelector(".next-button");

    nextButton.onclick = () => {
      if (this.level.isRunning) return;
      overlayNode.classList.remove("visible");
      this.level.stop();

      this.currentLevel++;
      this.updateLevelInfo();

      this.gameBoxNode.innerHTML = "";

      const settings = this.getLevelSettings(this.currentLevel);
      this.level.settings = settings;
      this.level.start();
    };
  }

  showLoseOverlay() {
    const overlayNode = document.querySelector(".overlay_lose");
    overlayNode.classList.add("visible");
    const restartButton = overlayNode.querySelector(".restart-button");

    restartButton.onclick = () => {
      overlayNode.classList.remove("visible");
      this.level.stop();

      this.gameBoxNode.innerHTML = "";

      this.level.start();
    };
  }
}

window.Game = Game;
