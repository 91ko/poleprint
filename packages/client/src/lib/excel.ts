import * as XLSX from 'xlsx';
import { DETAIL_TABLE_MAP, POLE_TYPE_LABELS } from '../config/detail-columns';

// 컬럼 한글 헤더 매핑
const MAIN_HEADERS: Record<string, string> = {
  id: 'ID', date: '날짜', clientName: '거래처명', remarks: '비고',
  totalQty: '총수량', unitPrice: '단가', amount: '금액',
  poleType: '번호찰구분', constructor: '시공자', website: '홈페이지',
  mgmt: '관리', mgmt1: '관리1', mgmt2: '관리2',
};

const DETAIL_HEADERS: Record<string, string> = {
  number: '번호', mgmt_district: '관리구', pole_number: '전주번호',
  line_name: '선로명', number1: '번호1', number2: '번호2',
  number3: '번호3', number4: '번호4', number5: '번호5',
  inspection_date: '점검일자', length: '장척', construction_date: '시공년월',
  constructor: '시공자', dl_name: 'DL명', supervisor: '감독자',
  remark1: '비고1', remark2: '비고2', remark3: '비고3', remark4: '비고4',
  ground_resistance1: '접지저항1', ground_resistance2: '접지저항2',
  format: '형식', old_mgmt_district: '구관리구', old_computer_number: '구전산번호',
  print_flag: '인쇄', sort_order: '정렬', output: '출력',
  mgmt_number1: '관리번호1', mgmt_number2: '관리번호2', mgmt_number3: '관리번호3',
  branch_name: '지점명', customer_number1: '고객번호1', customer_number2: '고객번호2',
  customer_number3: '고객번호3', computer_number1: '전산화번호1', computer_number2: '전산화번호2',
  pole_number1: '전주번호1', pole_number2: '전주번호2', pole_number3: '전주번호3',
  line11: '회선11', line12: '회선12', line13: '회선13', line14: '회선14', line15: '회선15',
  line21: '회선21', line22: '회선22', line23: '회선23', line24: '회선24', line25: '회선25',
  large_spec: '대규격', manager: '담당자',
  ha_ss: 'HA-SS', ha_dl: 'HA-DL', ha_section: 'HA구간',
  hb_ss: 'HB-SS', hb_dl: 'HB-DL', hb_section: 'HB구간',
  construction_company: '시공회사', project_number: '공사번호',
};

function getHeader(key: string): string {
  return MAIN_HEADERS[key] || DETAIL_HEADERS[key] || key;
}

/** 메인 목록 엑셀 내보내기 */
export function exportMainTable(rows: any[], filename = '전주관리_목록') {
  const data = rows.map((r) => {
    const obj: Record<string, any> = {};
    for (const [key, val] of Object.entries(r)) {
      const header = getHeader(key);
      obj[header] = key === 'poleType' ? (POLE_TYPE_LABELS[val as number] || val) : val;
    }
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '전주관리');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/** 세부 데이터 엑셀 내보내기 */
export function exportDetailTable(
  rows: any[],
  typeLabel: string,
  clientName: string
) {
  const data = rows.map((r) => {
    const obj: Record<string, any> = {};
    for (const [key, val] of Object.entries(r)) {
      if (key === 'rowid' || key === 'management_id') continue;
      obj[getHeader(key)] = val;
    }
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, typeLabel);
  XLSX.writeFile(wb, `${clientName}_${typeLabel}.xlsx`);
}

/** 엑셀 파일 읽기 → 행 데이터 배열 반환 */
export function readExcelFile(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        // 한글 헤더를 영문 필드명으로 역변환
        const reverseMain: Record<string, string> = {};
        for (const [k, v] of Object.entries(MAIN_HEADERS)) reverseMain[v] = k;
        const reverseDetail: Record<string, string> = {};
        for (const [k, v] of Object.entries(DETAIL_HEADERS)) reverseDetail[v] = k;
        const reverseAll = { ...reverseDetail, ...reverseMain };

        const result = json.map((row) => {
          const obj: Record<string, any> = {};
          for (const [header, val] of Object.entries(row)) {
            const field = reverseAll[header] || header;
            obj[field] = val;
          }
          return obj;
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
