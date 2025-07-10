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
    staticObjects,
    gameplayObjects,
    width = 1024,
    height = 640,
    tileXCount = 40,
    tileYCount = 24
  ) {
    this.gameBoxNode = gameBoxNode;
    this.staticObjects = staticObjects;
    this.gameplayObjects = gameplayObjects;
    this.width = width;
    this.height = height;
    this.tileXCount = tileXCount;
    this.tileYCount = tileYCount;
    this.tileWidth = width / tileXCount;
    this.tileHeight = height / tileYCount;
    this.settings = new GameLevelSettings();
    this.changesStack = [];
  }

  run() {
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

  init() {
    // this.gameplayObjects = Array.from({ length: this.tileYCount }, () =>
    //   Array.from({ length: this.tileXCount }, () => null)
    // );
    // this.staticObjects = Array.from({ length: this.tileYCount }, () =>
    //   Array.from({ length: this.tileXCount }, () => null)
    // );
    this.renderWalls();
    this.renderRooms();
    this.renderPaths();
    // this.renderEffects();
    const enemies = this.renderEnemies();
    this.renderPlayer();
    this.updateStatic();

    // enemies.map((enemy) => enemy.autoMove());
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
        const object = this.staticObjects[y][x];
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

    let placedHeal = 0;
    while (placedHeal < healEffectsCount) {
      const y = randomInteger(0, this.tileYCount - 1);
      const x = randomInteger(0, this.tileXCount - 1);

      const staticObj = this.staticObjects[y][x];
      if (staticObj === GameObjectType.PATH) {
        const obj = new GameObject(
          x,
          y,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.EFFECT_HEAL
        );
        this.staticObjects[y][x] = obj;

        // const tile = this.gameBoxNode.childNodes[y * this.tileXCount + x];
        // tile.className = obj.getObjectClassName();
        placedHeal++;
      }
    }

    let placedStrong = 0;
    while (placedStrong < strongEffectsCount) {
      const y = randomInteger(0, this.tileYCount - 1);
      const x = randomInteger(0, this.tileXCount - 1);

      const staticObj = this.staticObjects[y][x];
      if (staticObj === GameObjectType.PATH) {
        const obj = new GameObject(
          x,
          y,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.EFFECT_STRONG
        );
        this.staticObjects[y][x] = obj;

        // const tile = this.gameBoxNode.childNodes[y * this.tileXCount + x];
        // tile.className = obj.getObjectClassName();
        placedStrong++;
      }
    }
  }

  renderEnemies() {
    const enemies = [];
    const count = this.settings.ENEMIES_COUNT_MIN;
    let placed = 0;
    while (placed < count) {
      const y = randomInteger(0, this.tileYCount - 1);
      const x = randomInteger(0, this.tileXCount - 1);
      const current = this.staticObjects[y][x];
      if (current.type === GameObjectType.PATH) {
        const obj = new Enemy(
          x,
          y,
          this.tileWidth,
          this.tileHeight,
          1,
          this.getStaticObject.bind(this),
          this.setStaticObject.bind(this),
          this.pushChanges.bind(this)
        );
        enemies.push(obj);

        this.staticObjects[y][x] = obj;
        // const tile = this.gameBoxNode.childNodes[y * this.tileXCount + x];
        // tile.className = obj.getObjectClassName();
        placed++;
      }
    }
    return enemies;
  }

  renderPlayer() {
    const count = 1;
    let placed = 0;
    while (placed < count) {
      const y = randomInteger(0, this.tileYCount - 1);
      const x = randomInteger(0, this.tileXCount - 1);
      const current = this.staticObjects[y][x];
      if (current.type === GameObjectType.PATH) {
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
        this.staticObjects[y][x] = obj;
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
