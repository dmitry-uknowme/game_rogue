class Game {
  constructor() {
    this.objects = [];
    this.gameBoxNode = document.querySelector(".field");
    this.level = new GameLevel(this.gameBoxNode, this.objects);
  }

  init() {
    this.level.init();
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
    objects,
    width = 1024,
    height = 640,
    tileXCount = 40,
    tileYCount = 24
  ) {
    this.gameBoxNode = gameBoxNode;
    this.objects = objects;
    this.width = width;
    this.height = height;
    this.tileXCount = tileXCount;
    this.tileYCount = tileYCount;
    this.tileWidth = width / tileXCount;
    this.tileHeight = height / tileYCount;
    this.settings = new GameLevelSettings();
  }

  init() {
    this.renderWalls();
    this.renderRooms();
    this.renderPaths();
    this.renderEffects();
    this.renderEnemies();
    this.renderPlayer();
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
      this.objects.push(row);
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
            50,
            50,
            GameObjectType.PATH
          );

          const currentNode =
            this.gameBoxNode.childNodes[
              (y + startY) * this.tileXCount + (x + startX)
            ];
          this.objects[startY + y][startX + x] = pathObject;
          currentNode.className = pathObject.getObjectClassName();
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
          50,
          50,
          GameObjectType.PATH
        );

        this.objects[startY][x] = pathObject;
        const currentNode =
          this.gameBoxNode.childNodes[startY * this.tileXCount + x];
        currentNode.className = pathObject.getObjectClassName();
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
          50,
          50,
          GameObjectType.PATH
        );

        this.objects[y][startX] = pathObject;
        const currentNode =
          this.gameBoxNode.childNodes[y * this.tileXCount + startX];
        currentNode.className = pathObject.getObjectClassName();
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

      const current = this.objects[y][x];
      if (current.type === GameObjectType.PATH) {
        const obj = new GameObject(
          x,
          y,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.EFFECT_HEAL
        );
        this.objects[y][x] = obj;

        const tile = this.gameBoxNode.childNodes[y * this.tileXCount + x];
        tile.className = obj.getObjectClassName();

        placedHeal++;
      }
    }

    let placedStrong = 0;
    while (placedStrong < strongEffectsCount) {
      const y = randomInteger(0, this.tileYCount - 1);
      const x = randomInteger(0, this.tileXCount - 1);

      const current = this.objects[y][x];
      if (current.type === GameObjectType.PATH) {
        const obj = new GameObject(
          x,
          y,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.EFFECT_STRONG
        );
        this.objects[y][x] = obj;

        const tile = this.gameBoxNode.childNodes[y * this.tileXCount + x];
        tile.className = obj.getObjectClassName();

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
      const current = this.objects[y][x];
      if (current.type === GameObjectType.PATH) {
        const obj = new GameObject(
          x,
          y,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.ENEMY
        );
        this.objects[y][x] = obj;
        const tile = this.gameBoxNode.childNodes[y * this.tileXCount + x];
        tile.className = obj.getObjectClassName();
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
      const current = this.objects[y][x];
      if (current.type === GameObjectType.PATH) {
        const obj = new GameObject(
          x,
          y,
          this.tileWidth,
          this.tileHeight,
          GameObjectType.PLAYER
        );
        this.objects[y][x] = obj;
        const tile = this.gameBoxNode.childNodes[y * this.tileXCount + x];
        tile.className = obj.getObjectClassName();
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
  constructor(x, y, tileWidth, tileHeight, type) {
    this.x = x;
    this.y = y;
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

    return `<div class="${objectClassName}" style="width: ${this.tileWidth.toFixed(
      2
    )}px; height: ${this.tileHeight.toFixed(2)}px"></div>`;
  }

  styleStr() {
    return `"width: ${this.tileWidth.toFixed(
      2
    )}px; height: ${this.tileHeight.toFixed(2)}px`;
  }
}

class BaseCharacter extends GameObject {
  constructor(x, y, tileWidth, tileHeight, type) {
    this.x = x;
    this.y = y;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.type = type;
    super(this.x, this.y, this.tileWidth, this.tileHeight, this.type);
  }
}

class Enemy extends BaseCharacter {
  constructor(x, y, tileWidth, tileHeight) {
    this.x = x;
    this.y = y;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    super(
      this.x,
      this.y,
      this.tileWidth,
      this.tileHeight,
      GameObjectType.ENEMY
    );
  }
}

class Player extends BaseCharacter {
  constructor(x, y, tileWidth, tileHeight) {
    this.x = x;
    this.y = y;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    super(
      this.x,
      this.y,
      this.tileWidth,
      this.tileHeight,
      GameObjectType.PLAYER
    );
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
