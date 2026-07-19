import { useState } from 'react'
import type { Job } from '../types'
import { analyseJob, analyseJobText } from '../api'

interface Props {
  job: Job | null
  onJobUpdated: (job: Job) => void
}

function FitScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label = score >= 75 ? 'Strong match' : score >= 50 ? 'Good fit' : 'Needs prep'
  return (
    <div className="flex items-center gap-md p-md bg-white/60 rounded-xl border border-outline-variant/30">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-headline-md border-4 shrink-0"
        style={{ borderColor: color, color }}
      >
        {score}
      </div>
      <div>
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Fit Score</p>
        <p className="text-body-lg font-semibold text-on-surface">{label}</p>
      </div>
    </div>
  )
}

export default function AiInsightPanel({ job, onJobUpdated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaste, setShowPaste] = useState(false)
  const [pasteText, setPasteText] = useState('')

  const hasAnalysis = job?.ai_processed_at != null

  async function handleAnalyse() {
    if (!job) return
    setLoading(true)
    setError(null)
    setShowPaste(false)
    try {
      const updated = await analyseJob(job.id)
      onJobUpdated(updated)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Analysis failed'
      if (
        msg.toLowerCase().includes('paste') ||
        msg.toLowerCase().includes('fetch') ||
        msg.toLowerCase().includes('description') ||
        msg.toLowerCase().includes('scrape')
      ) {
        setShowPaste(true)
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handlePasteAnalyse() {
    if (!job || pasteText.trim().length < 50) return
    setLoading(true)
    setError(null)
    try {
      const updated = await analyseJobText(job.id, pasteText)
      onJobUpdated(updated)
      setShowPaste(false)
      setPasteText('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  // Empty state — no job selected
  if (!job) {
    return (
      <div className="ai-gradient p-lg rounded-2xl border border-outline-variant/50 flex flex-col items-center justify-center text-center gap-md py-xl min-h-[220px]">
        <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[28px]">auto_awesome</span>
        </div>
        <div>
          <p className="text-body-md font-semibold text-primary mb-xs">AI Insights</p>
          <p className="text-body-md text-on-surface-variant">Select a job to view AI analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-gradient p-lg rounded-2xl border border-outline-variant/50 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-filled text-on-primary text-sm">auto_awesome</span>
          </div>
          <h3 className="text-headline-md text-primary">AI Insight</h3>
        </div>
        {hasAnalysis ? (
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-sm py-xs rounded">
            Analysis Ready
          </span>
        ) : (
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container px-sm py-xs rounded">
            Not Analysed
          </span>
        )}
      </div>

      {/* Job title context */}
      <div className="mb-md px-xs">
        <p className="text-label-md text-on-surface-variant truncate">
          <span className="font-medium text-primary">{job.title}</span> at {job.company}
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-md animate-pulse">
          <div className="h-20 bg-surface-container-highest rounded-xl" />
          <div className="h-16 bg-surface-container-highest rounded-xl" />
          <div className="h-24 bg-surface-container-highest rounded-xl" />
          <p className="text-center text-label-md text-secondary pt-sm">
            AI is analysing your fit…
          </p>
        </div>
      )}

      {/* Not yet analysed */}
      {!loading && !hasAnalysis && (
        <div className="space-y-md">
          <p className="text-body-md text-on-surface-variant">
            Run AI analysis to score your fit, identify required skills, and get tailored tips for this role.
          </p>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg px-md py-sm">
              <p className="text-label-md text-error">{error}</p>
            </div>
          )}

          {showPaste ? (
            <div className="space-y-sm">
              <label className="block text-label-md text-primary font-medium">
                Paste the job description:
              </label>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                className="w-full h-36 bg-surface-container-low rounded-xl p-md text-body-md resize-none focus:ring-2 focus:ring-secondary outline-none"
                placeholder="Paste the full job description here (at least 50 characters)…"
              />
              <div className="flex gap-sm">
                <button
                  onClick={() => { setShowPaste(false); setError(null) }}
                  className="flex-1 border border-outline-variant text-on-surface-variant text-label-md py-sm rounded-xl hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasteAnalyse}
                  disabled={pasteText.trim().length < 50}
                  className="flex-1 bg-secondary text-on-secondary py-sm rounded-xl text-label-md disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  Analyse Description
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-sm">
              <button
                onClick={handleAnalyse}
                className="w-full bg-primary text-on-primary py-md rounded-xl text-label-md flex items-center justify-center gap-sm hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                Analyse with AI
              </button>
              <button
                onClick={() => setShowPaste(true)}
                className="w-full text-secondary text-label-md py-sm rounded-xl hover:bg-secondary/10 transition-colors"
              >
                Paste job description instead
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analysis results */}
      {!loading && hasAnalysis && (
        <div className="space-y-lg">
          {/* Fit Score */}
          {job.ai_fit_score != null && <FitScoreRing score={job.ai_fit_score} />}

          {/* Company Background */}
          {job.ai_company_background && (
            <section>
              <h4 className="text-label-md text-secondary mb-sm uppercase tracking-wider font-bold flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">travel_explore</span>
                Company Background
              </h4>
              <div className="glass-panel p-md rounded-xl">
                <p className="text-body-md text-on-surface leading-relaxed">{job.ai_company_background}</p>
              </div>
            </section>
          )}

          {/* Role Summary */}
          {job.ai_role_summary && (
            <section>
              <h4 className="text-label-md text-secondary mb-sm uppercase tracking-wider font-bold">
                Role Summary
              </h4>
              <div className="glass-panel p-md rounded-xl">
                <p className="text-body-md text-on-surface leading-relaxed">{job.ai_role_summary}</p>
              </div>
            </section>
          )}

          {/* Match Analysis */}
          {job.ai_fit_reasons && (
            <section>
              <h4 className="text-label-md text-secondary mb-sm uppercase tracking-wider font-bold">
                Match Analysis
              </h4>
              <div className="glass-panel p-md rounded-xl space-y-sm">
                {job.ai_fit_reasons.match?.map((reason, i) => (
                  <div key={i} className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-green-500 shrink-0 text-[20px] mt-[2px]">
                      check_circle
                    </span>
                    <p className="text-body-md text-on-surface">{reason}</p>
                  </div>
                ))}
                {job.ai_fit_reasons.tips?.map((tip, i) => (
                  <div key={i} className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-amber-500 shrink-0 text-[20px] mt-[2px]">
                      info
                    </span>
                    <p className="text-body-md text-on-surface">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {job.ai_skills_required && job.ai_skills_required.length > 0 && (
            <section>
              <h4 className="text-label-md text-secondary mb-sm uppercase tracking-wider font-bold">
                Key Skills Required
              </h4>
              <div className="flex flex-wrap gap-sm">
                {job.ai_skills_required.map((skill, i) =>
                  skill.candidate_has ? (
                    <span
                      key={i}
                      className="bg-primary text-on-primary px-md py-xs rounded-full text-label-sm flex items-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-[12px]">check</span>
                      {skill.name}
                    </span>
                  ) : (
                    <span
                      key={i}
                      className="bg-surface-container-highest text-on-surface-variant px-md py-xs rounded-full text-label-sm border border-outline-variant"
                    >
                      {skill.name}
                    </span>
                  )
                )}
              </div>
              <p className="text-label-sm text-on-surface-variant mt-sm">
                <span className="inline-block w-3 h-3 rounded-full bg-primary mr-xs align-middle" />
                Skills you have
                <span className="inline-block w-3 h-3 rounded-full bg-surface-container-highest border border-outline-variant ml-md mr-xs align-middle" />
                Gaps
              </p>
            </section>
          )}

          {/* AI Gaps */}
          {job.ai_gaps && job.ai_gaps.length > 0 && (
            <section>
              <h4 className="text-label-md text-secondary mb-sm uppercase tracking-wider font-bold">
                Areas to Address
              </h4>
              <div className="glass-panel p-md rounded-xl space-y-xs">
                {job.ai_gaps.map((gap, i) => (
                  <div key={i} className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-outline shrink-0 text-[18px] mt-[2px]">
                      arrow_forward
                    </span>
                    <p className="text-body-md text-on-surface">{gap}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Re-analyse footer */}
          <section className="pt-md border-t border-outline-variant/30 space-y-sm">
            {error && (
              <p className="text-label-md text-error">{error}</p>
            )}
            <button
              onClick={handleAnalyse}
              className="w-full border-2 border-outline-variant text-on-surface text-label-md py-sm rounded-xl hover:bg-surface-container transition-colors flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Re-analyse
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
