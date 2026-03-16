import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  type KeyboardEvent,
} from 'react';
import type { ICellEditorParams } from 'ag-grid-community';

/**
 * 전산화번호 에디터: 8자리 (5+3) 형식
 * 예: 12345-678
 */
const ComputerNumberEditor = forwardRef((props: ICellEditorParams, ref) => {
  const raw = String(props.value || '').replace(/[^0-9]/g, '');
  const [part1, setPart1] = useState(raw.slice(0, 5));
  const [part2, setPart2] = useState(raw.slice(5, 8));

  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref1.current?.focus();
    ref1.current?.select();
  }, []);

  useImperativeHandle(ref, () => ({
    getValue() {
      const v1 = part1.replace(/[^0-9]/g, '').slice(0, 5);
      const v2 = part2.replace(/[^0-9]/g, '').slice(0, 3);
      if (!v1 && !v2) return '';
      return `${v1}-${v2}`;
    },
    isCancelAfterEnd() {
      return false;
    },
  }));

  const handlePart1Change = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, 5);
    setPart1(digits);
    if (digits.length === 5) {
      ref2.current?.focus();
      ref2.current?.select();
    }
  };

  const handlePart2KeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Backspace' && part2 === '') {
      ref1.current?.focus();
    }
  };

  return (
    <div className="flex items-center gap-0.5 h-full px-1">
      <input
        ref={ref1}
        className="w-[52px] text-center border border-gray-300 rounded text-sm py-0.5"
        value={part1}
        onChange={(e) => handlePart1Change(e.target.value)}
        maxLength={5}
        placeholder="00000"
      />
      <span className="text-gray-400 text-sm">-</span>
      <input
        ref={ref2}
        className="w-[36px] text-center border border-gray-300 rounded text-sm py-0.5"
        value={part2}
        onChange={(e) => setPart2(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
        onKeyDown={handlePart2KeyDown}
        maxLength={3}
        placeholder="000"
      />
    </div>
  );
});

ComputerNumberEditor.displayName = 'ComputerNumberEditor';
export default ComputerNumberEditor;
