import { useCallback, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  type CellValueChangedEvent,
} from 'ag-grid-community';
import {
  ArrowLeft, Plus, Save, Trash2, X, Printer, FileDown, FileUp,
  SearchCheck, ArrowUpDown,
} from 'lucide-react';
import {
  DETAIL_TABLE_MAP,
  DETAIL_COLUMNS_MAP,
  POLE_TYPE_LABELS,
} from '../config/detail-columns';
import {
  useDetailList,
  useCreateDetail,
  useUpdateDetail,
  useDeleteDetail,
} from '../hooks/use-detail';
import { exportDetailTable, readExcelFile } from '../lib/excel';
import { printByType } from '../lib/print-label';
import { api } from '../lib/api';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const managementId = Number(id);
  const poleType = Number(searchParams.get('type') || '0');
  const clientName = searchParams.get('name') || '';
  const website = searchParams.get('web') || '';

  const table = DETAIL_TABLE_MAP[poleType] || 'detail_jju';
  const columns = DETAIL_COLUMNS_MAP[poleType] || [];
  const typeLabel = POLE_TYPE_LABELS[poleType] || '';

  const gridRef = useRef<AgGridReact>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<number, Record<string, any>>>(new Map());
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  const { data: rows = [], refetch } = useDetailList(table, managementId);
  const createMutation = useCreateDetail(table, managementId);
  const updateMutation = useUpdateDetail(table, managementId);
  const deleteMutation = useDeleteDetail(table, managementId);

  const hasChanges = pendingChanges.size > 0;

  const handleAdd = useCallback(() => {
    const nextNumber = rows.length > 0
      ? Math.max(...rows.map((r: any) => r.number || 0)) + 1
      : 1;
    createMutation.mutate({
      number: nextNumber,
      sort_order: nextNumber,
    });
  }, [rows, createMutation]);

  const handleCellChanged = useCallback((event: CellValueChangedEvent) => {
    if (!event.data?.rowid || !event.colDef.field) return;
    const rowid = event.data.rowid;
    setPendingChanges((prev) => {
      const next = new Map(prev);
      const existing = next.get(rowid) || {};
      next.set(rowid, { ...existing, [event.colDef.field!]: event.newValue });
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    const promises = Array.from(pendingChanges.entries()).map(([rowid, data]) =>
      updateMutation.mutateAsync({ rowid, ...data })
    );
    await Promise.all(promises);
    setPendingChanges(new Map());
  }, [pendingChanges, updateMutation]);

  const handleCancel = useCallback(() => {
    setPendingChanges(new Map());
    refetch();
  }, [refetch]);

  const handleDelete = useCallback(() => {
    if (!selectedRowId) {
      alert('삭제할 행을 선택하세요.');
      return;
    }
    if (confirm('선택한 행을 삭제하시겠습니까?')) {
      deleteMutation.mutate(selectedRowId);
      setSelectedRowId(null);
    }
  }, [selectedRowId, deleteMutation]);

  const handleSelectionChanged = useCallback(() => {
    if (gridRef.current?.api) {
      const selected = gridRef.current.api.getSelectedRows();
      setSelectedRowId(selected[0]?.rowid || null);
    }
  }, []);

  // 중복검사 (전주번호/관리구 기준)
  const handleDuplicateCheck = useCallback(() => {
    const field = poleType === 6 || poleType === 7 || poleType === 8
      ? 'ha_ss' : 'pole_number';
    const fieldName = poleType === 6 || poleType === 7 || poleType === 8
      ? 'HA-SS' : '전주번호';

    const values = rows.map((r: any) => r[field]).filter(Boolean);
    const duplicates = values.filter((v: string, i: number) => values.indexOf(v) !== i);
    const uniqueDups = [...new Set(duplicates)];

    if (uniqueDups.length === 0) {
      alert('중복 데이터가 없습니다.');
    } else {
      alert(`중복된 ${fieldName}: ${uniqueDups.join(', ')} (${uniqueDups.length}건)`);
    }
  }, [rows, poleType]);

  // 전주번호 정렬
  const handleSortByPoleNumber = useCallback(() => {
    if (!gridRef.current?.api) return;
    const field = poleType === 6 || poleType === 7 || poleType === 8
      ? 'ha_ss' : (poleType === 2 ? 'mgmt_number1' : 'number1');
    gridRef.current.api.applyColumnState({
      state: [{ colId: field, sort: 'asc' }],
      defaultState: { sort: null },
    });
  }, [poleType]);

  // Excel 내보내기
  const handleExport = useCallback(() => {
    exportDetailTable(rows, typeLabel, clientName);
  }, [rows, typeLabel, clientName]);

  // Excel 가져오기
  const handleImportClick = useCallback((mode: 'append' | 'replace') => {
    setImportMode(mode);
    fileInputRef.current?.click();
  }, []);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedRows = await readExcelFile(file);

      // 삭제 후 추가 모드
      if (importMode === 'replace') {
        if (!confirm(`기존 ${rows.length}건을 삭제하고 ${importedRows.length}건을 새로 추가합니다. 진행하시겠습니까?`)) {
          e.target.value = '';
          return;
        }
        for (const row of rows) {
          await api.delete(`/detail/${table}/${(row as any).rowid}`);
        }
      }

      let num = importMode === 'replace'
        ? 1
        : (rows.length > 0 ? Math.max(...rows.map((r: any) => r.number || 0)) + 1 : 1);

      for (const row of importedRows) {
        await api.post(`/detail/${table}`, {
          management_id: managementId,
          number: num,
          sort_order: num,
          ...row,
        });
        num++;
      }

      alert(`${importedRows.length}건 가져오기 완료`);
      refetch();
    } catch (err: any) {
      alert('가져오기 실패: ' + err.message);
    }

    e.target.value = '';
  }, [rows, table, managementId, refetch, importMode]);

  // 라벨 인쇄
  const handlePrint = useCallback(() => {
    printByType(poleType, rows, { clientName, website });
  }, [poleType, rows, clientName, website]);

  return (
    <div className="h-full flex flex-col">
      {/* Header - 원본 스타일 */}
      <div className="h-10 bg-blue-800 flex items-center px-4 text-white text-sm font-bold shrink-0 gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 hover:bg-blue-700 px-2 py-1 rounded"
        >
          <ArrowLeft size={16} />
          목록
        </button>
        <span className="text-blue-200">|</span>
        <span>{typeLabel} 입력</span>
      </div>

      {/* Info bar - 원본의 ID/제작일/거래처명 바 */}
      <div className="h-8 bg-gray-50 border-b border-gray-200 flex items-center px-3 text-xs gap-4 shrink-0">
        <span className="font-bold text-blue-700">ID: {managementId}</span>
        <span className="text-gray-500">거래처명: <strong className="text-gray-800">{clientName}</strong></span>
        <span className="text-gray-500">번호찰구분: <strong className="text-gray-800">{typeLabel}</strong></span>
        <div className="flex-1" />
        <span className="text-gray-400">{typeLabel}번호찰제작({managementId})</span>
      </div>

      {/* Toolbar */}
      <div className="h-11 bg-white border-b border-gray-300 flex items-center gap-1 px-2 shrink-0 flex-wrap">
        {/* 기본 CRUD */}
        <button
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleAdd}
        >
          <Plus size={14} />
          행추가
        </button>
        <button
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded ${
            hasChanges ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          <Save size={14} />
          저장
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={handleCancel}>
          <X size={14} />
          취소
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600" onClick={handleDelete}>
          <Trash2 size={14} />
          삭제
        </button>

        <div className="w-px h-6 bg-gray-300 mx-0.5" />

        {/* 데이터 도구 */}
        <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-amber-500 text-white rounded hover:bg-amber-600" onClick={handleDuplicateCheck}>
          <SearchCheck size={14} />
          중복검사
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-sky-500 text-white rounded hover:bg-sky-600" onClick={handleSortByPoleNumber}>
          <ArrowUpDown size={14} />
          번호정렬
        </button>

        <div className="w-px h-6 bg-gray-300 mx-0.5" />

        {/* 인쇄 */}
        <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700" onClick={handlePrint}>
          <Printer size={14} />
          출력
        </button>

        <div className="w-px h-6 bg-gray-300 mx-0.5" />

        {/* Excel */}
        <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700" onClick={handleExport}>
          <FileDown size={14} />
          엑셀저장
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-orange-500 text-white rounded hover:bg-orange-600" onClick={() => handleImportClick('append')}>
          <FileUp size={14} />
          이어서추가
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-400 text-white rounded hover:bg-red-500" onClick={() => handleImportClick('replace')}>
          <FileUp size={14} />
          삭제후추가
        </button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />

        <div className="flex-1" />
        <span className="text-xs text-gray-500">총 {rows.length}건</span>
      </div>

      {/* Grid */}
      <div className="flex-1 ag-theme-alpine">
        <AgGridReact
          ref={gridRef}
          rowData={rows}
          columnDefs={columns}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
          }}
          rowSelection="single"
          singleClickEdit={true}
          enterNavigatesVerticallyAfterEdit={true}
          undoRedoCellEditing={true}
          getRowId={(params) => String(params.data.rowid)}
          onCellValueChanged={handleCellChanged}
          onSelectionChanged={handleSelectionChanged}
          rowHeight={28}
          headerHeight={32}
        />
      </div>

      {/* Status */}
      <div className="h-7 bg-gray-100 border-t border-gray-300 flex items-center px-3 text-xs text-gray-600 shrink-0">
        <span>셀 클릭→편집 | 노란색 컬럼=필수 | 중복검사→전주번호 기준 | 출력→PDF미리보기(QR포함)</span>
      </div>
    </div>
  );
}
