const SIZE = 4;
let grid = [];
let score = 0;
let won = false;
let gameOver = false;
let touchStart = null;

const board = document.querySelector('#board');
const scoreElement = document.querySelector('#score');
const bestScoreElement = document.querySelector('#best-score');
const message = document.querySelector('#message');
const messageTitle = document.querySelector('#message-title');
const messageText = document.querySelector('#message-text');
const continueButton = document.querySelector('#continue-button');

let bestScore = Number(localStorage.getItem('2048-best-score')) || 0;
bestScoreElement.textContent = bestScore;

function startGame() {
  grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  score = 0;
  won = false;
  gameOver = false;
  addRandomTile();
  addRandomTile();
  hideMessage();
  render();
}

function addRandomTile() {
  const emptyCells = [];
  grid.forEach((row, y) => row.forEach((value, x) => {
    if (value === 0) emptyCells.push([y, x]);
  }));
  if (!emptyCells.length) return;
  const [y, x] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  grid[y][x] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  board.innerHTML = '';
  grid.flat().forEach(value => {
    const tile = document.createElement('div');
    tile.className = `tile tile-${value}${value > 2048 ? ' tile-super' : ''}`;
    tile.setAttribute('role', 'gridcell');
    tile.textContent = value || '';
    board.appendChild(tile);
  });
  scoreElement.textContent = score;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('2048-best-score', bestScore);
    bestScoreElement.textContent = bestScore;
  }
}

function mergeLine(line) {
  const values = line.filter(Boolean);
  const merged = [];
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === values[i + 1]) {
      const newValue = values[i] * 2;
      merged.push(newValue);
      score += newValue;
      i += 1;
    } else {
      merged.push(values[i]);
    }
  }
  return merged.concat(Array(SIZE - merged.length).fill(0));
}

function move(direction) {
  if (gameOver) return;
  const previous = JSON.stringify(grid);
  for (let i = 0; i < SIZE; i += 1) {
    let line;
    if (direction === 'left' || direction === 'right') {
      line = [...grid[i]];
      if (direction === 'right') line.reverse();
      line = mergeLine(line);
      if (direction === 'right') line.reverse();
      grid[i] = line;
    } else {
      line = grid.map(row => row[i]);
      if (direction === 'down') line.reverse();
      line = mergeLine(line);
      if (direction === 'down') line.reverse();
      grid.forEach((row, rowIndex) => { row[i] = line[rowIndex]; });
    }
  }
  if (JSON.stringify(grid) === previous) return;
  addRandomTile();
  render();
  if (!won && grid.some(row => row.includes(2048))) {
    won = true;
    showMessage('恭喜通关！', '你已经合成了 2048，继续挑战更高数字吧。', true);
  } else if (!canMove()) {
    gameOver = true;
    showMessage('游戏结束', `本局得分：${score}，再试一次突破纪录吧。`, false);
  }
}

function canMove() {
  if (grid.some(row => row.includes(0))) return true;
  return grid.some((row, y) => row.some((value, x) =>
    value === grid[y]?.[x + 1] || value === grid[y + 1]?.[x]
  ));
}

function showMessage(title, text, isWin) {
  messageTitle.textContent = title;
  messageText.textContent = text;
  continueButton.hidden = !isWin;
  message.classList.add('show');
  message.setAttribute('aria-hidden', 'false');
}

function hideMessage() {
  message.classList.remove('show');
  message.setAttribute('aria-hidden', 'true');
}

const keyMap = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  a: 'left', d: 'right', w: 'up', s: 'down', A: 'left', D: 'right', W: 'up', S: 'down'
};

window.addEventListener('keydown', event => {
  const direction = keyMap[event.key];
  if (direction) {
    event.preventDefault();
    move(direction);
  }
});

board.addEventListener('pointerdown', event => { touchStart = { x: event.clientX, y: event.clientY }; });
board.addEventListener('pointerup', event => {
  if (!touchStart) return;
  const deltaX = event.clientX - touchStart.x;
  const deltaY = event.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) return;
  move(Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? 'right' : 'left') : (deltaY > 0 ? 'down' : 'up'));
});

document.querySelector('#restart-button').addEventListener('click', startGame);
document.querySelector('#message-restart-button').addEventListener('click', startGame);
continueButton.addEventListener('click', hideMessage);

startGame();
