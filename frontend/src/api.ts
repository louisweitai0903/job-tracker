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

export async function uploadResume(file: File): Promise<ResumeData> {
  const form = new FormData()
  form.append('file', file)
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
  const res = await fetch(`${BASE}/jobs/${id}/analyse`, { method: 'POST' })
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
    body: JSON.stringify({ job_text: jobText }),
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
    body: JSON.stringify({ url, job_text: jobText }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Parsing URL failed' }))
    throw new Error(err.error || 'Parsing URL failed')
  }
  return res.json()
}
