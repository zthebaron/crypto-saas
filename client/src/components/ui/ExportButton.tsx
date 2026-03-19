import { useState } from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  onClick: () => Promise<void>;
  label?: string;
}

export function ExportButton({ onClick, label = 'Export PDF' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleClick = async () => {
    setExporting(true);
    try {
      await onClick();
    } catch (err) {
      console.error('Export failed:', err);
    }
    setExporting(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={exporting}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      <Download size={12} />
      {exporting ? 'Exporting...' : label}
    </button>
  );
}
