import { useState, useMemo } from 'react'
import type { Job } from '../types'
import JobCard from './JobCard'
import AiInsightPanel from './AiInsightPanel'
import { updateJob } from '../api'

interface Props {
  jobs: Job[]
  search: string
  onJobsChange: (jobs: Job[]) => void
}

export default function Dashboard({ jobs, search, onJobsChange }: Props) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<string>('date_desc')

  const filtered = useMemo(() => {
    let result = jobs.filter(
      j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company.toLowerCase().includes(search.toLowerCase())
    )

    if (statusFilter !== 'All') {
      result = result.filter(j => j.status === statusFilter)
    }

    result.sort((a, b) => {
      if (sortBy === 'fit_desc') {
        return (b.ai_fit_score || 0) - (a.ai_fit_score || 0)
      } else if (sortBy === 'fit_asc') {
        return (a.ai_fit_score || 0) - (b.ai_fit_score || 0)
      } else {
        // default date_desc
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      }
    })

    return result
  }, [jobs, search, statusFilter, sortBy])

  const appliedCount = jobs.filter(j => j.status === 'Applied').length
  const interviewingCount = jobs.filter(j => j.status === 'Interviewing').length
  const offeredCount = jobs.filter(j => j.status === 'Offer' || j.status === 'Offered').length
  const rejectedCount = jobs.filter(j => j.status === 'Rejected').length

  const tabs = [
    { label: 'All', count: jobs.length },
    { label: 'Applied', count: appliedCount },
    { label: 'Interviewing', count: interviewingCount },
    { label: 'Offer', count: offeredCount },
    { label: 'Rejected', count: rejectedCount },
  ]

  function handleJobUpdated(updated: Job) {
    onJobsChange(jobs.map(j => (j.id === updated.id ? updated : j)))
    setSelectedJob(updated)
  }

  return (
    <main className="ml-[280px] pt-24 px-margin-desktop pb-xl min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h2 className="text-headline-lg text-primary">Active Pipeline</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {jobs.length === 0
              ? 'No applications yet — add your first role to get started.'
              : `Tracking ${jobs.length} application${jobs.length !== 1 ? 's' : ''} with AI-driven insights.`}
          </p>
        </div>

        {/* Sort and Filters */}
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-sm bg-surface-container-low px-md py-sm rounded-lg border border-outline-variant/30">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">sort</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent text-label-md text-primary outline-none cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="fit_desc">Highest Fit Score</option>
              <option value="fit_asc">Lowest Fit Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gmail-like Tabs */}
      <div className="flex gap-md mb-lg border-b border-outline-variant/30">
        {tabs.map(tab => (
          <button
            key={tab.label}
            onClick={() => setStatusFilter(tab.label)}
            className={`pb-sm px-sm text-label-md font-medium flex items-center gap-xs transition-colors relative ${
              statusFilter === tab.label
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab.label}
            <span className={`px-xs py-[2px] rounded text-[11px] ${
              statusFilter === tab.label 
                ? 'bg-primary/10 text-primary' 
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}>
              {tab.count}
            </span>
            {statusFilter === tab.label && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary rounded-t" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Job List — 7 cols */}
        <div className="col-span-12 lg:col-span-7 space-y-md">
          {filtered.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-xl text-center shadow-card border border-outline-variant/20">
              <span className="material-symbols-outlined text-[52px] text-on-surface-variant mb-md block">
                work_outline
              </span>
              <p className="text-headline-md text-primary mb-sm">
                {search || statusFilter !== 'All' ? 'No matching applications' : 'No applications yet'}
              </p>
              <p className="text-body-md text-on-surface-variant">
                {search || statusFilter !== 'All'
                  ? 'Try a different search term or filter.'
                  : 'Click "New Application" in the sidebar to get started.'}
              </p>
            </div>
          ) : (
            filtered.map(job => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                onSelect={setSelectedJob}
                onUpdateStatus={async (jobToUpdate, newStatus) => {
                  try {
                    const updated = await updateJob(jobToUpdate.id, { ...jobToUpdate, status: newStatus })
                    handleJobUpdated(updated)
                  } catch (e) {
                    console.error("Failed to update status", e)
                  }
                }}
              />
            ))
          )}
        </div>

        {/* AI Insights Panel — 5 cols */}
        <div className="col-span-12 lg:col-span-5">
          <AiInsightPanel job={selectedJob} onJobUpdated={handleJobUpdated} />
        </div>
      </div>
    </main>
  )
}
