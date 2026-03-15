import { useState } from 'react';
import { X } from 'lucide-react';
import { Product, Category } from '../types';
import { generateId, allCategories, categoryEmoji, getCategoryLabels, Locale } from '../store';

interface Props {
  onAdd: (product: Product) => void;
  onClose: () => void;
  locale: Locale;
}

export default function ProductFormSheet({ onAdd, onClose, locale }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('vegetables');
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const product: Product = {
      id: generateId(),
      name: name.trim(),
      category,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAdd(product);
    onClose();
  }

  const categoryLabels = getCategoryLabels(locale);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="sheet-title" style={{ marginBottom: 0 }}>Create product</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Product name */}
          <div className="form-group">
            <label className="form-label">Product name *</label>
            <input
              className="form-input"
              placeholder="e.g. Tuscan Kale"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value as Category)}>
              {allCategories.map(c => (
                <option key={c} value={c}>{categoryEmoji[c]} {categoryLabels[c]}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Preferably organic, 500g bunch"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ minHeight: '80px' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
            Create product
          </button>
        </form>
      </div>
    </div>
  );
}
