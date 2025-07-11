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

    const codeToKey = {
      KeyW: "w",
      KeyA: "a",
      KeyS: "s",
      KeyD: "d",
      Space: "space",
    };

    document.addEventListener("keydown", (e) => {
      const key = codeToKey[e.code];
      if (key) {
        keys[key] = true;
        if (key === "space") {
          this.attack();
        }
        this.moveKeys(keys);
      }
    });

    document.addEventListener("keyup", (e) => {
      const key = codeToKey[e.code];
      if (key) {
        keys[key] = false;
      }
    });
  }

  // initControlListener() {
  //   const keys = {
  //     KeyW: false,
  //     KeyA: false,
  //     KeyS: false,
  //     KeyD: false,
  //     Space: false,
  //   };

  //   document.addEventListener("keydown", (e) => {
  //     debugger;
  //     if (e.code in keys) {
  //       debugger;
  //       keys[e.code] = true;

  //       if (e.code === "Space") {
  //         this.attack(); // только по Space
  //       }

  //       this.moveKeys(keys);
  //     }
  //   });

  //   document.addEventListener("keyup", (e) => {
  //     if (e.code in keys) {
  //       keys[e.code] = false;
  //     }
  //   });
  // }
}

window.Player = Player;
