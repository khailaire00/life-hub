import React, { useState } from 'react';
import {
  Utensils,
  ShoppingCart,
  Plus,
  Trash2,
  Check,
  Edit2,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { MealPlanDay, GroceryItem } from '../../types';

interface Props {
  mealPlans: MealPlanDay[];
  onUpdateMealPlans: (plans: MealPlanDay[]) => void;
  groceryItems: GroceryItem[];
  onUpdateGroceryItems: (items: GroceryItem[]) => void;
}

const GROCERY_CATEGORIES = [
  'Produce',
  'Meat & Seafood',
  'Dairy',
  'Bakery',
  'Pantry',
  'Snacks',
  'Household',
  'Other'
];

export const PlannerTab: React.FC<Props> = ({
  mealPlans,
  onUpdateMealPlans,
  groceryItems,
  onUpdateGroceryItems,
}) => {
  // Editing Meal Plan Day state
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editBreakfast, setEditBreakfast] = useState('');
  const [editLunch, setEditLunch] = useState('');
  const [editDinner, setEditDinner] = useState('');
  const [editSnack, setEditSnack] = useState('');

  // Grocery Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(GROCERY_CATEGORIES[0]);
  const [groceryFilter, setGroceryFilter] = useState('All');

  const handleStartEditMeal = (plan: MealPlanDay) => {
    setEditingDayId(plan.id);
    setEditBreakfast(plan.breakfast || '');
    setEditLunch(plan.lunch || '');
    setEditDinner(plan.dinner || '');
    setEditSnack(plan.snack || '');
  };

  const handleSaveMealPlan = (dayId: string) => {
    onUpdateMealPlans(
      mealPlans.map(m =>
        m.id === dayId
          ? {
              ...m,
              breakfast: editBreakfast.trim(),
              lunch: editLunch.trim(),
              dinner: editDinner.trim(),
              snack: editSnack.trim(),
            }
          : m
      )
    );
    setEditingDayId(null);
  };

  const handleAddGroceryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: GroceryItem = {
      id: `gi-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      checked: false,
      createdAt: new Date().toISOString(),
    };

    onUpdateGroceryItems([newItem, ...groceryItems]);
    setNewItemName('');
  };

  const toggleGroceryChecked = (id: string) => {
    onUpdateGroceryItems(
      groceryItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleDeleteGroceryItem = (id: string) => {
    onUpdateGroceryItems(groceryItems.filter(item => item.id !== id));
  };

  const handleClearCompletedGroceries = () => {
    onUpdateGroceryItems(groceryItems.filter(item => !item.checked));
  };

  const filteredGroceries = groceryItems.filter(item => {
    if (groceryFilter === 'All') return true;
    return item.category === groceryFilter;
  });

  const checkedGroceriesCount = groceryItems.filter(g => g.checked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
            Life Planner
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Weekly 7-day nutritional meal schedule paired with grocery shopping checklist.
          </p>
        </div>
      </div>

      {/* Split Layout: Left 7-Day Meal Planner (7 cols), Right Grocery List (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: 7-Day Meal Planner (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-main)]">7-Day Weekly Meal Planner</h2>
            </div>
            <span className="text-xs text-[var(--text-muted)]">Monday through Sunday</span>
          </div>

          <div className="space-y-3">
            {mealPlans.map((plan) => {
              const isEditing = editingDayId === plan.id;

              return (
                <div
                  key={plan.id}
                  className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/40 hover:bg-[var(--bg-canvas)] transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-main)]">
                      {plan.day}
                    </span>
                    <button
                      onClick={() => (isEditing ? handleSaveMealPlan(plan.id) : handleStartEditMeal(plan))}
                      className="text-xs text-[var(--accent)] font-medium hover:underline flex items-center gap-1"
                    >
                      {isEditing ? (
                        <>
                          <Check className="w-3 h-3" />
                          Save Day
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-3 h-3" />
                          Edit Meals
                        </>
                      )}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] uppercase">Breakfast</label>
                          <input
                            type="text"
                            value={editBreakfast}
                            onChange={(e) => setEditBreakfast(e.target.value)}
                            placeholder="Breakfast..."
                            className="w-full p-2 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] uppercase">Lunch</label>
                          <input
                            type="text"
                            value={editLunch}
                            onChange={(e) => setEditLunch(e.target.value)}
                            placeholder="Lunch..."
                            className="w-full p-2 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] uppercase">Dinner</label>
                          <input
                            type="text"
                            value={editDinner}
                            onChange={(e) => setEditDinner(e.target.value)}
                            placeholder="Dinner..."
                            className="w-full p-2 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--text-muted)] uppercase">Snacks / Notes</label>
                        <input
                          type="text"
                          value={editSnack}
                          onChange={(e) => setEditSnack(e.target.value)}
                          placeholder="Hydration, pre-workout snack, notes..."
                          className="w-full p-2 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Breakfast</span>
                        <p className="text-[11px] text-[var(--text-main)] mt-0.5 truncate">{plan.breakfast || '—'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Lunch</span>
                        <p className="text-[11px] text-[var(--text-main)] mt-0.5 truncate">{plan.lunch || '—'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Dinner</span>
                        <p className="text-[11px] text-[var(--text-main)] mt-0.5 truncate">{plan.dinner || '—'}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Standalone Grocery Shopping List (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-main)]">Grocery Shopping List</h2>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
              {checkedGroceriesCount}/{groceryItems.length} Checked
            </span>
          </div>

          {/* Add Item Form */}
          <form onSubmit={handleAddGroceryItem} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Add item (e.g. Olive oil, Sourdough)..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="text-xs p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-main)]"
              >
                {GROCERY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {checkedGroceriesCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompletedGroceries}
                  className="text-[11px] text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                >
                  Clear {checkedGroceriesCount} Checked
                </button>
              )}
            </div>
          </form>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
            <button
              onClick={() => setGroceryFilter('All')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                groceryFilter === 'All'
                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-medium'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              All
            </button>
            {GROCERY_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setGroceryFilter(cat)}
                className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                  groceryFilter === cat
                    ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grocery Items List */}
          <div className="space-y-1.5 max-h-[440px] overflow-y-auto pt-1">
            {filteredGroceries.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                No grocery items listed.
              </div>
            ) : (
              filteredGroceries.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/50 hover:bg-[var(--bg-canvas)] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => toggleGroceryChecked(item.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        item.checked
                          ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-contrast)]'
                          : 'border-[var(--border-strong)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span
                      className={`text-xs truncate ${
                        item.checked
                          ? 'line-through text-[var(--text-muted)]'
                          : 'text-[var(--text-main)] font-medium'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleDeleteGroceryItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-rose-600 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
