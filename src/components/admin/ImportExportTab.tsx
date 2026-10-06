import React, { useState } from 'react';
import { LinkItem, Category, Tag } from '../../types';
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle,
  Check,
  FileCode,
  ArrowRight,
} from 'lucide-react';

interface Props {
  links: LinkItem[];
  categories: Category[];
  tags: Tag[];
  onImportLinks: (newLinks: Partial<LinkItem>[]) => Promise<void>;
}

interface ParsedRow {
  title: string;
  url: string;
  description: string;
  categoryName: string;
  tagsString: string;
  isValid: boolean;
  error?: string;
  isDuplicate?: boolean;
}

export const ImportExportTab: React.FC<Props> = ({
  links,
  categories,
  tags,
  onImportLinks,
}) => {
  const [fileType, setFileType] = useState<'csv' | 'json' | 'txt'>('csv');
  const [fileContent, setFileContent] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const existingUrls = new Set(
    links.map((l) => l.url.trim().toLowerCase().replace(/\/$/, ''))
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setFileContent(text);
      parseContent(text, file.name.endsWith('.json') ? 'json' : 'csv');
    };
    reader.readAsText(file);
  };

  const parseContent = (content: string, type: 'csv' | 'json' | 'txt') => {
    setImportSummary(null);
    const rows: ParsedRow[] = [];

    if (type === 'json') {
      try {
        const json = JSON.parse(content);
        const array = Array.isArray(json) ? json : json.links || [];
        array.forEach((item: any) => {
          const title = item.title || '';
          let url = item.url || '';
          const desc = item.description || '';
          const cat = item.category || item.categoryName || '';
          const tagList = Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '';

          let isValid = true;
          let error = '';

          if (!title) {
            isValid = false;
            error = 'Missing Title';
          } else if (!url) {
            isValid = false;
            error = 'Missing URL';
          }

          if (url && !/^https?:\/\//i.test(url) && !/^(mailto:|tel:|wa\.me|t\.me)/i.test(url)) {
            url = 'https://' + url;
          }

          const isDuplicate = existingUrls.has(url.trim().toLowerCase().replace(/\/$/, ''));

          rows.push({
            title,
            url,
            description: desc,
            categoryName: cat,
            tagsString: tagList,
            isValid,
            error,
            isDuplicate,
          });
        });
      } catch (err: any) {
        alert('Invalid JSON file format: ' + err.message);
        return;
      }
    } else {
      // CSV or TXT line-by-line
      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const isHeader = lines[0]?.toLowerCase().includes('title') && lines[0]?.toLowerCase().includes('url');
      const dataLines = isHeader ? lines.slice(1) : lines;

      dataLines.forEach((line) => {
        // Simple comma or pipe parsing with quoted string support
        const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
        const title = parts[0] || '';
        let url = parts[1] || '';
        const description = parts[2] || '';
        const categoryName = parts[3] || '';
        const tagsString = parts[4] || '';

        let isValid = true;
        let error = '';

        if (!title) {
          isValid = false;
          error = 'Missing title';
        } else if (!url) {
          isValid = false;
          error = 'Missing URL';
        }

        if (url && !/^https?:\/\//i.test(url) && !/^(mailto:|tel:|wa\.me|t\.me)/i.test(url)) {
          url = 'https://' + url;
        }

        const isDuplicate = existingUrls.has(url.trim().toLowerCase().replace(/\/$/, ''));

        rows.push({
          title,
          url,
          description,
          categoryName,
          tagsString,
          isValid,
          error,
          isDuplicate,
        });
      });
    }

    setParsedRows(rows);
  };

  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsProcessing(true);
    try {
      const categoryMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
      const defaultCatId = categories[0]?.id || 'cat_all';

      const itemsToImport: Partial<LinkItem>[] = validRows.map((r, index) => {
        const catId = categoryMap.get(r.categoryName.toLowerCase()) || defaultCatId;
        const tagList = r.tagsString
          ? r.tagsString.split(',').map((t) => t.trim()).filter(Boolean)
          : [];

        return {
          title: r.title,
          url: r.url,
          description: r.description,
          categoryId: catId,
          tags: tagList,
          status: 'active',
          openNewTab: true,
          buttonStyle: 'glass',
          borderRadius: 16,
          order: links.length + index + 1,
        };
      });

      await onImportLinks(itemsToImport);
      setImportSummary({
        success: validRows.length,
        failed: parsedRows.length - validRows.length,
      });
      setParsedRows([]);
      setFileContent('');
    } catch (err: any) {
      alert('Import error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Export Links as CSV
  const exportCSV = () => {
    const headers = ['Title', 'URL', 'Description', 'Category', 'Tags', 'Clicks'];
    const rows = links
      .filter((l) => !l.deletedAt)
      .map((l) => {
        const catName = categories.find((c) => c.id === l.categoryId)?.name || '';
        const tags = (l.tags || []).join('; ');
        return [
          `"${(l.title || '').replace(/"/g, '""')}"`,
          `"${(l.url || '').replace(/"/g, '""')}"`,
          `"${(l.description || '').replace(/"/g, '""')}"`,
          `"${catName}"`,
          `"${tags}"`,
          l.clicks || 0,
        ].join(',');
      });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `biolink-links-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Links as JSON
  const exportJSON = () => {
    const cleanLinks = links
      .filter((l) => !l.deletedAt)
      .map((l) => ({
        title: l.title,
        url: l.url,
        description: l.description,
        categoryId: l.categoryId,
        tags: l.tags,
        clicks: l.clicks,
        featured: l.featured,
        pinned: l.pinned,
        status: l.status,
      }));

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cleanLinks, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `biolink-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Import & Export Links</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Bulk import 1,000+ links from CSV/JSON spreadsheets or download a full portable archive.
        </p>
      </div>

      {/* Export Section */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>Export Links Data</span>
        </h3>
        <p className="text-xs text-zinc-400">
          Export all active links with their click counts, categories, and tags.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white border border-zinc-700 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export as CSV (.csv)</span>
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white border border-zinc-700 transition"
          >
            <FileCode className="w-4 h-4 text-violet-400" />
            <span>Export as JSON (.json)</span>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <span>Bulk Import Links (CSV, JSON, TXT)</span>
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Format expected for CSV: <code>Title,URL,Description,Category,Tags</code> (e.g.{' '}
          <code>&quot;My Video&quot;,&quot;https://youtube.com/...&quot;,&quot;New episode&quot;,&quot;YouTube&quot;,&quot;Video, Tech&quot;</code>
          ).
        </p>

        {/* File upload bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <label className="flex-1 w-full flex items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 cursor-pointer transition">
            <Upload className="w-5 h-5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-300">
              Click to choose CSV or JSON file to parse
            </span>
            <input
              type="file"
              accept=".csv,.json,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {importSummary && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>
              Successfully imported {importSummary.success} link(s)!{' '}
              {importSummary.failed > 0 && `(${importSummary.failed} records were skipped due to invalid data)`}
            </span>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Preview: {parsedRows.length} items parsed ({parsedRows.filter((r) => r.isValid).length} valid)
              </span>
              <button
                onClick={handleExecuteImport}
                disabled={isProcessing || parsedRows.filter((r) => r.isValid).length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Importing...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Import ({parsedRows.filter((r) => r.isValid).length})</span>
                  </>
                )}
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400 sticky top-0">
                  <tr>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Title</th>
                    <th className="p-2.5">URL</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                  {parsedRows.slice(0, 100).map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="p-2.5">
                        {row.isValid ? (
                          row.isDuplicate ? (
                            <span className="text-amber-400 font-bold">Duplicate URL</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">Ready</span>
                          )
                        ) : (
                          <span className="text-rose-400 font-bold">{row.error}</span>
                        )}
                      </td>
                      <td className="p-2.5 font-sans font-semibold text-zinc-100 truncate max-w-xs">
                        {row.title}
                      </td>
                      <td className="p-2.5 text-zinc-400 truncate max-w-xs">{row.url}</td>
                      <td className="p-2.5 text-zinc-400">{row.categoryName || 'General'}</td>
                      <td className="p-2.5 text-zinc-500">{row.tagsString || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 100 && (
                <div className="p-2 text-center text-[10px] text-zinc-500 bg-zinc-900">
                  Showing first 100 of {parsedRows.length} parsed items. All valid items will be imported.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
