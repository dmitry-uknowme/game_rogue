class Game {
  constructor() {
    this.objects = [];
    this.gameBoxNode = document.querySelector(".field");
    this.level = new GameLevel(this.gameBoxNode, this.objects);
  }

  init() {
    this.level.renderWalls();
    this.level.renderRooms();
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
    EFFECT_STRONG_MIN = 2
  ) {
    this.ROOMS_COUNT_MIN = ROOMS_COUNT_MIN;
    this.ROOMS_COUNT_MAX = ROOMS_COUNT_MAX;
    this.ROOM_SIZE_MIN = ROOM_SIZE_MIN;
    this.ROOM_SIZE_MAX = ROOM_SIZE_MAX;
    this.PATH_COUNT_MIN = PATH_COUNT_MIN;
    this.PATH_COUNT_MAX = PATH_COUNT_MAX;
    this.EFFECT_HEAL_MIN = EFFECT_HEAL_MIN;
    this.EFFECT_STRONG_MIN = EFFECT_STRONG_MIN;
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
      const roomWidth = randomInteger(3, 8);
      const roomHeight = randomInteger(3, 6);
      const startX = randomInteger(1, this.tileXCount - roomWidth - 1);
      const startY = randomInteger(1, this.tileYCount - roomHeight - 1);
      for (let y = 0; y < roomHeight; y++) {
        for (let x = 0; x < roomWidth; x++) {
          const pathObject = new GameObject(
            x,
            y,
            this.tileWidth,
            this.tileHeight,
            GameObjectType.PATH
          );

          const currentNode =
            this.gameBoxNode.childNodes[
              y * this.tileYCount + startY + x * this.tileXCount + startX
            ];
          this.objects[startY + y][startX + x] = pathObject;
          currentNode.className = pathObject.getObjectClassName();
        }
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
    }
    return objectClassName;
  }

  node() {
    const objectClassName = this.objectClassName;

    return `<div class="${objectClassName}" style="width: ${this.tileWidth.toFixed(
      2
    )}px; height: ${this.tileHeight.toFixed(2)}px"></div>`;
  }
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
