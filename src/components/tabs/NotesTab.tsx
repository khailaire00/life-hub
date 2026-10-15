import React, { useState } from 'react';
import {
  FileText,
  Lock,
  Unlock,
  Search,
  Plus,
  Pin,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Key,
  Shield,
  KeyRound,
  Check,
  Edit2
} from 'lucide-react';
import { Note, VaultItem } from '../../types';

interface Props {
  notes: Note[];
  onUpdateNotes: (notes: Note[]) => void;
  vaultItems: VaultItem[];
  onUpdateVaultItems: (items: VaultItem[]) => void;
  vaultPin: string;
  onUpdateVaultPin: (newPin: string) => void;
}

export const NotesTab: React.FC<Props> = ({
  notes,
  onUpdateNotes,
  vaultItems,
  onUpdateVaultItems,
  vaultPin,
  onUpdateVaultPin,
}) => {
  const [activeMode, setActiveMode] = useState<'notes' | 'vault'>('notes');
  const [searchTerm, setSearchTerm] = useState('');

  // Public Notes Form / Edit State
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');

  // Vault Unlock State
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Vault New Item Form State
  const [showAddSecret, setShowAddSecret] = useState(false);
  const [secretTitle, setSecretTitle] = useState('');
  const [secretUsername, setSecretUsername] = useState('');
  const [secretValue, setSecretValue] = useState('');
  const [secretCategory, setSecretCategory] = useState<VaultItem['category']>('password');

  // Vault PIN change state
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  // Note CRUD
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const tagsArray = noteTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (noteId) {
      // Edit
      onUpdateNotes(
        notes.map(n =>
          n.id === noteId
            ? {
                ...n,
                title: noteTitle.trim(),
                content: noteContent,
                tags: tagsArray,
                updatedAt: new Date().toISOString()
              }
            : n
        )
      );
    } else {
      // Add
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: noteTitle.trim(),
        content: noteContent,
        tags: tagsArray,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onUpdateNotes([newNote, ...notes]);
    }

    setIsEditingNote(false);
    setNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
  };

  const startEditNote = (note: Note) => {
    setNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTags(note.tags.join(', '));
    setIsEditingNote(true);
  };

  const togglePinNote = (id: string) => {
    onUpdateNotes(
      notes.map(n => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    onUpdateNotes(notes.filter(n => n.id !== id));
  };

  // Vault Actions
  const handlePinDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      const next = enteredPin + digit;
      setEnteredPin(next);
      if (next.length === 4) {
        if (next === vaultPin) {
          setIsVaultUnlocked(true);
          setEnteredPin('');
          setPinError(false);
        } else {
          setPinError(true);
          setTimeout(() => {
            setEnteredPin('');
            setPinError(false);
          }, 800);
        }
      }
    }
  };

  const handleAddSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretTitle.trim() || !secretValue.trim()) return;

    const newItem: VaultItem = {
      id: `v-${Date.now()}`,
      title: secretTitle.trim(),
      username: secretUsername.trim() || undefined,
      secret: secretValue.trim(),
      category: secretCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateVaultItems([newItem, ...vaultItems]);
    setSecretTitle('');
    setSecretUsername('');
    setSecretValue('');
    setShowAddSecret(false);
  };

  const handleDeleteVaultItem = (id: string) => {
    onUpdateVaultItems(vaultItems.filter(v => v.id !== id));
  };

  const toggleRevealSecret = (id: string) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length === 4 && /^\d+$/.test(newPinInput)) {
      onUpdateVaultPin(newPinInput);
      setShowChangePin(false);
      setNewPinInput('');
    }
  };

  const filteredNotes = notes
    .filter(n =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const filteredVaultItems = vaultItems.filter(v =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.username && v.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Tab Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
            Notes & Vault
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Knowledge repository and encrypted credential vault.
          </p>
        </div>

        {/* Mode Segmented Switcher */}
        <div className="flex items-center p-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
          <button
            onClick={() => setActiveMode('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMode === 'notes'
                ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Public Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveMode('vault')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMode === 'vault'
                ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {isVaultUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            Secret Vault {isVaultUnlocked ? '(Unlocked)' : '(Protected)'}
          </button>
        </div>
      </div>

      {/* Global Real-Time Search Bar & Action Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeMode === 'notes' ? "Search notes by title, tag, or content..." : "Search secrets..."}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        {activeMode === 'notes' ? (
          <button
            onClick={() => {
              setNoteId(null);
              setNoteTitle('');
              setNoteContent('');
              setNoteTags('');
              setIsEditingNote(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            New Note
          </button>
        ) : isVaultUnlocked ? (
          <button
            onClick={() => setShowAddSecret(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Secret
          </button>
        ) : null}
      </div>

      {/* VIEW 1: PUBLIC NOTES */}
      {activeMode === 'notes' && (
        <div className="space-y-6">
          {/* Note Editor Modal / Card */}
          {isEditingNote && (
            <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--text-main)]">
                  {noteId ? 'Edit Note' : 'Create New Note'}
                </h3>
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="space-y-3">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title..."
                  className="w-full text-sm font-semibold p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent)]"
                />

                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write clear, unconstrained notes..."
                  rows={5}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent)] leading-relaxed"
                />

                <input
                  type="text"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  placeholder="Tags separated by commas (e.g. Architecture, Mindset, Design)..."
                  className="w-full text-xs p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingNote(false)}
                    className="px-4 py-2 text-xs font-medium rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full p-12 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-2xl">
                No notes found matching your search. Create one above!
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[var(--text-main)] leading-snug">
                        {note.title}
                      </h3>
                      <button
                        onClick={() => togglePinNote(note.id)}
                        className={`p-1 rounded-md transition-colors ${
                          note.pinned
                            ? 'text-[var(--accent)]'
                            : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--text-main)]'
                        }`}
                        title={note.pinned ? 'Unpin note' : 'Pin note'}
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-line line-clamp-6">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    {/* Zero-Pill tags separated by dots */}
                    <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                      {note.tags.length > 0 ? (
                        note.tags.map((tag, idx) => (
                          <React.Fragment key={idx}>
                            <span>{tag}</span>
                            {idx < note.tags.length - 1 && <span aria-hidden="true">·</span>}
                          </React.Fragment>
                        ))
                      ) : (
                        <span>General</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEditNote(note)}
                        className="p-1 hover:text-[var(--text-main)] transition-colors"
                        title="Edit note"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 hover:text-rose-600 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SECRET VAULT */}
      {activeMode === 'vault' && (
        <div className="space-y-6">
          {!isVaultUnlocked ? (
            /* PIN-Protected Lock Screen */
            <div className="max-w-md mx-auto p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--text-main)]">Secret Vault Locked</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Enter your 4-digit code to view sensitive passwords & codes.
                </p>
                <p className="text-[10px] text-[var(--text-muted)] font-mono">
                  Default Session PIN: 1234
                </p>
              </div>

              {/* 4 Pin Dots/Boxes */}
              <div className={`flex justify-center gap-3 ${pinError ? 'animate-shake' : ''}`}>
                {[0, 1, 2, 3].map((idx) => {
                  const hasDigit = enteredPin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-10 h-12 rounded-xl border flex items-center justify-center font-mono text-lg font-bold transition-all ${
                        pinError
                          ? 'border-rose-500 text-rose-500 bg-rose-50/10'
                          : hasDigit
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)]'
                      }`}
                    >
                      {hasDigit ? '•' : ''}
                    </div>
                  );
                })}
              </div>

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', '⌫'].map((btn) => (
                  <button
                    key={btn}
                    onClick={() => {
                      if (btn === 'Clear') setEnteredPin('');
                      else if (btn === '⌫') setEnteredPin(prev => prev.slice(0, -1));
                      else handlePinDigit(btn);
                    }}
                    className="h-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-muted)] font-mono text-sm font-semibold transition-colors flex items-center justify-center"
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Unlocked Vault Grid */
            <div className="space-y-5">
              {/* Unlocked Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                  <Shield className="w-4 h-4" />
                  <span>Session Active · Vault Unlocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowChangePin(!showChangePin)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors"
                  >
                    Change PIN
                  </button>
                  <button
                    onClick={() => {
                      setIsVaultUnlocked(false);
                      setEnteredPin('');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity"
                  >
                    Lock Vault
                  </button>
                </div>
              </div>

              {/* Change PIN Form */}
              {showChangePin && (
                <form onSubmit={handleChangePin} className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex items-center gap-2 max-w-sm">
                  <input
                    type="password"
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="New 4-digit PIN"
                    className="flex-1 text-xs p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono text-center"
                  />
                  <button
                    type="submit"
                    disabled={newPinInput.length !== 4}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] disabled:opacity-50"
                  >
                    Update PIN
                  </button>
                </form>
              )}

              {/* Add Secret Form Modal */}
              {showAddSecret && (
                <form onSubmit={handleAddSecret} className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Store New Secret</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddSecret(false)}
                      className="text-xs text-[var(--text-muted)]"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={secretTitle}
                      onChange={(e) => setSecretTitle(e.target.value)}
                      placeholder="Title (e.g. Studio Gate Code, GitHub Token)"
                      className="text-xs p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                    />
                    <input
                      type="text"
                      value={secretUsername}
                      onChange={(e) => setSecretUsername(e.target.value)}
                      placeholder="Username / Identifier (optional)"
                      className="text-xs p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={secretValue}
                      onChange={(e) => setSecretValue(e.target.value)}
                      placeholder="Secret password, code, or key..."
                      className="text-xs p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] font-mono"
                    />
                    <select
                      value={secretCategory}
                      onChange={(e) => setSecretCategory(e.target.value as any)}
                      className="text-xs p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-main)]"
                    >
                      <option value="password">Password</option>
                      <option value="gate_code">Gate / Entry Code</option>
                      <option value="api_key">API Key / Token</option>
                      <option value="secret_note">Secret Passphrase Note</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 text-xs font-semibold rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]"
                  >
                    Save Encrypted Secret
                  </button>
                </form>
              )}

              {/* Secrets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVaultItems.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-2xl">
                    No secrets stored yet. Add one above.
                  </div>
                ) : (
                  filteredVaultItems.map((item) => {
                    const isRevealed = !!revealedIds[item.id];
                    const isCopied = copiedId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-semibold text-[var(--text-main)]">{item.title}</h4>
                            {item.username && (
                              <p className="text-[11px] font-mono text-[var(--text-muted)]">{item.username}</p>
                            )}
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] capitalize">
                            {item.category.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Secret Box with Reveal & Copy */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs font-mono">
                          <span className="truncate max-w-[160px]">
                            {isRevealed ? item.secret : '••••••••••••'}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => toggleRevealSecret(item.id)}
                              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                              title={isRevealed ? 'Hide secret' : 'Reveal secret'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(item.secret, item.id)}
                              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                              title="Copy secret"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[10px] text-[var(--text-muted)]">
                          <span>Updated {item.updatedAt.slice(0, 10)}</span>
                          <button
                            onClick={() => handleDeleteVaultItem(item.id)}
                            className="p-1 text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                            title="Delete secret"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
