class GameLevelGenerator {
  constructor() {}

  // 1) Flood-fill всех доступных PATH
  static floodFillPaths(map, startX, startY) {
    const h = map.length,
      w = map[0].length;
    const visited = Array.from({ length: h }, () => Array(w).fill(false));
    const queue = [[startX, startY]];
    visited[startY][startX] = true;

    while (queue.length) {
      const [x, y] = queue.shift();
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx,
          ny = y + dy;
        if (
          nx >= 0 &&
          nx < w &&
          ny >= 0 &&
          ny < h &&
          !visited[ny][nx] &&
          map[ny][nx].type === GameObjectType.PATH
        ) {
          visited[ny][nx] = true;
          queue.push([nx, ny]);
        }
      }
    }
    return visited;
  }

  // 2) Найти недостижимые PATH и соединить
  static connectPaths(map) {
    const h = map.length,
      w = map[0].length;
    // Найти старт
    let sx, sy;
    outer: for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (map[y][x].type === GameObjectType.PATH) {
          sx = x;
          sy = y;
          break outer;
        }
      }
    }

    let reachable = GameLevelGenerator.floodFillPaths(map, sx, sy);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (map[y][x].type === GameObjectType.PATH && !reachable[y][x]) {
          // 3) Ищем ближайшую достижимую клетку
          const { tx, ty } = GameLevelGenerator.findClosestReachable(
            x,
            y,
            reachable
          );
          // 4) Прокладываем простой L‑образный коридор
          GameLevelGenerator.carveCorridor(map, x, y, tx, ty);
          // обновляем отметку
          reachable = GameLevelGenerator.floodFillPaths(map, sx, sy);
        }
      }
    }
  }

  // вспомогательная: поиск ближайшей достиг. PATH через BFS
  static findClosestReachable(sx, sy, reachable) {
    const h = reachable.length,
      w = reachable[0].length;
    const queue = [[sx, sy, 0]];
    const seen = Array.from({ length: h }, () => Array(w).fill(false));
    seen[sy][sx] = true;
    while (queue.length) {
      const [x, y] = queue.shift();
      if (reachable[y][x]) return { tx: x, ty: y };
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx,
          ny = y + dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h && !seen[ny][nx]) {
          seen[ny][nx] = true;
          queue.push([nx, ny]);
        }
      }
    }
    return { tx: sx, ty: sy };
  }

  // вспомогательная: вырезает L‑образный коридор
  static carveCorridor(map, x1, y1, x2, y2) {
    let x = x1,
      y = y1;
    // двигаемся по X
    while (x !== x2) {
      map[y][x].type = GameObjectType.PATH;
      x += x2 > x ? 1 : -1;
    }
    // потом по Y
    while (y !== y2) {
      map[y][x].type = GameObjectType.PATH;
      y += y2 > y ? 1 : -1;
    }
  }

  static manhDist(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  static getRandomSpawnCoordsWithOffset(
    map,
    tileXCount,
    tileYCount,
    count,
    offset = 5
  ) {
    const spawned = [];

    while (spawned.length < count) {
      const x = randomInteger(0, tileXCount - 1);
      const y = randomInteger(0, tileYCount - 1);

      const cell = map[y][x];
      if (cell.type !== GameObjectType.PATH) continue;

      const isClose = spawned.some(
        (e) => GameLevelGenerator.manhDist(e.x, e.y, x, y) < offset
      );
      if (isClose) continue;
      spawned.push({ x, y });
    }

    return spawned;
  }

  //   static getRandomSpawnCoordsWithOffset(
  //     map,
  //     tileXCount,
  //     tileYCount,
  //     count,
  //     offset = 5
  //   ) {
  //     const spawned = [];

  //     // Манхэттен‑расстояние
  //     const manh = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2);

  //     while (spawned.length < count) {
  //       const x = randomInteger(0, tileXCount - 1);
  //       const y = randomInteger(0, tileYCount - 1);

  //       // 1) клетка должна быть проходом
  //       if (map[y][x].type !== GameObjectType.PATH) continue;

  //       // 2) проверяем, что от неё до всех ранее сгенеренных >= offset
  //       const isClose = spawned.some((p) => manh(p.x, p.y, x, y) < offset);
  //       if (isClose) continue;

  //       // 3) сохраняем именно эту пару (x и y)
  //       spawned.push({ x, y });
  //     }

  //     return spawned;
  //   }
}

window.GameLevelGenerator = GameLevelGenerator;
