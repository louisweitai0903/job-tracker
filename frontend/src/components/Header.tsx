interface Props {
  search: string
  onSearch: (v: string) => void
  onOpenSettings: () => void
}

export default function Header({ search, onSearch, onOpenSettings }: Props) {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-surface flex items-center justify-between px-margin-desktop z-40 border-b border-outline-variant/30">
      <div className="relative flex-1 max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
          search
        </span>
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="w-full bg-surface-container-low border-none rounded-full py-sm pl-10 pr-md text-body-md focus:ring-2 focus:ring-secondary outline-none transition-all"
          placeholder="Search applications..."
        />
      </div>
      <div className="flex items-center gap-lg">
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-all">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-all"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  )
}
