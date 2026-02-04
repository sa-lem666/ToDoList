// Card sets for different difficulty levels
const allLetters = {
    8: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6'],
    4: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    6: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']
};

// Game state variables
let letters = [];
let shuffledLetters = [];
let flippedCards = [];
let matchedCards = [];
let moves = 0;
let time = 0;
let timerInterval = null;
let canFlip = true;

function getDifficulty() {
    return document.getElementById('difficulty').value;
}

// Save game state to localStorage
function saveGameState() {
    const gameState = {
        difficulty: getDifficulty(),
        shuffledLetters,
        matchedCards,
        moves,
        time
    };
    localStorage.setItem('memoryGameState', JSON.stringify(gameState));
}

// Load game state from localStorage
function loadGameState() {
    const saved = localStorage.getItem('memoryGameState');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Initialize or restore game
function newGame() {
    const savedState = loadGameState();
    let difficulty;

    if (savedState) {
        // Restore previous game state
        difficulty = savedState.difficulty;
        shuffledLetters = savedState.shuffledLetters;
        matchedCards = savedState.matchedCards;
        moves = savedState.moves;
        time = savedState.time;
        document.getElementById('difficulty').value = difficulty;
    } else {
        // Start new game
        difficulty = getDifficulty();
        letters = allLetters[difficulty];
        shuffledLetters = [...letters].sort(() => Math.random() - 0.5);
        matchedCards = [];
        moves = 0;
        time = 0;
    }
    
    flippedCards = [];
    canFlip = true;
    letters = allLetters[difficulty];

    clearInterval(timerInterval);

    document.getElementById('moves').textContent = moves;
    document.getElementById('timer').textContent = time;

    updateGridLayout(difficulty);
    createCards();

    // Restore visual state of matched cards
    matchedCards.forEach(index => {
        const card = document.querySelector(`[data-index="${index}"]`);
        if (card) {
            card.classList.add('matched');
            card.classList.add('flipped');
        }
    });

    if (matchedCards.length < letters.length) {
        startTimer();
    }
}

function updateGridLayout(difficulty) {
    const cardsContainer = document.getElementById('cardsContainer');
    cardsContainer.style.gridTemplateColumns = `repeat(${difficulty}, 1fr)`;
}

function createCards() {
    const cardsContainer = document.getElementById('cardsContainer');
    cardsContainer.innerHTML = '';

    shuffledLetters.forEach((letter, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        card.dataset.letter = letter;

        const frontFace = document.createElement('div');
        frontFace.classList.add('front-face');
        frontFace.textContent = '?';

        const backFace = document.createElement('div');
        backFace.classList.add('back-face');
        backFace.textContent = letter;

        card.appendChild(frontFace);
        card.appendChild(backFace);

        card.addEventListener('click', flipCard);

        cardsContainer.appendChild(card);
    });
}

// Handle card flip and check for matches
function flipCard(e) {
    if (!canFlip) return;

    const card = e.currentTarget;
    const index = card.dataset.index;

    if (flippedCards.includes(index) || matchedCards.includes(index)) {
        return;
    }

    card.classList.add('flipped');
    flippedCards.push(index);

    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;
        saveGameState();
        checkMatch();
    }
}

function checkMatch() {
    canFlip = false;

    const [firstIndex, secondIndex] = flippedCards;
    const firstLetter = shuffledLetters[firstIndex];
    const secondLetter = shuffledLetters[secondIndex];

    if (firstLetter === secondLetter) {
        matchedCards.push(firstIndex, secondIndex);

        document.querySelector(`[data-index="${firstIndex}"]`).classList.add('matched');
        document.querySelector(`[data-index="${secondIndex}"]`).classList.add('matched');

        flippedCards = [];
        canFlip = true;

        if (matchedCards.length === letters.length) {
            clearInterval(timerInterval);
            setTimeout(() => {
                alert(`Congratulations! You won in ${moves} moves and ${time} seconds!`);
            }, 500);
        }
    } else {
        setTimeout(() => {
            document.querySelector(`[data-index="${firstIndex}"]`).classList.remove('flipped');
            document.querySelector(`[data-index="${secondIndex}"]`).classList.remove('flipped');
            flippedCards = [];
            canFlip = true;
        }, 1000);
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        time++;
        document.getElementById('timer').textContent = time;
        saveGameState();
    }, 1000);
}

// Clear saved game when starting fresh
function clearSavedGame() {
    localStorage.removeItem('memoryGameState');
}

document.addEventListener('DOMContentLoaded', newGame);