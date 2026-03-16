import { useCallback, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type CellValueChangedEvent,
  type RowDoubleClickedEvent,
  type GridReadyEvent,
} from 'ag-grid-community';
import type { MainTableRow } from '../../hooks/use-main-table';

ModuleRegistry.registerModules([AllCommunityModule]);

const POLE_TYPE_LABELS: Record<number, string> = {
  0: '가공(주)',
  1: '주',
  2: '등',
  4: '기기',
  6: '케이블',
  7: '케이블라벨',
  8: '케이블2',
  9: '기타',
};

interface MainTableGridProps {
  rows: MainTableRow[];
  onCellChanged: (id: number, field: string, value: unknown) => void;
  onRowDoubleClick: (row: MainTableRow) => void;
  onSelectionChanged: (row: MainTableRow | null) => void;
  gridRef: React.RefObject<AgGridReact<MainTableRow> | null>;
}

export default function MainTableGrid({
  rows,
  onCellChanged,
  onRowDoubleClick,
  onSelectionChanged,
  gridRef,
}: MainTableGridProps) {
  const [columnDefs] = useState<ColDef<MainTableRow>[]>([
    { field: 'id', headerName: 'ID', width: 70, editable: false, sortable: true },
    {
      field: 'date',
      headerName: '날짜',
      width: 110,
      editable: true,
      cellEditor: 'agTextCellEditor',
    },
    { field: 'clientName', headerName: '거래처명', width: 160, editable: true },
    { field: 'remarks', headerName: '비고', width: 160, editable: true },
    {
      field: 'totalQty',
      headerName: '총수량',
      width: 80,
      editable: false,
      type: 'numericColumn',
    },
    {
      field: 'unitPrice',
      headerName: '단가',
      width: 90,
      editable: true,
      type: 'numericColumn',
      valueFormatter: (p) => (p.value ? Number(p.value).toLocaleString() : '0'),
    },
    {
      field: 'amount',
      headerName: '금액',
      width: 100,
      editable: true,
      type: 'numericColumn',
      valueFormatter: (p) => (p.value ? Number(p.value).toLocaleString() : '0'),
    },
    {
      field: 'poleType',
      headerName: '번호찰구분',
      width: 110,
      editable: false,
      valueFormatter: (p) => POLE_TYPE_LABELS[p.value] || String(p.value),
    },
    { field: 'constructor', headerName: '시공자', width: 100, editable: true },
    { field: 'website', headerName: '홈페이지', width: 130, editable: true },
    { field: 'mgmt', headerName: '관리', width: 100, editable: true },
    { field: 'mgmt1', headerName: '관리1', width: 100, editable: true },
    { field: 'mgmt2', headerName: '관리2', width: 100, editable: true },
  ]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Restore column widths from localStorage
    const saved = localStorage.getItem('mainTableColWidths');
    if (saved) {
      try {
        const widths = JSON.parse(saved);
        params.api.applyColumnState({ state: widths });
      } catch {
        // ignore
      }
    }
  }, []);

  const onColumnResized = useCallback(() => {
    if (gridRef.current?.api) {
      const state = gridRef.current.api.getColumnState();
      localStorage.setItem('mainTableColWidths', JSON.stringify(state));
    }
  }, [gridRef]);

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<MainTableRow>) => {
      if (event.data && event.colDef.field) {
        onCellChanged(event.data.id, event.colDef.field, event.newValue);
      }
    },
    [onCellChanged]
  );

  const handleRowDoubleClicked = useCallback(
    (event: RowDoubleClickedEvent<MainTableRow>) => {
      if (event.data) onRowDoubleClick(event.data);
    },
    [onRowDoubleClick]
  );

  const handleSelectionChanged = useCallback(() => {
    if (gridRef.current?.api) {
      const selected = gridRef.current.api.getSelectedRows();
      onSelectionChanged(selected[0] || null);
    }
  }, [gridRef, onSelectionChanged]);

  return (
    <div className="flex-1 ag-theme-alpine">
      <AgGridReact<MainTableRow>
        ref={gridRef}
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={{
          resizable: true,
          sortable: true,
          filter: true,
        }}
        rowSelection="single"
        singleClickEdit={true}
        enterNavigatesVerticallyAfterEdit={true}
        undoRedoCellEditing={true}
        getRowId={(params) => String(params.data.id)}
        onGridReady={onGridReady}
        onColumnResized={onColumnResized}
        onCellValueChanged={handleCellValueChanged}
        onRowDoubleClicked={handleRowDoubleClicked}
        onSelectionChanged={handleSelectionChanged}
      />
    </div>
  );
}
