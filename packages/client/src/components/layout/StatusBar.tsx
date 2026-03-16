interface StatusBarProps {
  message?: string;
  rowCount?: number;
}

export default function StatusBar({ message, rowCount }: StatusBarProps) {
  return (
    <div className="h-7 bg-gray-100 border-t border-gray-300 flex items-center px-3 text-xs text-gray-600 shrink-0">
      <span className="flex-1">{message || '목록을 더블클릭하면 세부내역을 볼 수 있습니다.'}</span>
      {rowCount !== undefined && <span>총 {rowCount}건</span>}
    </div>
  );
}
