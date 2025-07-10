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
      console.log(`.tileW[data-x="${this.x}"][data-y="${this.y}"]`);
    }
  }

  styleStr() {
    return `"width: ${this.tileWidth.toFixed(
      2
    )}px; height: ${this.tileHeight.toFixed(2)}px`;
  }

  toObject() {
    return {
      x: this.x,
      y: this.y,
      type: this.type,
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
    };
  }
}

window.GameObject = GameObject;
window.GameObjectType = GameObjectType;
