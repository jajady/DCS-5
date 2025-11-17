class Fins {
  constructor(parent, r) {
    this.parent = parent;
    this.r = r;
    this.offset = createVector(0, 0);
    this.leftLocal = createVector(-150, 0);
    this.rightLocal = createVector(150, 0);

    this.finCount = 30;

    // 🔥 ellipseX를 저장할 변수
    this.currentEllipseX = this.r;
  }

  setMove(baseMove, factor) {
    this.offset = baseMove.copy().mult(factor);
  }

  getAnchorsLocal() {
    const left = p5.Vector.add(this.leftLocal, this.offset);
    const right = p5.Vector.add(this.rightLocal, this.offset);
    return { left, right };
  }

  // 🔥 sin으로 진동한 ellipseX가 반영된 지느러미 끝점 좌표 반환
  getEllipseCentersLocal() {
    const centers = [];

    // 🔥 show()에서 업데이트된 ellipseX 사용!
    const base = createVector(this.currentEllipseX, 0);
    const step = TWO_PI / this.finCount;

    for (let i = 0; i < this.finCount; i++) {
      const v = base.copy().rotate(i * step);
      v.add(this.offset);
      centers.push(v);
    }
    return centers;
  }

  show() {
    push();
    translate(this.offset.x, this.offset.y);

    // 🌊 sin 기반 진동값 (0~1)
    const t = frameCount * 0.05;
    const sinValue = (sin(t) + 1) * 0.5;

    // 🔥 최소값 = this.r*0.1, 최대값 = this.r
    const minX = this.r * 0.4;      // 1/10
    const maxX = this.r * 2;
    const ellipseX = minX + sinValue * (maxX - minX);  // = r*0.1 + sin*(r*0.9)

    // 🔥 진동한 ellipseX를 상태로 저장해서 getEllipseCentersLocal에 반영
    this.currentEllipseX = ellipseX;

    const baseColor = this.parent.c2;      // Octo의 c2
    const rC = red(baseColor);
    const gC = green(baseColor);
    const bC = blue(baseColor);
    const ellipseAlpha = 0.4 * 255;       // 예: 40% 불투명도

    const ellipseW = this.r * 0.1;
    const ellipseH = this.r * 0.1;

    for (let i = 0; i < this.finCount; i++) {
      strokeWeight(this.r * 0.18);
      stroke(rC, gC, bC, 0.3 * 255);
      // fill('rgba(198, 216, 255, 1)');
      fill(rC, gC, bC, ellipseAlpha);
      ellipse(ellipseX, 0, ellipseW, ellipseH);

      rotate(TWO_PI / this.finCount);
    }

    pop();
  }
}
