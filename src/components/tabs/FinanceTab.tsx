import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  ExternalLink,
  ShoppingBag,
  CreditCard,
  CheckCircle,
  Tag,
  Search
} from 'lucide-react';
import { Transaction, WishlistItem } from '../../types';

interface Props {
  transactions: Transaction[];
  onUpdateTransactions: (transactions: Transaction[]) => void;
  wishlistItems: WishlistItem[];
  onUpdateWishlist: (items: WishlistItem[]) => void;
}

const CATEGORIES = [
  'Food',
  'Housing',
  'Transport',
  'Utilities',
  'Salary',
  'Investment',
  'Freelance',
  'Entertainment',
  'Health',
  'Other'
];

export const FinanceTab: React.FC<Props> = ({
  transactions,
  onUpdateTransactions,
  wishlistItems,
  onUpdateWishlist,
}) => {
  // Transaction Form State
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txCategory, setTxCategory] = useState(CATEGORIES[0]);
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Wishlist Form State
  const [wlTitle, setWlTitle] = useState('');
  const [wlUrl, setWlUrl] = useState('');
  const [wlPrice, setWlPrice] = useState('');
  const [wlPriority, setWlPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [wlNotes, setWlNotes] = useState('');
  const [showWlForm, setShowWlForm] = useState(false);

  // Financial Calculations
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const netBalance = totalIncome - totalExpense;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(txAmount);
    if (!txTitle.trim() || isNaN(parsedAmount) || parsedAmount === 0) return;

    const finalAmount = txType === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: txTitle.trim(),
      amount: finalAmount,
      category: txCategory,
      date: txDate,
      createdAt: new Date().toISOString(),
    };

    onUpdateTransactions([newTx, ...transactions]);
    setTxTitle('');
    setTxAmount('');
  };

  const handleDeleteTransaction = (id: string) => {
    onUpdateTransactions(transactions.filter(t => t.id !== id));
  };

  const handleAddWishlistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wlTitle.trim()) return;

    let formattedUrl = wlUrl.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newItem: WishlistItem = {
      id: `wl-${Date.now()}`,
      title: wlTitle.trim(),
      url: formattedUrl || undefined,
      price: wlPrice ? parseFloat(wlPrice) : undefined,
      priority: wlPriority,
      acquired: false,
      notes: wlNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onUpdateWishlist([newItem, ...wishlistItems]);
    setWlTitle('');
    setWlUrl('');
    setWlPrice('');
    setWlNotes('');
    setShowWlForm(false);
  };

  const toggleWishlistAcquired = (id: string) => {
    onUpdateWishlist(
      wishlistItems.map(item =>
        item.id === id ? { ...item, acquired: !item.acquired } : item
      )
    );
  };

  const handleDeleteWishlistItem = (id: string) => {
    onUpdateWishlist(wishlistItems.filter(item => item.id !== id));
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'All' || t.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
            Finance & Shopping
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Cashflow tracking, ledger transactions, and saved wishlist link bookmarks.
          </p>
        </div>
      </div>

      {/* Dynamic Net Balance Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-xs font-medium text-[var(--text-muted)]">Net Balance</span>
          <div className="text-2xl font-mono font-bold tracking-tight text-[var(--text-main)] tabular-nums">
            ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            {netBalance >= 0 ? 'Surplus cashflow' : 'Net expenditure exceeds income'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Total Inflow</span>
          </div>
          <div className="text-2xl font-mono font-bold tracking-tight text-emerald-600 tabular-nums">
            +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Salary, freelance, and returns</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Total Outflow</span>
          </div>
          <div className="text-2xl font-mono font-bold tracking-tight text-rose-600 tabular-nums">
            -${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Fixed living expenses & lifestyle</p>
        </div>
      </div>

      {/* Split Layout: Left Expense Tracker, Right Wishlist & Link Saver */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Expense Tracker (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-main)]">Expense & Income Tracker</h2>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
              {transactions.length} Records
            </span>
          </div>

          {/* Transaction Entry Form */}
          <form onSubmit={handleAddTransaction} className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-[var(--border-subtle)] p-0.5 bg-[var(--bg-surface)] text-xs">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`px-3 py-1 rounded-md transition-colors font-medium ${
                    txType === 'expense'
                      ? 'bg-rose-50 text-rose-700 shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Expense (-)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`px-3 py-1 rounded-md transition-colors font-medium ${
                    txType === 'income'
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Income (+)
                </button>
              </div>

              <input
                type="text"
                value={txTitle}
                onChange={(e) => setTxTitle(e.target.value)}
                placeholder="Item or transaction description..."
                className="flex-1 text-xs p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs text-[var(--text-muted)]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-xs pl-6 pr-2 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono tabular-nums focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <select
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value)}
                className="text-xs p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-main)] focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="text-xs p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono tabular-nums text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Transaction
            </button>
          </form>

          {/* Search & Filter Header */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="w-full text-xs pl-8 pr-2 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)]"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Transactions Ledger Table */}
          <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-muted)]/50 text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Date</th>
                  <th className="py-2.5 px-3 font-medium">Description</th>
                  <th className="py-2.5 px-3 font-medium">Category</th>
                  <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                  <th className="py-2.5 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                      No transactions recorded.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[var(--bg-canvas)] transition-colors group">
                      <td className="py-2.5 px-3 font-mono tabular-nums text-[var(--text-muted)] text-[11px]">
                        {tx.date}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[var(--text-main)] max-w-[160px] truncate">
                        {tx.title}
                      </td>
                      <td className="py-2.5 px-3 text-[var(--text-muted)] text-[11px]">
                        {tx.category}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono tabular-nums font-semibold ${
                        tx.amount > 0 ? 'text-emerald-600' : 'text-[var(--text-main)]'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-rose-600 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Wishlist & Link Saver (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-main)]">Wishlist & Link Saver</h2>
            </div>
            <button
              onClick={() => setShowWlForm(!showWlForm)}
              className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              {showWlForm ? 'Close' : 'Add Item'}
            </button>
          </div>

          {showWlForm && (
            <form onSubmit={handleAddWishlistItem} className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2.5">
              <input
                type="text"
                value={wlTitle}
                onChange={(e) => setWlTitle(e.target.value)}
                placeholder="Product name or article title..."
                className="w-full text-xs p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--accent)]"
              />
              <input
                type="text"
                value={wlUrl}
                onChange={(e) => setWlUrl(e.target.value)}
                placeholder="https://example.com/product-link"
                className="w-full text-xs p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--accent)] font-mono"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={wlPrice}
                  onChange={(e) => setWlPrice(e.target.value)}
                  placeholder="Price ($ USD)"
                  className="w-full text-xs p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono tabular-nums focus:outline-none"
                />
                <select
                  value={wlPriority}
                  onChange={(e) => setWlPriority(e.target.value as any)}
                  className="text-xs p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] focus:outline-none"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <input
                type="text"
                value={wlNotes}
                onChange={(e) => setWlNotes(e.target.value)}
                placeholder="Notes (e.g. color, size, specs)..."
                className="w-full text-xs p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Save Wishlist Item
              </button>
            </form>
          )}

          {/* Cards List */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
            {wishlistItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                No items in wishlist yet. Save items or web links above.
              </div>
            ) : (
              wishlistItems.map((item) => {
                let domain = '';
                if (item.url) {
                  try {
                    domain = new URL(item.url).hostname.replace('www.', '');
                  } catch (e) {
                    domain = 'link';
                  }
                }

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      item.acquired
                        ? 'bg-[var(--bg-muted)]/40 border-[var(--border-subtle)] opacity-70'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleWishlistAcquired(item.id)}
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                              item.acquired
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-[var(--border-strong)] hover:border-[var(--accent)]'
                            }`}
                            title={item.acquired ? 'Mark as to buy' : 'Mark as acquired'}
                          >
                            {item.acquired && <CheckCircle className="w-3 h-3 stroke-[2]" />}
                          </button>
                          <h4 className={`text-xs font-semibold truncate ${
                            item.acquired ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'
                          }`}>
                            {item.title}
                          </h4>
                        </div>

                        {item.notes && (
                          <p className="text-[11px] text-[var(--text-muted)] pl-5">
                            {item.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] pl-5">
                          {item.price !== undefined && (
                            <span className="font-mono tabular-nums font-medium text-[var(--text-main)]">
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                          {item.price !== undefined && <span>·</span>}
                          <span className="capitalize">{item.priority}</span>
                          {domain && (
                            <>
                              <span>·</span>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-[var(--accent)] hover:underline inline-flex items-center gap-0.5 truncate max-w-[120px]"
                              >
                                {domain}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteWishlistItem(item.id)}
                        className="p-1 text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
