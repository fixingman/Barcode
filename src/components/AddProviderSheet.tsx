import { useState } from 'react';
import { X, Globe, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Provider } from '../types';
import { generateId, scrapeUrl } from '../store';

interface Props {
  onAdd: (p: Provider) => void;
  onClose: () => void;
}

const PALETTE = ['#4a7c59', '#7c6a3a', '#7c4a3a', '#3a5c7c', '#5c3a7c', '#7c3a5c'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type FetchStatus = 'idle' | 'loading' | 'ok' | 'error';

export default function AddProviderSheet({ onAdd, onClose }: Props) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [deliveryDays, setDeliveryDays] = useState<number[]>([]);
  const [cutoffDays, setCutoffDays] = useState('1');
  const [notes, setNotes] = useState('');

  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [fetchError, setFetchError] = useState('');
  const [scrapedText, setScrapedText] = useState<string | undefined>();
  const [scrapedAt, setScrapedAt] = useState<string | undefined>();

  function toggleDay(d: number) {
    setDeliveryDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  }

  async function handleFetchUrl() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setFetchStatus('loading');
    setFetchError('');
    try {
      const text = await scrapeUrl(trimmed);
      setScrapedText(text);
      setScrapedAt(new Date().toISOString());
      setFetchStatus('ok');
      // Auto-fill name from domain if still empty
      if (!name.trim()) {
        try {
          const host = new URL(trimmed).hostname.replace(/^www\./, '');
          const pretty = host.split('.')[0];
          setName(pretty.charAt(0).toUpperCase() + pretty.slice(1));
        } catch { /* ignore */ }
      }
    } catch (err) {
      setFetchStatus('error');
      setFetchError(err instanceof Error ? err.message : 'Could not reach that URL');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const provider: Provider = {
      id: generateId(),
      name: name.trim(),
      color,
      deliveryDays,
      orderCutoffDays: parseInt(cutoffDays) || 1,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
      scrapedText,
      scrapedAt,
    };
    onAdd(provider);
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="sheet-title" style={{ marginBottom: 0 }}>Add provider</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* URL — first, so name can be auto-filled */}
          <div className="form-group">
            <label className="form-label">Website URL</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="form-input"
                placeholder="https://www.abelandcole.co.uk"
                value={url}
                onChange={e => { setUrl(e.target.value); setFetchStatus('idle'); }}
                type="url"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flexShrink: 0, padding: '0 14px', fontSize: '0.8125rem', gap: '5px' }}
                onClick={handleFetchUrl}
                disabled={!url.trim() || fetchStatus === 'loading'}
              >
                {fetchStatus === 'loading'
                  ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Globe size={14} />
                }
                {fetchStatus === 'loading' ? 'Fetching…' : 'Fetch'}
              </button>
            </div>

            {/* Status feedback */}
            {fetchStatus === 'ok' && scrapedText && (
              <div style={{
                marginTop: '8px',
                padding: '10px 12px',
                background: 'var(--moss-light)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}>
                <CheckCircle size={14} color="var(--moss)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--moss-deep)', fontWeight: 500 }}>
                    Website fetched — prices ready
                  </div>
                  <div className="caption" style={{ marginTop: '2px' }}>
                    {scrapedText.length.toLocaleString()} chars indexed. Prices will auto-suggest when you add items.
                  </div>
                </div>
              </div>
            )}

            {fetchStatus === 'error' && (
              <div style={{
                marginTop: '8px',
                padding: '10px 12px',
                background: 'var(--urgent-bg)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}>
                <AlertCircle size={14} color="var(--urgent)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div style={{ fontSize: '0.8125rem', color: 'var(--urgent)' }}>{fetchError}</div>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Provider name *</label>
            <input
              className="form-input"
              placeholder="e.g. Abel & Cole"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* Color */}
          <div className="form-group">
            <label className="form-label">Colour</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 28, height: 28,
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '2.5px solid var(--ink)' : '2px solid transparent',
                    outline: color === c ? '2px solid var(--paper-card)' : 'none',
                    outlineOffset: -3,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Delivery days */}
          <div className="form-group">
            <label className="form-label">Delivery days</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {DAY_LABELS.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  className={`chip ${deliveryDays.includes(i) ? 'active' : ''}`}
                  onClick={() => toggleDay(i)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Cutoff */}
          <div className="form-group">
            <label className="form-label">Order cut-off (days before delivery)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              max="7"
              value={cutoffDays}
              onChange={e => setCutoffDays(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Any notes about this provider…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
            Add provider
          </button>
        </form>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
