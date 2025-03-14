// variables

const player1 = {
    type: 'player1',
    color: 'red'
}
const player2 = {
    type: 'player2',
    color: 'yellow'
}
let currentPlayer = player1;

const rows = 6;
const cols = 7;
const gameBoard = document.getElementById("game-board");

// create board
// block-scoped = awesome apparently
for (let col = 0; col < cols; col++) {
    const column = document.createElement("div");
    column.classList.add("column");
    column.dataset.col = col;

    column.addEventListener("click", () => dropToken(col));

    for (let row = 0; row < rows; row++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = row;
        column.appendChild(cell);
    }

    gameBoard.appendChild(column);
}

function dropToken(selectedColumn) {
    // select items with column class, with the data-col = whatever the column number inputted into the function was
    // then select cells inside
    const columnCells = document.querySelectorAll(`.column[data-col="${selectedColumn}"] .cell`);
    
    // for each cell in column
    for (i = columnCells.length - 1; i >= 0; i--) {
        if (!columnCells[i].classList.contains('occupied')) {
            columnCells[i].style.backgroundColor = currentPlayer.color;
            columnCells[i].classList.add('occupied', currentPlayer.type);

            currentPlayer = (currentPlayer === player1) ? player2 : player1;
            break;
        }
    }
}