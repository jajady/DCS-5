class Mouth {
  constructor(parent, offsetX = 0, offsetY = 0.1, widthMult = 0.3, heightMult = 0.15) {
    this.parent = parent;
    this.offsetX = offsetX;   // 부모 r 기준 오프셋
    this.offsetY = offsetY;
    this.widthMult = widthMult;
    this.heightMult = heightMult;

    // 위치/치수
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;

    // 펄스 상태 (Headset 로직 이식)
    this._wasTouchedFood = false;
    this._pulseSeq = [];
    this._pulse = null; // { start, mult, up, hold, down }
    this._big = { up: 18, hold: 8, down: 22 };
    this._small = { up: 14, hold: 6, down: 18 };
    this.scale = 1;
  }

  _startEatPulseSequence() {
    this._pulseSeq = [
      { mult: 3, ...this._big },
      { mult: 2, ...this._small },
      { mult: 2, ...this._small },
      { mult: 2, ...this._small },
      { mult: 2, ...this._small },
    ];
    this._pulse = null;
  }

  update() {
    const p = this.parent;

    // ① 먹이 닿는 순간(상승 에지) 펄스 시작
    if (p.touchedFood && !this._wasTouchedFood) this._startEatPulseSequence();
    this._wasTouchedFood = p.touchedFood;

    // ② 큐에서 펄스 하나씩 꺼내서 실행
    if (!this._pulse && this._pulseSeq.length > 0) {
      const next = this._pulseSeq.shift();
      this._pulse = { start: frameCount, ...next };
    }

    // ③ 펄스 이징
    this.scale = 1;
    if (this._pulse) {
      const { start, mult, up, hold, down } = this._pulse;
      const elapsed = frameCount - start;
      const total = up + hold + down;
      const ease = (t) => (1 - Math.cos(Math.PI * t)) / 2;

      if (elapsed <= up) {
        this.scale = 1 + (mult - 1) * ease(elapsed / up);
      } else if (elapsed <= up + hold) {
        this.scale = mult;
      } else if (elapsed <= total) {
        const t = (elapsed - up - hold) / down;
        this.scale = mult - (mult - 1) * ease(t);
      } else {
        this._pulse = null;
        this.scale = 1;
      }
    }

    // ④ 위치/치수 업데이트 (애벌레는 머리 원 기준)
    const head = p.circles?.[0] || p.position;
    const r = p.r * p.getVisualScale();
    this.w = r * this.widthMult;
    this.h = r * this.heightMult * this.scale;
    this.x = head.x + r * this.offsetX;
    this.y = head.y + r * this.offsetY;
  }

  show() {
    // Headset과 같은 모양(둥근 사각형 아래쪽만 라운드)
    push();
    noStroke();
    fill(0);
    rectMode(CORNERS);

    const halfW = this.w;
    const topY = this.y - this.h * 0.5;
    const bottomY = this.y + this.h * 0.5;
    const cornerR = constrain(this.h * 0.6, 1, min(this.w, this.h) - 0.5);

    rect(this.x - halfW, topY, this.x + halfW, bottomY, 0, 0, cornerR, cornerR);
    pop();
  }
}