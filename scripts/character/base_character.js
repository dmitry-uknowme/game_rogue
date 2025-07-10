class BaseCharacter extends GameObject {
  constructor(
    x,
    y,
    tileWidth,
    tileHeight,
    type,
    fovRadius,
    getStaticObject,
    setStaticObject
  ) {
    super(x, y, tileWidth, tileHeight, type);
    this.x = x;
    this.y = y;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.type = type;
    this.fovRadius = fovRadius;
    this.getStaticObject = getStaticObject;
    this.setStaticObject = setStaticObject;
    this.fovObjects = [];
    this.initFovObjects();
  }

  initFovObjects() {
    const r = this.fovRadius - 1;
    if (!this.fovObjects?.length) {
      this.fovObjects = new Array(3 + r)
        .fill(null)
        .map((el) => new Array(3 + r).fill(null));
    }
  }

  updateFovObjects() {
    // const centerOnStatic = this.getStaticObject(this.x, this.y);
    // console.log({ x: this.x, y: this.y, centerOnStatic });
    const r = this.fovRadius - 1;
    const centerIndex = Math.round((3 + r) / 2) - 1;

    const prevObjects = this.fovObjects;

    this.fovObjects = this.fovObjects.map((arr1, dy) =>
      arr1.map((arr2, dx) => {
        const mapX = this.x + (dx - centerIndex);
        const mapY = this.y + (dy - centerIndex);

        if (dx === centerIndex && dy === centerIndex) {
          return this;
        }

        const staticObject = this.getStaticObject(mapX, mapY);
        if (!staticObject) return null;

        if (staticObject.type !== GameObjectType.PATH) {
        }

        return staticObject ?? null;
      })
    );

    this.updateFov(prevObjects);
    return this.fovObjects;
  }

  updateFov(prevObjects) {
    const newObjects = this.fovObjects;
    const dirtyObjects = [];

    const rows = newObjects.length;
    const cols = newObjects[0]?.length || 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const p = prevObjects[y][x];
        const n = newObjects[y][x];

        // Случай, если один объект есть, а другой нет
        if ((p === null) !== (n === null)) {
          dirtyObjects.push({ y, x });
          continue;
        }

        // Оба null — ничего не менялось
        if (p === null && n === null) continue;

        // Оба не null: проверяем тип (или другие свойства)
        if (p.type !== n.type) {
          dirtyObjects.push({ y, x });
          continue;
        }

        // Если нужно — можно сравнить ещё hpPercent, x,y и т.д.
      }
      debugger;
    }
    // console.log({ prevObjects, newObjects });
    // debugger;
    // const coords = (arr) =>
    //   arr.map((row) =>
    //     row.map((obj) => (obj ? { x: obj.x, y: obj.y, type: obj.type } : null))
    //   );
    // console.log({
    //   prev: JSON.stringify(coords(prevObjects)),
    //   next: JSON.stringify(coords(newObjects)),
    // });
    // newFovObjects.forEach((objects)=>{
    //   objects.forEach((obj)=> )
    // })

    // const dirtyObjects = newFovObjects.map((arr1) =>
    //   arr1.map((obj) => {
    //     return prevObjects.find(
    //       (prevObj) => prevObj.x === obj.x && prevObj.y === obj.y
    //     );
    //   })
    // );
    // debugger;
  }

  move(keys) {
    let newX;
    let newY;
    if (keys.w) {
      newX = this.x;
      newY = this.y - 1;
    } else if (keys.s) {
      newX = this.x;
      newY = this.y + 1;
    } else if (keys.a) {
      newX = this.x - 1;
      newY = this.y;
    } else if (keys.d) {
      newX = this.x + 1;
      newY = this.y;
    }

    if (this.getStaticObject(newX, newY)?.type !== GameObjectType.PATH) return;

    this.moveTo(newX, newY);
  }

  moveTo(targetX, targetY) {
    const oldX = this.x;
    const oldY = this.y;

    const prevObj = this.getStaticObject(oldX, oldY);
    const targetObj = this.getStaticObject(targetX, targetY);

    this.setStaticObject(oldX, oldY, targetObj);
    this.setStaticObject(targetX, targetY, prevObj);

    prevObj.x = targetX;
    prevObj.y = targetY;
    targetObj.x = oldX;
    targetObj.y = oldY;

    this.x = targetX;
    this.y = targetY;

    targetObj.updateNode();
    prevObj.updateNode();

    this.updateFovObjects();
  }
}

window.BaseCharacter = BaseCharacter;
