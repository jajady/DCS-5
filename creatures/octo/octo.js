class Octo extends Creature {
  constructor(position, dna) {
    super(position, dna);

    this.headBaseR = this.r;
    this.eyeBaseR = this.r * 0.33;
    this.mouthBaseR = this.r * 0.2;
    // fins도 나중에 같이 키우고 싶으면 finsBaseR = this.r * 2; 처럼 저장해두면 됨

    // 파츠들 생성
    this.head = new OctoHead(this, this.headBaseR);
    this.eyes = new OctoEyes(this, this.eyeBaseR);
    this.mouth = new OctoMouth(this, this.mouthBaseR);
    this.fins = new Fins(this, this.r * 2); // 일단 기존 그대로

    // 이 값들은 update()에서 계산해서 각 파츠에게 줌
    this.moveVec = createVector(0, 0);
    this.lookDir = createVector(0, 0);  // 눈이 부드럽게 따라가게 할 때 씀


    // 시각적 요소(Decorations)
    this.showBlusher = false;   // 볼터치
    this.showEyelash = false;   // 속눈썹
    this._finsWaveStarted = false;
  }


  // ★ 진화 훅
  onEvolve(step) {
    // 2단계: 블러셔, 귀음영 추가,  속눈썹
    this.showBlusher = (step >= 2);

    if (step >= 3 && !this._finsWaveStarted) {
      if (this.fins && typeof this.fins.startWave === 'function') {
        this.fins.startWave();
      }
      this._finsWaveStarted = true;
    }
  }

  update() {
    super.update();

    // 1) 개체의 움직임
    let move = this.velocity.copy();

    // 속도가 0에 가까우면 눈이 흔들리니까 부드럽게
    if (move.mag() > 0.0001) {
      // 눈이 얼굴 밖으로 튀어나가지 않도록 얼굴 크기 기준으로 제한
      move.setMag(this.r * 0.8);   // 얼굴 반지름의 25%만 이동
      this.moveVec = move;
    }

    // (선택) 프레임마다 튀는 거 싫으면 이렇게 스무딩
    this.lookDir.lerp(this.moveVec, 0.04);   // 0.2는 반응속도

    // 2) 각 파츠에 “얼마나 따라갈지” 알려주기
    // this.ears.setMove(move, -0.3);       // 귀는 반대 방향
    this.eyes.setMove(move, 0.3);    // 눈은 0.5배, 눈동자는 20px 제한
    this.mouth.setMove(move, 0.25);
    this.mouth.update();
    this.fins.setMove(move, -1.5);
  }

  show() {
    // 1) 버프 스케일
    const s = this.getVisualScale();
    const r = this.r * s;

    // 🔹 머리/눈/입도 동일 스케일을 받도록 r 갱신
    if (this.head) {
      this.head.r = this.headBaseR * s;
    }
    if (this.eyes) {
      this.eyes.r = this.eyeBaseR * s;
      this.eyes.pupilLimit = this.eyes.r;   // 눈동자 이동 제한도 같이 스케일
    }
    if (this.mouth) {
      this.mouth.r = this.mouthBaseR * s;
    }

    // === 지속 후광 ===
    if (this.isHalo) {
      push();
      noStroke();
      const pulse = 0.6 + 0.4 * sin(frameCount * 0.05); // 살짝 숨쉬듯 펄스
      const alpha = 90 + 60 * pulse; // 알파값 변화
      fill(209, 255, 176, alpha);    // 연초록 빛 후광
      ellipse(this.position.x, this.position.y, this.r * 4.5, this.r * 4.5);  // 후광
      pop();
    }

    // === 힐 연결선: 머리에서 시작 ===
    if (this._healTarget) {
      const a = this.position;
      const b = this._healTarget.position;

      const pulse = 0.5 + 0.5 * sin(frameCount * 0.1);
      const alpha = 50 * pulse;

      push();
      stroke(red(this.c2), green(this.c2), blue(this.c2), alpha);
      strokeWeight(max(1, this.r * 0.12));
      line(a.x, a.y, b.x, b.y);

      // 선을 따라 이동하는 점
      const dotT = (millis() - this._healStartMs) / 400.0;
      const frac = dotT - floor(dotT);
      const px = lerp(a.x, b.x, frac);
      const py = lerp(a.y, b.y, frac);
      noStroke();
      fill(this.c3);
      circle(px, py, this.r * 0.35);
      pop();
    }

    // === 본체 그리기 ===
    push();
    translate(this.position.x, this.position.y);

    // 진화 3단계 이상일 때만 line 활성화
    if (this.evolutionStep >= 3) {
      this.fins.show();
      const finCenters = this.fins.getEllipseCentersLocal();

      const hex = this.c2.toString('#rrggbb');
      stroke(hex + 'aa');                // 동일 색 + 알파
      strokeWeight(this.r * 0.18);

      for (const p of finCenters) {
        line(0, 0, p.x, p.y);
      }
    }
    noStroke();

    /* ── 모자(4단계~) ── */
    if (this.showHat) {
      strokeJoin(ROUND);
      strokeCap(ROUND);
      strokeWeight(0.5);
      fill(this.c3);
      triangle(r * 0.2, -r * 2, r * 1, -r * 0.5, -r * 1, -r * 0.5);
      fill(this.currentColor);
      circle(r * 0.2, -r * 2, r * 0.25);
      noStroke();
    }

    /* ── 머리 ── */
    fill(this.currentColor);
    this.head.show();

    /* ── 블러셔(2단계~) ── */
    if (this.showBlusher) {
      push();
      translate(r * 0.6, 0);
      fill(this.c2);
      ellipse(0, 0, r * 0.5, r * 0.2);
      pop();

      push();
      translate(-r * 0.6, 0);
      fill(this.c2);
      ellipse(0, 0, r * 0.5, r * 0.2);
      pop();
    }

    this.mouth.show();
    this.eyes.show();

    // fill('red');
    // circle(0, 0, this.r * 0.5);
    pop(); // ← 본체 translate 블록 종료

    // ★ 눈에게 현재 터치 상태 전달 (Octo에만 eyes가 있으므로 여기서 연결)
    if (this.eyes && typeof this.eyes.setTouching === 'function') {
      this.eyes.setTouching(this.touching);
    }

  }
}