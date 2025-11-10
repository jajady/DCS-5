class octoMouth {
  constructor(r) {
    this.r = r;   // 75
    this.offset = createVector(0, 0);
  }

  setMove(baseMove, factor) {
    this.offset = baseMove.copy().mult(factor);
  }

  show() {
    push();
    translate(this.offset.x, this.offset.y);
    fill('white');
    ellipse(0, this.r, this.r * 0.5, this.r * 0.3);   // 입
    pop();
  }
}