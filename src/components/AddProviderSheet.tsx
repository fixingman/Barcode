import { useState } from 'react';
import { X } from 'lucide-react';
import { Provider } from '../types';
import { generateId } from '../store';

interface Props {
  onAdd: (p: Provider) => void;
  onClose: () => void;
}

const PALETTE = ['#4a7c59', '#7c6a3a', '#7c4a3a', '#3a5c7c', '#5c3a7c', '#7c3a5c'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AddProviderSheet({ onAdd, onClose }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [deliveryDays, setDeliveryDays] = useState<number[]>([]);
  const [cutoffDays, setCutoffDays] = useState('1');
  const [notes, setNotes] = useState('');

  function toggleDay(d: number) {
    setDeliveryDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
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
      notes: notes.trim() || undefined,
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
          <div className="form-group">
            <label className="form-label">Provider name *</label>
            <input
              className="form-input"
              placeholder="e.g. Abel & Cole"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

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
      </div>
    </div>
  );
}
