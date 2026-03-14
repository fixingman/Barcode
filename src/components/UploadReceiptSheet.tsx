import { useState } from 'react';
import { X, Upload, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { GroceryItem } from '../types';
import { generateId, parseReceiptText, ParsedGroceryItem } from '../store';

interface Props {
  providerId: string;
  onItemsExtracted: (items: GroceryItem[]) => void;
  onClose: () => void;
}

type OCRStatus = 'idle' | 'loading' | 'success' | 'error';

export default function UploadReceiptSheet({ providerId, onItemsExtracted, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [status, setStatus] = useState<OCRStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState<ParsedGroceryItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate file is an image
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setFile(f);
    setError('');
    setParsed([]);
    setSelectedIndices(new Set());

    // Preview
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleOCR() {
    if (!file) return;
    setStatus('loading');
    setProgress(0);
    setError('');
    setParsed([]);

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const ocrText = result.data.text;
      if (!ocrText.trim()) {
        setError('No text found in image. Try a clearer photo.');
        setStatus('error');
        return;
      }

      const items = parseReceiptText(ocrText);
      if (items.length === 0) {
        setError('Could not extract grocery items. Try a receipt or shelf label photo.');
        setStatus('error');
        return;
      }

      setParsed(items);
      // Auto-select all items
      setSelectedIndices(new Set(items.map((_, i) => i)));
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR failed');
      setStatus('error');
    }
  }

  function toggleItem(idx: number) {
    const next = new Set(selectedIndices);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedIndices(next);
  }

  function handleAddItems() {
    const items: GroceryItem[] = [];
    for (const idx of selectedIndices) {
      const p = parsed[idx];
      items.push({
        id: generateId(),
        name: p.name,
        category: p.category ?? 'other',
        providerId,
        quantity: p.quantity,
        isOrganic: p.isOrganic ?? false,
        priority: 'essential',
        valueRating: 2,
        priceEstimate: p.priceEstimate,
        addedAt: new Date().toISOString(),
        ordered: false,
        recurring: false,
      });
    }
    onItemsExtracted(items);
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="sheet-title" style={{ marginBottom: 0 }}>Scan receipt</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {status === 'idle' && (
          <div>
            <div className="form-group">
              <label className="form-label">Upload receipt or shelf photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '16px',
                  border: '2px dashed var(--paper-deep)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--paper)',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  color: 'var(--ink-muted)',
                }}
              />
            </div>

            {preview && (
              <div style={{ marginTop: '16px' }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: '240px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
              </div>
            )}

            {file && (
              <button
                className="btn btn-primary"
                style={{ marginTop: '16px' }}
                onClick={handleOCR}
              >
                <Upload size={16} />
                Extract items from photo
              </button>
            )}

            <div className="caption" style={{ marginTop: '12px', color: 'var(--ink-muted)' }}>
              📸 Take a clear photo of a receipt or grocery shelf. The app will extract item names and prices.
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Loader size={32} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite', color: 'var(--moss)' }} />
            <div style={{ fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: '8px' }}>
              Reading receipt…
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>
              {progress}% complete
            </div>
            <div
              style={{
                marginTop: '12px',
                height: '4px',
                background: 'var(--paper-warm)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'var(--moss)',
                  width: `${progress}%`,
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div
            style={{
              padding: '16px',
              background: 'var(--urgent-bg)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={16} color="var(--urgent)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ color: 'var(--urgent)', fontSize: '0.9375rem' }}>{error}</div>
          </div>
        )}

        {status === 'success' && parsed.length > 0 && (
          <div>
            <div
              style={{
                padding: '12px',
                background: 'var(--moss-light)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <CheckCircle size={16} color="var(--moss)" />
              <span style={{ fontSize: '0.9375rem', color: 'var(--moss-deep)', fontWeight: 500 }}>
                Found {parsed.length} items — select which to add
              </span>
            </div>

            <div className="item-list" style={{ marginBottom: '16px' }}>
              {parsed.map((item, idx) => (
                <label
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--paper-card)',
                    borderBottom: '1px solid var(--paper-warm)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIndices.has(idx)}
                    onChange={() => toggleItem(idx)}
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: 'var(--ink)', fontSize: '0.9375rem' }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {item.quantity && (
                        <span className="badge badge-category" style={{ fontSize: '0.75rem' }}>
                          {item.quantity}
                        </span>
                      )}
                      {item.category && (
                        <span className="badge badge-category" style={{ fontSize: '0.75rem' }}>
                          {item.category}
                        </span>
                      )}
                      {item.isOrganic && (
                        <span className="badge badge-organic" style={{ fontSize: '0.75rem' }}>
                          🌱
                        </span>
                      )}
                      {item.priceEstimate != null && (
                        <span className="badge badge-category" style={{ fontSize: '0.75rem' }}>
                          £{item.priceEstimate.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button
              className="btn btn-primary"
              onClick={handleAddItems}
              disabled={selectedIndices.size === 0}
            >
              Add {selectedIndices.size} items
            </button>
          </div>
        )}

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
