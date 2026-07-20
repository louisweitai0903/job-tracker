import { useState } from 'react'
import { createJob, parseJobUrl } from '../api'
import type { Job } from '../types'

interface Props {
  onClose: () => void
  onJobCreated: (job: Job) => void
}

const STATUSES = ['Applied', 'Interviewing', 'Offered', 'Rejected', 'Withdrawn']

export default function AddJobModal({ onClose, onJobCreated }: Props) {
  const [form, setForm] = useState({
    company: '',
    title: '',
    link: '',
    status: 'Applied',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  
  // Stored AI details parsed from the link/pasted text
  const [aiData, setAiData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPasteArea, setShowPasteArea] = useState(false)
  const [pastedText, setPastedText] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleAutoFill() {
    if (!form.link.trim()) {
      setError('Please enter a job posting URL first.')
      return
    }
    setParsing(true)
    setError(null)
    setShowPasteArea(false)
    try {
      const data = await parseJobUrl(form.link)
      setForm(f => ({
        ...f,
        company: data.company || f.company,
        title: data.title || f.title,
      }))
      setAiData(data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'URL parsing failed'
      setError(`${msg} - Try pasting the job description text manually below.`)
      setShowPasteArea(true)
    } finally {
      setParsing(false)
    }
  }

  async function handlePasteFill() {
    if (!pastedText.trim() || pastedText.trim().length < 50) {
      setError('Please paste at least 50 characters of the job description.')
      return
    }
    setParsing(true)
    setError(null)
    try {
      const data = await parseJobUrl(form.link, pastedText)
      setForm(f => ({
        ...f,
        company: data.company || f.company,
        title: data.title || f.title,
      }))
      setAiData(data)
      setShowPasteArea(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Pasted text parsing failed')
    } finally {
      setParsing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.company.trim() || !form.title.trim()) {
      setError('Company and Job Title are required.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const jobPayload: Partial<Job> = {
        company: form.company,
        title: form.title,
        link: form.link || undefined,
        status: form.status,
        date: form.date || undefined,
        notes: form.notes || undefined,
      }

      // If we parsed AI data, save it directly with the job!
      if (aiData) {
        jobPayload.description = aiData.description || undefined
        jobPayload.ai_role_summary = aiData.role_summary || undefined
        jobPayload.ai_skills_required = aiData.skills_required || undefined
        jobPayload.ai_fit_score = aiData.fit_score != null ? aiData.fit_score : undefined
        
        const gaps = (aiData.skills_required || [])
          .filter((s: any) => !s.candidate_has)
          .map((s: any) => s.name)
        jobPayload.ai_gaps = gaps

        const fitReasons = {
          match: aiData.match_reasons || [],
          tips: aiData.improvement_tips || []
        }
        jobPayload.ai_fit_reasons = fitReasons
        jobPayload.ai_urgency_level = aiData.urgency_level || undefined
        jobPayload.ai_processed_at = new Date().toISOString()
      }

      const job = await createJob(jobPayload)
      onJobCreated(job)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-primary/40 backdrop-blur-[2px] z-[60] flex items-center justify-center p-md"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-2xl shadow-modal overflow-hidden animate-in">
        {/* Header */}
        <div className="px-xl py-lg border-b border-outline-variant flex justify-between items-center">
          <div>
            <h2 className="text-headline-md text-primary">New Application</h2>
            <p className="text-label-md text-on-surface-variant mt-xs">Auto-fill & track job applications using AI</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-outline hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-xl space-y-lg max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* AI hint */}
          <div className="ai-gradient p-md rounded-xl border border-secondary/20 flex items-center gap-md">
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-filled text-secondary text-[18px]">auto_awesome</span>
            </div>
            <span className="text-label-md text-secondary leading-snug">
              Paste a URL and click <strong>Auto-fill with AI</strong>. The system will parse the role, company name, and calculate your resume fit score automatically.
            </span>
          </div>

          {/* URL & Auto-fill Action */}
          <div>
            <label className="block text-label-md text-primary mb-sm font-medium">Job Posting URL</label>
            <div className="flex gap-sm">
              <input
                value={form.link}
                onChange={e => set('link', e.target.value)}
                type="url"
                placeholder="https://www.linkedin.com/jobs/view/…"
                className="flex-1 bg-surface-container-low border-2 border-transparent focus:border-secondary rounded-xl px-md py-md text-body-md outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={parsing || !form.link.trim()}
                className="bg-secondary text-on-secondary px-lg rounded-xl text-label-md font-medium active:scale-95 transition-transform flex items-center gap-sm shrink-0 disabled:opacity-50"
              >
                {parsing && !showPasteArea ? (
                  <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                )}
                Auto-fill
              </button>
            </div>
          </div>

          {/* Manual paste fallback */}
          {showPasteArea && (
            <div className="space-y-sm p-md bg-surface-container-low rounded-xl border border-outline-variant/30">
              <label className="block text-label-md text-primary font-medium">Paste Job Description Text</label>
              <textarea
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                rows={4}
                placeholder="Paste the full job details here..."
                className="w-full bg-surface-container-lowest rounded-xl p-md text-body-md outline-none resize-none focus:ring-2 focus:ring-secondary border border-outline-variant/30"
              />
              <button
                type="button"
                onClick={handlePasteFill}
                disabled={parsing || pastedText.trim().length < 50}
                className="w-full bg-primary text-on-primary py-md rounded-xl text-label-md font-medium flex items-center justify-center gap-sm disabled:opacity-50"
              >
                {parsing ? (
                  <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                )}
                Parse Pasted Details
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-md">
            {/* Company */}
            <div>
              <label className="block text-label-md text-primary mb-sm font-medium">
                Company <span className="text-error">*</span>
              </label>
              <input
                value={form.company}
                onChange={e => set('company', e.target.value)}
                required
                placeholder={parsing ? 'Parsing...' : 'e.g. Google'}
                className="w-full bg-surface-container-low border-2 border-transparent focus:border-secondary rounded-xl px-md py-md text-body-md outline-none transition-all"
              />
            </div>
            {/* Title */}
            <div>
              <label className="block text-label-md text-primary mb-sm font-medium">
                Job Title <span className="text-error">*</span>
              </label>
              <input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                required
                placeholder={parsing ? 'Parsing...' : 'e.g. Software Engineer'}
                className="w-full bg-surface-container-low border-2 border-transparent focus:border-secondary rounded-xl px-md py-md text-body-md outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            {/* Status */}
            <div>
              <label className="block text-label-md text-primary mb-sm font-medium">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="w-full bg-surface-container-low border-2 border-transparent focus:border-secondary rounded-xl px-md py-md text-body-md outline-none transition-all appearance-none"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {/* Date */}
            <div>
              <label className="block text-label-md text-primary mb-sm font-medium">Date Applied</label>
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className="w-full bg-surface-container-low border-2 border-transparent focus:border-secondary rounded-xl px-md py-md text-body-md outline-none transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-label-md text-primary mb-sm font-medium">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              placeholder="Recruiter name, referral, deadline…"
              className="w-full bg-surface-container-low border-2 border-transparent focus:border-secondary rounded-xl px-md py-md text-body-md outline-none transition-all resize-none"
            />
          </div>

          {/* AI Extraction Success Notification */}
          {aiData && !error && (
            <div className="p-md bg-green-50 rounded-xl border border-green-200 flex items-center gap-md text-green-800">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
              <span className="text-label-md">
                AI extracted: <strong>{aiData.company}</strong> — <strong>{aiData.title}</strong> (Fit score: {aiData.fit_score}%)
              </span>
            </div>
          )}

          {error && (
            <p className="text-label-md text-error bg-error/10 px-md py-sm rounded-lg">{error}</p>
          )}

          {/* Footer buttons */}
          <div className="flex gap-md pt-sm">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-outline-variant text-on-surface text-label-md py-md rounded-xl hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || parsing}
              className="flex-1 bg-secondary text-on-secondary text-label-md py-md rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60 font-medium"
            >
              {loading ? 'Saving…' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
