import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import Toolbar from '../components/layout/Toolbar';
import StatusBar from '../components/layout/StatusBar';
import MainTableGrid from '../components/main-table/MainTableGrid';
import {
  useMainTableList,
  useCreateMainTable,
  useUpdateMainTable,
  useDeleteMainTable,
  type MainTableRow,
} from '../hooks/use-main-table';
import { exportMainTable } from '../lib/excel';

export default function MainPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState<MainTableRow | null>(null);
  const [pendingChanges, setPendingChanges] = useState<
    Map<number, Record<string, unknown>>
  >(new Map());

  const gridRef = useRef<AgGridReact<MainTableRow>>(null);

  const { data: rows = [], refetch } = useMainTableList(search || undefined);
  const createMutation = useCreateMainTable();
  const updateMutation = useUpdateMainTable();
  const deleteMutation = useDeleteMainTable();

  const hasChanges = pendingChanges.size > 0;

  const handleNew = useCallback(
    (poleType: number) => {
      createMutation.mutate({ poleType });
    },
    [createMutation]
  );

  const handleCellChanged = useCallback(
    (id: number, field: string, value: unknown) => {
      setPendingChanges((prev) => {
        const next = new Map(prev);
        const existing = next.get(id) || {};
        next.set(id, { ...existing, [field]: value });
        return next;
      });
    },
    []
  );

  const handleSave = useCallback(async () => {
    const promises = Array.from(pendingChanges.entries()).map(([id, data]) =>
      updateMutation.mutateAsync({ id, ...data })
    );
    await Promise.all(promises);
    setPendingChanges(new Map());
  }, [pendingChanges, updateMutation]);

  const handleCancel = useCallback(() => {
    setPendingChanges(new Map());
    refetch();
  }, [refetch]);

  const handleDelete = useCallback(() => {
    if (!selectedRow) {
      alert('삭제할 항목을 선택하세요.');
      return;
    }
    if (selectedRow.id <= 6) {
      alert('샘플 데이터(ID 1~6)는 삭제할 수 없습니다.');
      return;
    }
    if (confirm(`ID ${selectedRow.id} "${selectedRow.clientName}"을(를) 삭제하시겠습니까?`)) {
      deleteMutation.mutate(selectedRow.id);
      setSelectedRow(null);
    }
  }, [selectedRow, deleteMutation]);

  const handleRowDoubleClick = useCallback((row: MainTableRow) => {
    navigate(`/detail/${row.id}?type=${row.poleType}&name=${encodeURIComponent(row.clientName)}&web=${encodeURIComponent(row.website || '')}`);
  }, [navigate]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-10 bg-blue-800 flex items-center px-4 text-white text-sm font-bold shrink-0">
        한전번호찰 통합프로그램 (Web)
      </div>

      <Toolbar
        onNew={handleNew}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
        onRefresh={() => {
          setPendingChanges(new Map());
          refetch();
        }}
        onSearch={setSearch}
        onExport={() => exportMainTable(rows)}
        hasChanges={hasChanges}
      />

      <MainTableGrid
        rows={rows}
        onCellChanged={handleCellChanged}
        onRowDoubleClick={handleRowDoubleClick}
        onSelectionChanged={setSelectedRow}
        gridRef={gridRef}
      />

      <StatusBar rowCount={rows.length} />
    </div>
  );
}
