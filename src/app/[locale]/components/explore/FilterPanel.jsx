import { FiX } from 'react-icons/fi';

function ChipGroup({ options, selected, onToggle, multi = false }) {
  const isSelected = (id) => (multi ? selected.includes(id) : selected === id);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onToggle(opt.id)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
            isSelected(opt.id)
              ? 'border-ember bg-gradient-passion text-white shadow-[0_4px_14px_rgba(235,6,3,0.35)]'
              : 'border-[var(--line)] text-[var(--txt-soft)] hover:border-blush/40 hover:text-white'
          }`}
        >
          {opt.title}
        </button>
      ))}
    </div>
  );
}

export default function FilterPanel({ lists, filters, setFilters, onApply, onReset, onClose }) {
  const sectionLabel = 'mb-2.5 block text-sm font-semibold text-white';

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-[var(--line)] bg-obsidian p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl text-white">Filtres</h2>
          <button onClick={onClose} className="text-[var(--txt-faint)] hover:text-white">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Distance Range */}
        <div className="mb-6">
          <div className="mb-2.5 flex items-center justify-between">
            <span className={sectionLabel + ' mb-0'}>Distance</span>
            <span className="font-mono text-xs text-ember">{filters.max_distance || 500} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="500"
            value={filters.max_distance || 500}
            onChange={(e) => setFilters((f) => ({ ...f, max_distance: e.target.value }))}
            className="w-full accent-ember"
          />
        </div>

        {/* Age */}
        <div className="mb-6">
          <div className="mb-2.5 flex items-center justify-between">
            <span className={sectionLabel + ' mb-0'}>Âge</span>
            <span className="font-mono text-xs text-ember">{filters.min_age || 18} - {filters.max_age || 60}</span>
          </div>
          <div className="relative h-6">
            <input
              type="range"
              min="18"
              max="80"
              value={filters.min_age || 18}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), Number(filters.max_age || 60) - 1);
                setFilters((f) => ({ ...f, min_age: val }));
              }}
              className="pointer-events-none absolute inset-x-0 top-0 w-full appearance-none bg-transparent accent-ember [&::-webkit-slider-thumb]:pointer-events-auto"
            />
            <input
              type="range"
              min="18"
              max="80"
              value={filters.max_age || 60}
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), Number(filters.min_age || 18) + 1);
                setFilters((f) => ({ ...f, max_age: val }));
              }}
              className="pointer-events-none absolute inset-x-0 top-0 w-full appearance-none bg-transparent accent-ember [&::-webkit-slider-thumb]:pointer-events-auto"
            />
          </div>
        </div>

        {/* Search Preference */}
        <div className="mb-6">
          <span className={sectionLabel}>Recherche</span>
          <ChipGroup
            options={[
              { id: 'MALE', title: 'Homme' },
              { id: 'FEMALE', title: 'Femme' },
              { id: '', title: 'Les deux' },
            ]}
            selected={filters.gender}
            onToggle={(id) => setFilters((f) => ({ ...f, gender: id }))}
          />
        </div>

        {/* Interests */}
        <div className="mb-6">
          <span className={sectionLabel}>Centres d&apos;intérêt</span>
          <ChipGroup
            options={lists.interests.map((i) => ({ id: i.title, title: i.title }))}
            selected={filters.interest}
            onToggle={(id) => setFilters((f) => ({ ...f, interest: f.interest === id ? '' : id }))}
          />
        </div>

        {/* Languages */}
        <div className="mb-6">
          <span className={sectionLabel}>Langues connues</span>
          <ChipGroup
            options={lists.languages.map((l) => ({ id: l.title, title: l.title }))}
            selected={filters.language}
            onToggle={(id) => setFilters((f) => ({ ...f, language: f.language === id ? '' : id }))}
          />
        </div>

        {/* Religion */}
        <div className="mb-6">
          <span className={sectionLabel}>Religion</span>
          <ChipGroup
            options={lists.religions}
            selected={Number(filters.religion) || filters.religion}
            onToggle={(id) => setFilters((f) => ({ ...f, religion: f.religion === id ? '' : id }))}
          />
        </div>

        {/* Relationship Goals */}
        <div className="mb-6">
          <span className={sectionLabel}>Objectif relationnel</span>
          <ChipGroup
            options={lists.goals}
            selected={Number(filters.relation_goal) || filters.relation_goal}
            onToggle={(id) => setFilters((f) => ({ ...f, relation_goal: f.relation_goal === id ? '' : id }))}
          />
        </div>

        {/* Verify Profile */}
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3">
          <span className="text-sm font-medium text-white">Profils vérifiés uniquement</span>
          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, verified_only: !f.verified_only }))}
            className={`relative h-6 w-11 rounded-full transition ${filters.verified_only ? 'bg-gradient-passion' : 'bg-white/10'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                filters.verified_only ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="mt-auto flex gap-3 border-t border-[var(--line)] pt-5">
          <button
            onClick={onApply}
            className="flex-1 rounded-xl bg-gradient-passion px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)] transition hover:brightness-110"
          >
            Appliquer
          </button>
          <button
            onClick={onReset}
            className="rounded-xl border border-[var(--line)] px-5 py-3 text-sm text-[var(--txt-soft)] transition hover:text-white"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}
