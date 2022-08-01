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
// variabile globale contenente la posizione delle bombe
let bombsArray = [];

/*******************************************
    funzione di avvio del gioco
*******************************************/
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
    // const bombsArray = getBombsArray(bombsNum, cellsNum);
    bombsArray = getBombsArray(bombsNum, cellsNum);
    console.log(bombsArray);

    // inserisco le bombe
    // insertBombs(bombsArray, myGrid);

    // TODO: la matrice dovrebbe essere superflua qua... bisogna quindi chiamare addHandler su myGrid e modificare la funziona di conseguenza - DA VERIFICARE

    // Creo una matrice
    const matrix = createMatrix(rowNum, myGrid);
    // console.log(matrix);

    // matrix[x,y] es:
    // console.log(matrix[0][5]);

    // aggiungo il clickHandler a tutti gli elementi della griglia
    addHandler(matrix);

}

/*******************************************
    funzione che crea la griglia
*******************************************/
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

        cell.dataset.myCell = i;

        //TODO: DA AGGIUNGERE PER CHEATTARE CON LA CONSOLE!!!
        // cell.innerHTML = i + 1;

        // appendere elemento al tabellone
        tableContainer.append(cell);
        grid.push(cell);
    }

    return grid;
}

/*******************************************
    funzione che crea l'elemento casella
*******************************************/
function getSquareElement() {
    const square = document.createElement('div');
    square.classList.add('square');
    // aggancia evento click
    // square.addEventListener('click', clickHandler);
    return square;
}

/*******************************************
    funzione che gestisce il click
*******************************************/
function clickHandler(e) {
    // console.log(e.composedPath()[1]);
    // console.log(this);

    // TODO: NON POSSO passare parametri, altrimenti il remove listener è IMPOSSIBILE!!!!! @MAURO
    // HO PROVATO in tutti i modi dell'internette
    // mi serve: matrix, x, y

    const dim = parseInt(document.querySelector('select').value);
    // console.log(dim);

    const row = dim ** 2;
    // console.log(row);

    const grid = [];
    for (let i = 0; i < e.composedPath()[1].childNodes.length; i++) {
        grid[i] = e.composedPath()[1].childNodes[i];
    }
    // console.log(grid);

    // matrix recuperato
    const matrix = createMatrix(dim, grid);
    // console.log((parseInt(matrix[0][0].dataset.myCell)));

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
    if (bombsArray.includes(parseInt(matrix[x][y].dataset.myCell))) {
        statusImg.src = "img/sad.png"
        matrix[x][y].innerHTML = '&#128163';
        matrix[x][y].classList.add('bomb')
        revealAll(matrix);
        clearGame();
    } else { // altrimenti svelo l'area adiacente senza bombe
        revealArea(matrix, x, y);
    }

    // scrivo in console il numero della cella
    // console.log(square.innerHTML);

    // dobbiamo far sì che una volta partita la funzione venga rimosso l'evento
    matrix[x][y].removeEventListener('click', clickHandler);
}

/*******************************************
    funzione che rimuove gli eventi
*******************************************/
function clearGame() {
    // so che se non è vuoto, tutti gli elementi avranno ALMENO la classe square
    const squareElements = document.querySelectorAll('.square');
    // console.log(squareElements.length);

    // PER OGNI elemento square, rimuovo l'evento click
    for (let i = 0; i < squareElements.length; i++) {
        squareElements[i].removeEventListener('click', clickHandler);
        // console.dir(squareElements[i]);
    }
}

/*******************************************
    funzione che genera il numero di bombe
    presenti
*******************************************/
const getBombsNum = (dim) => {
    if (dim == 10) {
        return dim;
    } else if (dim == 15) {
        return dim * 2;
    } else {
        return dim * 3;
    }
    // console.log("NUMERO: ", bombsNum);
}

/*******************************************
    funzione che genera un array con la
    posizione delle bombe
*******************************************/
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

/*******************************************
    funzione di supporto al filtro per
    eliminare doppioni da un array
*******************************************/
const unique = (value, index, self) => {
    return self.indexOf(value) === index;
}

// function insertBombs(bombs, grid) {
//     for (let i = 0; i < grid.length; i++) {
//         for (let j = 0; j < bombs.length; j++) {
//             if (bombs[j] === i) {
//                 grid[i].classList.add('bomb');
//                 // console.log(grid[i]);
//             }
//         }
//     }

//     //TODO: SUPERFLUO - PER CHEATTARE
//     // stampo in console dove sono le bombe
//     for (let i = 0; i < bombs.length; i++) {
//         console.log((bombs[i] + 1));
//     }
// }

/*******************************************
    funzione che trasforma una griglia
    in una matrice
*******************************************/
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

    // for (let x = 0; x < row; x++) {
    //     for (let y = 0; y < row; y++) {
    //         console.log((parseInt(matrixX[x][y].dataset.myCell)));
    //     }
    // }
    return matrixX;
}

/*******************************************
    funzione che aggiunge gli event
    a tutti gli elementi
*******************************************/
function addHandler(matrix) {
    for (let x = 0; x < matrix.length; x++) {
        for (let y = 0; y < matrix.length; y++) {
            // matrix[x][y].addEventListener('click', function () {
            //     clickHandler(matrix, x, y);
            // });
            // console.log(matrix[x][y]);
            matrix[x][y].addEventListener('click', clickHandler);

            // implemento la bandierina col click destro
            matrix[x][y].addEventListener('contextmenu', function (ev) {
                ev.preventDefault();

                if (!this.classList.contains('clicked')) {
                    if (this.innerHTML == '') {
                        this.innerHTML = '&#9873;';
                    } else {
                        this.innerHTML = '';
                    }
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

/*******************************************
    funzione che gestisce il rivelamento
    degli elementi adiacenti
*******************************************/
function revealArea(matrix, x, y) {
    let counter = 0;
    // console.log(counter);
    // in ogni caso, se sto controllando, rivelo la casella
    // console.log(matrix[x][y].classList);
    matrix[x][y].classList.add('clicked');
    // console.log(!matrix[x][y].classList.contains('clicked'));


    // matrix[x][y].classList.add('checked');

    //decremento contatore celle da rivelare
    bombsNumElement.innerHTML -= 1;
    // SE arrivo a 0 => VITTORIA
    if (bombsNumElement.innerHTML == 0) {
        clearGame();
        statusImg.src = "img/cool.png";
        bombsNumElement.innerHTML = "Hai vinto!";
        revealAll(matrix);
    }

    // controllo a riga -1, riga e riga+1
    for (let i = x - 1; i <= x + 1; i++) {
        if (i >= 0 && i < matrix.length) {
            // controllo a colonna -1, colonna e colonna+1
            for (let j = y - 1; j <= y + 1; j++) {
                if (j >= 0 && j < matrix.length) {
                    if (bombsArray.includes(parseInt(matrix[i][j].dataset.myCell))) {
                        counter++;
                    }
                    // console.log(bombsArray.includes(parseInt(matrix[x][y].dataset.myCell)));

                }
            }
        }
    }
    console.log(counter);

    // in ogni caso, se sto controllando, inserisco il risultato del conteggio bombe adiacenti nella casella
    matrix[x][y].innerHTML = counter;
    // console.log(matrix.length);

    // controllo a riga -1, riga e riga+1
    for (let i = x - 1; i <= x + 1; i++) {
        // SE l'indice esiste
        if (i >= 0 && i < matrix.length) {
            // controllo a colonna -1, colonna e colonna+1
            for (let j = y - 1; j <= y + 1; j++) {
                // SE l'indice esiste
                if (j >= 0 && j < matrix.length) {
                    // SE non è se stesso (altrimenti va in loop)
                    // E SE non contiente la classe clicked (loop di nuovo - cella già controllata)
                    if ((i !== x || j !== y) && !matrix[i][j].classList.contains('clicked')) {
                        // SE non ha bombe dintorno
                        if (counter === 0) {
                            // console.log((i !== x || j !== y) && !matrix[i][j].classList.contains('clicked'));
                            // console.log(counter);
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
            if (bombsArray.includes(parseInt(matrix[x][y].dataset.myCell))) {
                matrix[x][y].innerHTML = '&#128163';
                matrix[x][y].classList.add('bomb')
            }
            matrix[x][y].classList.add('clicked');
        }
    }
}