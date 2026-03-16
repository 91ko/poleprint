import type { ColDef } from 'ag-grid-community';
import ComputerNumberEditor from '../components/editors/ComputerNumberEditor';

// 전산화번호 공통 컬럼 설정 (8자리: 5+3)
const computerNumberColDef = {
  cellEditor: ComputerNumberEditor,
  cellEditorPopup: true,
  valueFormatter: (p: any) => {
    const v = String(p.value || '');
    if (v.includes('-')) return v;
    const digits = v.replace(/[^0-9]/g, '');
    if (digits.length === 0) return '';
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  },
};

// 체크박스 컬럼 공통
const checkboxCol = (field: string, headerName: string): ColDef => ({
  field,
  headerName,
  width: 55,
  editable: true,
  cellRenderer: (params: any) => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = params.value === '1' || params.value === true || params.value === 'True';
    input.style.cursor = 'pointer';
    input.addEventListener('change', () => {
      params.setValue(input.checked ? '1' : '0');
    });
    return input;
  },
});

// =====================================================
// 가공(주) - detail_jju (원본 스크린샷 기준 전체 컬럼)
// =====================================================
const jjuColumns: ColDef[] = [
  { field: 'number', headerName: '번호', width: 55, editable: false, pinned: 'left' },
  // 구전산화번호
  { field: 'old_mgmt_district', headerName: '관리구(구)', width: 90, editable: true },
  { field: 'old_computer_number', headerName: '전산번호(구)', width: 110, editable: true, ...computerNumberColDef },
  // 신전산화번호
  { field: 'mgmt_district', headerName: '관리구(신)', width: 90, editable: true,
    cellStyle: { backgroundColor: '#ffffcc' } },
  { field: 'pole_number', headerName: '전산번호(신)', width: 110, editable: true,
    cellStyle: { backgroundColor: '#ffffcc' }, ...computerNumberColDef },
  // 선로/전주
  { field: 'line_name', headerName: '선로명', width: 100, editable: true,
    cellStyle: { backgroundColor: '#ffffcc' } },
  { field: 'number1', headerName: '번호1(A1)', width: 90, editable: true,
    cellStyle: { backgroundColor: '#ffffcc' } },
  { field: 'number2', headerName: 'A2', width: 60, editable: true },
  { field: 'number3', headerName: 'A3', width: 60, editable: true },
  { field: 'number4', headerName: 'A4', width: 60, editable: true },
  { field: 'number5', headerName: 'A5', width: 60, editable: true },
  // 시공 정보
  { field: 'length', headerName: '장척', width: 55, editable: true },
  { field: 'construction_date', headerName: '시공년월', width: 90, editable: true },
  { field: 'constructor', headerName: '시공자', width: 80, editable: true },
  { field: 'dl_name', headerName: 'DL명', width: 80, editable: true },
  { field: 'supervisor', headerName: '감독자', width: 80, editable: true },
  // COS휴즈/상표시찰
  { field: 'cos_fuse_capacity', headerName: 'COS휴즈용량', width: 100, editable: true },
  { field: 'top_label_row1', headerName: '상표시찰1단', width: 100, editable: true },
  { field: 'top_label_row2', headerName: '상표시찰2단', width: 100, editable: true },
  // 점검
  { field: 'inspection_date', headerName: '점검일자', width: 90, editable: true },
  { field: 'remark1', headerName: '비고', width: 120, editable: true },
  // 접지
  { field: 'ground_resistance1', headerName: '접지1A', width: 70, editable: true },
  { field: 'ground_resistance2', headerName: '접지2A', width: 70, editable: true },
  // 체크박스들
  checkboxCol('is_new', '신규'),
  checkboxCol('is_demolished', '철거'),
  checkboxCol('intake', '인입'),
  checkboxCol('print_flag', '인쇄'),
  // 기타
  { field: 'format', headerName: '형식', width: 70, editable: true },
  { field: 'text1', headerName: '지선주', width: 70, editable: true },
  { field: 'old_line_name', headerName: '선로명(구)', width: 100, editable: true },
  { field: 'old_pole_number', headerName: '전주번호(구)', width: 100, editable: true },
  { field: 'current_pole_number', headerName: '현행번호', width: 90, editable: true },
  { field: 'sort_order', headerName: '정렬', width: 55, editable: true, type: 'numericColumn' },
];

// =====================================================
// 지중 - detail_jjung
// =====================================================
const jjungColumns: ColDef[] = [
  { field: 'number', headerName: '번호', width: 55, editable: false, pinned: 'left' },
  { field: 'old_mgmt_district', headerName: '관리구(구)', width: 90, editable: true },
  { field: 'old_computer_number', headerName: '전산번호(구)', width: 110, editable: true, ...computerNumberColDef },
  { field: 'mgmt_district', headerName: '관리구(신)', width: 90, editable: true,
    cellStyle: { backgroundColor: '#ffffcc' } },
  { field: 'pole_number', headerName: '전산번호(신)', width: 110, editable: true,
    cellStyle: { backgroundColor: '#ffffcc' }, ...computerNumberColDef },
  { field: 'line_name', headerName: '선로명', width: 100, editable: true,
    cellStyle: { backgroundColor: '#ffffcc' } },
  { field: 'number1', headerName: '번호1', width: 80, editable: true,
    cellStyle: { backgroundColor: '#ffffcc' } },
  { field: 'number2', headerName: '번호2', width: 70, editable: true },
  { field: 'number3', headerName: '번호3', width: 70, editable: true },
  { field: 'number4', headerName: '번호4', width: 70, editable: true },
  { field: 'number5', headerName: '번호5', width: 70, editable: true },
  { field: 'length', headerName: '장척', width: 55, editable: true },
  { field: 'construction_date', headerName: '시공년월', width: 90, editable: true },
  { field: 'constructor', headerName: '시공자', width: 80, editable: true },
  { field: 'dl_name', headerName: 'DL명', width: 80, editable: true },
  { field: 'supervisor', headerName: '감독자', width: 80, editable: true },
  { field: 'inspection_date', headerName: '점검일자', width: 90, editable: true },
  { field: 'remark1', headerName: '비고', width: 120, editable: true },
  { field: 'ground_resistance1', headerName: '접지1', width: 70, editable: true },
  { field: 'ground_resistance2', headerName: '접지2', width: 70, editable: true },
  checkboxCol('is_new', '신규'),
  checkboxCol('is_demolished', '철거'),
  checkboxCol('print_flag', '인쇄'),
  { field: 'format', headerName: '형식', width: 70, editable: true },
  { field: 'text1', headerName: '지선주', width: 70, editable: true },
  { field: 'sort_order', headerName: '정렬', width: 55, editable: true, type: 'numericColumn' },
];

// =====================================================
// 등 - detail_deung
// =====================================================
const deungColumns: ColDef[] = [
  { field: 'number', headerName: '번호', width: 55, editable: false, pinned: 'left' },
  { field: 'mgmt_number1', headerName: '관리번호1', width: 100, editable: true },
  { field: 'mgmt_number2', headerName: '관리번호2', width: 100, editable: true },
  { field: 'mgmt_number3', headerName: '관리번호3', width: 100, editable: true },
  { field: 'branch_name', headerName: '지점명', width: 110, editable: true },
  { field: 'customer_number1', headerName: '고객번호1', width: 100, editable: true },
  { field: 'customer_number2', headerName: '고객번호2', width: 100, editable: true },
  { field: 'customer_number3', headerName: '고객번호3', width: 100, editable: true },
  { field: 'computer_number1', headerName: '전산화번호1', width: 130, editable: true, ...computerNumberColDef },
  { field: 'computer_number2', headerName: '전산화번호2', width: 130, editable: true, ...computerNumberColDef },
  { field: 'line_name', headerName: '선로명', width: 110, editable: true },
  { field: 'pole_number1', headerName: '전주번호1', width: 100, editable: true },
  { field: 'pole_number2', headerName: '전주번호2', width: 100, editable: true },
  { field: 'pole_number3', headerName: '전주번호3', width: 100, editable: true },
  { field: 'sort_order', headerName: '정렬', width: 55, editable: true, type: 'numericColumn' },
  checkboxCol('output', '출력'),
];

// =====================================================
// 기기 - detail_kiki
// =====================================================
const kikiColumns: ColDef[] = [
  { field: 'number', headerName: '번호', width: 55, editable: false, pinned: 'left' },
  { field: 'mgmt_district', headerName: '관리구', width: 90, editable: true },
  { field: 'pole_number', headerName: '전주번호', width: 110, editable: true },
  { field: 'line_name', headerName: '선로명', width: 110, editable: true },
  { field: 'number1', headerName: '번호1', width: 80, editable: true },
  { field: 'number2', headerName: '번호2', width: 80, editable: true },
  { field: 'number3', headerName: '번호3', width: 80, editable: true },
  { field: 'number4', headerName: '번호4', width: 80, editable: true },
  { field: 'number5', headerName: '번호5', width: 80, editable: true },
  { field: 'line11', headerName: '회선11', width: 70, editable: true },
  { field: 'line12', headerName: '회선12', width: 70, editable: true },
  { field: 'line13', headerName: '회선13', width: 70, editable: true },
  { field: 'line14', headerName: '회선14', width: 70, editable: true },
  { field: 'line15', headerName: '회선15', width: 70, editable: true },
  { field: 'line21', headerName: '회선21', width: 70, editable: true },
  { field: 'line22', headerName: '회선22', width: 70, editable: true },
  { field: 'line23', headerName: '회선23', width: 70, editable: true },
  { field: 'line24', headerName: '회선24', width: 70, editable: true },
  { field: 'line25', headerName: '회선25', width: 70, editable: true },
  { field: 'large_spec', headerName: '대규격', width: 90, editable: true },
  { field: 'remark1', headerName: '비고1', width: 120, editable: true },
  { field: 'remark2', headerName: '비고2', width: 120, editable: true },
  checkboxCol('print_flag', '인쇄'),
  { field: 'sort_order', headerName: '정렬', width: 55, editable: true, type: 'numericColumn' },
];

// =====================================================
// 케이블 공통 - detail_cable, detail_cable2, detail_cable_label
// =====================================================
const cableColumns: ColDef[] = [
  { field: 'number', headerName: '번호', width: 55, editable: false, pinned: 'left' },
  { field: 'ha_ss', headerName: 'HA-SS', width: 90, editable: true,
    cellStyle: { backgroundColor: '#ffffcc' } },
  { field: 'ha_dl', headerName: 'HA-DL', width: 90, editable: true,
    cellStyle: { backgroundColor: '#ffffcc' } },
  { field: 'ha_section', headerName: 'HA구간', width: 100, editable: true },
  { field: 'hb_ss', headerName: 'HB-SS', width: 90, editable: true,
    cellStyle: { backgroundColor: '#ffffcc' } },
  { field: 'hb_dl', headerName: 'HB-DL', width: 90, editable: true,
    cellStyle: { backgroundColor: '#ffffcc' } },
  { field: 'hb_section', headerName: 'HB구간', width: 100, editable: true },
  { field: 's0_number', headerName: 'S0번호', width: 80, editable: true },
  { field: 's0_sw_name', headerName: 'S0-SW명', width: 90, editable: true },
  { field: 's0_location', headerName: 'S0위치', width: 90, editable: true },
  { field: 's0_ss', headerName: 'S0-SS', width: 80, editable: true },
  { field: 's0_dl', headerName: 'S0-DL', width: 80, editable: true },
  { field: 's1_number', headerName: 'S1번호', width: 80, editable: true },
  { field: 's1_sw_name', headerName: 'S1-SW명', width: 90, editable: true },
  { field: 's1_location', headerName: 'S1위치', width: 90, editable: true },
  { field: 's1_ss', headerName: 'S1-SS', width: 80, editable: true },
  { field: 's1_dl', headerName: 'S1-DL', width: 80, editable: true },
  { field: 's2_number', headerName: 'S2번호', width: 80, editable: true },
  { field: 's2_sw_name', headerName: 'S2-SW명', width: 90, editable: true },
  { field: 's2_location', headerName: 'S2위치', width: 90, editable: true },
  { field: 'construction_date', headerName: '시공년월', width: 100, editable: true },
  { field: 'construction_company', headerName: '시공회사', width: 100, editable: true },
  { field: 'project_number', headerName: '공사번호', width: 100, editable: true },
  { field: 'supervisor', headerName: '감독자', width: 90, editable: true },
  { field: 'remark1', headerName: '비고1', width: 120, editable: true },
  { field: 'remark2', headerName: '비고2', width: 120, editable: true },
  { field: 'sort_order', headerName: '정렬', width: 55, editable: true, type: 'numericColumn' },
  checkboxCol('output', '출력'),
];

// =====================================================
// 기타 - detail_etc
// =====================================================
const etcColumns: ColDef[] = [
  { field: 'number', headerName: '번호', width: 55, editable: false, pinned: 'left' },
  { field: 'mgmt_district', headerName: '관리구', width: 90, editable: true },
  { field: 'pole_number', headerName: '전주번호', width: 110, editable: true },
  { field: 'line_name', headerName: '선로명', width: 110, editable: true },
  { field: 'number1', headerName: '번호1', width: 80, editable: true },
  { field: 'number2', headerName: '번호2', width: 80, editable: true },
  { field: 'number3', headerName: '번호3', width: 80, editable: true },
  { field: 'number4', headerName: '번호4', width: 80, editable: true },
  { field: 'number5', headerName: '번호5', width: 80, editable: true },
  { field: 'remark1', headerName: '비고1', width: 140, editable: true },
  { field: 'remark2', headerName: '비고2', width: 140, editable: true },
  { field: 'remark3', headerName: '비고3', width: 140, editable: true },
  { field: 'remark4', headerName: '비고4', width: 140, editable: true },
  { field: 'manager', headerName: '담당자', width: 90, editable: true },
  { field: 'sort_order', headerName: '정렬', width: 55, editable: true, type: 'numericColumn' },
  checkboxCol('output', '출력'),
];

// poleType → detail table name
export const DETAIL_TABLE_MAP: Record<number, string> = {
  0: 'detail_jju',
  1: 'detail_jjung',
  2: 'detail_deung',
  4: 'detail_kiki',
  6: 'detail_cable',
  7: 'detail_cable_label',
  8: 'detail_cable2',
  9: 'detail_etc',
};

// poleType → column config
export const DETAIL_COLUMNS_MAP: Record<number, ColDef[]> = {
  0: jjuColumns,
  1: jjungColumns,
  2: deungColumns,
  4: kikiColumns,
  6: cableColumns,
  7: cableColumns,
  8: cableColumns,
  9: etcColumns,
};

// poleType → label
export const POLE_TYPE_LABELS: Record<number, string> = {
  0: '가공(주)',
  1: '주(지중)',
  2: '등',
  4: '기기',
  6: '케이블',
  7: '케이블라벨',
  8: '케이블2',
  9: '기타',
};
