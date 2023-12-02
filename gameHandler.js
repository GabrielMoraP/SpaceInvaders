const score = document.querySelector('.score');
const startScreen = document.querySelector('.startScreen');
const gameArea = document.querySelector('.gameArea');
const level = document.querySelector('.level');
const reports = document.querySelector('.report');
const about = document.querySelector('.about');
const aboutTuto = document.querySelector('.about-tuto');

let gameStart = new Audio();
let gameOver = new Audio();
let explosionAudio = new Audio();
let shootAudio = new Audio();
let log = "";
let correctAnswers = "";
let badAnswers = "";
let totalAnswers = "";

gameStart.src = "assets/audio/game.mp3";
gameOver.src = "assets/audio/game_over.mp3";
explosionAudio.src = "assets/audio/explosion.wav";
shootAudio.src = "assets/audio/shoot.wav";

const levelSpeed = { easy: 7, moderate: 10, difficult: 14 };

let keys = {
    W: false,
    A: false,
    S: false,
    D: false,
    w: false,
    a: false,
    s: false,
    d: false,
    Enter: false
};

let player = { speed: 7, score: 0, bullets: [] };

level.addEventListener('click', (e) => {
    player.speed = levelSpeed[e.target.id];
});

reports.addEventListener('click', () => {
    saveReportToFile(log);
});

about.addEventListener('click', () => {
    aboutTuto.classList.remove('hide');
});

aboutTuto.addEventListener('click', () => {
    aboutTuto.classList.add('hide');
});

startScreen.addEventListener('click', () => {
    startGame(0);
});

function startGame(score, x, y) {
    startScreen.classList.add('hide');
    gameArea.innerHTML = "";

    player.start = true;
    player.bullets = [];
    gameStart.play();
    gameOver.pause();
    gameStart.loop = true;
    player.score = score;
    window.requestAnimationFrame(gamePlay);

    for (let i = 0; i < 5; i++) {
        let canvas = document.createElement('div');
        canvas.setAttribute('class', 'canvas');
        canvas.y = (i * 150);
        canvas.style.top = canvas.y + "px";
        gameArea.appendChild(canvas);
    }

    let ship = document.createElement('div');
    ship.setAttribute('class', 'ship');
    ship.style.backgroundImage = 'url("assets/images/nave.gif")';
    gameArea.appendChild(ship);

    if (score == 0) {
        player.x = ship.offsetLeft;
        player.y = ship.offsetTop;
    } else {
        player.x = x;
        player.y = y;
    }

    for (let i = 0; i < 3; i++) {
        let enemy = document.createElement('div');
        enemy.setAttribute('class', 'enemy');
        enemy.y = ((i + 1) * 350) * -1;
        enemy.style.top = enemy.y + "px";
        enemy.style.left = Math.floor(Math.random() * 900) + "px";
        gameArea.appendChild(enemy);
        enemy.shootTime = Math.floor(Math.random() * 500) + 200;
    }

    for (let i = 0; i < 4; i++) {
        let bullet = document.createElement('div');
        bullet.setAttribute('class', 'bullet');
        bullet.y = ((i + 1) * 350) * -1;
        bullet.style.top = bullet.y + "px";
        bullet.style.left = Math.floor(Math.random() * 900) + "px";
        gameArea.appendChild(bullet);
    }
}

function onCollision(a, b) {
    const aRect = {
        top: a.getBoundingClientRect().top + 20,
        bottom: a.getBoundingClientRect().bottom - 20,
        left: a.getBoundingClientRect().left + 30,
        right: a.getBoundingClientRect().right - 30
    };

    const bRect = {
        top: b.getBoundingClientRect().top + 20,
        bottom: b.getBoundingClientRect().bottom - 20,
        left: b.getBoundingClientRect().left + 30,
        right: b.getBoundingClientRect().right - 30
    };

    return !(aRect.top > bRect.bottom || aRect.bottom < bRect.top ||
        aRect.right < bRect.left || aRect.left > bRect.right);
}

function onCollisionBullet(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();

    return !(aRect.top > bRect.bottom || aRect.bottom < bRect.top ||
             aRect.right < bRect.left || aRect.left > bRect.right);

}

function onGameOver() {
    player.start = false;
    gameStart.pause();
    gameOver.play();
    startScreen.classList.remove('hide');
    startScreen.innerHTML = "GAME OVER! <br> TU SCORE FINAL ES: " + player.score + "<br> PRESIONE PARA VOLVER A JUGAR.";
}

function generateMathProblem() {
    let num1 = Math.floor(Math.random() * 10);
    let num2 = Math.floor(Math.random() * 10);
    if (num1 < num2) {
        let temp = num1;
        num1 = num2;
        num2 = temp;
    }
    const operators = ['+', '-', '*', '/'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let answer;
    switch (operator) {
        case '+':
            answer = num1 + num2;
            break;
        case '-':
            answer = num1 - num2;
            break;
        case '*':
            answer = num1 * num2;
            break;
        case '/':
            if (num1 % 2 == 1) {
                num1 += 1;
            }
            if (num2 % 2 == 1) {
                num2 -= 1;
            }
            if (num2 == 0) {
                num2 = 1;
            }
            if (num2 > (num1 / 2)) {
                num2 = num1 / 2;
            }
            answer = num1 / num2;
            break;
        default:
            throw new Error('Operador no reconocido');
    }
    const problem = `${num1} ${operator} ${num2}`;
    return { problem, answer };
}

function handleCollisionWithEnemy() {
    let ship = document.querySelector('.ship');
    ship.style.backgroundImage = 'url("assets/images/explosion.gif")';
    explosionAudio.play();

    player.start = false;
    gameStart.pause();
    gameOver.play();

    const { problem, answer } = generateMathProblem();
    totalAnswers++;

    const dialog = document.querySelector('.custom-dialog');
    const dialogText = document.getElementById('dialog-text');
    const optionsContainer = document.getElementById('options-container');
    const optionBtns = optionsContainer.querySelectorAll('.option-btn');

    dialogText.innerHTML = `HAS CHOCADO! <br> RESUELVE EL PROBLEMA PARA CONTINUAR <br> ${problem} =`;

    let options = [answer];
    options[0] = answer;
    options[1] = answer + 2;
    options[2] = answer + 4;
    options[3] = answer + 6;

    options.sort();

    optionBtns.forEach((btn, index) => {
        btn.textContent = options[index];
        btn.dataset.answer = options[index];
    });

    dialog.classList.remove('hide');

    function handleOptionClick(e) {
        document.querySelector('.custom-dialog').classList.add('hide');
        optionsContainer.removeEventListener('click', handleOptionClick); // Remove the event listener

        if (e.target.dataset.answer == answer) {
            correctAnswers++;
            log += `Pregunta: ${problem}, Respuesta Correcta: ${e.target.dataset.answer}\n`;
            startGame(player.score, player.x, player.y);
        } else {
            badAnswers++;
            log += `Pregunta: ${problem}, Respuesta Erronea: ${e.target.dataset.answer}\n`;
            onGameOver();
        }
    }

    optionsContainer.addEventListener('click', handleOptionClick);

    keys = {
        W: false,
        A: false,
        S: false,
        D: false,
        w: false,
        a: false,
        s: false,
        d: false,
        Enter: false
    };
}

function handleCollisionKillEnemy(enemy) {
    enemy.style.backgroundImage = 'url("assets/images/explosion.gif")';
    explosionAudio.play();
    keys = {
        W: false,
        A: false,
        S: false,
        D: false,
        w: false,
        a: false,
        s: false,
        d: false,
        Enter: false
    };
}

function moveEnemy(ship) {
    let enemy = document.querySelectorAll('.enemy');
    enemy.forEach((item) => {
        if (onCollision(ship, item)) {
            handleCollisionWithEnemy();
        }

        if (item.y >= 750) {
            item.y = -300;
            item.style.left = Math.floor(Math.random() * 900) + "px";
            item.shootTime = Math.floor(Math.random() * 500) + 200;
            item.style.backgroundImage = 'url("assets/images/ufo.gif")';
        }

        if (item.shootTime <= 0) {
            createEnemyBullet(item);
            item.shootTime = Math.floor(Math.random() * 500) + 200;
        } else {
            item.shootTime -= player.speed;
        }

        item.y += player.speed;
        item.style.top = item.y + "px";
    });
}

function createEnemyBullet(enemy) {
    let bullet = document.createElement('div');
    bullet.setAttribute('class', 'enemyBullet');
    bullet.y = enemy.y + enemy.offsetHeight - 20;
    bullet.style.top = bullet.y + "px";
    bullet.style.left = (enemy.offsetLeft + enemy.offsetWidth / 2) - 7 + "px";
    gameArea.appendChild(bullet);
}

function moveBullet() {
    let bullet = document.querySelectorAll('.bullet');
    let enemies = document.querySelectorAll('.enemy');

    bullet.forEach((bulletItem) => {
        if (bulletItem.y <= 0) {
            bulletItem.remove();
            player.bullets.shift();
        } else {
            bulletItem.y -= player.speed + 3;
            bulletItem.style.top = bulletItem.y + "px";

            enemies.forEach((enemy) => {
                if (onCollisionBullet(bulletItem, enemy)) {
                    handleCollisionKillEnemy(enemy);
                    bulletItem.remove();
                    player.bullets.shift();
                    player.score+=1000;
                    showScoreText(`+${1000}`);
                }
            });
        }
    });
}


function moveEnemyBullet(ship) {
    let bullet = document.querySelectorAll('.enemyBullet');
    bullet.forEach((item) => {
        if (item.y >= gameArea.getBoundingClientRect().bottom) {
            item.remove();
        } else {
            item.y += player.speed + 3;
            item.style.top = item.y + "px";
            if (onCollision(ship, item)) {
                handleCollisionWithEnemy();
                item.remove();
            }
        }
    });
}

function shoot() {
    shootAudio.play();
    let ship = document.querySelector('.ship');
    let bullet = document.createElement('div');
    bullet.setAttribute('class', 'bullet');
    bullet.y = player.y - 10;
    bullet.style.top = bullet.y + "px";
    bullet.style.left = (player.x + ship.offsetWidth / 2) - 7 + "px";
    gameArea.appendChild(bullet);
    player.bullets.push(bullet);
}

function moveCanvas() {
    let canvas = document.querySelectorAll('.canvas');
    canvas.forEach((item) => {
        if (item.y >= 700) {
            item.y -= 750;
        }
        item.y += player.speed;
        item.style.top = item.y + "px";
    });
}

function gamePlay() {
    let ship = document.querySelector('.ship');
    let road = gameArea.getBoundingClientRect();

    if (player.start) {
        moveCanvas();
        moveBullet();
        moveEnemy(ship);
        moveEnemyBullet(ship);

        if (keys.W && player.y > (road.top)) player.y -= player.speed;
        if (keys.S && player.y < (road.bottom - 140)) player.y += player.speed;
        if (keys.A && player.x > 0) player.x -= player.speed;
        if (keys.D && player.x < (road.width - 140)) player.x += player.speed;

        if (keys.w && player.y > (road.top)) player.y -= player.speed;
        if (keys.s && player.y < (road.bottom - 140)) player.y += player.speed;
        if (keys.a && player.x > 0) player.x -= player.speed;
        if (keys.d && player.x < (road.width - 140)) player.x += player.speed;

        ship.style.top = player.y + "px";
        ship.style.left = player.x + "px";

        if (keys.Enter && player.bullets.length < 1) {
            shoot();
        }

        window.requestAnimationFrame(gamePlay);

        player.score++;
        const ps = player.score - 1;
        score.innerHTML = 'SCORE: ' + ps;
    }
}

function showScoreText(text, x, y) {
    const scoreTextElement = document.querySelector('.score-text');
    scoreTextElement.textContent = text;
    scoreTextElement.classList.add('animate-score');
    setTimeout(() => {
        scoreTextElement.textContent = '';
        scoreTextElement.classList.remove('animate-score');
    }, 2000);
}

function saveReportToFile(report) {

    // Obtener la fecha y hora actual
    const fechaActual = new Date();

    // Formatear la fecha y la hora
    const formatoFechaHora =
        `${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}_${fechaActual.getDate().toString().padStart(2, '0')}_${fechaActual.getFullYear()}-` +
        `${fechaActual.getHours().toString().padStart(2, '0')}_${fechaActual.getMinutes().toString().padStart(2, '0')}_${fechaActual.getSeconds().toString().padStart(2, '0')}`;

    // Nombre del archivo con la fecha y hora
    const nombreArchivo = `reporte_${formatoFechaHora}.txt`;

    // Contenido del archivo de texto con saltos de línea
    let promedioCorrectas = correctAnswers / totalAnswers;
    let promedioIncorrectas = badAnswers / totalAnswers;
    let porcentajeCorrectas = correctAnswers*100 / totalAnswers;
    let porcentajeIncorrectas = badAnswers*100 / totalAnswers;
    const contenido = report.replace(/\n/g, '\r\n') + `\r\nTotal Preguntas: ${totalAnswers}\r\n\r\nPreguntas Correctas: ${correctAnswers}\r\nPreguntas Incorrectas: ${badAnswers}\r\n\r\nPromedio Correctas: ${promedioCorrectas}\r\nPromedio Incorrectas: ${promedioIncorrectas}\r\n\r\nPorcentajes Correctas: ${porcentajeCorrectas}%\r\nPorcentajes Incorrectas: ${porcentajeIncorrectas}%\r\n\r\nScore Final: ${player.score}\r\nFecha y hora: ${formatoFechaHora}`;

    // Crear un objeto Blob con el contenido
    const blob = new Blob([contenido], { type: "text/plain" });

    // Crear un objeto URL para el Blob
    const url = URL.createObjectURL(blob);

    // Crear un enlace temporal
    const enlaceTemporal = document.createElement("a");
    enlaceTemporal.href = url;
    enlaceTemporal.download = nombreArchivo;

    // Agregar el enlace temporal al DOM
    document.body.appendChild(enlaceTemporal);

    // Simular clic en el enlace para iniciar la descarga
    enlaceTemporal.click();

    // Eliminar el enlace temporal del DOM
    document.body.removeChild(enlaceTemporal);

    // Limpiar y revocar el objeto URL
    URL.revokeObjectURL(url);

    log = "";
}

document.addEventListener('keydown', (e) => {
    e.preventDefault();
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    e.preventDefault();
    keys[e.key] = false;
});
