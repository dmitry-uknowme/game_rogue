class Enemy extends BaseCharacter {
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
      GameObjectType.ENEMY,
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
  }
}

window.Enemy = Enemy;
