class BaseCharacter extends GameObject {
  constructor(
    x,
    y,
    tileWidth,
    tileHeight,
    type,
    fovRadius,
    getStaticObject,
    setStaticObject,
    pushLevelChanges
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
    this.pushLevelChanges = pushLevelChanges;
    this.maxHp = 10;
    this.strong = 2;
    this.currentHp = this.maxHp;
    this.prevPosition = { x, y };
    this.fovObjects = [];
    // this.fovObjects = this.getFovObjects();
  }

  getFovObjects(x = this.x, y = this.y) {
    const radius = this.fovRadius - 1;
    const centerIndex = Math.round((3 + radius) / 2) - 1;
    // const size = this.fovRadius * 2 + 1;
    // const centerIndex = this.fovRadius;
    const fovObjects = new Array(3 + radius).fill(null).map((_, dy) =>
      new Array(3 + radius).fill(null).map((_, dx) => {
        const mapX = x + (dx - centerIndex);
        const mapY = y + (dy - centerIndex);

        if (dx === centerIndex && dy === centerIndex) {
          return this;
        }

        const staticObject = this.getStaticObject(mapX, mapY);
        return staticObject ?? null;
      })
    );

    return fovObjects;
  }

  // updateFovObjects() {
  //   const radius = this.fovRadius - 1;
  //   const centerIndex = Math.round((3 + radius) / 2) - 1;

  //   // const prevObjects = [...this.fovObjects];

  //   this.fovObjects = prevObjects.map((arr1, dy) =>
  //     arr1.map((arr2, dx) => {
  //       const mapX = this.x + (dx - centerIndex);
  //       const mapY = this.y + (dy - centerIndex);

  //       if (dx === centerIndex && dy === centerIndex) {
  //         return this;
  //       }

  //       const staticObject = this.getStaticObject(mapX, mapY);
  //       console.log({ staticObject });
  //       return staticObject ?? null;
  //     })
  //   );
  //   this.updateFov(prevObjects);
  //   return this.fovObjects;
  // }

  // updateFov(prevObjects) {
  //   const nextObjects = this.fovObjects.map((row) => [...row]);

  //   const dirtyCoords = [];

  //   const rows = nextObjects.length;
  //   const cols = nextObjects[0]?.length || 0;
  //   const centerIndex = this.fovRadius;

  //   const prevList = flattenFov(prevObjects, this.x, this.y);
  //   const nextList = flattenFov(nextObjects, this.x, this.y);
  //   debugger;
  //   dirtyCoords.push([...diffFovLists(prevList, nextList)]);

  //   // for (let y = 0; y < rows; y++) {
  //   //   for (let x = 0; x < cols; x++) {
  //   //     const prev = prevObjects[y][x];
  //   //     const curr = newObjects[y][x];

  //   //     // Проверяем, изменилось ли что-то в этой клетке
  //   //     const hasChanged = this.hasObjectChanged(prev, curr);

  //   //     if (hasChanged) {
  //   //       // Преобразуем локальные координаты в глобальные
  //   //       const globalX = this.x + (x - centerIndex);
  //   //       const globalY = this.y + (y - centerIndex);

  //   //       dirtyCoords.push({ x: globalX, y: globalY });
  //   //     }
  //   //   }
  //   // }
  //   debugger;
  //   // Обновляем только изменившиеся клетки
  //   dirtyCoords.forEach((coord) => {
  //     const obj = this.getStaticObject(coord.x, coord.y);
  //     if (obj && obj.updateNode) {
  //       obj.updateNode();
  //     }
  //   });

  //   console.log("Dirty coordinates:", dirtyCoords);
  //   return dirtyCoords;
  // }

  attack(objectType) {
    const fovObjects = this.getFovObjects();
    const listObjects = flattenFov(fovObjects);
    const otherEnemies = listObjects.filter(
      (obj) => obj instanceof BaseCharacter && obj.type !== this.type
    );
    otherEnemies.map((enemy) => {
      const enemyObj = this.getStaticObject(enemy.x, enemy.y);
      enemyObj.currentHp -= this.strong;
      this.pushLevelChanges([enemyObj]);
    });
  }

  applyEffect(obj) {
    if (obj.type === GameObjectType.EFFECT_HEAL) {
      const newHp = Math.min(this.currentHp + 5, this.maxHp);
      this.currentHp = newHp;
    } else if (obj.type === GameObjectType.EFFECT_STRONG) {
      this.strong = 4;
      setTimeout(() => {
        console.log("effect strong released");
        this.strong = 2;
        this.pushLevelChanges([this]);
      }, 5000);
    }
    const pathObj = new GameObject(
      obj.x,
      obj.y,
      this.tileWidth,
      this.tileHeight,
      GameObjectType.PATH
    );
    const replaced = this.setStaticObject(obj.x, obj.y, pathObj);
    this.pushLevelChanges([this, replaced]);
  }

  moveKeys(keys) {
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

    const staticObject = this.getStaticObject(newX, newY);
    if (!staticObject) return;

    if (
      staticObject.type === GameObjectType.EFFECT_HEAL ||
      staticObject.type === GameObjectType.EFFECT_STRONG
    ) {
      this.applyEffect(staticObject);
    }

    if (
      staticObject.type !== GameObjectType.PATH &&
      staticObject.type !== GameObjectType.EFFECT_HEAL &&
      staticObject.type !== GameObjectType.EFFECT_STRONG
      // && !(staticObject in GameObjectType.EFFECTS
    )
      return;

    this.moveTo(newX, newY);
  }

  moveTo(targetX, targetY) {
    const oldX = this.x;
    const oldY = this.y;

    const targetObj = this.getStaticObject(targetX, targetY);

    targetObj.x = oldX;
    targetObj.y = oldY;

    this.prevPosition = { x: this.x, y: this.y };
    this.x = targetX;
    this.y = targetY;

    // this.setStaticObject(targetX, targetY, this);
    // this.setStaticObject(oldX, oldY, targetObj);

    const resultMoveFrom = this.getStaticObject(oldX, oldY);
    const resultMoveTo = this.getStaticObject(targetX, targetY);
    console.log(`Moved from (${oldX}, ${oldY}) to (${targetX}, ${targetY})`);

    this.pushLevelChanges([targetObj, this]);
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

  node() {
    const objectClassName = this.objectClassName;
    const hpPercent = (this.currentHp / this.maxHp) * 100;
    return `
      <div class="tile" style="
        width: ${this.tileWidth.toFixed(2)}px;
        height: ${this.tileHeight.toFixed(2)}px" 
        data-x="${this.x}" 
        data-y="${this.y}">
          <div class="${objectClassName}">
            <div class="health" style="width: ${hpPercent}%;"></div>
          </div>
      </div>`;
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
