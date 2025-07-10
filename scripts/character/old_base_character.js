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
    const radius = this.fovRadius - 1;
    const centerIndex = Math.round((3 + radius) / 2) - 1;
    // const size = this.fovRadius * 2 + 1;
    // const centerIndex = this.fovRadius;
    this.fovObjects = new Array(3 + radius).fill(null).map((_, dy) =>
      new Array(3 + radius).fill(null).map((_, dx) => {
        const mapX = this.x + (dx - centerIndex);
        const mapY = this.y + (dy - centerIndex);

        // if (dx === centerIndex && dy === centerIndex) {
        //   return this.toObject();
        // }

        const staticObject = this.getStaticObject(mapX, mapY);
        return staticObject?.toObject() ?? null;
      })
    );
  }

  updateFovObjects() {
    const radius = this.fovRadius - 1;
    const centerIndex = Math.round((3 + radius) / 2) - 1;

    const prevObjects = [
      ...this.fovObjects.map((row) => row.map((item) => item)),
    ];

    this.fovObjects = prevObjects.map((arr1, dy) =>
      arr1.map((arr2, dx) => {
        const mapX = this.x + (dx - centerIndex);
        const mapY = this.y + (dy - centerIndex);

        if (dx === centerIndex && dy === centerIndex) {
          return this.toObject();
        }

        const staticObject = this.getStaticObject(mapX, mapY);
        console.log({ staticObject });
        return staticObject?.toObject() ?? null;
      })
    );
    this.updateFov(prevObjects);
    return this.fovObjects;
  }

  updateFov(prevObjects) {
    const nextObjects = this.fovObjects.map((row) => [...row]);

    const dirtyCoords = [];

    const rows = nextObjects.length;
    const cols = nextObjects[0]?.length || 0;
    const centerIndex = this.fovRadius;

    const prevList = flattenFov(prevObjects, this.x, this.y);
    const nextList = flattenFov(nextObjects, this.x, this.y);
    debugger;
    dirtyCoords.push([...diffFovLists(prevList, nextList)]);

    // for (let y = 0; y < rows; y++) {
    //   for (let x = 0; x < cols; x++) {
    //     const prev = prevObjects[y][x];
    //     const curr = newObjects[y][x];

    //     // Проверяем, изменилось ли что-то в этой клетке
    //     const hasChanged = this.hasObjectChanged(prev, curr);

    //     if (hasChanged) {
    //       // Преобразуем локальные координаты в глобальные
    //       const globalX = this.x + (x - centerIndex);
    //       const globalY = this.y + (y - centerIndex);

    //       dirtyCoords.push({ x: globalX, y: globalY });
    //     }
    //   }
    // }
    debugger;
    // Обновляем только изменившиеся клетки
    dirtyCoords.forEach((coord) => {
      const obj = this.getStaticObject(coord.x, coord.y);
      if (obj && obj.updateNode) {
        obj.updateNode();
      }
    });

    console.log("Dirty coordinates:", dirtyCoords);
    return dirtyCoords;
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

    const targetObj = this.getStaticObject(targetX, targetY);

    // targetObj.x = oldX;
    // targetObj.y = oldY;

    // this.x = targetX;
    // this.y = targetY;
    const newCharacter = new BaseCharacter(
      targetX,
      targetY,
      this.tileWidth,
      this.tileHeight,
      this.type,
      this.fovRadius,
      this.getStaticObject,
      this.setStaticObject
    );

    const newTargetObject = new GameObject(
      oldX,
      oldY,
      targetObj.tileWidth,
      targetObj.tileHeight,
      targetObj.type
    );

    // this.setStaticObject(targetX, targetY, newCharacter);
    this.setStaticObject(oldX, oldY, newTargetObject);

    const resultMoveFrom = this.getStaticObject(oldX, oldY);
    const resultMoveTo = this.getStaticObject(targetX, targetY);
    debugger;
    console.log(`Moved from (${oldX}, ${oldY}) to (${targetX}, ${targetY})`);

    // targetObj.updateNode();
    // prevObj.updateNode();

    this.updateFovObjects();
  }

  // moveTo(targetX, targetY) {
  //   const oldX = this.x;
  //   const oldY = this.y;

  //   // Получаем PATH объект с целевой позиции
  //   const pathObj = this.getStaticObject(targetX, targetY);

  //   // Ставим персонажа на новую позицию
  //   this.setStaticObject(targetX, targetY, this);

  //   // Ставим PATH объект на старую позицию персонажа
  //   this.setStaticObject(oldX, oldY, pathObj);

  //   // Обновляем координаты
  //   if (pathObj) {
  //     pathObj.x = oldX;
  //     pathObj.y = oldY;
  //   }

  //   this.x = targetX;
  //   this.y = targetY;

  //   console.log(`Moved from (${oldX}, ${oldY}) to (${targetX}, ${targetY})`);

  //   this.updateFovObjects();
  // }

  hasObjectChanged(prev, curr) {
    // Если один объект есть, а другой нет
    if ((prev === null) !== (curr === null)) {
      return true;
    }

    // Оба null — ничего не изменилось
    if (prev === null && curr === null) {
      return false;
    }

    // Оба не null: проверяем тип и другие свойства
    if (prev.type !== curr.type) {
      return true;
    }

    // Проверяем координаты (если объект переместился)
    if (prev.x !== curr.x || prev.y !== curr.y) {
      return true;
    }

    return false;
  }
}

window.BaseCharacter = BaseCharacter;
