import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// 라벨 크기 (mm) - 원본 기본값 기준
const LABEL_W = 100;
const LABEL_H = 70;
const MARGIN = 5;

interface LabelField {
  label: string;
  value: string;
  x: number;
  y: number;
  fontSize?: number;
  bold?: boolean;
}

interface PrintOptions {
  title: string;
  rows: Record<string, any>[];
  fields: LabelField[][];  // per-row fields
  qrData?: string[];       // per-row QR data
  orientation?: 'portrait' | 'landscape';
}

/** QR코드를 DataURL로 생성 */
async function generateQR(text: string): Promise<string> {
  if (!text) return '';
  return QRCode.toDataURL(text, {
    width: 80,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
}

/** 한글 포함 텍스트의 대략적 너비 계산 */
function textWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const ch of text) {
    width += ch.charCodeAt(0) > 127 ? fontSize * 0.6 : fontSize * 0.35;
  }
  return width;
}

/** 라벨 PDF 생성 및 미리보기 */
export async function printLabels(options: PrintOptions): Promise<void> {
  const { title, rows, fields, qrData, orientation = 'landscape' } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [LABEL_W, LABEL_H],
  });

  for (let i = 0; i < rows.length; i++) {
    if (i > 0) doc.addPage([LABEL_W, LABEL_H], orientation);

    const rowFields = fields[i] || [];

    // 테두리
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(MARGIN, MARGIN, LABEL_W - MARGIN * 2, LABEL_H - MARGIN * 2);

    // 타이틀
    doc.setFontSize(8);
    doc.text(title, LABEL_W / 2, MARGIN + 4, { align: 'center' });

    // 필드 렌더링
    for (const field of rowFields) {
      const fs = field.fontSize || 7;
      doc.setFontSize(fs);

      // 라벨: 값 형식
      const labelText = `${field.label}: ${field.value}`;
      doc.text(labelText, field.x, field.y);
    }

    // QR코드
    if (qrData?.[i]) {
      try {
        const qrImg = await generateQR(qrData[i]);
        if (qrImg) {
          doc.addImage(qrImg, 'PNG', LABEL_W - MARGIN - 18, MARGIN + 6, 16, 16);
        }
      } catch {
        // QR 생성 실패 시 무시
      }
    }
  }

  // 새 탭에서 미리보기
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
}

// ===== 타입별 라벨 생성 함수들 =====

/** 가공(주) / 지중 라벨 */
export async function printJjuLabels(
  rows: Record<string, any>[],
  mainRow: { clientName: string; website: string }
) {
  const fields = rows.map((r) => [
    { label: '관리구', value: r.mgmt_district || '', x: MARGIN + 2, y: MARGIN + 10 },
    { label: '전주번호', value: r.pole_number || '', x: MARGIN + 2, y: MARGIN + 15 },
    { label: '선로명', value: r.line_name || '', x: MARGIN + 2, y: MARGIN + 20 },
    { label: '번호', value: [r.number1, r.number2, r.number3, r.number4, r.number5].filter(Boolean).join('-'), x: MARGIN + 2, y: MARGIN + 25 },
    { label: '시공년월', value: r.construction_date || '', x: MARGIN + 2, y: MARGIN + 30 },
    { label: '시공자', value: r.constructor || '', x: MARGIN + 2, y: MARGIN + 35 },
    { label: '감독자', value: r.supervisor || '', x: MARGIN + 2, y: MARGIN + 40 },
    { label: '점검일자', value: r.inspection_date || '', x: MARGIN + 2, y: MARGIN + 45 },
    { label: '접지저항', value: [r.ground_resistance1, r.ground_resistance2].filter(Boolean).join('/'), x: MARGIN + 2, y: MARGIN + 50 },
    { label: '비고', value: r.remark1 || '', x: MARGIN + 2, y: MARGIN + 55 },
  ]);

  const qrData = rows.map((r) => {
    const parts = [r.mgmt_district, r.pole_number, r.line_name].filter(Boolean);
    return mainRow.website ? `${mainRow.website}?${parts.join('/')}` : parts.join('/');
  });

  await printLabels({
    title: `번호찰 - ${mainRow.clientName}`,
    rows,
    fields,
    qrData,
  });
}

/** 등 라벨 */
export async function printDeungLabels(
  rows: Record<string, any>[],
  mainRow: { clientName: string }
) {
  const fields = rows.map((r) => [
    { label: '관리번호', value: [r.mgmt_number1, r.mgmt_number2, r.mgmt_number3].filter(Boolean).join('-'), x: MARGIN + 2, y: MARGIN + 10 },
    { label: '지점명', value: r.branch_name || '', x: MARGIN + 2, y: MARGIN + 16 },
    { label: '고객번호', value: [r.customer_number1, r.customer_number2, r.customer_number3].filter(Boolean).join('-'), x: MARGIN + 2, y: MARGIN + 22 },
    { label: '전산화번호', value: [r.computer_number1, r.computer_number2].filter(Boolean).join(' / '), x: MARGIN + 2, y: MARGIN + 28 },
    { label: '선로명', value: r.line_name || '', x: MARGIN + 2, y: MARGIN + 34 },
    { label: '전주번호', value: [r.pole_number1, r.pole_number2, r.pole_number3].filter(Boolean).join('-'), x: MARGIN + 2, y: MARGIN + 40 },
  ]);

  await printLabels({ title: `등 번호찰 - ${mainRow.clientName}`, rows, fields });
}

/** 기기 라벨 */
export async function printKikiLabels(
  rows: Record<string, any>[],
  mainRow: { clientName: string }
) {
  const fields = rows.map((r) => [
    { label: '관리구', value: r.mgmt_district || '', x: MARGIN + 2, y: MARGIN + 10 },
    { label: '전주번호', value: r.pole_number || '', x: MARGIN + 2, y: MARGIN + 15 },
    { label: '선로명', value: r.line_name || '', x: MARGIN + 2, y: MARGIN + 20 },
    { label: '번호', value: [r.number1, r.number2, r.number3, r.number4, r.number5].filter(Boolean).join('-'), x: MARGIN + 2, y: MARGIN + 25 },
    { label: '회선1', value: [r.line11, r.line12, r.line13, r.line14, r.line15].filter(Boolean).join('/'), x: MARGIN + 2, y: MARGIN + 30 },
    { label: '회선2', value: [r.line21, r.line22, r.line23, r.line24, r.line25].filter(Boolean).join('/'), x: MARGIN + 2, y: MARGIN + 35 },
    { label: '대규격', value: r.large_spec || '', x: MARGIN + 2, y: MARGIN + 40 },
    { label: '비고', value: r.remark1 || '', x: MARGIN + 2, y: MARGIN + 45 },
  ]);

  await printLabels({ title: `기기 번호찰 - ${mainRow.clientName}`, rows, fields });
}

/** 케이블 라벨 */
export async function printCableLabels(
  rows: Record<string, any>[],
  mainRow: { clientName: string }
) {
  const fields = rows.map((r) => [
    { label: 'HA', value: `${r.ha_ss || ''} / ${r.ha_dl || ''} / ${r.ha_section || ''}`, x: MARGIN + 2, y: MARGIN + 10 },
    { label: 'HB', value: `${r.hb_ss || ''} / ${r.hb_dl || ''} / ${r.hb_section || ''}`, x: MARGIN + 2, y: MARGIN + 16 },
    { label: 'S0', value: `${r.s0_number || ''} ${r.s0_sw_name || ''}`, x: MARGIN + 2, y: MARGIN + 22 },
    { label: 'S1', value: `${r.s1_number || ''} ${r.s1_sw_name || ''}`, x: MARGIN + 2, y: MARGIN + 28 },
    { label: '시공', value: `${r.construction_date || ''} ${r.construction_company || ''}`, x: MARGIN + 2, y: MARGIN + 34 },
    { label: '감독자', value: r.supervisor || '', x: MARGIN + 2, y: MARGIN + 40 },
    { label: '비고', value: r.remark1 || '', x: MARGIN + 2, y: MARGIN + 46 },
  ]);

  await printLabels({ title: `케이블 번호찰 - ${mainRow.clientName}`, rows, fields });
}

/** 기타 라벨 */
export async function printEtcLabels(
  rows: Record<string, any>[],
  mainRow: { clientName: string }
) {
  const fields = rows.map((r) => [
    { label: '관리구', value: r.mgmt_district || '', x: MARGIN + 2, y: MARGIN + 10 },
    { label: '전주번호', value: r.pole_number || '', x: MARGIN + 2, y: MARGIN + 16 },
    { label: '선로명', value: r.line_name || '', x: MARGIN + 2, y: MARGIN + 22 },
    { label: '번호', value: [r.number1, r.number2, r.number3, r.number4, r.number5].filter(Boolean).join('-'), x: MARGIN + 2, y: MARGIN + 28 },
    { label: '비고1', value: r.remark1 || '', x: MARGIN + 2, y: MARGIN + 34 },
    { label: '비고2', value: r.remark2 || '', x: MARGIN + 2, y: MARGIN + 40 },
    { label: '담당자', value: r.manager || '', x: MARGIN + 2, y: MARGIN + 46 },
  ]);

  await printLabels({ title: `기타 번호찰 - ${mainRow.clientName}`, rows, fields });
}

/** poleType에 따라 적절한 인쇄 함수 호출 */
export async function printByType(
  poleType: number,
  rows: Record<string, any>[],
  mainRow: { clientName: string; website: string }
) {
  if (rows.length === 0) {
    alert('인쇄할 데이터가 없습니다.');
    return;
  }

  switch (poleType) {
    case 0:
    case 1:
      return printJjuLabels(rows, mainRow);
    case 2:
      return printDeungLabels(rows, mainRow);
    case 4:
      return printKikiLabels(rows, mainRow);
    case 6:
    case 7:
    case 8:
      return printCableLabels(rows, mainRow);
    case 9:
      return printEtcLabels(rows, mainRow);
    default:
      alert('지원하지 않는 번호찰 유형입니다.');
  }
}
