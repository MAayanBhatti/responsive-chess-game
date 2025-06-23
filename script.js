const board = document.getElementById('chessboard');
const resetBtn = document.getElementById('resetBtn');
let selectedSquare = null;
let currentPlayer = 'white';

let whiteTime = 300;
let blackTime = 300;
let timerInterval = null;

const whiteTimerEl = document.getElementById('white-timer');
const blackTimerEl = document.getElementById('black-timer');

const initialBoard = [
  ["♜","♞","♝","♛","♚","♝","♞","♜"],
  ["♟","♟","♟","♟","♟","♟","♟","♟"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["♙","♙","♙","♙","♙","♙","♙","♙"],
  ["♖","♘","♗","♕","♔","♗","♘","♖"]
];

let gameState = JSON.parse(JSON.stringify(initialBoard));

function isWhite(piece) {
  return ["♙","♖","♘","♗","♕","♔"].includes(piece);
}

function isBlack(piece) {
  return ["♟","♜","♞","♝","♛","♚"].includes(piece);
}

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateTimerDisplay() {
  whiteTimerEl.textContent = `White: ${formatTime(whiteTime)}`;
  blackTimerEl.textContent = `Black: ${formatTime(blackTime)}`;
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (currentPlayer === 'white') {
      whiteTime--;
      if (whiteTime <= 0) {
        clearInterval(timerInterval);
        alert("Time's up! Black wins!");
      }
    } else {
      blackTime--;
      if (blackTime <= 0) {
        clearInterval(timerInterval);
        alert("Time's up! White wins!");
      }
    }
    updateTimerDisplay();
  }, 1000);
}

function createBoard() {
  board.innerHTML = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.classList.add('square', (row + col) % 2 === 0 ? 'light' : 'dark');
      square.dataset.row = row;
      square.dataset.col = col;
      square.innerText = gameState[row][col];
      square.addEventListener('click', () => handleClick(row, col));
      board.appendChild(square);
    }
  }
}

function handleClick(row, col) {
  const clickedPiece = gameState[row][col];

  if (selectedSquare) {
    const [fromRow, fromCol] = selectedSquare;
    const selectedPiece = gameState[fromRow][fromCol];

    if ((currentPlayer === 'white' && !isWhite(selectedPiece)) ||
        (currentPlayer === 'black' && !isBlack(selectedPiece))) {
      selectedSquare = null;
      clearHighlights();
      return;
    }

    const validMoves = getValidMoves(fromRow, fromCol, selectedPiece);
    if (validMoves.some(([r, c]) => r === row && c === col)) {
      gameState[row][col] = selectedPiece;
      gameState[fromRow][fromCol] = "";
      currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
      selectedSquare = null;
      clearHighlights();
      createBoard();
      updateTurnDisplay();
      startTimer();
    } else {
      if (clickedPiece !== "" && ((currentPlayer === 'white' && isWhite(clickedPiece)) || (currentPlayer === 'black' && isBlack(clickedPiece)))) {
        selectedSquare = [row, col];
        highlightMoves(row, col, clickedPiece);
      } else {
        selectedSquare = null;
        clearHighlights();
      }
    }
  } else {
    if (clickedPiece !== "" && ((currentPlayer === 'white' && isWhite(clickedPiece)) || (currentPlayer === 'black' && isBlack(clickedPiece)))) {
      selectedSquare = [row, col];
      highlightMoves(row, col, clickedPiece);
    }
  }
}

function highlightMoves(row, col, piece) {
  clearHighlights();
  const moves = getValidMoves(row, col, piece);
  document.querySelectorAll('.square').forEach(sq => {
    const r = parseInt(sq.dataset.row);
    const c = parseInt(sq.dataset.col);
    if (moves.some(([mr, mc]) => mr === r && mc === c)) {
      sq.classList.add('highlight');
    }
  });
}

function clearHighlights() {
  document.querySelectorAll('.square').forEach(sq => sq.classList.remove('highlight'));
}

function getValidMoves(row, col, piece) {
  const moves = [];

  const directions = {
    rook: [[1,0], [-1,0], [0,1], [0,-1]],
    bishop: [[1,1], [1,-1], [-1,1], [-1,-1]],
    king: [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1], [-1,1]],
    knight: [
      [-2, -1], [-2, 1],
      [-1, -2], [-1, 2],
      [1, -2], [1, 2],
      [2, -1], [2, 1]
    ]
  };

  const isEnemy = (target) => {
    if (piece === "") return false;
    return isWhite(piece) ? isBlack(target) : isWhite(target);
  };

  const empty = (r, c) => gameState[r][c] === "";

  if (piece === "♙") {
    if (row > 0 && empty(row - 1, col)) moves.push([row - 1, col]);
    if (row === 6 && empty(5, col) && empty(4, col)) moves.push([row - 2, col]);
    if (row > 0 && col > 0 && isEnemy(gameState[row - 1][col - 1])) moves.push([row - 1, col - 1]);
    if (row > 0 && col < 7 && isEnemy(gameState[row - 1][col + 1])) moves.push([row - 1, col + 1]);
  } else if (piece === "♟") {
    if (row < 7 && empty(row + 1, col)) moves.push([row + 1, col]);
    if (row === 1 && empty(2, col) && empty(3, col)) moves.push([row + 2, col]);
    if (row < 7 && col > 0 && isEnemy(gameState[row + 1][col - 1])) moves.push([row + 1, col - 1]);
    if (row < 7 && col < 7 && isEnemy(gameState[row + 1][col + 1])) moves.push([row + 1, col + 1]);
  }

  else if (["♖", "♜"].includes(piece)) {
    for (const [dr, dc] of directions.rook) {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (empty(r, c)) {
          moves.push([r, c]);
        } else {
          if (isEnemy(gameState[r][c])) moves.push([r, c]);
          break;
        }
        r += dr;
        c += dc;
      }
    }
  }

  else if (["♗", "♝"].includes(piece)) {
    for (const [dr, dc] of directions.bishop) {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (empty(r, c)) {
          moves.push([r, c]);
        } else {
          if (isEnemy(gameState[r][c])) moves.push([r, c]);
          break;
        }
        r += dr;
        c += dc;
      }
    }
  }

  else if (["♕", "♛"].includes(piece)) {
    for (const [dr, dc] of [...directions.rook, ...directions.bishop]) {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (empty(r, c)) {
          moves.push([r, c]);
        } else {
          if (isEnemy(gameState[r][c])) moves.push([r, c]);
          break;
        }
        r += dr;
        c += dc;
      }
    }
  }

  else if (["♘", "♞"].includes(piece)) {
    for (const [dr, dc] of directions.knight) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (empty(r, c) || isEnemy(gameState[r][c])) {
          moves.push([r, c]);
        }
      }
    }
  }

  else if (["♔", "♚"].includes(piece)) {
    for (const [dr, dc] of directions.king) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = gameState[r][c];
        if (target === "" || isEnemy(target)) {
          moves.push([r, c]);
        }
      }
    }
  }

  return moves;
}

resetBtn.addEventListener('click', () => {
  gameState = JSON.parse(JSON.stringify(initialBoard));
  selectedSquare = null;
  currentPlayer = 'white';
  whiteTime = blackTime = 300;
  createBoard();
  updateTurnDisplay();
  updateTimerDisplay();
  startTimer();
});

function updateTurnDisplay() {
  resetBtn.innerText = `Reset Game • ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
}

createBoard();
updateTurnDisplay();
updateTimerDisplay();
startTimer();
