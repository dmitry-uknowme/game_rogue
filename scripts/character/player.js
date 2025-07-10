class Player extends BaseCharacter {
  constructor(
    x,
    y,
    tileWidth,
    tileHeight,
    fovRadius,
    getStaticObject,
    setStaticObject,
    pushLevelChanges
  ) {
    super(
      x,
      y,
      tileWidth,
      tileHeight,
      GameObjectType.PLAYER,
      fovRadius,
      getStaticObject,
      setStaticObject,
      pushLevelChanges
    );
    this.x = x;
    this.y = y;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.fovRadius = fovRadius;
    this.getStaticObject = getStaticObject;
    this.setStaticObject = setStaticObject;
    this.pushLevelChanges = pushLevelChanges;
    this.initControlListener();
  }

  initControlListener() {
    const keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      space: false,
    };

    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = true;
      }
      if (e.code.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = true;
        this.attack();
      }

      this.moveKeys(keys);
    });

    document.addEventListener("keyup", (e) => {
      if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = false;
      }
      if (e.code.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = false;
      }
    });
  }
}

window.Player = Player;
