// ====================== Eyes (눈 + 눈동자 + 감기) ======================
class OctoEyes {
  constructor(r) {
    this.offset = createVector(0, 0);      // 눈 전체 이동
    this.pupilOffset = createVector(0, 0); // 눈동자 이동

    this.r = r;                            // 눈 크기 (지름) 150
    this.pupilLimit = this.r * 0.5;       // 눈동자는 너무 많이 안 움직이게

    // 깜빡임 상태
    this.eyeOpen = 1.0;
    this._blinkPhase = 0;
    this._blinkSpeed = 0.25;
  }

  // baseMove: 전체 얼굴이 움직이려는 벡터
  // factor: 눈이 그걸 얼마나 따라갈지
  // pupilLimit: 눈동자만 따로 제한
  setMove(baseMove, factor) {
    this.offset = baseMove.copy().mult(factor);
    this.pupilOffset = baseMove.copy();
    this.pupilOffset.limit(this.pupilLimit);
  }

  show() {
    push();
    translate(this.offset.x, this.offset.y);

    const r = this.r;              // 기준 눈 크기
    const eyeGap = r * 0.5;        // 두 눈 중심 간 거리 절반 (좌우 간격 조정)
    const pupilSize = r * 0.4;     // 눈 빤짝이 크기
    const eyelidHeight = r * 0.2;  // 눈 감을 때 두께

    if (mouseIsPressed) {
      // 👁️ 눈 감기
      fill('black');
      rectMode(CENTER);
      rect(-eyeGap, 0, r * 0.5, eyelidHeight, r * 0.05);
      rect(eyeGap, 0, r * 0.5, eyelidHeight, r * 0.05);
    } else {
      // 👁️ 눈 뜸
      fill('black');
      ellipse(-eyeGap, 0, r * 0.5, r);  // 왼쪽 눈 흰자
      ellipse(eyeGap, 0, r * 0.5, r);   // 오른쪽 눈 흰자

      // 👁️ 빤짝이
      push();
      // pupilOffset도 r 비율에 따라 조정
      translate(this.pupilOffset.x * (r / 100), this.pupilOffset.y * (r / 100));
      fill('white');
      ellipse(-eyeGap, -pupilSize * 0.3, pupilSize * 0.5, pupilSize); // 왼쪽 눈동자
      ellipse(eyeGap, -pupilSize * 0.3, pupilSize * 0.5, pupilSize);  // 오른쪽 눈동자
      pop();
    }

    pop();
  }
}