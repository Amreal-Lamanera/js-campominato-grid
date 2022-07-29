// console.log('ok');

// recupero tasto play dal DOM
const play = document.querySelector("input[type='submit']");
// console.log(play);

// avvio il gioco al click
play.addEventListener('click', playGame);

// recupero statusImg
const statusImg = document.getElementById('statusImg');
// recupero dove inserire numero di spazi liberi
const toRevealElement = document.getElementById('toReveal');
// console.log(toRevealElement);
const bombsNumElement = document.getElementById('bombsNum');

// funzione di avvio del gioco
function playGame() {
    // console.log("gioca");

    // rivelo il contatore
    toRevealElement.classList.remove('d-none');

    // rendo visibile status img
    statusImg.src = "img/smile.png";
    statusImg.style.display = "block";
    // console.dir(statusImg);


    // recupero difficoltà dal DOM
    let rowNum = parseInt(document.querySelector('select').value);

    // riferimento griglia dal DOM
    let tableContainerElement = document.querySelector('.tableContainer');
    // console.log(tableContainerElement);

    // imposto lo stile in base alla difficoltà
    tableContainerElement.style.gridTemplateColumns = `repeat(${rowNum},1fr)`;


    const cellsNum = rowNum ** 2;

    // Creo la griglia in html
    const myGrid = createGrid(cellsNum, tableContainerElement);
    // console.log(myGrid);


    let bombsNum = getBombsNum(rowNum);
    // console.log(bombsNum);

    // metto nel DOM il numero di caselle libere
    bombsNumElement.innerHTML = cellsNum - bombsNum

    // genero un array di numeri random
    const bombsArray = getBombsArray(bombsNum, cellsNum);
    // console.log(bombsArray);

    // inserisco le bombe
    insertBombs(bombsArray, myGrid);

    // Creo una matrice
    const matrix = createMatrix(rowNum, myGrid);
    // console.log(matrix);

    // matrix[x,y] es:
    // console.log(matrix[0][5]);

    // aggiungo il clickHandler a tutti gli elementi della griglia
    addHandler(matrix);

}

// funzione che crea la griglia
function createGrid(dim, tableContainer) {
    // console.log(tableContainer.innerHTML);

    // creo l'array da ritornare
    const grid = [];
    // problema, anche svuotando gli event listner del gioco precedente rimangono attivi - problemi di performance dopo molti new game
    // => SE table container non è vuoto chiamo clearGame e svuoto
    if (tableContainer.innerHTML != '') {
        clearGame();
        tableContainer.innerHTML = '';
    }

    // console.log('OK', dim, tableContainer);

    // PER OGNI ciclo generare elemento html (square) e lo inserisco nel DOM
    for (let i = 0; i < dim; i++) {
        const cell = getSquareElement();

        //TODO: DA AGGIUNGERE PER CHEATTARE CON LA CONSOLE!!!
        // cell.innerHTML = i + 1;

        // appendere elemento al tabellone
        tableContainer.append(cell);
        grid.push(cell);
    }

    return grid;
}

// funzione che crea l'elemento casella
function getSquareElement() {
    const square = document.createElement('div');
    square.classList.add('square');
    // aggancia evento click
    // square.addEventListener('click', clickHandler);
    return square;
}

// funzione che gestisce il click
function clickHandler(e) {
    // console.log(e.path[1].childNodes[0]);
    // console.log(this);

    // TODO: NON POSSO passare parametri, altrimenti il remove listener è IMPOSSIBILE!!!!! @MAURO
    // HO PROVATO in tutti i modi dell'internette
    // mi serve: matrix, x, y

    const dim = parseInt(document.querySelector('select').value);
    // console.log(dim);

    const row = dim ** 2;
    // console.log(row);

    const grid = [];
    for (let i = 0; i < e.path[1].childNodes.length; i++) {
        grid[i] = e.path[1].childNodes[i];
    }
    // console.log(grid);

    // matrix recuperato
    const matrix = createMatrix(dim, grid);
    // console.log(matrix[0][0]);

    let x;
    let y;

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            if (matrix[i][j] == this) {
                // console.log(matrix[i][j]);
                x = i;
                y = j;
                break;
            }
        }
    }
    // console.log(x, y);

    // aggiungo classe clicked in ogni caso
    matrix[x][y].classList.toggle('clicked');

    // console.log(matrix[x][y].classList);


    // controllo se ho trovato una bomba
    if (matrix[x][y].classList[1] == 'bomb') {
        statusImg.src = "img/sad.png"
        matrix[x][y].innerHTML = '&#128163';
        revealAll(matrix);
        clearGame();
    } else { // altrimenti velo l'area adiacente senza bombe
        revealArea(matrix, x, y);
    }

    // scrivo in console il numero della cella
    // console.log(square.innerHTML);

    // dobbiamo far sì che una volta partita la funzione venga rimosso l'evento
    matrix[x][y].removeEventListener('click', clickHandler);
}

// funzione che "pulisce" il gioco all'avvio di un new game
function clearGame() {
    // nascondo le scritte
    // toRevealElement.classList.add('d-none');

    // so che se non è vuoto, tutti gli elementi avranno ALMENO la classe square
    const squareElements = document.querySelectorAll('.square');
    // console.log(squareElements.length);

    // PER OGNI elemento square, rimuovo l'evento click
    for (let i = 0; i < squareElements.length; i++) {
        squareElements[i].removeEventListener('click', clickHandler);
        // console.dir(squareElements[i]);
    }
}

// funzione di supporto al filtro per eliminare doppioni da un array
const unique = (value, index, self) => {
    return self.indexOf(value) === index;
}

// funzione che genera il numero di bombe presenti
const getBombsNum = (dim) => {
    if (dim == 7) {
        return dim;
    } else if (dim === 9) {
        return dim * 2;
    } else {
        return dim * 3;
    }
    // console.log("NUMERO: ", bombsNum);
}

// funzione che genera un array con la posizione delle bombe
const getBombsArray = (dim, num) => {
    const array = [];
    for (let i = 0; i < dim; i++) {
        array[i] = Math.floor(Math.random() * num);
        // SE elemento ripetuto, ripeto il ciclo decrementando i
        // TODO: trovata su internet, non so come funzioni...
        const uniqueBombs = array.filter(unique);
        if (array.length > uniqueBombs.length) {
            i--;
        }
    }
    return array;
}

function insertBombs(bombs, grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < bombs.length; j++) {
            if (bombs[j] === i) {
                grid[i].classList.add('bomb');
                // console.log(grid[i]);
            }
        }
    }

    //TODO: SUPERFLUO - PER CHEATTARE
    // stampo in console dove sono le bombe
    for (let i = 0; i < bombs.length; i++) {
        console.log((bombs[i] + 1));
    }
}

// funzione che trasforma una griglia in una matrice
function createMatrix(row, grid) {
    const matrixX = [];
    let index = 0;
    for (let x = 0; x < row; x++) {
        const matrixY = [];
        for (let y = 0; y < row; y++) {
            matrixY[y] = grid[index++];

        }
        matrixX.push(matrixY);
    }
    return matrixX;
}

function addHandler(matrix) {
    for (let x = 0; x < matrix.length; x++) {
        for (let y = 0; y < matrix.length; y++) {
            // matrix[x][y].addEventListener('click', function () {
            //     clickHandler(matrix, x, y);
            // });
            // console.log(matrix[x][y]);
            matrix[x][y].addEventListener('click', clickHandler);
            // TODO: implemento la bandierina che rimarrà attiva anche a gioco finito
            matrix[x][y].addEventListener('contextmenu', function (ev) {
                ev.preventDefault();
                if (this.innerHTML == '') {
                    this.innerHTML = '&#9873;';
                } else {
                    this.innerHTML = '';
                }
                return false;
            }, false);
        }
    }
}

// const handler = function (matrix, x, y) {
//     return function removeHandler() {
//         clickHandler(matrix, x, y);
//     }

// }

function revealArea(matrix, x, y) {
    let counter = 0;
    // console.log(counter);
    matrix[x][y].classList.add('clicked');
    matrix[x][y].classList.add('checked');
    bombsNumElement.innerHTML -= 1;
    if (bombsNumElement.innerHTML == 0) {
        clearGame();
        statusImg.src = "img/cool.png";
        bombsNumElement.innerHTML = "Hai vinto!";
        revealAll(matrix);
    }

    // controllo a riga -1, riga e riga+1
    for (let i = x - 1; i <= x + 1; i++) {
        // controllo a colonna -1, colonna e colonna+1
        if (i >= 0 && i < matrix.length) {
            for (let j = y - 1; j <= y + 1; j++) {
                if (j >= 0 && j < matrix.length) {
                    if (matrix[i][j].classList[1] === 'bomb') {
                        counter++;
                        // console.log(counter);
                    }
                    // console.log(matrix[i][j].classList, (matrix[i][j].classList.length - 1));

                    // else {
                    //     revealArea(matrix, i, y)
                    // }
                }
            }
        }
    }
    // console.log(counter);

    matrix[x][y].innerHTML = counter;
    // console.log(matrix.length);

    for (let i = x - 1; i <= x + 1; i++) {
        // controllo a colonna -1, colonna e colonna+1
        if (i >= 0 && i < matrix.length) {
            for (let j = y - 1; j <= y + 1; j++) {
                if (j >= 0 && j < matrix.length) {
                    if ((i !== x || j !== y) && matrix[i][j].classList[matrix[i][j].classList.length - 1] !== 'checked') {
                        if (counter === 0) {
                            revealArea(matrix, i, j)
                        }
                        // console.log(i, j, x, y);
                        // console.dir(matrix[i][j].classList);
                        // console.log(matrix[i][j]);
                    }
                }
            }
        }
    }
}

function revealAll(matrix) {
    for (let x = 0; x < matrix.length; x++) {
        for (let y = 0; y < matrix.length; y++) {
            if (matrix[x][y].classList[matrix[x][y].classList.length - 1] == 'bomb') {
                matrix[x][y].innerHTML = '&#128163';
            }
            matrix[x][y].classList.add('clicked');
        }
    }
}