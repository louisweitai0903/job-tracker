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

  const filtered = useMemo(
    () =>
      jobs.filter(
        j =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.company.toLowerCase().includes(search.toLowerCase())
      ),
    [jobs, search]
  )

  const interviewingCount = jobs.filter(j => j.status === 'Interviewing').length
  const offeredCount = jobs.filter(j => j.status === 'Offered').length
  const appliedCount = jobs.filter(j => j.status === 'Applied').length

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

        {/* Stat badges */}
        <div className="flex gap-sm flex-wrap justify-end">
          {appliedCount > 0 && (
            <div className="bg-surface-container-highest px-md py-sm rounded-lg flex items-center gap-sm text-label-sm text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-outline-variant" />
              {appliedCount} Applied
            </div>
          )}
          {interviewingCount > 0 && (
            <div className="bg-secondary-fixed px-md py-sm rounded-lg flex items-center gap-sm text-label-sm text-on-secondary-fixed">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              {interviewingCount} Interviewing
            </div>
          )}
          {offeredCount > 0 && (
            <div className="bg-[#d1e7dd] px-md py-sm rounded-lg flex items-center gap-sm text-label-sm text-[#0f5132]">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {offeredCount} Offered
            </div>
          )}
        </div>
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
                {search ? 'No matching applications' : 'No applications yet'}
              </p>
              <p className="text-body-md text-on-surface-variant">
                {search
                  ? 'Try a different search term.'
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
