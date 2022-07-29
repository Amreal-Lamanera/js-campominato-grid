console.log('ok');

// TODO: come editare colonne del grid:
// const prova = document.querySelector('.tableContainer');
// console.log(prova);
// prova.style.gridTemplateColumns = "repeat(10, 1fr)";
// console.log(prova);

// recupero tasto play dal DOM
const play = document.querySelector("input[type='submit']");
console.log(play);

// avvio il gioco al click
play.addEventListener('click', playGame);

function playGame() {
    // console.log("gioca");

    // recupero difficoltà dal DOM
    let diff = document.querySelector('select').value;

    // diff = numero di righe
    // riferimento griglia dal DOM
    let tableContainerElement = document.querySelector('.tableContainer');
    // console.log(tableContainerElement);

    // imposto lo stile in base alla difficoltà
    tableContainerElement.style.gridTemplateColumns = `repeat(${diff}, 1fr)`;


    // Per adesso generiamo una griglia statica - no difficoltà
    createGrid(diff, tableContainerElement)
}

function createGrid(dim, tableContainer) {
    // console.log(tableContainer.innerHTML);

    // problema, anche svuotando gli event listner del gioco precedente rimangono attivi - problemi di performance dopo molti new game
    // => SE table container non è vuoto chiamo clearGame e svuoto
    if (tableContainer.innerHTML != '') {
        clearGame();
        tableContainer.innerHTML = '';
    }
    const cellsNum = dim ** 2;

    // genero un array di numeri random
    const bombsArray = [];
    for (let i = 0; i < dim; i++) {
        bombsArray[i] = Math.floor(Math.random() * cellsNum);
        // SE elemento ripetuto, ripeto il ciclo decrementando i
        // TODO: trovata su internet, non so come funzioni...
        const uniqueBombs = bombsArray.filter(unique);
        if (bombsArray.length > uniqueBombs.length) {
            i--;
        }
    }

    // stampo in console dove sono le bombe
    for (let i = 0; i < dim; i++) {
        console.log((bombsArray[i] + 1));
    }


    // PER OGNI ciclo generare elemento html (square) e lo inserisco nel DOM
    for (let i = 0; i < cellsNum; i++) {
        const cell = getSquareElement();

        // controllo se inserire una bomba casualmente
        for (let j = 0; j < dim; j++) {
            if (bombsArray[j] === i) {
                cell.classList.add('bomb');
            }
        }

        //TODO: da rimuovere
        cell.innerHTML = i + 1;

        // appendere elemento al tabellone
        tableContainer.append(cell);
    }
}

function getSquareElement() {
    const square = document.createElement('div');
    square.classList.add('square');
    // aggancia evento click
    square.addEventListener('click', clickHandler);
    return square;
}

function clickHandler() {
    const square = this;
    square.classList.toggle('clicked');
    // scrivo in console il numero della cella
    console.log(square.innerHTML);

    // dobbiamo far sì che una volta partita la funzione venga rimosso l'evento
    square.removeEventListener('click', clickHandler);
}

function clearGame() {
    // so che se non è vuoto, tutti gli elementi avranno ALMENO la classe square
    const squareElements = document.querySelectorAll('.square');
    // console.log(squareElements.length);

    // PER OGNI elemento square, rimuovo l'evento click
    for (let i = 0; i < squareElements.length; i++) {
        squareElements[i].removeEventListener('click', clickHandler);
        console.dir(squareElements[i]);
    }
}

const unique = (value, index, self) => {
    return self.indexOf(value) === index;
}