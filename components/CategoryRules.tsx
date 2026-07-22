"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

type Rule = {
  _id: string;
  keyword: string;
  matchType: string;
  targetCategoryName: string;
};

type Category = {
  id: string;
  name: string;
};

export function CategoryRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [matchType, setMatchType] = useState("contains");
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/category-rules");
      const data = await res.json();
      setRules(data.rules || []);
      setCategories(data.categories || []);
      if (data.categories?.length > 0 && !targetCategoryId) {
        setTargetCategoryId(data.categories[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim() || !targetCategoryId) return;

    setSubmitting(true);
    await fetch("/api/category-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, matchType, targetCategoryId }),
    });
    setSubmitting(false);
    setKeyword("");
    fetchData();
  }

  async function handleDelete(id: string) {
    await fetch("/api/category-rules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  }

  if (loading) {
    return <div className="text-[14px] text-on-surface-variant">Loading rules...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Keyword"
          className="flex-1 h-[48px] px-4 bg-surface-dim rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
        <select
          value={matchType}
          onChange={(e) => setMatchType(e.target.value)}
          className="w-full md:w-[150px] h-[48px] px-4 bg-surface-dim rounded-xl text-[14px] text-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        >
          <option value="contains">Contains</option>
          <option value="startsWith">Starts With</option>
          <option value="exact">Exact Match</option>
        </select>
        <select
          value={targetCategoryId}
          onChange={(e) => setTargetCategoryId(e.target.value)}
          className="w-full md:w-[200px] h-[48px] px-4 bg-surface-dim rounded-xl text-[14px] text-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          disabled={submitting}
          className="h-[48px] px-6 bg-primary text-on-primary rounded-xl text-[14px] font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus size={16} />
          Add Rule
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {rules.map((rule) => (
          <div key={rule._id} className="flex justify-between items-center p-4 bg-surface-dim rounded-xl">
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-bold text-primary">{rule.keyword}</span>
              <span className="text-[12px] text-on-surface-variant bg-surface px-2 py-1 rounded-md">{rule.matchType}</span>
              <span className="text-[14px] text-on-surface-variant">→</span>
              <span className="text-[14px] font-medium text-success">{rule.targetCategoryName}</span>
            </div>
            <button
              onClick={() => handleDelete(rule._id)}
              className="text-on-surface-variant hover:text-error transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {rules.length === 0 && (
          <p className="text-[14px] text-on-surface-variant text-center py-4">No rules defined.</p>
        )}
      </div>
    </div>
  );
}
