/**
 * Превращает (2D‑массив размером size×size)
 * в массив объектов { x: number, y: number, type: string }.
 * При этом смещаем локальные координаты [dy][dx] в глобальные X,Y.
 */
function flattenFov(fovObjects, centerX, centerY) {
  const size = fovObjects.length;
  const center = Math.floor(size / 2);
  const list = [];

  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const obj = fovObjects[dy][dx];
      if (!obj) continue;
      const globalX = centerX + (dx - center);
      const globalY = centerY + (dy - center);
      list.push(obj);
      // list.push({ x: globalX, y: globalY, type: obj.type });
    }
  }

  return list;
}
// function flattenFov(fovObjects, centerX, centerY) {
//   const size = fovObjects.length;
//   const center = Math.floor(size / 2);
//   const list = [];

//   for (let dy = 0; dy < size; dy++) {
//     for (let dx = 0; dx < size; dx++) {
//       const obj = fovObjects[dy][dx];
//       if (!obj) continue;
//       const globalX = centerX + (dx - center);
//       const globalY = centerY + (dy - center);
//       list.push({ x: globalX, y: globalY, type: obj.type });
//     }
//   }

//   return list;
// }

/**
 * Сравнивает два списка клеток по {x,y,type} и возвращает
 * массив координат, где тип изменился или объект появился/ушёл.
 */
// function diffFovLists(prevList, nextList) {
//   const dirty = [];

//   // Сначала создаём карту prev по ключу "x,y"
//   const prevMap = new Map();
//   prevList.forEach((o) => {
//     prevMap.set(`${o.x},${o.y}`, o.type);
//   });

//   // Обрабатываем nextList: появление или изменение типа
//   nextList.forEach((o) => {
//     const key = `${o.x},${o.y}`;
//     const prevType = prevMap.get(key);
//     if (prevType !== o.type) {
//       dirty.push({ x: o.x, y: o.y });
//     }
//     prevMap.delete(key);
//   });

//   // В prevMap останутся те, что исчезли в nextList
//   for (const key of prevMap.keys()) {
//     const [x, y] = key.split(",").map(Number);
//     dirty.push({ x, y });
//   }

//   return dirty;
// }

function diffFovLists(prevList, nextList) {
  const dirty = [];

  // Сопоставляем next по координатам, если в prev есть объект с теми же координатами — сравниваем type
  const prevMap = new Map();
  prevList.forEach((o) => {
    prevMap.set(`${o.x},${o.y}`, o.type);
  });

  nextList.forEach((o) => {
    const key = `${o.x},${o.y}`;
    const prevType = prevMap.get(key);

    // Сравниваем только type, если координата уже была в прошлом
    if (prevMap.has(key) && prevType !== o.type) {
      dirty.push({ x: o.x, y: o.y });
    }
  });

  return dirty;
}

// function diffFovLists(prevList, nextList) {
//   const dirty = [];

//   // Сопоставляем next по координатам, если в prev есть объект с теми же координатами — сравниваем type
//   const prevMap = new Map();
//   prevList.forEach((o) => {
//     prevMap.set(`${o.x},${o.y}`, o.type);
//   });

//   nextList.forEach((o) => {
//     const key = `${o.x},${o.y}`;
//     const prevType = prevMap.get(key);

//     // Сравниваем только type, если координата уже была в прошлом
//     if (prevMap.has(key) && prevType !== o.type) {
//       dirty.push({ x: o.x, y: o.y });
//     }
//   });

//   return dirty;
// }

function randomInteger(min, max, usedResults = [], maxTries = 5) {
  const result = Math.floor(Math.random() * (max - min + 1)) + min;
  if (maxTries === 0) {
    throw Error("No random tries left");
  }
  if (result in usedResults) {
    return randomInteger(min, max, usedResults, maxTries - 1);
  }
  return result;
}

function hasObjectChanged(prev, curr) {
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

  // Проверяем здоровье (если есть)
  if (prev.hp !== curr.hp) {
    return true;
  }

  return false;
}

window.flattenFov = flattenFov;
window.diffFovLists = diffFovLists;
window.randomInteger = randomInteger;
window.hasObjectChanged = hasObjectChanged;
