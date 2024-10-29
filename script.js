let enemies = [];
let enemyInterval = 50;
let gameDuration = 30;
let remainingTime = gameDuration;
let points = 0;
let gameOver = false;
let inputField;
let saveScoreButton;
let bgImage; 
let qrCodeImage;
let restartButton;


function preload() {
  bgImage = loadImage('Logo-Santa-Lucia.png');
  qrCodeImage = loadImage('qrcode.png');
  
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  bullets = [];
  player = new Player(300, 700, 30);
  generateRandomEnemies();
  frameRate(60);
}

function draw() {
  background("rgb(204,242,204)");

  // Desenha a imagem no centro da tela
  if (bgImage) {
    imageMode(CENTER);
    image(bgImage, width / 2, height / 2);
  }

  if (gameOver) {
    drawGameOverScreen();
  } else {
    player.draw();
    player.move();
    handleBullets();
    handleEnemies();
    checkHit();
    updateTimer();
    generateEnemy();
    drawScore();
    drawTimer();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}



function handleBullets() {
  // Desenha e atualiza balas
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].draw();
    if (bullets[i].posY < 0) {
      bullets.splice(i, 1);
    }
  }
}

function handleEnemies() {
  // Desenha e atualiza inimigos
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].draw();
  }
}

function updateTimer() {
  // Atualiza o temporizador
  if (frameCount % 60 === 0 && remainingTime > 0) {
    remainingTime--;
    if (remainingTime <= 0) {
      gameOver = true;
    }
  }
}

function generateRandomEnemies() {
  for (let i = 0; i < 5; i++) {
    generateEnemy();
  }
}

function shoot() {
  let bullet = new Bullet(player.posX + 12, player.posY - 20, 5, 20);
  bullets.push(bullet);
}

function checkHit() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      let d = dist(bullets[i].posX, bullets[i].posY, enemies[j].posX, enemies[j].posY);
      if (d < enemies[j].size) {
        enemies.splice(j, 1);
        points++;
      }
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    let d = dist(enemies[i].posX, enemies[i].posY, player.posX, player.posY);
    if (d < player.size) {
      gameOver = true;
    }
  }
}

function generateEnemy() {
  if (frameCount % enemyInterval === 0) {
    enemies.push(new Enemy(floor(random(20, width - 50)), floor(random(20, height / 3 - 50)), 20));
  }
}

function drawScore() {
  fill(0);
  textSize(30);
  textAlign(CENTER, TOP);
  text("Score: " + points, width / 2, 10);
}

function drawTimer() {
  fill(0);
  textSize(30);
  textAlign(CENTER, TOP);
  let minutes = floor(remainingTime / 60);
  let seconds = remainingTime % 60;
  text(nf(minutes, 2) + ":" + nf(seconds, 2), width / 2, 50);
}

function drawGameOverScreen() {
  background(0);
  fill(255);
  textAlign(CENTER);
  textSize(50);
  text("Fim de jogo", width / 2, height / 4 - 50);
  textSize(30);
  text("Obrigado por jogar!", width / 2, height / 4 + 50);
  text("Final Score: " + points, width / 2, height / 4 + 100);

  // Define o tamanho do QR Code
  const qrCodeWidth = 150;
  const qrCodeHeight = 150;

  if (qrCodeImage) {
    text("Desenvolvido por Alexandre Miclos ", width / 5, height / 4 + 50);
    imageMode(CENTER);
    image(qrCodeImage, width / 5, height / 4 + 180, qrCodeWidth, qrCodeHeight);
  }

  // Container centralizado para o campo de entrada e o botão "Salvar Placar"
  if (!inputField && !saveScoreButton) {
    let container = createDiv();
    container.position(width / 2 - 115, height / 4 + 200); // Centraliza o container horizontalmente
    container.class('container');

    inputField = createInput();
    inputField.size(200); 
    inputField.class('input-field');
    inputField.parent(container);

    saveScoreButton = createButton('Salvar Placar');
    saveScoreButton.class('save-button');
    saveScoreButton.mousePressed(() => {
      let username = inputField.value();
      if (username) {
        sendScoreToServer(username, points);
      }
      container.remove();
      inputField = null;
      saveScoreButton = null;
    });
    saveScoreButton.parent(container);
  }

  // Cria o botão de reinício do jogo
  if (!restartButton) {
    restartButton = createButton('Reiniciar Jogo');
    restartButton.position(width / 2 - 72, height / 4 + 310);
     // Centraliza o botão de reinício
    restartButton.class('restart-button');
    restartButton.mousePressed(() => {
      restartGame();
      restartButton.remove();
      restartButton = null;
    });
  }
}


function sendScoreToServer(username, score) {
  fetch('https://apimongodb-3dq1.onrender.com/save-score/spaceship', { // Use a URL da sua API
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, score })
  })
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
}


function restartGame() {
  // Resetar as variáveis de jogo
  gameOver = false;
  points = 0;
  player.posX = 300;
  player.posY = 500;
  enemies = [];
  bullets = [];
  remainingTime = gameDuration;
  
  // Gera novos inimigos
  generateRandomEnemies();

  // Remove o campo de entrada e os botões, se existirem
  if (inputField) {
    inputField.remove();
    inputField = null;
  }
  if (saveScoreButton) {
    saveScoreButton.remove();
    saveScoreButton = null;
  }
  if (restartButton) {
    restartButton.remove();
    restartButton = null;
  }
}

class Player {
  constructor(posX, posY, size) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
  }

  draw() {
    fill("#2A701D");
    rect(this.posX, this.posY, this.size, this.size);
    fill("#424242");
    rect(this.posX + 10, this.posY - 10, 10, 30);
    fill("#424242");
    rect(this.posX + 30, this.posY + 5, 5, 20);
    rect(this.posX - 5, this.posY + 5, 5, 20);
    rect(this.posX + 12, this.posY - 20, 5, 20);
  }

  move() {
    // Movimenta para a esquerda com 'A' ou seta esquerda
    if ((keyIsDown(65) || keyIsDown(LEFT_ARROW)) && this.posX >= 5) {
      this.posX -= 5;
    }
  
    // Movimenta para a direita com 'D' ou seta direita
    if ((keyIsDown(68) || keyIsDown(RIGHT_ARROW)) && this.posX <= width - this.size) {
      this.posX += 5;
    }
  
    // Movimenta para cima com 'W' ou seta cima
    if ((keyIsDown(87) || keyIsDown(UP_ARROW)) && this.posY >= 5 + this.size) {
      this.posY -= 5;
    }
  
    // Movimenta para baixo com 'S' ou seta baixo
    if ((keyIsDown(83) || keyIsDown(DOWN_ARROW)) && this.posY <= height - this.size) {
      this.posY += 5;
    }
  }
}  

class Enemy {
  constructor(posX, posY, size) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
  }
  
  draw() {
    fill(0, 0, 0); // Adiciona cor para visualizar os inimigos
    rect(this.posX, this.posY, this.size, this.size);
    this.posY++;
  }
}



class Bullet {
  constructor(posX, posY, sizeX, sizeY) {
    this.posX = posX;
    this.posY = posY;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
  }

  draw() {
    fill(0, 0, 255); // Adiciona cor para visualizar as balas
    rect(this.posX, this.posY, this.sizeX, this.sizeY);
    this.posY -= 10;
  }
}

function keyPressed() {
  if (key === ' ') {  // tecla de espaço para disparar
    shoot();
  }
}

function shoot() {
  let bullet = new Bullet(player.posX + 12, player.posY - 20, 5, 20);
  bullets.push(bullet);
}
