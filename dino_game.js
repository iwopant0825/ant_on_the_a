const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let score; //현재 점수
let scoreText; //현재 점수 텍스트
let highscore; //최고 점수
let highscoreText; //최고 점수 텍스트
let dino; //공룡
let gravity; // 중력값
let obstacles = []; //장애물
let gameSpeed; // 게임 속도
let keys = {}; // 키 값
const background = new Image();
background.src = "./image/play.png"; // 배경 이미지 파일의 경로

//이벤트 리스너 추가
document.addEventListener("keydown", function (evt) {
  keys[evt.code] = true;
});
document.addEventListener("keyup", function (evt) {
  keys[evt.code] = false;
});

function DrawBackground() {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

class Dino {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;

    this.dy = 0; //점프를 위한
    this.jumpForce = 15; //
    this.originalHeight = h; //숙이기 전 높이
    this.grounded = false; //땅에 있는지 판단
    this.jumpTimer = 0; // 점프 시간 체크를 위한 타이머 추가
    this.animationFrames = ["ant_1.png", "ant_2.png"]; // 애니메이션 프레임 목록
    this.currentAnimationFrame = 0; // 현재 애니메이션 프레임 인덱스
    this.animationSpeed = 10; // 애니메이션 속도 (숫자가 작을수록 빠름)
    this.frameCount = 0; // 현재 프레임 카운터
  }

  Draw() {
    var img = new Image();
    if ((keys["ShiftLeft"] || keys["KeyS"]) && this.grounded) {
      // 숙였을 때 이미지 변경
      img.src = "./image/" + this.animationFrames[this.currentAnimationFrame];
      ctx.drawImage(img, this.x, this.y - 220, this.w * 2.5, this.h * 2.5);
    } else {
      // 원래 모습 또는 점프 중일 때 애니메이션 적용
      img.src = "./image/" + this.animationFrames[this.currentAnimationFrame];
      ctx.drawImage(img, this.x, this.y - 240, this.w * 2.5, this.h * 2.5);

      // 프레임 카운터 업데이트 및 애니메이션 프레임 변경
      this.frameCount++;
      if (this.frameCount >= this.animationSpeed) {
        this.currentAnimationFrame = (this.currentAnimationFrame + 1) % this.animationFrames.length;
        this.frameCount = 0;
      }
    }
  }

  Jump() {
    //점프함수 추가
    if (this.grounded && this.jumpTimer == 0) {
      //땅에 있는지 && 타이머 =0
      this.jumpTimer = 1;
      this.dy = -this.jumpForce;
    } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
      this.jumpTimer++;
      this.dy = -this.jumpForce - this.jumpTimer / 50; //갈수록 빠르게 떨어지는 것 구현
    }
  }

  Animate() {
    // 키 입력
    if (keys["Space"] || keys["KeyW"]) {
      // 스페이스바 or 키보드 W 입력시
      this.Jump();
    } else {
      this.jumpTimer = 0;
    }

    if (keys["ShiftLeft"] || keys["KeyS"]) {
      // 왼쉬프트 or 키보드 S 입력시
      this.h = this.originalHeight / 2; //h를 절반으로 줄여서 숙인 것과 같은 효과
      this.y += this.h / 2;
    } else {
      this.h = this.originalHeight;
    }

    this.y += this.dy; //위치 변경

    //중력적용
    if (this.y + this.h < canvas.height) {
      //공중에 떠 있을 때
      this.dy += gravity; // 중력만큼 dy++
      this.grounded = false;
    } else {
      this.dy = 0;
      this.grounded = true;
      this.y = canvas.height - this.h; //바닥에 딱 붙어 있게 해줌
    }

    //this.y += this.dy; <-삭제 (뒤에 쓰면 중력 적용할 때 문제가 생김)

    this.Draw();
  }
}

class obstacle {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y - 240;
    this.w = w;
    this.h = h * 2;
    this.c = c;
    this.shape = RandomIntInRange(1, 6); // 랜덤 모양 설정 (1부터 6까지)
    this.dx = -gameSpeed; // 왼쪽으로 달려올 예정
    this.top = this.shape <= 3; // top 여부 판단 (shape가 1, 2, 3이면 top)
  }

  Update() {
    this.x += this.dx;
    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw() {
    var img = new Image();
    console.log(this.shape);
    if (this.shape === 1) {
      img.src = "./image/top_obstacle_1.png";
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    } else if (this.shape === 2) {
      img.src = "./image/top_obstacle_2.png";
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    } else if (this.shape === 3) {
      img.src = "./image/top_obstacle_3.png";
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    } else if (this.shape === 4) {
      img.src = "./image/bottom_obstacle_1.png";
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    } else if (this.shape === 5) {
      img.src = "./image/bottom_obstacle_2.png";
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    } else if (this.shape === 6) {
      img.src = "./image/bottom_obstacle_3.png";
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    }
  }
}

class Text {
  constructor(t, x, y, a, c, s) {
    this.t = t;
    this.x = x;
    this.y = y;
    this.a = a;
    this.c = c;
    this.s = s;
  }
  Draw() {
    ctx.beginPath();
    ctx.fillStyle = this.c; // 오타 수정: fillSyle -> fillStyle
    ctx.font = this.s + "px sans-serif";
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
    ctx.closePath();
  }
}

function SpawnObstacle() {
  let size = 70;
  let newObstacle = new obstacle(
    canvas.width + size,
    canvas.height - size,
    size,
    size,
    "#2484Ef"
  );

  if (newObstacle.top === true) {
    newObstacle.y -= 370;
    newObstacle.h *= 2.9;
  }

  obstacles.push(newObstacle);
}

function RandomIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function Start() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.font = "20px sans-serif";

  gameSpeed = 10;
  gravity = 1;

  score = 0;
  highscore = 0;

  if (localStorage.getItem("highscore")) {
    highscore = localStorage.getItem("highscore");
  }

  dino = new Dino(25, canvas.height - 150, 50, 50, "pink");
  //dino.Draw();// <- 업데이트 함수에서 그리기 위해서 삭제

  scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");

  highscoreText = new Text(
    "Hightscore: " + highscore,
    canvas.width - 25,
    25,
    "right",
    "#212121",
    "20"
  );

  requestAnimationFrame(Update); // 추가
}

let initialSpawnTimer = 200;
let spawntimer = initialSpawnTimer;

function init() {
  obstacles = [];
  score = 0;
  spawntimer = initialSpawnTimer;
  gameSpeed = 10;

  localStorage.setItem("highscore", highscore);
}

function Update() {
  requestAnimationFrame(Update);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  DrawBackground();
  dino.Animate(); //공룡한테 애니메이션 주는 함수 <-여기서 그려줄거임

  spawntimer--;
  if (spawntimer <= 0) {
    SpawnObstacle();
    console.log(obstacles);
    spawntimer = initialSpawnTimer - gameSpeed * 8;

    if (spawntimer < 60) {
      spawntimer = 60;
    }
  }

  for (let i = 0; i < obstacles.length; i++) {
    let o = obstacles[i];

    if (o.x + o.w < 0) {
      obstacles.splice(i, 1);
    }

    if (
      dino.x + dino.w*2.5 > o.x &&
      dino.x < o.x + o.w &&
      dino.y-240 + dino.h*2.5 > o.y &&
      dino.y-240 < o.y + o.h
    ) {
      init();
    }
    o.Update();
  }

  score++;
  scoreText.t = "Score: " + score;
  scoreText.Draw();

  if (score > highscore) {
    highscore = score;
    highscoreText.t = "Highscore: " + highscore;
  }

  highscoreText.Draw();

  gameSpeed += 0.003;
}
Start();