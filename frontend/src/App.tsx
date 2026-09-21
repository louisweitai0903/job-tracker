import { useEffect, useState } from 'react'
import type { Job, ResumeData, View } from './types'
import { fetchJobs, fetchResume } from './api'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ProfilePage from './components/ProfilePage'
import SettingsPage from './components/SettingsPage'
import AddJobModal from './components/AddJobModal'

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [jobs, setJobs] = useState<Job[]>([])
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Initial data fetch
  useEffect(() => {
    Promise.all([
      fetchJobs().catch(e => { console.error(e); return [] as Job[] }),
      fetchResume().catch(e => { console.error(e); return null }),
    ]).then(([jobsData, resumeData]) => {
      setJobs(jobsData)
      setResume(resumeData)
      setLoadingJobs(false)
    }).catch(e => {
      console.error(e)
      setLoadError('Failed to connect to the backend. Is the Rust server running on port 8000?')
      setLoadingJobs(false)
    })
  }, [])

  function handleJobCreated(job: Job) {
    setJobs(prev => [job, ...prev])
    setShowAddModal(false)
  }

  if (loadingJobs) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="flex flex-col items-center gap-lg text-on-surface-variant">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-body-md">Loading CareerFlow…</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="max-w-md text-center p-xl bg-surface-container-lowest rounded-2xl shadow-card">
          <span className="material-symbols-outlined text-[48px] text-error mb-md block">cloud_off</span>
          <h2 className="text-headline-md text-primary mb-sm">Cannot reach backend</h2>
          <p className="text-body-md text-on-surface-variant">{loadError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar
        activeView={view}
        onNavigate={v => { setView(v); setSearch('') }}
        onNewJob={() => setShowAddModal(true)}
      />
      <Header search={search} onSearch={setSearch} onOpenSettings={() => setView('settings')} />

      {view === 'dashboard' && (
        <Dashboard jobs={jobs} search={search} onJobsChange={setJobs} />
      )}
      {view === 'profile' && (
        <ProfilePage resume={resume} onResumeChange={setResume} />
      )}
      {view === 'settings' && <SettingsPage />}

      {showAddModal && (
        <AddJobModal
          onClose={() => setShowAddModal(false)}
          onJobCreated={handleJobCreated}
        />
      )}
    </div>
  )
}
