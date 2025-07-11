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
    this.moveInterval = null;
  }

  autoMove() {
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
    this.moveInterval = setInterval(() => {
      if (this.currentHp <= 0) {
        clearInterval(this.moveInterval);
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
  }

  stop() {
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
      this.moveInterval = null;
    }
  }
}

window.Enemy = Enemy;
