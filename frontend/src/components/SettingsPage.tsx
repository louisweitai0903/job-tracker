import SchemaBuilder from './schema-builder/SchemaBuilder'

export default function SettingsPage() {
  return (
    <main className="ml-[280px] pt-24 px-margin-desktop pb-xl min-h-screen">
      <div className="mb-lg">
        <h1 className="text-headline-lg text-primary mb-xs">Settings</h1>
        <p className="text-body-md text-on-surface-variant">
          Manage tools for this workspace.
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-card p-lg">
        <div className="mb-md">
          <h2 className="text-headline-md text-primary mb-xs">AI Response Schema Builder</h2>
          <p className="text-body-md text-on-surface-variant">
            Opens pre-loaded with the schema this project currently sends to ai-service, so you're
            improving it rather than starting from scratch — switch between the Resume and Job
            Analysis schemas with the dropdown below. Matches the subset ai-service's Gemini client
            accepts (type, description, enum, properties, required, items, minimum, maximum). Drag
            fields to reorder them, then copy or download the result to use as a{' '}
            <code className="text-label-sm bg-surface-container-low px-xs py-[2px] rounded">
              schema_definition
            </code>{' '}
            payload for /extract, /analyze, or /search — you'll still need to paste it into{' '}
            <code className="text-label-sm bg-surface-container-low px-xs py-[2px] rounded">
              backend/src/ai_schemas.rs
            </code>{' '}
            by hand, this tool doesn't write back to the backend.
          </p>
        </div>
        <SchemaBuilder />
      </div>
    </main>
  )
}
