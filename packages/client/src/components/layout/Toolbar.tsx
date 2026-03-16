import { useState } from 'react';
import {
  Plus, Save, X, Trash2, RefreshCw, Search, FileDown,
} from 'lucide-react';

const POLE_TYPES = [
  { value: 0, label: '가공(주)' },
  { value: 1, label: '주' },
  { value: 2, label: '등' },
  { value: 4, label: '기기' },
  { value: 6, label: '케이블' },
  { value: 7, label: '케이블라벨' },
  { value: 8, label: '케이블2' },
  { value: 9, label: '기타' },
];

interface ToolbarProps {
  onNew: (poleType: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  onSearch: (term: string) => void;
  onExport?: () => void;
  hasChanges: boolean;
}

export default function Toolbar({
  onNew, onSave, onCancel, onDelete, onRefresh, onSearch, onExport, hasChanges,
}: ToolbarProps) {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="h-11 bg-white border-b border-gray-300 flex items-center gap-1 px-2 shrink-0">
      {/* New button with dropdown */}
      <div className="relative">
        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowNewMenu(!showNewMenu)}
        >
          <Plus size={16} />
          신규
        </button>
        {showNewMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNewMenu(false)} />
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[140px]">
              {POLE_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  className="block w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50"
                  onClick={() => {
                    onNew(pt.value);
                    setShowNewMenu(false);
                  }}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded ${
          hasChanges
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        onClick={onSave}
        disabled={!hasChanges}
      >
        <Save size={16} />
        저장
      </button>

      <button
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        onClick={onCancel}
      >
        <X size={16} />
        취소
      </button>

      <button
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        onClick={onDelete}
      >
        <Trash2 size={16} />
        삭제
      </button>

      <button
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        onClick={onRefresh}
      >
        <RefreshCw size={16} />
      </button>

      {onExport && (
        <>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
            onClick={onExport}
          >
            <FileDown size={16} />
            엑셀
          </button>
        </>
      )}

      <div className="flex-1" />

      {/* Search */}
      <div className="flex items-center gap-1">
        <input
          type="text"
          placeholder="검색..."
          className="px-2 py-1 text-sm border border-gray-300 rounded w-48"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearch(searchTerm);
          }}
        />
        <button
          className="p-1.5 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => onSearch(searchTerm)}
        >
          <Search size={16} />
        </button>
      </div>
    </div>
  );
}
