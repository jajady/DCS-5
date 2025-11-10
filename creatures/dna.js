/* ---------------------------------------------------
   DNA: 유전 정보 클래스
   - 여기서는 길이 1의 실수 배열(0~1)로 간단화
   - genes[0]을 사용해 개체의 크기/최대속도를 결정
--------------------------------------------------- */
class DNA {
  constructor() {
    this.genes = [];
    // 크기/속도 스칼라
    this.genes[0] = random(0, 1);              // 0~1 사이 균등 난수

    const palettes = [
      {
        c1: color('#ff9ae9ff'), // 분홍
        c2: color('#ffd4f6ff'),
        c3: color('#73cdf7ff'),
        c4: color('#9665feff')
      },
      {
        c1: color('#7CFC00'), // 연두
        c2: color('#d5ffaaff'),
        c3: color('#efe11bff'),
        c4: color('#f9b701ff'),
      },
      {
        c1: color('#ffff78ff'), // 노랑
        c2: color('#ffffceff'),
        c3: color('#ffb274ff'),
        c4: color('#ff674cff'),
      },
      {
        c1: color('#a0fdffff'),  // 하늘색
        c2: color('#d5fdfeff'),
        c3: color('#52ff78ff'),
        c4: color('#00e990ff')
      }
    ];
    // 색상 팔레트(객체)
    this.genes[1] = random(palettes);      // 고유 색 팔레트
    // 진화 단계
    this.genes[2] = 1;                   // 진화 단계(초기값 1)
  }

  // 복사
  copy() {
    let newDNA = new DNA();
    newDNA.genes = this.genes.slice(); // 배열 복사
    return newDNA;
  }

  // 돌연변이: 확률로 임의 치환
  mutate(rate) {
    for (let i = 0; i < this.genes.length; i++) {
      if (random(1) < rate) {
        this.genes[0] = random(1);
      }
    }
  }
}