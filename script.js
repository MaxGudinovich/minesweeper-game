// Set this constant to true to debug the placement of bombs without
// having to click on all cells to reveal them.
const CHEAT_REVEAL_ALL = false;

const ROWS_COUNT = 10;
const COLS_COUNT = 10;
const BOMBS_COUNT = 10;
let bombs = BOMBS_COUNT;

var defeat = false;
var victory = false;

function Cell() {
  this.discovered = false;
  this.isBomb = false;
  this.hasBeenFlagged = false;
}

var cells = Array(ROWS_COUNT);
for (var row = 0; row < ROWS_COUNT; row++) {
  cells[row] = Array(COLS_COUNT);
  for (var col = 0; col < COLS_COUNT; col++) {
    cells[row][col] = new Cell();
  }
}

let totalCellsToClear = cells.length * cells.length - BOMBS_COUNT;

while (bombs > 0) {
  var row = Math.floor(Math.random() * ROWS_COUNT);
  var col = Math.floor(Math.random() * COLS_COUNT);
  if (!cells[row][col].isBomb) {
    cells[row][col].isBomb = true;
    bombs--;
  }
}

render();

let clickedRow, clickedCol;

function handleClick(row, col) {
  clickedRow = row;
  clickedCol = col;

  discoverCell(clickedRow, clickedCol);
}

function discoverCell(row, col, initialRow, initialCol) {
  if (initialRow === undefined || initialCol === undefined) {
    initialRow = row;
    initialCol = col;

    if (cells[row][col].isBomb) {
      defeat = true;
    }
  }

  if (row < 0 || row >= cells.length || col < 0 || col >= cells[0].length) {
    return;
  }

  if (cells[row][col].discovered) {
    return;
  }

  if (cells[row][col].isBomb) {
    return;
  }

  if (Math.abs(row - initialRow) > 1 || Math.abs(col - initialCol) > 1) {
    return;
  }

  cells[row][col].discovered = true;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      discoverCell(row + i, col + j, initialRow, initialCol);
    }
  }
}

function flagCell(row, col) {
  cells[row][col].hasBeenFlagged = true;
}

function countAdjacentBombs(row, col) {
  let bombCount = 0;

  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i >= 0 && i < cells.length && j >= 0 && j < cells[0].length) {
        if (cells[i][j].isBomb) {
          bombCount++;
        }
      }
    }
  }
  if (cells[row][col].isBomb) {
    bombCount--;
  }
  return bombCount;
}

function getBombsCount() {
  return BOMBS_COUNT;
}

function getClearedCells() {
  let cleared = 0;
  cells.map((el) => el.map((el) => (el.discovered ? cleared++ : '')));
  return cleared;
}

function getTotalCellsToClear() {
  return totalCellsToClear;
}

function checkForVictory() {
  let cleared = getClearedCells();

  if (cleared === totalCellsToClear) {
    victory = true;
  }
}

//
// Rendering functions
//
function getMessage() {
  if (victory == true) {
    return 'Well done! 👏🏼<br><br>Refresh the page to start again.';
  } else if (defeat) {
    return 'Boom! 💥<br><br>Refresh the page to try again.';
  }
  return '';
}

// "Render" the game. Update the content of the page to reflect any changes to the game state.
function render() {
  var playfield = document.getElementById('playfield');
  var html = '';
  for (var row = 0; row < ROWS_COUNT; row++) {
    html += '<div class="row">';
    for (var col = 0; col < COLS_COUNT; col++) {
      var cell = cells[row][col];
      var cellText = '';
      var cssClass = '';
      var textColor = '';
      if (cell.discovered || CHEAT_REVEAL_ALL || defeat) {
        cssClass = 'discovered';
        if (cell.isBomb) {
          cellText = '💣';
        } else {
          var adjBombs = countAdjacentBombs(row, col);
          if (adjBombs > 0) {
            cellText = adjBombs.toString();
            if (adjBombs == 1) {
              textColor = 'blue';
            } else if (adjBombs == 2) {
              textColor = 'green';
            } else if (adjBombs == 3) {
              textColor = 'red';
            } else if (adjBombs == 4) {
              textColor = 'black';
            }
          }
        }
      } else {
        if (cell.hasBeenFlagged) {
          cellText = '🚩';
        }
      }
      html += `<div class="cell ${cssClass}" style="color:${textColor}" onclick="onCellClicked(${row}, ${col}, event)">${cellText}</div>`;
    }
    html += '</div>';
  }
  playfield.innerHTML = html;

  // Defeat screen
  var body = document.getElementsByTagName('body')[0];
  if (defeat) {
    body.classList.add('defeat');
  }

  // Victory screen
  if (victory) {
    body.classList.add('victory');
  }

  // Update stats
  document.getElementById('bombs-count').innerText = getBombsCount().toString();
  document.getElementById('cleared-cells-count').innerText =
    getClearedCells().toString();
  document.getElementById('total-cells-to-clear').innerText =
    getTotalCellsToClear().toString();

  // Update message
  document.getElementById('message').innerHTML = getMessage();
}

// This function gets called each time a cell is clicked. Arguments "row" and "col" will be set to the relevant
// values. Argument "event" is used to check if the shift key was held during the click.
function onCellClicked(row, col, event) {
  if (event.shiftKey) {
    flagCell(row, col);
  } else {
    /* discoverCell(row, col); */
    handleClick(row, col);
  }
  checkForVictory();
  render();
}
