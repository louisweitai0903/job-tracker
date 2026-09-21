import { useState } from 'react'

interface ImportDialogProps {
  onImport: (json: unknown) => void
  onClose: () => void
}

export function ImportDialog({ onImport, onClose }: ImportDialogProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleImport() {
    try {
      const parsed = JSON.parse(text)
      onImport(parsed)
      onClose()
    } catch {
      setError('That is not valid JSON.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-md">
      <div className="w-full max-w-xl rounded-2xl bg-surface-container-lowest p-lg shadow-modal animate-in">
        <h2 className="mb-xs text-label-md font-semibold text-on-surface">Import JSON Schema</h2>
        <p className="mb-sm text-label-sm text-on-surface-variant">
          Paste a schema using the supported subset (type, description, enum, properties, required, items,
          minimum, maximum). Unsupported keywords are ignored.
        </p>
        <textarea
          className="h-64 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low p-sm font-mono text-xs text-on-surface outline-none focus:ring-2 focus:ring-secondary"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='{"type": "object", "properties": {...}}'
        />
        {error && <p className="mt-xs text-label-sm text-error">{error}</p>}
        <div className="mt-md flex justify-end gap-sm">
          <button
            type="button"
            className="rounded-xl border-2 border-outline-variant px-md py-xs text-label-md text-on-surface hover:bg-surface-container transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-secondary px-md py-xs text-label-md text-on-secondary hover:opacity-90"
            onClick={handleImport}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  )
}
