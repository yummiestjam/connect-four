// variables -----------------------------------------------------------------------------------------------------------
// player variables
const player1 = {
    type: 'player1',
    color: 'red',
    hover: '#ff9797'
}
const player2 = {
    type: 'player2',
    color: 'yellow',
    hover: '#fff09b'
}
let currentPlayer = player1;

// board variables
const rows = 6;
const cols = 7;
const gameBoard = document.getElementById("game-board");

// move counter, used to check for draws
let numMoves = 0;

// game state
let gameIsRunning = true;

// create board -------------------------------------------------------------------------------------------------------
for (let col = 0; col < cols; col++) {
    const column = document.createElement("div");
    column.classList.add("column");
    column.dataset.col = col;

    column.addEventListener("mouseenter", () => addHoverToken(col));
    column.addEventListener("mouseleave", () => clearHoverToken(col));
    column.addEventListener("click", () => dropToken(col));

    for (let row = 0; row < rows; row++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = row;
        column.appendChild(cell);
    }

    gameBoard.appendChild(column);
}

// prepare popups ------------------------------------------------------------------------------------------------
const popup = document.getElementById('result-popup');
const resultMsg = document.getElementById('result');
const btnReplay = document.getElementById('replay');
const btnViewBoard = document.getElementById('view-board');

const alertPopup = document.getElementById('alert-popup');

let popupIsHidden = false;

// hide popup
popup.style.display = "none";

btnReplay.addEventListener("click", () => {
    event.stopPropagation; // for a bug where clicking replay over a full column would trigger showAlert() while resetting
    resetGame();
})

btnViewBoard.addEventListener("click", () => {
    popup.style.display = "none";
    popupIsHidden = true;
})

let clicksSinceHidden = 0;
document.addEventListener("click", () => {
    if (popupIsHidden) {
        clicksSinceHidden++;
        if (clicksSinceHidden == 2) {
            popup.style.display = "flex";
            popupIsHidden = false;
            clicksSinceHidden = 0;
        }
    }
})

// full column alert
alertPopup.style.display = "none";
function showAlert() {
    alertPopup.style.display = "flex";
    alertPopup.classList.remove('alert-fade'); // remove just in case it's still going

    void alertPopup.offsetWidth; // something about reflows? interesting explanation here https://stackoverflow.com/questions/60686489/what-purpose-does-void-element-offsetwidth-serve

    alertPopup.classList.add('alert-fade');

    alertPopup.addEventListener('animationend', function resetAlert() {
        alertPopup.classList.remove('alert-fade');
        alertPopup.style.display = "none";
        alertPopup.removeEventListener('animationend', resetAlert);
    })
}

// game functions and logic -------------------------------------------------------------------------------------------
function addHoverToken(selectedColumn) {
    const columnCells = document.querySelectorAll(`.column[data-col="${selectedColumn}"] .cell`);
    
    if (gameIsRunning) {
        // for each cell in column
        for (i = columnCells.length - 1; i >= 0; i--) {
            if (!columnCells[i].classList.contains('occupied')) {
                columnCells[i].style.backgroundColor = currentPlayer.hover;
                break;
            }
        }
    }
}

function clearHoverToken(selectedColumn) {
    const columnCells = document.querySelectorAll(`.column[data-col="${selectedColumn}"] .cell`);
    
    if (gameIsRunning) {
        // for each cell in column
        for (i = columnCells.length - 1; i >= 0; i--) {
            if (!columnCells[i].classList.contains('occupied')) {
                columnCells[i].style.backgroundColor = "";
                break;
            }
        }
    }
}

function dropToken(selectedColumn) {
    // select items with column class, with the data-col = whatever the column number inputted into the function was
    // then select cells inside
    const columnCells = document.querySelectorAll(`.column[data-col="${selectedColumn}"] .cell`);
    let tokenWasPlaced = false;
    
    if (gameIsRunning) {
        // for each cell in column
        for (i = columnCells.length - 1; i >= 0; i--) {
            if (!columnCells[i].classList.contains('occupied')) {
                columnCells[i].style.backgroundColor = currentPlayer.color;
                columnCells[i].classList.add('occupied', currentPlayer.type);
                numMoves++;
                tokenWasPlaced = true
                endTurn();
                break;
            }
        }
    }

    if (!tokenWasPlaced) {
        showAlert();
    }
}

function endTurn() {
    // console.log(numMoves);
    if (checkWin()) { // if game is not yet won, switch turn
        resultMsg.innerHTML = currentPlayer.type == "player1" ? "Player 1 Wins!" : "Player 2 Wins!";
        endGame();
    } else if (numMoves >= rows * cols) {
        resultMsg.innerHTML = `It's a draw!`;
        endGame();
    } else {
        currentPlayer = (currentPlayer === player1) ? player2 : player1;
    }
}

function checkWin() {
    // col and row values to add to selected cells' positions, to select next cells 
    // col, row
    const directions = [
        [1, 0], // horiz
        [0, -1], // vert
        [1, 1], // diag down-right
        [1, -1] // diag up-right
    ]

    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            // get cell, by inserting the col and row index into the selector 
            const cell = document.querySelector(`.column[data-col='${col}'] .cell[data-row='${row}']`);
            // console.log(cell); // looks like it outputs every cell

            if (!cell.classList.contains('occupied')) { // if the cell is NOT occupied...
                continue; // nothing here, move on to next iteration
            } else { // if the cell IS occupied...
                // identify player
                const player = cell.classList.contains('player1') ? 'player1' : 'player2';

                // cool syntax for going through an array, name the first and second element "dx" and "dy"
                // so you have a reference to either value in each iteration
                for (let [dx, dy] of directions) {
                    // console.log(dx + " " +  dy);
                    // track number of tokens found in a row
                    let count = 1;

                    // important loop, check the next 3 cells in the current direction in this iteration
                    for (let i = 1; i < 4; i++) {
                        const nextCol = col + dx * i;
                        const nextRow = row + dy * i;
                        // console.log('next position: ' + `col ${nextCol}, row ${nextRow}`);

                        // get next cell, inserting col and row index into selector
                        const nextCell = document.querySelector(`.column[data-col='${nextCol}'] .cell[data-row='${nextRow}']`);

                        if (nextCell && nextCell.classList.contains(player)) {
                            // console.log(`.column[data-col='${nextCol}'] .cell[data-row='${nextRow}']`);
                            // console.log(nextCell);
                            count++;
;                        }
                    }

                    if (count === 4) { return true; }
                }  
                
            }
        }
    }

    // no win? keep playing
    return false;
}

function endGame() {
    gameIsRunning = false;
    popup.style.display = "flex";
}

function resetGame() {
    const cells = document.querySelectorAll(`.cell`);

    cells.forEach(cell => {
        cell.style.backgroundColor = '';
        cell.classList.remove('occupied', 'player1', 'player2');
    })

    numMoves = 0;
    gameIsRunning = true;
    currentPlayer = player1;
    popup.style.display = "none";
}