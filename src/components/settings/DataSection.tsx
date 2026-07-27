import { useState } from 'react';
import { useStore } from '@/store';
import GhostButton from '@/components/ui/GhostButton';
import { downloadBlob } from '@/utils/csv';
import { copyToClipboard } from '@/utils/storage';

interface Props {
  onToast: (msg: string, ok?: boolean) => void;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function DataSection({ onToast }: Props) {
  const exportCSV = useStore((s) => s.exportCSV);
  const encodeBackup = useStore((s) => s.encodeBackup);
  const restoreBackup = useStore((s) => s.restoreBackup);

  const today = new Date();
  const thirtyAgo = new Date();
  thirtyAgo.setDate(today.getDate() - 30);

  const [start, setStart] = useState(dateKey(thirtyAgo));
  const [end, setEnd] = useState(dateKey(today));
  const [backupCode, setBackupCode] = useState('');

  const handleExport = () => {
    const csv = exportCSV(start, end);
    downloadBlob(`gymaker-${start}-${end}.csv`, csv);
    onToast('CSV exported', true);
  };

  const handleCopyBackup = async () => {
    const code = encodeBackup();
    const ok = await copyToClipboard(code);
    onToast(ok ? 'Copied backup code' : 'Copy failed', ok);
  };

  const handleRestore = () => {
    if (!backupCode.trim()) {
      onToast('Paste a backup code first', false);
      return;
    }
    const res = restoreBackup(backupCode.trim());
    if (res) {
      onToast('Data restored successfully', true);
      setBackupCode('');
    } else {
      onToast('Invalid backup code', false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-display font-semibold text-white/90 text-sm mb-3">
          CSV Export
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-white/50 block mb-1">Start</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">End</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="input-base"
            />
          </div>
        </div>
        <GhostButton variant="solid" onClick={handleExport}>
          Export CSV
        </GhostButton>
      </div>

      <div className="divider" />

      <div>
        <h4 className="font-display font-semibold text-white/90 text-sm mb-3">
          Backup &amp; Restore
        </h4>
        <div className="mb-4">
          <GhostButton variant="ghost" onClick={handleCopyBackup}>
            Copy Backup Code
          </GhostButton>
        </div>
        <textarea
          rows={6}
          value={backupCode}
          onChange={(e) => setBackupCode(e.target.value)}
          placeholder="Paste backup code here..."
          className="input-base font-mono text-xs resize-y"
        />
        <div className="mt-3">
          <GhostButton variant="solid" onClick={handleRestore}>
            Restore Data
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
