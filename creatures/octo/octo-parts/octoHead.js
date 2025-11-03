// ====================== Head (얼굴 원) ======================
class OctoHead {
  constructor(r) {
    this.r = r;   // Face 인스턴스 참조 저장
  }

  show() {
    fill('white');
    ellipse(0, 0, this.r * 2, this.r * 2);   // 얼굴 본체
  }
}