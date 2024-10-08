var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';

var gBoard;
var gGamerPos;

let Score = 0;
let gBall = 2;
let interval;

function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);

	Score = 0;
	gBall = 2;
	renderScore(document.getElementById('score'))
	interval= setInterval(addBall, 5000);
}


function buildBoard() {
	// Create the Matrix
	// var board = createMat(10, 12)
	var board = new Array(10);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(12);
	}

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}

			//add holes
			if((i == 0 && j == 5) || (i == board.length - 1 && j == 5) || (i == 4 && j == 0) || (i == 4 && j == board[0].length - 1))
			{
				cell.type = FLOOR;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			//TODO - Change To ES6 template string
			strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	console.log('strHTML is:');
	console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}


// Move the player to a specific location
function moveTo(i, j) {

	var flag = true
	if (i === -1 && j === 5) { 
		i = gBoard.length - 1; 
	} else if (i === gBoard.length  && j === 5) { 
		i = 0;
	} else if (i === 4 && j === -1) { 
		j = gBoard[0].length - 1; 
	} else if (i === 4 && j === gBoard[0].length) { 
		j = 0; 
	} else{
		flag = false
	}


	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((flag === true)||(iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

		if (targetCell.gameElement === BALL) {
			Score++;
			console.log('Collecting!', Score);
			renderScore(document.getElementById('score'))
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);
		setTimeout(() => {
			checkIfWon(); 
		}, "100");


	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	console.log('cellClass:', cellClass);
	return cellClass;
}


// Function to add a ball to a random floor cell
function addBall() {
    var emptyCells = [];
    for (var i = 1; i < gBoard.length - 1; i++) {
        for (var j = 1; j < gBoard[0].length - 1; j++) {
            if (gBoard[i][j].type === FLOOR && gBoard[i][j].gameElement === null) {
                emptyCells.push({ i: i, j: j });
            }
        }
    }

    if (emptyCells.length > 0) {
        var randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        gBoard[randomCell.i][randomCell.j].gameElement = BALL; 
        renderCell(randomCell, BALL_IMG); 
		gBall++;
        console.log('new ball', randomCell); 
    }
}

// render the score
function renderScore(element) {
	element.innerHTML = `Score: ${Score}`;
}

// Check if there are any balls left on the board
function checkIfWon() {
	if(gBall != Score)
	{
		return
	}
    alert('You won!');
	clearInterval(interval);
    
}

// Restart the game
function restart() {
    clearInterval(interval); 
    initGame(); 
}

