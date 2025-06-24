// Variáveis globais de jogo
let player, inimigos = [], tiros = [];
let pontos = 0;
let gameOver = false; // Nova variável para controlar o estado do jogo
let jogoIniciado = false; // Nova variável para controlar se o jogo realmente começou

// Variáveis de carregamento de imagens
let personagemImagem, cenarioImagem, tiroImagem, inimigosImagem = [];
let studentId = 'default', imagePathPrefix = '';

// Variáveis de calibração
const ESCALA_IMAGEM = 1.5;
const VELOCIDADE_INIMIGO_BASE = 3;
const VELOCIDADE_TIRO_BASE = 15;

// Variáveis de tamanhos escalonados (calculadas em setup)
let playerScaledWidth, playerScaledHeight;
let inimigoScaledWidth, inimigoScaledHeight;
let tiroScaledWidth, tiroScaledHeight;


function preload() {
    const urlParams = new URLSearchParams(window.location.search);
    studentId = urlParams.get('aluno') || 'default';
    if (studentId === 'default') {
        console.warn("Nenhum 'aluno' especificado na URL. Usando o ID padrão: " + studentId);
    }

    imagePathPrefix = `assets/${studentId}/`;
    const numTiposInimigo = 2;

    try {
        personagemImagem = loadImage(imagePathPrefix + 'personagem.png');
        cenarioImagem = loadImage(imagePathPrefix + 'fundo.png');
        tiroImagem = loadImage(imagePathPrefix + 'tiro.png');
        for (let i = 0; i < numTiposInimigo; i++) {
            inimigosImagem[i] = loadImage(imagePathPrefix + `inimigo${i}.png`);
        }
    } catch (error) {
        console.error(`Erro ao carregar imagens para o aluno ${studentId}:`, error);
        personagemImagem = loadImage('assets/default/personagem.png');
        cenarioImagem = loadImage('assets/default/fundo.png');
        tiroImagem = loadImage('assets/default/tiro.png');
        for (let i = 0; i < numTiposInimigo; i++) {
            inimigosImagem[i] = loadImage(`assets/default/inimigo${i}.png`);
        }
    }
}


function setup() {
    createCanvas(windowWidth, windowHeight);
    
    playerScaledWidth = 60 * ESCALA_IMAGEM;
    playerScaledHeight = 60 * ESCALA_IMAGEM;
    inimigoScaledWidth = 60 * ESCALA_IMAGEM;
    inimigoScaledHeight = 60 * ESCALA_IMAGEM;
    tiroScaledWidth = 30 * ESCALA_IMAGEM;
    tiroScaledHeight = 50 * ESCALA_IMAGEM;

    player = new Personagem(personagemImagem, width / 2 - playerScaledWidth / 2, height - playerScaledHeight - 30, playerScaledWidth, playerScaledHeight);

    for (let i = 0; i < 10; i++) {
        inimigos.push(new Inimigo(random(inimigosImagem), random(0, width - inimigoScaledWidth), random(-height * 2, 0), inimigoScaledWidth, inimigoScaledHeight));
    }
}


function draw() {
    if (gameOver) {
        exibirGameOver();
        return; 
    }

    background(cenarioImagem); 

    player.x = constrain(mouseX - player.comp / 2, 0, width - player.comp);
    player.exibir();

    placar();
    personagemColisao();
    verificaColisao();

    for (let i = inimigos.length - 1; i >= 0; i--) {
        let inimigo = inimigos[i];
        inimigo.exibir(); 
        inimigo.y += VELOCIDADE_INIMIGO_BASE; 

        if (inimigo.y > height) { 
            inimigos.splice(i, 1);
            pontos -= 1; 
            inimigos.push(new Inimigo(random(inimigosImagem), random(0, width - inimigoScaledWidth), random(-height * 2, 0), inimigoScaledWidth, inimigoScaledHeight));
            jogoIniciado = true; // Define que o jogo realmente começou após o primeiro inimigo passar
        }
    }

    for (let i = tiros.length - 1; i >= 0; i--) {
        let tiro = tiros[i];
        tiro.mostraTiro();
        tiro.y -= VELOCIDADE_TIRO_BASE; 
        if (tiro.y < 0) tiros.splice(i, 1);
    }

    if (pontos <= 0 && jogoIniciado) { // Só dá Game Over se os pontos forem zero ou menos E o jogo já tiver começado
        gameOver = true;
    }
}

// FUNÇÕES AUXILIARES


function colideRetangulo(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2);
}

function placar() {
    textSize(width * 0.03);
    fill(255, 255, 0);
    textFont("Pixelify Sans");
    textAlign(LEFT, TOP); 
    text(pontos, width * 0.05, height * 0.05);
}

function mousePressed() {
    if (!gameOver) { // Só permite atirar se o jogo não estiver em Game Over
        tiros.push(new Tiro(tiroImagem, player.x + player.comp / 2 - tiroScaledWidth / 2, player.y, tiroScaledWidth, tiroScaledHeight)); 
    }
}

function personagemColisao() {
    for (let inimigo of inimigos) {
        if (colideRetangulo(player.x, player.y, player.comp, player.alt, inimigo.x, inimigo.y, inimigo.comp, inimigo.alt)) {
            gameOver = true;
            break; 
        }
    }
}

function verificaColisao() {
    for (let i = inimigos.length - 1; i >= 0; i--) {
        let inimigoJogo = inimigos[i];
        for (let j = tiros.length - 1; j >= 0; j--) {
            let tiro = tiros[j];
            if (colideRetangulo(inimigoJogo.x, inimigoJogo.y, inimigoJogo.comp, inimigoJogo.alt, tiro.x, tiro.y, tiro.comp, tiro.alt)) {
                inimigos.splice(i, 1); 
                tiros.splice(j, 1); 
                inimigos.push(new Inimigo(random(inimigosImagem), random(0, width - inimigoScaledWidth), random(-height * 2, 0), inimigoScaledWidth, inimigoScaledHeight));
                pontos += 1; 
                break; 
            }
        }
    }
}

function exibirGameOver() {
    textSize(width * 0.05);
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2);
    noLoop(); 
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    playerScaledWidth = 60 * ESCALA_IMAGEM;
    playerScaledHeight = 60 * ESCALA_IMAGEM;
    inimigoScaledWidth = 60 * ESCALA_IMAGEM;
    inimigoScaledHeight = 60 * ESCALA_IMAGEM;
    tiroScaledWidth = 30 * ESCALA_IMAGEM;
    tiroScaledHeight = 50 * ESCALA_IMAGEM;

    player.comp = playerScaledWidth;
    player.alt = playerScaledHeight;
    player.y = height - player.alt - 30;
}