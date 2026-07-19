import { useRef, useState, useEffect } from 'react'
import type { ResumeData, SkillItem } from '../types'
import { uploadResume, deleteResume, updateResume } from '../api'

interface Props {
  resume: ResumeData | null
  onResumeChange: (r: ResumeData | null) => void
}

const CATEGORY_STYLES: Record<string, { tag: string; dot: string; label: string }> = {
  technical: { tag: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', label: 'Technical' },
  design: { tag: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', label: 'Design' },
  soft: { tag: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'Soft Skills' },
  language: { tag: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', label: 'Languages' },
  tool: { tag: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', label: 'Tools' },
}

const CATEGORY_ORDER: SkillItem['category'][] = ['technical', 'design', 'language', 'tool', 'soft']

function SkillsSection({ skills }: { skills: SkillItem[] }) {
  const grouped = CATEGORY_ORDER.reduce<Record<string, SkillItem[]>>((acc, cat) => {
    const items = skills.filter(s => s.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  return (
    <div className="space-y-md">
      {Object.entries(grouped).map(([cat, items]) => {
        const style = CATEGORY_STYLES[cat] ?? { tag: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', label: cat }
        return (
          <div key={cat}>
            <div className="flex items-center gap-xs mb-sm">
              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">{style.label}</span>
            </div>
            <div className="flex flex-wrap gap-xs">
              {items.map((skill, i) => (
                <span key={i} className={`${style.tag} px-sm py-xs rounded text-label-sm font-medium`}>
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ProfilePage({ resume, onResumeChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  
  const [isEditingRaw, setIsEditingRaw] = useState(false)
  const [rawJson, setRawJson] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (resume && !isEditingRaw) {
      setRawJson(JSON.stringify(resume, null, 2))
    }
  }, [resume, isEditingRaw])

  async function handleSaveRaw() {
    try {
      setSaveError(null)
      const parsed = JSON.parse(rawJson)
      const updated = await updateResume(parsed)
      onResumeChange(updated)
      setIsEditingRaw(false)
    } catch (e: any) {
      setSaveError(e.message || 'Invalid JSON format')
    }
  }

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please upload a PDF file.')
      return
    }
    setUploading(true)
    setUploadError(null)
    try {
      const data = await uploadResume(file)
      onResumeChange(data)
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    await deleteResume()
    onResumeChange(null)
  }

  const strengthScore = resume?.profile_strength_score ?? 0
  const strengthColor =
    strengthScore >= 75 ? '#22c55e' : strengthScore >= 50 ? '#f59e0b' : '#0058be'

  return (
    <main className="ml-[280px] pt-24 px-margin-desktop pb-xl min-h-screen">
      {/* Header */}
      <div className="mb-xl flex justify-between items-end">
        <div>
          <h2 className="text-headline-lg text-primary">My Profile</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Manage your professional identity and resume.
          </p>
        </div>
        {resume && !isEditingRaw && (
          <button
            onClick={() => setIsEditingRaw(true)}
            className="bg-surface-container hover:bg-surface-container-high text-primary px-md py-sm rounded-lg text-label-md transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Data
          </button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left: Resume + Experience + Education + Projects */}
        <div className="col-span-12 lg:col-span-8 space-y-xl">
          {isEditingRaw ? (
            <div className="bg-surface-container-lowest rounded-xl p-lg shadow-card border border-outline-variant/20 space-y-md">
              <h3 className="text-headline-md text-primary">Edit Profile Data</h3>
              <p className="text-body-md text-on-surface-variant">
                Directly edit the structured JSON representation of your profile.
              </p>
              
              <textarea
                value={rawJson}
                onChange={e => setRawJson(e.target.value)}
                className="w-full h-[600px] bg-surface-container-low rounded-lg p-md font-mono text-[13px] text-primary border border-outline-variant/50 focus:border-secondary outline-none resize-y"
              />
              
              {saveError && (
                <div className="text-label-md text-error bg-error/10 px-md py-sm rounded-lg">
                  {saveError}
                </div>
              )}
              
              <div className="flex justify-end gap-sm">
                <button
                  onClick={() => setIsEditingRaw(false)}
                  className="px-md py-sm rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRaw}
                  className="px-md py-sm rounded-lg text-label-md bg-secondary text-on-secondary hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Resume Upload Card */}
              <div className="bg-surface-container-lowest rounded-xl p-lg shadow-card border border-outline-variant/20">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-headline-md text-primary">Resume</h3>
              {resume && (
                <span className="text-label-sm text-green-600 bg-green-50 px-sm py-xs rounded font-bold">
                  Active
                </span>
              )}
            </div>
            <p className="text-body-md text-on-surface-variant mb-lg">
              Upload your latest PDF resume for AI parsing and job matching.
            </p>

            {/* Drop zone */}
            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                setDragActive(false)
                const f = e.dataTransfer.files[0]
                if (f) handleFile(f)
              }}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${
                dragActive
                  ? 'border-secondary bg-secondary-fixed/40'
                  : 'border-outline-variant hover:border-secondary hover:bg-surface-container-low'
              } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                }}
              />
              <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary group-hover:scale-110 transition-transform mb-md">
                <span className="material-symbols-outlined text-[32px]">
                  {uploading ? 'hourglass_top' : 'cloud_upload'}
                </span>
              </div>
              <p className="text-label-md text-primary mb-xs font-medium">
                {uploading ? 'Uploading & parsing resume…' : 'Drag & drop your resume here'}
              </p>
              {!uploading && (
                <>
                  <p className="text-body-md text-on-surface-variant mb-lg">
                    or{' '}
                    <span className="text-secondary font-bold">browse your computer</span>
                  </p>
                  <p className="text-label-sm text-outline">PDF only · Max 10 MB</p>
                </>
              )}
            </div>

            {uploadError && (
              <p className="mt-md text-label-md text-error bg-error/10 px-md py-sm rounded-lg">
                {uploadError}
              </p>
            )}

            {/* Current resume info */}
            {resume && (
              <div className="mt-lg p-md bg-surface-container-low rounded-lg flex items-center justify-between border border-surface-container-highest">
                <div className="flex items-center gap-md min-w-0">
                  <span className="material-symbols-outlined text-error text-[24px] shrink-0">picture_as_pdf</span>
                  <div className="min-w-0">
                    <p className="text-label-md text-primary truncate">{resume.filename}</p>
                    <p className="text-xs text-on-surface-variant">
                      Uploaded{' '}
                      {new Date(resume.uploaded_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDelete}
                  className="ml-md text-on-surface-variant hover:text-error transition-colors shrink-0"
                  title="Remove resume"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Work Experience */}
          {resume?.work_experience && resume.work_experience.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl p-lg shadow-card border border-outline-variant/20">
              <h3 className="text-headline-md text-primary mb-lg">Work Experience</h3>
              <div className="space-y-xl">
                {resume.work_experience.map((exp, i) => (
                  <div key={i} className="flex gap-lg group">
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary">business</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-md">
                        <h4 className="text-body-lg font-semibold text-primary">{exp.title}</h4>
                        <span className="text-label-sm text-on-surface-variant shrink-0 bg-surface-container px-sm py-xs rounded">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-label-md text-secondary mb-sm mt-xs">{exp.company}</p>
                      <p className="text-body-md text-on-surface-variant leading-relaxed">{exp.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume?.education && resume.education.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl p-lg shadow-card border border-outline-variant/20">
              <h3 className="text-headline-md text-primary mb-lg">Education</h3>
              <div className="space-y-lg">
                {resume.education.map((edu, i) => (
                  <div key={i} className="flex gap-lg">
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary">school</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-md">
                        <h4 className="text-body-lg font-semibold text-primary">{edu.degree}</h4>
                        <span className="text-label-sm text-on-surface-variant shrink-0 bg-surface-container px-sm py-xs rounded">
                          {edu.period}
                        </span>
                      </div>
                      <p className="text-label-md text-secondary mt-xs">{edu.institution}</p>
                      {edu.specialization && (
                        <p className="text-body-md text-on-surface-variant mt-sm">{edu.specialization}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume?.projects && resume.projects.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl p-lg shadow-card border border-outline-variant/20">
              <h3 className="text-headline-md text-primary mb-lg">Projects</h3>
              <div className="space-y-lg">
                {resume.projects.map((proj, i) => (
                  <div key={i} className="p-md bg-surface-container-low rounded-xl">
                    <h4 className="text-body-lg font-semibold text-primary mb-xs">{proj.name}</h4>
                    <p className="text-body-md text-on-surface-variant mb-md leading-relaxed">
                      {proj.description}
                    </p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-xs">
                        {proj.technologies.map((tech, ti) => (
                          <span
                            key={ti}
                            className="bg-primary/10 text-primary px-sm py-xs rounded text-label-sm font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Right: Profile Strength + Skills */}
        <div className="col-span-12 lg:col-span-4 space-y-xl">
          {/* Profile Strength Card */}
          {resume && (
            <div className="glass-panel rounded-2xl p-lg sticky top-24">
              <div className="flex items-center gap-sm mb-lg">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[16px]">
                    trending_up
                  </span>
                </div>
                <h3 className="text-headline-md text-primary">Profile Strength</h3>
              </div>

              {/* Score */}
              <div className="flex items-center gap-md mb-lg">
                <div
                  className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-headline-md shrink-0"
                  style={{ borderColor: strengthColor, color: strengthColor }}
                >
                  {strengthScore}
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">
                    Completeness
                  </p>
                  <div className="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${strengthScore}%`,
                        background: strengthColor,
                      }}
                    />
                  </div>
                </div>
              </div>

              {resume.profile_strength_tip && (
                <div className="bg-secondary/10 rounded-xl p-md border-l-4 border-secondary">
                  <p className="text-label-md text-secondary font-medium mb-xs">Tip</p>
                  <p className="text-body-md text-on-surface">{resume.profile_strength_tip}</p>
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {resume?.skills && resume.skills.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl p-lg shadow-card border border-outline-variant/20">
              <h3 className="text-headline-md text-primary mb-lg">Skills</h3>
              <SkillsSection skills={resume.skills} />
            </div>
          )}

          {/* Empty state — no resume */}
          {!resume && (
            <div className="glass-panel rounded-2xl p-lg flex flex-col items-center justify-center text-center gap-md py-xl">
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-[28px]">
                  description
                </span>
              </div>
              <div>
                <p className="text-body-md font-semibold text-primary mb-xs">No resume uploaded</p>
                <p className="text-body-md text-on-surface-variant">
                  Upload your resume to see AI-extracted skills, experience, and profile strength.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
