const monsterHealthBar = document.getElementById('monster-health');
const playerHealthBar = document.getElementById('player-health');
const bonusLifeEl = document.getElementById('bonus-life');

const attackBtn = document.getElementById('attack-btn');
const strongAttackBtn = document.getElementById('strong-attack-btn');
const healBtn = document.getElementById('heal-btn');
const logBtn = document.getElementById('log-btn');

//Global Constants
const ATTACK_VALUE = 10; 
const MONSTER_ATTACK_VALUE = 14;
const STRONG_ATTACK_VALUE = 20;
const MODE_ATTACK = 'ATTACK';
const MODE_STRONG_ATTACK = 'STRONG_ATTACK';
const HEAL_VALUE = 10;
const LOG_EVENT_PLAYER_ATTACK = 'PLAYER_ATTACK';
const LOG_EVENT_PLAYER_STRONG_ATTACK = 'PLAYER_STRONG_ATTACK';
const LOG_EVENT_MONSTER_ATTACK = 'MONSTER_ATTACK';
const LOG_EVENT_PLAYER_HEAL = 'PLAYER_HEAL';
const LOG_EVENT_GAME_OVER = 'GAME_OVER';

let battleLog = [];
let lastLoggedEntry;

function getMaxLifeValues() {
    const userEnteredValue = prompt('Maximum life for you and the monster.', '100');
    let parsedValue = parseInt(userEnteredValue);
    if (isNaN(parsedValue) || parsedValue <= 0) {
        throw { message: 'Invalid user input, not a number!' };
    }
    return parsedValue;
}

let chosenMaxLife;

try {
    chosenMaxLife = getMaxLifeValues();
} catch (error) {
    console.log(error);
    chosenMaxLife = 100;
    alert('You entered something wrong, default 100.');
}

let currentMonsterHealth = chosenMaxLife;
let currentPlayerHealth = chosenMaxLife;
let hasBonusLife = true;

function adjustHealthBars(maxLife) {
    monsterHealthBar.max = maxLife;
    monsterHealthBar.value = maxLife;
    playerHealthBar.max = maxLife;
    playerHealthBar.value = maxLife;
}

adjustHealthBars(chosenMaxLife);


function writeToLog(ev, val, playerHealth, monsterHealth) {
    let logEntry = {
        event: ev,
        hitPoints: val,
        finalPlayerHealth: playerHealth,
        finalMonsterHealth: monsterHealth
    };
    switch (ev) {
    case LOG_EVENT_PLAYER_ATTACK:
        logEntry.target = 'MONSTER';
        break;
    case LOG_EVENT_PLAYER_STRONG_ATTACK:
        logEntry.target = 'MONSTER';
        break;
    case LOG_EVENT_MONSTER_ATTACK:
        logEntry.target = 'PLAYER';
        break;
    case LOG_EVENT_PLAYER_HEAL:
        logEntry.target = 'PLAYER';
        break;
    case LOG_EVENT_GAME_OVER:
        logEntry = {
            event: ev,
            result: val,
            finalPlayerHealth: playerHealth,
            finalMonsterHealth: monsterHealth
        };
        break;
    }
    battleLog.push(logEntry);
}

function dealMonsterDamage(damage) {
    const dealtDamage = Math.random() * damage;
    monsterHealthBar.value = +monsterHealthBar.value - dealtDamage;
    return dealtDamage;
}

function dealPlayerDamage(damage) {
    const dealtDamage = Math.random() * damage;
    playerHealthBar.value = +playerHealthBar.value - dealtDamage;
    return dealtDamage;
}

function increasePlayerHealth(healValue) {
    playerHealthBar.value = +playerHealthBar.value + healValue;
}

function resetGame(value) {
    playerHealthBar.value = value;
    monsterHealthBar.value = value;
}

function removeBonusLife() {
    bonusLifeEl.parentNode.removeChild(bonusLifeEl);
}

function setPlayerHealth(health) {
    playerHealthBar.value = health;
}

function reset() {
    currentMonsterHealth = chosenMaxLife;
    currentPlayerHealth = chosenMaxLife;
    resetGame(chosenMaxLife);
}

// Event-handlers //
function endRound() {
    const initialPlayerHealth = currentPlayerHealth;
    const playerDamage = dealPlayerDamage(MONSTER_ATTACK_VALUE);
    currentPlayerHealth -= playerDamage;
    writeToLog(
        LOG_EVENT_MONSTER_ATTACK, 
        playerDamage, 
        currentMonsterHealth, 
        currentPlayerHealth
    );

    if (currentPlayerHealth <= 0 && hasBonusLife) {
        hasBonusLife = false;
        removeBonusLife();
        currentPlayerHealth = initialPlayerHealth;
        setPlayerHealth(initialPlayerHealth);
        alert('You would be dead, but you\'re bonus life saved you!');
    }

    if (currentMonsterHealth <= 0 && currentPlayerHealth > 0) {
        alert('You win!!');
        writeToLog(
            LOG_EVENT_GAME_OVER, 
            'PLAYER WON', 
            currentMonsterHealth, 
            currentPlayerHealth
        );
    } else if (currentPlayerHealth <= 0 && currentMonsterHealth > 0) {
        alert('You loose...');
        writeToLog(
            LOG_EVENT_GAME_OVER, 
            'MONSTER WON', 
            currentMonsterHealth, 
            currentPlayerHealth
        );
    } else if (currentPlayerHealth <= 0 && currentMonsterHealth <= 0) {
        alert('It\'s a draw...');
        writeToLog(
            LOG_EVENT_GAME_OVER, 
            'A DRAW', 
            currentMonsterHealth, 
            currentPlayerHealth
        );
    }

    if (currentMonsterHealth <= 0 || currentPlayerHealth <= 0) {
        reset();
    }
}

function attackMonster (mode) {
    const maxDamage = 
        mode === MODE_ATTACK 
            ? ATTACK_VALUE 
            : STRONG_ATTACK_VALUE;
    const logEvent = 
        mode === MODE_ATTACK
            ? LOG_EVENT_PLAYER_ATTACK
            : LOG_EVENT_PLAYER_STRONG_ATTACK;
    const damage = dealMonsterDamage(maxDamage);
    currentMonsterHealth -= damage;
    writeToLog(
        logEvent, 
        damage, 
        currentMonsterHealth, 
        currentPlayerHealth
    );
    endRound();
}



function attackHandler() {
    attackMonster(MODE_ATTACK);
}

function strongAttackHandler() {
    attackMonster(MODE_STRONG_ATTACK);
}

function healHandler() {
    // eslint-disable-next-line no-unused-vars
    let healValue;
    if (currentPlayerHealth >= chosenMaxLife - HEAL_VALUE) {
        alert('You can\'t heal more than your max initial heath!');
        healValue = chosenMaxLife - currentPlayerHealth;
    } else {
        healValue = HEAL_VALUE; 
    }
    increasePlayerHealth(HEAL_VALUE);
    currentPlayerHealth += HEAL_VALUE;
    writeToLog(
        LOG_EVENT_PLAYER_HEAL, 
        healValue, 
        currentMonsterHealth, 
        currentPlayerHealth
    );
    endRound();
}

function printLogHandler() {
    let i = 0;
    for (const logEntry of battleLog) {
        if(!lastLoggedEntry && lastLoggedEntry !== 0 || lastLoggedEntry < i) {
            console.log(`#${i}`);
            for (const key in logEntry) {
                console.log(`${key} => ${logEntry[key]}`);
            }
            lastLoggedEntry = i;
            break;
        }
        i++;
    }
}

attackBtn.addEventListener('click', attackHandler);
strongAttackBtn.addEventListener('click', strongAttackHandler);
healBtn.addEventListener('click', healHandler);
logBtn.addEventListener('click', printLogHandler);
