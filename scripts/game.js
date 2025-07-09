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
  }

  run() {
    const now = performance.now();
    const delta = now - (this.lastUpdateTime || 0);

    const targetFPS = 10;
    const frameDuration = 1000 / targetFPS;

    if (!this.lastUpdateTime || delta >= frameDuration) {
      // this.update();
      this.lastUpdateTime = now;
    }

    // requestAnimationFrame(this.run.bind(this));
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
    this.renderEnemies();
    this.renderPlayer();
    this.updateStatic();
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
    // console.log({ objs: this.gameplayObjects });
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

      // const current = this.gameplayObjects[y][x];
      const staticObj = this.staticObjects[y][x];
      const dynamicObj = this.gameplayObjects[y][x];
      if (staticObj?.type === GameObjectType.PATH && dynamicObj === null) {
        const obj = new GameObject(
          x,
          y,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.EFFECT_STRONG
        );
        this.gameplayObjects[y][x] = obj;

        // const tile = this.gameBoxNode.childNodes[y * this.tileXCount + x];
        // tile.className = obj.getObjectClassName();
        placedStrong++;
      }
    }
  }

  renderEnemies() {
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
          (x, y) => this.staticObjects[y][x]
        );

        this.staticObjects[y][x] = obj;
        // const tile = this.gameBoxNode.childNodes[y * this.tileXCount + x];
        // tile.className = obj.getObjectClassName();
        placed++;
      }
    }
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
          (x, y) => this.staticObjects[y][x]
        );
        this.staticObjects[y][x] = obj;
        // const tile = this.gameBoxNode.childNodes[y * this.tileXCount + x];
        // tile.className = obj.getObjectClassName();
        placed++;
      }
    }
  }
}

class GameObjectType {
  constructor() {}
  static WALL = "OBJECT_WALL";
  static PATH = "OBJECT_PATH";
  static EFFECT_HEAL = "OBJECT_EFFECT_HEAL";
  static EFFECT_STRONG = "OBJECT_EFFECT_STRONG";
  static PLAYER = "OBJECT_PLAYER";
  static ENEMY = "OBJECT_ENEMY";
}

class GameObject {
  // constructor(x, y, tileWidth, tileHeight, objectWidth, objectHeight, type) {
  constructor(x, y, tileWidth, tileHeight, type) {
    this.x = x;
    this.y = y;
    // this.objectWidth = objectWidth;
    // this.objectHeight = objectHeight;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.type = type;
    this.objectClassName = this.getObjectClassName(this.type);
  }

  getObjectClassName(type = this.type) {
    let objectClassName = "";
    if (type === GameObjectType.PATH) {
      objectClassName = "tile";
    } else if (type === GameObjectType.EFFECT_STRONG) {
      objectClassName = "tileSW";
    } else if (type === GameObjectType.EFFECT_HEAL) {
      objectClassName = "tileHP";
    } else if (type === GameObjectType.WALL) {
      objectClassName = "tileW";
    } else if (type === GameObjectType.ENEMY) {
      objectClassName = "tileE";
    } else if (type === GameObjectType.PLAYER) {
      objectClassName = "tileP";
    }
    return objectClassName;
  }

  node() {
    const objectClassName = this.objectClassName;

    if (this.type === GameObjectType.WALL) {
      return `<div class="${objectClassName}" style="
                width: ${this.tileWidth.toFixed(2)}px;
                height: ${this.tileHeight.toFixed(2)}px" 
                data-x="${this.x}"
                data-y="${this.y}">
              </div>`;
    } else {
      //   return `<div class="tile" style="
      //             width: ${this.tileWidth.toFixed(2)}px;
      //             height: ${this.tileHeight.toFixed(2)}px"
      //             data-x="${this.x}"
      //             data-y="${this.y}">
      //               <div class="${objectClassName}" style="position: absolute"></div>
      //           </div>`;
      // }
      return `<div class="tile" style="
                width: ${this.tileWidth.toFixed(2)}px;
                height: ${this.tileHeight.toFixed(2)}px" 
                data-x="${this.x}" 
                data-y="${this.y}">
                  <div class="${objectClassName}"></div>
              </div>`;
    }

    // else {
    //   return `<div class="${objectClassName}" style="width: ${this.tileWidth.toFixed(
    //     2
    //   )}px; height: ${this.tileHeight.toFixed(2)}px; position: absolute; top: ${
    //     this.y * this.tileHeight
    //   }px; left: ${this.x * this.tileWidth}px"></div>`;
    // }
  }

  updateNode() {
    const currentNode = document.querySelector(
      `.tileW[data-x="${this.x}"][data-y="${this.y}"]`
    );
    if (currentNode) {
      document.querySelector(
        `.tileW[data-x="${this.x}"][data-y="${this.y}"]`
      ).innerHTML = this.node();
    } else {
      console.log({
        currentNode: `.tileW[data-x="${this.x}"][data-y="${this.y}"]`,
      });
    }
  }

  styleStr() {
    return `"width: ${this.tileWidth.toFixed(
      2
    )}px; height: ${this.tileHeight.toFixed(2)}px`;
  }
}

class BaseCharacter extends GameObject {
  constructor(x, y, tileWidth, tileHeight, type, fovRadius, getStaticObject) {
    super(x, y, tileWidth, tileHeight, type);
    this.x = x;
    this.y = y;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.type = type;
    this.fovRadius = fovRadius;
    this.getStaticObject = getStaticObject;
    this.fovObjects = [];
    this.initFovObjects();
  }

  initFovObjects() {
    // const centerOnStatic = this.getStaticObject(this.x, this.y);
    // console.log({ x: this.x, y: this.y, centerOnStatic });
    const r = this.fovRadius - 1;
    const centerIndex = Math.round((3 + r) / 2) - 1;
    // this.fovObjects = new Array(3 + r).fill(null).map((el1, key1) =>
    //   new Array(3 + r).fill(null).map((el2, key2) => {
    //     const staticObject =
    //     key1 === centerIndex && key2 === centerIndex ? this : null;
    //   })
    // );
    this.fovObjects = new Array(3 + r).fill(null).map((_, dy) =>
      new Array(3 + r).fill(null).map((_, dx) => {
        const mapX = this.x + (dx - centerIndex);
        const mapY = this.y + (dy - centerIndex);

        if (dx === centerIndex && dy === centerIndex) {
          return this;
        }

        const isInBounds =
          mapY >= 0 &&
          mapY < this.tileYCount &&
          mapX >= 0 &&
          mapX < this.tileXCount;

        if (!isInBounds) return null;

        const staticObject = this.getStaticObject?.(mapX, mapY);
        return staticObject ?? null;
      })
    );
  }
}

class Enemy extends BaseCharacter {
  constructor(x, y, tileWidth, tileHeight, fovRadius, getStaticObject) {
    super(
      x,
      y,
      tileWidth,
      tileHeight,
      GameObjectType.ENEMY,
      fovRadius,
      getStaticObject
    );
    this.x = x;
    this.y = y;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.fovRadius = fovRadius;
    this.getStaticObject = getStaticObject;
  }
}

class Player extends BaseCharacter {
  constructor(x, y, tileWidth, tileHeight, fovRadius, getStaticObject) {
    super(
      x,
      y,
      tileWidth,
      tileHeight,
      GameObjectType.PLAYER,
      fovRadius,
      getStaticObject
    );
    this.x = x;
    this.y = y;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.fovRadius = fovRadius;
    this.getStaticObject = getStaticObject;
  }
}

function randomInteger(min, max, usedResults = [], maxTries = 5) {
  const result = Math.floor(Math.random() * (max - min + 1)) + min;
  if (maxTries === 0) {
    throw Error("No random tries left");
  }
  if (result in usedResults) {
    return randomInteger(min, max, usedResults, maxTries - 1);
  }
  return result;
}
