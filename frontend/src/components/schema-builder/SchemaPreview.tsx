import { useState } from 'react'
import { JsonSchemaDict } from 'schema-builder'

interface SchemaPreviewProps {
  schema: JsonSchemaDict
}

export function SchemaPreview({ schema }: SchemaPreviewProps) {
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(schema, null, 2)

  async function handleCopy() {
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleDownload() {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schema.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-sm flex items-center justify-between">
        <h2 className="text-label-md font-semibold text-on-surface">JSON Schema</h2>
        <div className="flex gap-xs">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-xs rounded-lg border border-outline-variant px-sm py-xs text-label-sm text-on-surface hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-xs rounded-lg border border-outline-variant px-sm py-xs text-label-sm text-on-surface hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[16px]">download</span> Download
          </button>
        </div>
      </div>
      <pre className="flex-1 overflow-auto rounded-xl border border-outline-variant bg-primary p-sm text-xs text-white">
        <code>{json}</code>
      </pre>
    </div>
  )
}
