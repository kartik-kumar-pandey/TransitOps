import { useState, useRef } from 'react';
import { Upload, AlertTriangle, CheckCircle2, X, FileText, Download } from 'lucide-react';

/**
 * Generic CSV Importer.
 * Props:
 *   columns     – array of { key, label, required, type }
 *   onImport    – fn(validRows) → { success, error }
 *   entityName  – "Vehicle" | "Driver"
 *   sampleCsv   – string for the sample download
 */
export default function CsvImport({ columns, onImport, entityName, sampleCsv }) {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});   // { rowIndex: [errorStrings] }
  const [fileName, setFileName] = useState('');
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef();

  const reset = () => {
    setRows([]);
    setErrors({});
    setFileName('');
    setImportResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const validateRow = (row) => {
    const errs = [];
    columns.forEach(col => {
      if (col.required && !row[col.key]?.toString().trim()) {
        errs.push(`"${col.label}" is required`);
      }
      if (col.type === 'number' && row[col.key] !== undefined && isNaN(Number(row[col.key]))) {
        errs.push(`"${col.label}" must be a number`);
      }
    });
    return errs;
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) { setRows([]); return; }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const parsed = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
        return obj;
      });

      // Map CSV headers → column keys
      const mappedRows = parsed.map(raw => {
        const mapped = {};
        columns.forEach(col => {
          // Try exact match then label match
          mapped[col.key] = raw[col.key] ?? raw[col.label] ?? '';
        });
        return mapped;
      });

      const rowErrors = {};
      mappedRows.forEach((row, i) => {
        const errs = validateRow(row);
        if (errs.length) rowErrors[i] = errs;
      });

      setRows(mappedRows);
      setErrors(rowErrors);
    };
    reader.readAsText(file);
  };

  const validRows = rows.filter((_, i) => !errors[i]);

  const handleImport = () => {
    if (validRows.length === 0) return;
    let imported = 0, failed = 0;
    validRows.forEach(row => {
      const res = onImport(row);
      if (res?.success) imported++; else failed++;
    });
    setImportResult({ imported, failed });
    if (imported > 0) reset();
  };

  const downloadSample = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_${entityName.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:border-violet-500/50 hover:bg-violet-500/5"
        style={{ borderColor: 'var(--border-subtle)' }}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
        <div className="p-3 bg-violet-500/10 rounded-xl mb-3">
          <Upload className="h-6 w-6 text-violet-400" />
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {fileName || `Drop a ${entityName} CSV file here`}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Click to browse — must have headers matching column names
        </p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); downloadSample(); }}
          className="mt-3 flex items-center text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-lg hover:bg-violet-500/20 transition-colors"
        >
          <Download className="h-3 w-3 mr-1" />
          Download Sample CSV
        </button>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2 animate-slide-up">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            Successfully imported <strong>{importResult.imported}</strong> {entityName}(s).
            {importResult.failed > 0 && <> {importResult.failed} row(s) were skipped due to conflicts.</>}
          </span>
        </div>
      )}

      {/* Preview Table */}
      {rows.length > 0 && (
        <div className="space-y-3 animate-slide-up">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Preview: <span className="text-violet-400">{validRows.length}</span> valid,{' '}
              <span className="text-red-400">{rows.length - validRows.length}</span> errors
            </p>
            <div className="flex items-center space-x-2">
              <button onClick={reset} className="text-[10px] text-red-400 hover:text-red-300 flex items-center">
                <X className="h-3 w-3 mr-1" />Clear
              </button>
              <button
                onClick={handleImport}
                disabled={validRows.length === 0}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg disabled:opacity-40 transition-colors"
              >
                Import {validRows.length} {entityName}(s)
              </button>
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                    <th className="px-3 py-2 text-left font-bold text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Status
                    </th>
                    {columns.map(col => (
                      <th key={col.key} className="px-3 py-2 text-left font-bold text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {rows.map((row, i) => {
                    const hasError = !!errors[i];
                    return (
                      <tr key={i} className={hasError ? 'bg-red-500/5' : 'hover:bg-white/2'}>
                        <td className="px-3 py-2">
                          {hasError
                            ? <span title={errors[i].join('; ')} className="flex items-center text-red-400">
                                <AlertTriangle className="h-3.5 w-3.5" />
                              </span>
                            : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          }
                        </td>
                        {columns.map(col => (
                          <td key={col.key} className="px-3 py-2" style={{ color: hasError ? '#f87171' : 'var(--text-secondary)' }}>
                            {row[col.key] || <span className="opacity-30">—</span>}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
