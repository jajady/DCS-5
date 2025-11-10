// ====================== Eyes (눈 + 눈동자 + 감기) ======================
class OctoEyes {
  constructor(r) {
    this.offset = createVector(0, 0);
    this.pupilOffset = createVector(0, 0);

    this.r = r;
    this.pupilLimit = this.r * 0.9;

    // 깜빡 상태
    this.eyeOpen = 1.0;     // 1(완전 개안) ~ 0(완전 감김)
    this._touching = false; // 손 닿음 여부
    this._blinking = false;
    this._blinkStart = 0;
    this._blinkDur = 800;   // 한 번 깜빡(닫→열) 시간
    this._blinkGap = 700;   // 다음 깜빡까지 대기
  }

  setMove(baseMove, factor) {
    this.offset = baseMove.copy().mult(factor);
    this.pupilOffset = baseMove.copy();
    this.pupilOffset.limit(this.pupilLimit);
  }

  // ★ Octo가 터치 상태를 넘겨줄 메서드
  setTouching(flag) {
    this._touching = !!flag;
    if (!this._touching) this._blinking = false;
  }

  _startBlink(now = millis()) {
    this._blinking = true;
    this._blinkStart = now;
  }

  _updateBlink() {
    const now = millis();
    if (this._touching) {
      if (!this._blinking) this._startBlink(now);
      const t = (now - this._blinkStart) / this._blinkDur; // 0→1
      if (t >= 1) {
        this._blinking = false;
        if (now - this._blinkStart >= this._blinkDur + this._blinkGap) {
          this._startBlink(now);
        }
        this.eyeOpen = lerp(this.eyeOpen, 1.0, 0.35); // 쉬는 구간엔 서서히 개안
      } else {
        const closePhase = sin(PI * t); // 0→1→0
        this.eyeOpen = 1.0 - closePhase; // 1→0→1
      }
    } else {
      this._blinking = false;
      this.eyeOpen = lerp(this.eyeOpen, 1.0, 0.2); // 터치 끝나면 천천히 열림
    }
  }

  show() {
    this._updateBlink();

    push();
    translate(this.offset.x, this.offset.y);

    const r = this.r;
    const eyeGap = r * 0.5;
    const baseEyeW = r * 0.5;
    const baseEyeH = r;
    const eyeH = baseEyeH * this.eyeOpen;

    const pupilW = r * 0.25;
    const pupilH = (r * 0.4) * this.eyeOpen;

    // 눈
    fill('black');
    ellipse(-eyeGap, 0, baseEyeW, eyeH);
    ellipse(eyeGap, 0, baseEyeW, eyeH);

    // 눈동자/하이라이트
    push();
    translate(this.pupilOffset.x * (r / 100), this.pupilOffset.y * (r / 100));
    fill('white');
    ellipse(-eyeGap, -pupilH * 0.3, pupilW, pupilH);
    ellipse(eyeGap, -pupilH * 0.3, pupilW, pupilH);
    pop();

    pop();
  }
}