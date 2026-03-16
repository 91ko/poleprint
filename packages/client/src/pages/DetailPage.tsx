import { useCallback, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  type CellValueChangedEvent,
} from 'ag-grid-community';
import {
  ArrowLeft, Plus, Save, Trash2, X,
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

ModuleRegistry.registerModules([AllCommunityModule]);

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const managementId = Number(id);
  const poleType = Number(searchParams.get('type') || '0');
  const clientName = searchParams.get('name') || '';

  const table = DETAIL_TABLE_MAP[poleType] || 'detail_jju';
  const columns = DETAIL_COLUMNS_MAP[poleType] || [];
  const typeLabel = POLE_TYPE_LABELS[poleType] || '';

  const gridRef = useRef<AgGridReact>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<number, Record<string, any>>>(new Map());

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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-10 bg-blue-800 flex items-center px-4 text-white text-sm font-bold shrink-0 gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 hover:bg-blue-700 px-2 py-1 rounded"
        >
          <ArrowLeft size={16} />
          목록
        </button>
        <span className="text-blue-200">|</span>
        <span>
          [{typeLabel}] {clientName} (ID: {managementId})
        </span>
      </div>

      {/* Toolbar */}
      <div className="h-11 bg-white border-b border-gray-300 flex items-center gap-1 px-2 shrink-0">
        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleAdd}
        >
          <Plus size={16} />
          행 추가
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded ${
            hasChanges
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          <Save size={16} />
          저장
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          onClick={handleCancel}
        >
          <X size={16} />
          취소
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          onClick={handleDelete}
        >
          <Trash2 size={16} />
          삭제
        </button>

        <div className="flex-1" />
        <span className="text-sm text-gray-500">총 {rows.length}건</span>
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
        />
      </div>

      {/* Status */}
      <div className="h-7 bg-gray-100 border-t border-gray-300 flex items-center px-3 text-xs text-gray-600 shrink-0">
        <span>셀을 클릭하여 직접 편집할 수 있습니다. 편집 후 저장 버튼을 눌러주세요.</span>
      </div>
    </div>
  );
}
