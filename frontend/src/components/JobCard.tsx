import type { Job } from '../types'
interface Props {
  job: Job
  isSelected: boolean
  onSelect: (job: Job) => void
  onUpdateStatus?: (job: Job, newStatus: string) => void
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`
}

function getAccentClass(urgency?: string): string {
  if (urgency === 'high') return 'border-l-[4px] border-l-secondary'
  if (urgency === 'medium') return 'border-l-[4px] border-l-amber-400'
  return 'border-l-[4px] border-l-outline-variant'
}

const LOGO_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
]

export default function JobCard({ job, isSelected, onSelect, onUpdateStatus }: Props) {
  const colorIdx = job.company.charCodeAt(0) % LOGO_COLORS.length
  const accentClass = getAccentClass(job.ai_urgency_level)

  return (
    <div
      onClick={() => onSelect(job)}
      className={`group cursor-pointer bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card hover:shadow-card-hover transition-all flex items-center justify-between pl-0 pr-lg py-lg ${accentClass} ${
        isSelected ? 'ring-2 ring-secondary/30 bg-surface-container-low' : ''
      }`}
    >
      {/* Left content */}
      <div className="flex items-center gap-lg pl-lg">
        {/* Company logo */}
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl shrink-0 ${LOGO_COLORS[colorIdx]}`}
        >
          {job.company.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-headline-md text-primary group-hover:text-secondary transition-colors leading-snug">
            {job.title}
          </h3>
          <p className="text-label-md text-on-surface-variant mt-xs">
            {job.company}
            {job.created_at ? ` · ${timeAgo(job.created_at)}` : ''}
          </p>
        </div>
      </div>

      {/* Right content */}
      <div className="flex items-center gap-md shrink-0">
        <select
          value={job.status}
          onClick={e => e.stopPropagation()}
          onChange={e => onUpdateStatus?.(job, e.target.value)}
          className="bg-transparent text-label-md text-on-surface-variant border border-outline-variant rounded-lg px-2 py-1 outline-none cursor-pointer focus:ring-2 focus:ring-secondary/50"
        >
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button
          onClick={e => {
            e.stopPropagation()
            onSelect(job)
          }}
          className="flex items-center gap-xs text-label-md text-secondary border border-secondary/30 px-md py-sm rounded-lg transition-all hover:bg-secondary hover:text-on-secondary"
        >
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          Insights
        </button>
      </div>
    </div>
  )
}
