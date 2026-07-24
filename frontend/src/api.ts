import type { Job, ResumeData } from './types'

const BASE = '/api'

export async function fetchJobs(): Promise<Job[]> {
  const res = await fetch(`${BASE}/jobs`)
  if (!res.ok) throw new Error('Failed to fetch jobs')
  return res.json()
}

export async function createJob(data: Partial<Job>): Promise<Job> {
  const res = await fetch(`${BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateJob(id: string, data: Partial<Job>): Promise<Job> {
  const res = await fetch(`${BASE}/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteJob(id: string): Promise<void> {
  const res = await fetch(`${BASE}/jobs/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await res.text())
}

export async function fetchResume(): Promise<ResumeData | null> {
  const res = await fetch(`${BASE}/resume`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch resume')
  return res.json()
}

export async function updateResume(data: ResumeData): Promise<ResumeData> {
  const res = await fetch(`${BASE}/resume`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Update failed' }))
    throw new Error(err.error || 'Failed to update resume')
  }
  return res.json()
}

export function getPreferredModel(): string {
  return localStorage.getItem('preferred_ai_model') || 'gemini-3.1-pro-preview'
}

export async function uploadResume(file: File): Promise<ResumeData> {
  const form = new FormData()
  form.append('file', file)
  form.append('model', getPreferredModel())
  
  const res = await fetch(`${BASE}/resume`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(err.error || 'Upload failed')
  }
  return res.json()
}

export async function deleteResume(): Promise<void> {
  await fetch(`${BASE}/resume`, { method: 'DELETE' })
}

export async function analyseJob(id: string): Promise<Job> {
  // We need to send it as JSON so the backend can parse it, but analyse_job has no body in the backend!
  // Wait, in backend, `analyse_by_url` doesn't take a JSON body! It just takes Path(id).
  // Let me just append it as a query param, or update the backend to take a JSON body?
  // Let's look at analyseJob implementation in api.ts. It's POST without body.
  // Actually I updated it in backend earlier? Let's check `analyse.rs`.
  // Wait, I did NOT update `analyse_by_url` to take a payload! I left it as is and passed `None` for model.
  // Oh, right, `analyse_by_url` has no JSON extractor.
  // For `analyseJob`, I'll change it to send a query string maybe? No, let's just leave analyseJob calling without a model if it's too much, or wait, I can just update the backend to accept an optional JSON body for `analyse_by_url`.
  
  // Wait, let's just make it a query parameter in backend for analyse_by_url, or just let it use the default? 
  // Let's add it as a JSON payload for analyse_by_url in backend in a moment if needed. For now I'll just change api.ts to send JSON body.
  const res = await fetch(`${BASE}/jobs/${id}/analyse`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: getPreferredModel() })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Analysis failed' }))
    throw new Error(err.error || 'Analysis failed')
  }
  return res.json()
}

export async function analyseJobText(id: string, jobText: string): Promise<Job> {
  const res = await fetch(`${BASE}/jobs/${id}/analyse-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_text: jobText, model: getPreferredModel() }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Analysis failed' }))
    throw new Error(err.error || 'Analysis failed')
  }
  return res.json()
}

export async function parseJobUrl(url: string, jobText?: string): Promise<any> {
  const res = await fetch(`${BASE}/jobs/parse-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, job_text: jobText, model: getPreferredModel() }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Parsing URL failed' }))
    throw new Error(err.error || 'Parsing URL failed')
  }
  return res.json()
}
