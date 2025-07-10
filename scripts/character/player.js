class Player extends BaseCharacter {
  constructor(
    x,
    y,
    tileWidth,
    tileHeight,
    fovRadius,
    getStaticObject,
    setStaticObject
  ) {
    super(
      x,
      y,
      tileWidth,
      tileHeight,
      GameObjectType.PLAYER,
      fovRadius,
      getStaticObject,
      setStaticObject
    );
    this.x = x;
    this.y = y;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.fovRadius = fovRadius;
    this.getStaticObject = getStaticObject;
    this.setStaticObject = setStaticObject;
    this.initControlListener();
  }

  initControlListener() {
    const keys = {
      w: false,
      a: false,
      s: false,
      d: false,
    };

    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = true;
      }
      // if (keys.w) {
      this.move(keys);
      // }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = false;
      }
    });
  }
}

window.Player = Player;
