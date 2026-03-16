export enum PoleType {
  OVERHEAD = 0,       // 가공(주)
  POLE = 1,           // 주
  LAMP = 2,           // 등
  EQUIPMENT = 4,      // 기기
  CABLE = 6,          // 케이블
  CABLE_LABEL = 7,    // 케이블라벨
  CABLE2 = 8,         // 케이블2
  ETC = 9,            // 기타
}

export const POLE_TYPE_LABELS: Record<number, string> = {
  [PoleType.OVERHEAD]: '가공(주)',
  [PoleType.POLE]: '주',
  [PoleType.LAMP]: '등',
  [PoleType.EQUIPMENT]: '기기',
  [PoleType.CABLE]: '케이블',
  [PoleType.CABLE_LABEL]: '케이블라벨',
  [PoleType.CABLE2]: '케이블2',
  [PoleType.ETC]: '기타',
};
