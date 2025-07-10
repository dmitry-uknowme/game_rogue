class Enemy extends BaseCharacter {
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
      GameObjectType.ENEMY,
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
    // this.autoMove();
  }

  autoMove() {
    // const moveDirection = Math.random() > 0.5 ? "X" : "Y";
    const fovRadius = this.fovRadius;
    const fovObjects = this.getFovObjects();
    const moveDirections = {
      up: {
        obj: fovObjects[0][1],
        isMovable: fovObjects[0][1]?.type === GameObjectType.PATH,
      },
      down: {
        obj: fovObjects[2][1],
        isMovable: fovObjects[2][1]?.type === GameObjectType.PATH,
      },
      left: {
        obj: fovObjects[1][0],
        isMovable: fovObjects[1][0]?.type === GameObjectType.PATH,
      },
      right: {
        obj: fovObjects[1][2],
        isMovable: fovObjects[1][2]?.type === GameObjectType.PATH,
      },
    };
    // const listObjects = flattenFov(fovObjects);
    let moveInterval = setInterval(() => {
      if (this.currentHp < 0) {
        clearInterval(moveInterval);
        return;
      }
      const moveList = Object.keys(moveDirections)
        .map((key) => moveDirections[key])
        .filter((item) => item.isMovable);

      const randomMoveIndex = randomInteger(0, moveList.length - 1);
      const randomObj = moveList[randomMoveIndex].obj;
      this.moveTo(randomObj.x, randomObj.y);
      this.attack();
    }, 1000);
    // setTimeout(() => {
    //   this.moveTo(this.x + 1, this.y);
    // }, 5000);
    // setInterval(() => {
    //   if (moveDirection === "X") {
    //     this.moveTo(this.x + 1, this.y);
    //   }
    // }, 500);
  }
}

window.Enemy = Enemy;
