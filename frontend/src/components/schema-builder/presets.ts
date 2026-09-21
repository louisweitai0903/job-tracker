import { JsonSchemaDict } from 'schema-builder'

/**
 * Mirrors the schemas actually hardcoded in backend/src/ai_schemas.rs, so Settings opens
 * showing the schema this project currently sends to ai-service rather than a blank slate.
 * If ai_schemas.rs changes, update these to match — this is a read-only starting point for
 * editing, not a live source of truth (the builder never writes back to the Rust source).
 */
export interface SchemaPreset {
  id: string
  label: string
  schema: JsonSchemaDict
}

const resumeSchema: JsonSchemaDict = {
  type: 'object',
  properties: {
    profile_strength_score: { type: 'integer' },
    profile_strength_tip: { type: 'string' },
    skills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: { type: 'string', enum: ['technical', 'design', 'soft', 'language', 'tool'] },
        },
        required: ['name', 'category'],
      },
    },
    work_experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          company: { type: 'string' },
          period: { type: 'string' },
          summary: { type: 'string' },
        },
        required: ['title', 'company', 'period', 'summary'],
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          degree: { type: 'string' },
          institution: { type: 'string' },
          period: { type: 'string' },
          specialization: { type: 'string' },
        },
        required: ['degree', 'institution', 'period'],
      },
    },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          technologies: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'description', 'technologies'],
      },
    },
  },
  required: ['profile_strength_score', 'profile_strength_tip', 'skills', 'work_experience', 'education', 'projects'],
}

function jobAnalysisSchema(includeParsing: boolean): JsonSchemaDict {
  const properties: Record<string, JsonSchemaDict> = {
    analysis_ready: { type: 'boolean' },
    role_summary: { type: 'string' },
    company_background: { type: 'string' },
    match_reasons: { type: 'array', items: { type: 'string' } },
    improvement_tips: { type: 'array', items: { type: 'string' } },
    skills_required: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          candidate_has: { type: 'boolean' },
        },
        required: ['name', 'candidate_has'],
      },
    },
    fit_score: { type: 'integer' },
    urgency_level: { type: 'string', enum: ['high', 'medium', 'low'] },
  }

  const required = [
    'analysis_ready',
    'role_summary',
    'company_background',
    'match_reasons',
    'improvement_tips',
    'skills_required',
    'fit_score',
    'urgency_level',
  ]

  if (includeParsing) {
    properties.company = { type: 'string' }
    properties.title = { type: 'string' }
    required.unshift('title')
    required.unshift('company')
  }

  return { type: 'object', properties, required }
}

export const PRESETS: SchemaPreset[] = [
  { id: 'resume', label: 'Resume Schema', schema: resumeSchema },
  { id: 'job-analysis', label: 'Job Analysis Schema (Analyze)', schema: jobAnalysisSchema(false) },
  {
    id: 'job-analysis-parse',
    label: 'Job Analysis Schema (Auto-fill / Parse URL)',
    schema: jobAnalysisSchema(true),
  },
]
