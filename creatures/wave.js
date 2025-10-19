class Wave {
  constructor(x, y, radius, w, amplitude, period, color) {
    this.xspacing = radius / 4;
    this.x = x;
    this.y = y;
    this.r = radius;
    this.w = w;
    this.c = color;
    this.c2 = color;
    this.c3 = color;
    this.c4 = color;

    // === 입 펄스 ===
    this.mouthBaseH = radius * 0.05;
    this.mouthScale = 1;
    this.pulsing = false;
    this.pulseMaxScale = 2;
    this.pulseSpeed = 0.05;
    this.pulsePhase = 0;
    this.pulseCount = 0;
    this.pulseTotal = 5;

    // === 눈 깜빡임 ===
    this.eyeBaseW = this.r * 0.085;
    this.eyeBaseH = this.r * 0.125;
    this.eyeOpen = 1;
    this.blinkPhase = 0;
    this.blinkSpeed = 0.1;

    // ★ 손 접촉 상태 for 눈깜빡임
    this.touching = false;

    // 웨이브 형태 관련
    this.origin = createVector(x, y);
    this.theta = 0;
    this.amplitude = amplitude;
    this.period = period;
    this.dx = (TWO_PI / this.period) * this.xspacing;
    this.yvalues = new Array(floor(this.w / this.xspacing));
    this.angle = 0;

    // 더듬이 상태 (0=없음, 1=완전 성장)
    this.antAmount = 0;        // 현재 값
    this.antTarget = 0;        // 목표 값
    this.antSpeed = 0.06;     // 성장/축소 속도
    this.antLenMul = 0.50;  //  길이
    this.antSpreadMul = 0.1;  // 좌우 간격
    this.antBulgeMul = 0.28;  // 곡률
    this.antTipMul = 0.12;  // 끝 구슬 크기

    // 표시 플래그 (기본은 꺼둠)
    this.showFur = false;      // 털
    this.showStripes = false;  // 줄무늬
    this.showFeet = false;     // 발

    this.isHalo = false;      // 후광
  }

  // 먹이에 닿았을 때 입 펄스 시작
  bite() {
    this.pulsing = true;
    this.pulsePhase = 0;
    this.pulseCount = 0;
  }

  // ★ 손 닿음 감지: true/false로 갱신
  blink(isTouching) {
    this.touching = isTouching;
  }

  getLength() {
    return (this.yvalues.length - 1) * this.xspacing;
  }

  update() {
    // 파형
    this.theta += 0.02;
    let t = this.theta;
    for (let i = 0; i < this.yvalues.length; i++) {
      this.yvalues[i] = sin(t) * this.amplitude;
      t += this.dx;
    }

    // 방향/이동
    const dx = this.x - this.origin.x;
    const dy = this.y - this.origin.y;
    const d = sqrt(dx * dx + dy * dy);
    const L = this.getLength();
    if (d > 1e-6) {
      this.angle = atan2(dy, dx);
      const move = d - L;
      const ux = dx / d, uy = dy / d;
      this.origin.x += ux * move;
      this.origin.y += uy * move;
    }

    // 입 펄스
    if (this.pulsing) {
      this.pulsePhase += this.pulseSpeed;
      const s = sin(constrain(this.pulsePhase, 0, PI));
      this.mouthScale = 1 + (this.pulseMaxScale - 1) * s;
      if (this.pulsePhase >= PI) {
        this.pulsePhase = 0;
        this.pulseCount += 1;
        if (this.pulseCount >= this.pulseTotal) this.pulsing = false;
      }
    } else {
      this.mouthScale = lerp(this.mouthScale, 1, 0.12);
    }

    // ★ 눈 깜빡임: 손 닿으면 계속 반복
    if (this.touching) {
      this.blinkPhase += this.blinkSpeed;
      this.eyeOpen = (1 + cos(this.blinkPhase)) * 0.5; // 1..0..1 루프
      if (this.blinkPhase >= TWO_PI) this.blinkPhase -= TWO_PI;
    } else {
      this.eyeOpen = lerp(this.eyeOpen, 1, 0.25); // 자연 복귀
    }

    // ★ 더듬이 양 보간
    this.antAmount = lerp(this.antAmount, this.antTarget, this.antSpeed);
  }

  show() {
    push();
    translate(this.origin.x, this.origin.y);
    rotate(this.angle);

    // ★ 더듬이 (진화 2단계에서 자람)
    if (this.antAmount > 0.01) {
      const headX = (this.yvalues.length - 1) * this.xspacing;
      const headY = this.yvalues[this.yvalues.length - 1] - this.r * 0.15;

      // 성장 감도 살짝 낮춰서 초반에 덜 길어 보이게 (선택)
      const grow = pow(this.antAmount, 0.85);

      const len = this.r * (this.antLenMul * grow);  // 길이 ↓
      const spread = this.r * this.antSpreadMul;         // 좌우 간격 ↓
      const bulge = this.r * this.antBulgeMul;          // 곡률 ↓

      stroke(this.c);
      strokeWeight(max(1, this.r * 0.06)); // 0.08 → 0.06 (살짝 얇게)
      noFill();

      // 왼쪽
      beginShape();
      vertex(headX - spread, headY - this.r * 0.15);
      quadraticVertex(headX - spread - bulge * 0.3, headY - bulge * 0.5,
        headX - spread - bulge * 0.15, headY - len);
      endShape();

      // 오른쪽
      beginShape();
      vertex(headX + spread, headY - this.r * 0.15);
      quadraticVertex(headX + spread + bulge * 0.3, headY - bulge * 0.5,
        headX + spread + bulge * 0.15, headY - len);
      endShape();

      // 끝 구슬 더 작게
      fill(this.c); noStroke();
      const tipD = this.r * this.antTipMul;
      circle(headX - spread - bulge * 0.15, headY - len, tipD);
      circle(headX + spread + bulge * 0.15, headY - len, tipD);
    }

    // 몸통
    noStroke();
    const N = this.yvalues.length;
    const a = 1 / 3;     // 좌측 상승 구간 끝
    const b = 1 / 3;     // 우측 하강 구간 시작(1 - b)
    const endScale = 0.8; // 양 끝 최소 지름 비율 (0~1)

    for (let i = 0; i < N; i++) {
      const px = i * this.xspacing;
      const py = this.yvalues[i];
      const u = (N <= 1) ? 0 : i / (N - 1); // 0~1 위치

      let s; // 지름 비율(0~1)
      if (u < a) {
        // 앞쪽: endScale -> 1 로 스무스 업
        const t = u / a;                    // 0~1
        const smooth = t * t * (3 - 2 * t); // smoothstep
        s = lerp(endScale, 1, smooth);
      } else if (u > 1 - b) {
        // 뒤쪽: endScale -> 1 로 스무스 업 (끝으로 갈수록 다시 다운되도록 반대로 계산)
        const t = (1 - u) / b;              // 0~1
        const smooth = t * t * (3 - 2 * t);
        s = lerp(endScale, 1, smooth);
      } else {
        // 가운데(1/3 ~ 2/3): plateau = 1배
        s = 1;
      }

      push();
      translate(px, py);

      fill(0, 0, 0, 20);
      circle(- this.r * 0.1, 0, this.r * s);   // 각 몸통 그림자

      // ★ 털: 진화 1단계에서만 (얼굴 제외)
      if (this.showFur && i !== N - 1) {
        rectMode(CORNERS);
        fill(this.c2);
        for (let j = 1; j <= 6; j++) {
          push();
          rotate(PI * j / 6);
          rect(0, 0, -this.r * s * 0.7, -this.r * s * 0.1, 5);
          pop();
        }
      }

      // ★ 발: 진화 3단계에서
      if (this.showFeet) {
        fill(this.c2);
        ellipse(0, this.r * s * 0.5, this.r * s * 0.25, this.r * s * 0.25);
      }

      fill(this.c);
      circle(0, 0, this.r * s);   // 몸통

      // ★ 줄무늬/점: 진화 2단계에서 (얼굴 제외)
      if (this.showStripes && i !== N - 1) {
        rectMode(CENTER);
        fill(this.c3); // 줄
        rect(- this.r * 0.1, 0, this.r * s * 0.25, this.r * s, 5);

        fill(this.c4); // 점
        circle(- this.r * 0.1, this.r * -0.3, this.r * s * 0.1);
        circle(- this.r * 0.1, this.r * -0.1, this.r * s * 0.15);
        circle(- this.r * 0.1, this.r * 0.1, this.r * s * 0.125);
        circle(- this.r * 0.1, this.r * 0.3, this.r * s * 0.1);
      }
      rectMode(CORNER);

      pop();


    }



    // 얼굴
    const headX = (this.yvalues.length - 1) * this.xspacing;
    const headY = this.yvalues[this.yvalues.length - 1] - this.r * 0.15;
    const eW = this.eyeBaseW;
    const eH = this.eyeBaseH * this.eyeOpen;

    // 눈
    fill(0);
    ellipse(headX, headY, eW, eH);
    fill(this.c);
    ellipse(headX, headY - this.r * 0.025 * this.eyeOpen, this.r * 0.05, this.r * 0.1 * this.eyeOpen);

    fill(0);
    ellipse(headX + this.r * 0.2, headY, eW, eH);
    fill(this.c);
    ellipse(headX + this.r * 0.2, headY - this.r * 0.02 * this.eyeOpen, this.r * 0.05, this.r * 0.1 * this.eyeOpen);

    // 입
    fill(0);
    rectMode(CENTER);
    const mouthH = this.mouthBaseH * this.mouthScale;
    rect(headX + this.r * 0.1, headY + this.r * 0.3, this.r * 0.25, mouthH);

    pop();
  }

  getHeadWorldPos() {
    // 로컬(애벌레 내부 좌표)에서의 머리 위치
    const headX = (this.yvalues.length - 1) * this.xspacing;
    const headY = this.yvalues[this.yvalues.length - 1] - this.r * 0.15;

    // 회전(rotate(this.angle))과 평행이동(translate(origin))을 적용한 월드 좌표
    const ca = Math.cos(this.angle);
    const sa = Math.sin(this.angle);

    const wx = this.origin.x + headX * ca - headY * sa;
    const wy = this.origin.y + headX * sa + headY * ca;

    return createVector(wx, wy);
  }
}