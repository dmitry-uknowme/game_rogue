class GameLevelSettings {
  constructor(
    ROOMS_COUNT_MIN = 5,
    ROOMS_COUNT_MAX = 10,
    ROOM_SIZE_MIN = 3,
    ROOM_SIZE_MAX = 8,
    PATH_COUNT_MIN = 3,
    PATH_COUNT_MAX = 5,
    EFFECT_HEAL_MIN = 10,
    EFFECT_STRONG_MIN = 2,
    ENEMIES_COUNT_MIN = 10
  ) {
    this.ROOMS_COUNT_MIN = ROOMS_COUNT_MIN;
    this.ROOMS_COUNT_MAX = ROOMS_COUNT_MAX;
    this.ROOM_SIZE_MIN = ROOM_SIZE_MIN;
    this.ROOM_SIZE_MAX = ROOM_SIZE_MAX;
    this.PATH_COUNT_MIN = PATH_COUNT_MIN;
    this.PATH_COUNT_MAX = PATH_COUNT_MAX;
    this.EFFECT_HEAL_MIN = EFFECT_HEAL_MIN;
    this.EFFECT_STRONG_MIN = EFFECT_STRONG_MIN;
    this.ENEMIES_COUNT_MIN = ENEMIES_COUNT_MIN;
  }
}

class GameLevel {
  constructor(
    gameBoxNode,
    // staticObjects,
    // gameplayObjects,
    onWin,
    onLose,
    updateEnemiesInfo,
    width = 1024,
    height = 640,
    tileXCount = 40,
    tileYCount = 24,
    settings = new GameLevelSettings()
  ) {
    this.gameBoxNode = gameBoxNode;
    this.staticObjects = [];
    this.gameplayObjects = [];
    this.width = width;
    this.height = height;
    this.tileXCount = tileXCount;
    this.tileYCount = tileYCount;
    this.tileWidth = width / tileXCount;
    this.tileHeight = height / tileYCount;
    this.onWin = onWin;
    this.onLose = onLose;
    this.settings = settings;
    this.changesStack = [];
    this.isRunning = false;
    this.lastUpdateTime = null;
    this.updateEnemiesInfo = updateEnemiesInfo;
  }

  run() {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = now - (this.lastUpdateTime || 0);

    const targetFPS = 30;
    const frameDuration = 1000 / targetFPS;

    if (!this.lastUpdateTime || delta >= frameDuration) {
      this.updateChanged();
      this.lastUpdateTime = now;
    }

    requestAnimationFrame(this.run.bind(this));
  }

  start() {
    this.init();
    this.isRunning = true;
    this.lastUpdateTime = null;
    this.run();
    const enemiesLeft = this.gameplayObjects.filter((e) => e instanceof Enemy);
    this.updateEnemiesInfo(enemiesLeft.length);
  }

  stop() {
    this.resetObjects();
    this.isRunning = false;
  }

  restart() {
    this.stop();
    document.querySelector(".field").innerHTML = "";
    setTimeout(() => {
      this.start();
    }, 500);
  }

  resetObjects() {
    this.changesStack = [];

    this.gameplayObjects = this.gameplayObjects.map((obj) =>
      obj instanceof BaseCharacter ? obj.stop() : obj
    );
    this.gameplayObjects = [];
    this.staticObjects = [];
  }

  init() {
    this.renderWalls();
    this.renderRooms();
    this.renderPaths();
    this.renderEffects();
    this.renderEnemies(true, true);
    this.renderPlayer();
    GameLevelGenerator.connectPaths(this.staticObjects);
    this.updateStatic();
  }

  updateChanged() {
    const changes = this.changesStack;
    while (changes.length > 0) {
      const objectToChange = changes.shift();

      this.setStaticObject(objectToChange.x, objectToChange.y, objectToChange);
      objectToChange.updateNode();
      this.handlLevelChanges(objectToChange);
    }
  }

  handlLevelChanges(obj) {
    if (obj instanceof Enemy) {
      if (obj.currentHp <= 0) {
        const pathObject = new GameObject(
          obj.x,
          obj.y,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.PATH
        );
        this.pushChanges([pathObject]);

        this.gameplayObjects = this.gameplayObjects.filter(
          (eObj) => !(eObj instanceof Enemy && eObj.id === obj.id)
        );
        const enemiesLeft = this.gameplayObjects.filter(
          (e) => e instanceof Enemy
        );
        this.updateEnemiesInfo(enemiesLeft.length);
        if (!enemiesLeft?.length) {
          this.stop();
          this.onWin();
        }
      }
    } else if (obj instanceof Player) {
      if (obj.currentHp <= 0) {
        const pathObject = new GameObject(
          obj.x,
          obj.y,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.PATH
        );
        this.pushChanges([pathObject]);
        // const newGameplayObjects = this.gameplayObjects.filter(
        //   (eObj) => !(eObj instanceof Player)
        // );
        // this.gameplayObjects = this.gameplayObjects.map((obj) =>  instanceof Enemy && eObj.id === obj.id? obj.stop(): );
        // this.gameplayObjects = [];
        this.stop();
        this.onLose();
        // this.stop();
        // Game.showLoseOverlay(() => this.restart());
      }
    }
  }

  pushChanges(objs) {
    this.changesStack = [...this.changesStack, ...objs];
    return objs;
  }

  updateStatic() {
    for (let y = 0; y < this.staticObjects.length; y++) {
      for (let x = 0; x < this.staticObjects[y].length; x++) {
        const object = this.getStaticObject(x, y);
        // if (object && object.type !== GameObjectType.WALL) {
        object.updateNode();
        // }
      }
    }
  }

  renderWalls() {
    for (let y = 0; y < this.tileYCount; y++) {
      const row = [];
      for (let x = 0; x < this.tileXCount; x++) {
        const wallObject = new GameObject(
          x,
          y,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.WALL
        );
        this.gameBoxNode.insertAdjacentHTML("beforeend", wallObject.node());
        row.push(wallObject);
      }
      this.staticObjects.push(row);
    }
  }

  renderRooms() {
    const roomCount = randomInteger(
      this.settings.ROOMS_COUNT_MIN,
      this.settings.ROOMS_COUNT_MAX
    );
    for (let i = 0; i < roomCount; i++) {
      const roomWidth = randomInteger(
        this.settings.ROOM_SIZE_MIN,
        this.settings.ROOM_SIZE_MAX
      );
      const roomHeight = randomInteger(
        this.settings.ROOM_SIZE_MIN,
        this.settings.ROOM_SIZE_MAX
      );
      const startX = randomInteger(1, this.tileXCount - roomWidth - 1);
      const startY = randomInteger(1, this.tileYCount - roomHeight - 1);
      for (let y = 0; y < roomHeight; y++) {
        for (let x = 0; x < roomWidth; x++) {
          const pathObject = new GameObject(
            startX + x,
            startY + y,
            // 50,
            // 50,
            this.tileWidth,
            this.tileHeight,
            GameObjectType.PATH
          );

          // const currentNode =
          //   this.gameBoxNode.childNodes[
          //     (y + startY) * this.tileXCount + (x + startX)
          //   ];
          this.staticObjects[startY + y][startX + x] = pathObject;
          // currentNode.className = pathObject.getObjectClassName();
        }
      }
    }
  }

  renderPaths() {
    const pathXCount = randomInteger(
      this.settings.PATH_COUNT_MIN,
      this.settings.PATH_COUNT_MAX
    );
    const pathYCount = randomInteger(
      this.settings.PATH_COUNT_MIN,
      this.settings.PATH_COUNT_MAX
    );

    const startYUsed = [];
    const startXUsed = [];

    for (let i = 0; i < pathXCount; i++) {
      const startY = randomInteger(1, this.tileYCount - 1, startYUsed);
      startYUsed.push(startY);
      for (let x = 0; x < this.tileXCount; x++) {
        const pathObject = new GameObject(
          x,
          startY,
          // 50,
          // 50,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.PATH
        );

        this.staticObjects[startY][x] = pathObject;
        // const currentNode =
        //   this.gameBoxNode.childNodes[startY * this.tileXCount + x];
        // currentNode.className = pathObject.getObjectClassName();
        // currentNode.style = pathObject.styleStr;
      }
    }

    for (let i = 0; i < pathYCount; i++) {
      const startX = randomInteger(1, this.tileXCount - 1, startXUsed);
      startXUsed.push(startX);
      for (let y = 0; y < this.tileYCount; y++) {
        const pathObject = new GameObject(
          startX,
          y,
          // 50,
          // 50,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.PATH
        );

        this.staticObjects[y][startX] = pathObject;
        // const currentNode =
        //   this.gameBoxNode.childNodes[y * this.tileXCount + startX];
        // currentNode.className = pathObject.getObjectClassName();
        // currentNode.style = pathObject.styleStr;
      }
    }
  }

  renderEffects() {
    const healEffectsCount = this.settings.EFFECT_HEAL_MIN;
    const strongEffectsCount = this.settings.EFFECT_STRONG_MIN;
    let placedHeal = [];
    let placedStrong = 0;
    let attempts = 0;
    const maxAttempts = 1000;

    const spawnCoords = GameLevelGenerator.getRandomSpawnCoordsWithOffset(
      this.staticObjects,
      this.tileXCount,
      this.tileYCount,
      healEffectsCount,
      5
    );

    spawnCoords.forEach((coord) => {
      const obj = new GameObject(
        coord.x,
        coord.y,
        this.tileWidth,
        this.tileHeight,
        GameObjectType.EFFECT_HEAL
      );
      this.setStaticObject(obj.x, obj.y, obj);
    });

    while (placedStrong < strongEffectsCount && attempts < maxAttempts) {
      const y = randomInteger(0, this.tileYCount - 1);
      const x = randomInteger(0, this.tileXCount - 1);

      const staticObj = this.getStaticObject(x, y);
      if (staticObj?.type === GameObjectType.PATH) {
        const obj = new GameObject(
          x,
          y,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.EFFECT_STRONG
        );
        this.setStaticObject(x, y, obj);
        placedStrong++;
      }

      attempts++;
    }

    if (placedHeal < healEffectsCount) {
      console.warn(
        `Размещено только ${placedHeal} из ${healEffectsCount} эффектов`
      );
    }
  }

  renderEnemies(withAutoMove = true) {
    const count = this.settings.ENEMIES_COUNT_MIN;

    const spawnCoords = GameLevelGenerator.getRandomSpawnCoordsWithOffset(
      this.staticObjects,
      this.tileXCount,
      this.tileYCount,
      count,
      5
    );

    spawnCoords.forEach((coord, index) => {
      const obj = new Enemy(
        coord.x,
        coord.y,
        this.tileWidth,
        this.tileHeight,
        1,
        this.getStaticObject.bind(this),
        this.setStaticObject.bind(this),
        this.pushChanges.bind(this)
      );

      obj.id = index;
      this.gameplayObjects.push(obj);
      this.setStaticObject(obj.x, obj.y, obj);
      if (withAutoMove) {
        obj.autoMove();
      }
    });
    this.updateEnemiesInfo(spawnCoords.length);
  }

  renderPlayer() {
    const count = 1;
    let placed = 0;
    while (placed < count) {
      const y = randomInteger(0, this.tileYCount - 1);
      const x = randomInteger(0, this.tileXCount - 1);
      const obj = this.getStaticObject(x, y);
      if (obj.type === GameObjectType.PATH) {
        const obj = new Player(
          x,
          y,
          this.tileWidth,
          this.tileHeight,
          1,
          this.getStaticObject.bind(this),
          this.setStaticObject.bind(this),
          this.pushChanges.bind(this)
        );
        this.gameplayObjects.push(obj);
        this.setStaticObject(x, y, obj);
        // const tile = this.gameBoxNode.childNodes[y * this.tileXCount + x];
        // tile.className = obj.getObjectClassName();
        placed++;
      }
    }
  }

  getStaticObject(x, y) {
    if (!this.isInBounds(x, y)) return null;
    return this.staticObjects[y][x];
  }

  setStaticObject(x, y, newObj) {
    this.staticObjects[y][x] = newObj;
    return newObj;
  }

  isInBounds(mapX, mapY) {
    const isInBounds =
      mapY >= 0 &&
      mapY < this.tileYCount &&
      mapX >= 0 &&
      mapX < this.tileXCount;
    return isInBounds;
  }
}

window.GameLevel = GameLevel;
