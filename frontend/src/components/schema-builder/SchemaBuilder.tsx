import { useMemo, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FieldRow } from './FieldRow'
import { SchemaPreview } from './SchemaPreview'
import { ImportDialog } from './ImportDialog'
import { PRESETS } from './presets'
import {
  FieldNode,
  FieldType,
  addChild,
  createRoot,
  duplicateNames,
  findNode,
  findParentId,
  fromJsonSchema,
  removeField,
  reorderSiblings,
  setFieldType,
  toJsonSchema,
  updateField,
} from 'schema-builder'

export default function SchemaBuilder() {
  const [root, setRoot] = useState<FieldNode>(() => fromJsonSchema(PRESETS[0].schema))
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id)
  const [showImport, setShowImport] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const schema = useMemo(() => toJsonSchema(root), [root])
  const rootChildren = useMemo(() => root.children ?? [], [root])
  const rootDuplicates = useMemo(() => duplicateNames(rootChildren), [rootChildren])

  function handleUpdate(id: string, patch: Partial<FieldNode>) {
    setRoot((r) => updateField(r, id, patch))
  }

  function handleSetType(id: string, type: FieldType) {
    setRoot((r) => setFieldType(r, id, type))
  }

  function handleAddChild(parentId: string) {
    setRoot((r) => addChild(r, parentId))
  }

  function handleRemove(id: string) {
    setRoot((r) => removeField(r, id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setRoot((r) => {
      const activeParent = findParentId(r, String(active.id))
      const overParent = findParentId(r, String(over.id))
      if (!activeParent || activeParent !== overParent) return r

      const siblings = findNode(r, activeParent)?.children ?? []
      const oldIndex = siblings.findIndex((s) => s.id === active.id)
      const newIndex = siblings.findIndex((s) => s.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return r

      return reorderSiblings(r, activeParent, oldIndex, newIndex)
    })
  }

  function handleReset() {
    if (confirm('Discard the current schema and start with a blank one?')) {
      setPresetId('')
      setRoot(createRoot())
    }
  }

  function handleImport(json: unknown) {
    setPresetId('')
    setRoot(fromJsonSchema(json))
  }

  function handleSelectPreset(id: string) {
    const preset = PRESETS.find((p) => p.id === id)
    if (!preset) return
    if (confirm(`Load "${preset.label}"? This discards the current unsaved schema.`)) {
      setPresetId(preset.id)
      setRoot(fromJsonSchema(preset.schema))
    }
  }

  return (
    <div className="grid grid-cols-1 gap-lg lg:grid-cols-2" style={{ minHeight: 480 }}>
      <section className="flex flex-col">
        <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
          <h2 className="text-label-md font-semibold text-on-surface">Fields</h2>
          <div className="flex flex-wrap items-center gap-xs">
            <select
              className="rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-label-sm text-on-surface"
              value={presetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
            >
              <option value="" disabled>
                Load current schema…
              </option>
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="flex items-center gap-xs rounded-lg border border-outline-variant px-sm py-xs text-label-sm text-on-surface hover:bg-surface-container-low"
              onClick={() => setShowImport(true)}
            >
              <span className="material-symbols-outlined text-[16px]">upload</span> Import
            </button>
            <button
              type="button"
              className="flex items-center gap-xs rounded-lg border border-outline-variant px-sm py-xs text-label-sm text-on-surface hover:bg-surface-container-low"
              onClick={handleReset}
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span> Blank
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-xs overflow-auto rounded-2xl border border-outline-variant/30 bg-surface-container-low p-sm" style={{ maxHeight: 560 }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={rootChildren.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {rootChildren.map((child) => (
                <FieldRow
                  key={child.id}
                  node={child}
                  duplicate={rootDuplicates.has(child.name)}
                  onUpdate={handleUpdate}
                  onSetType={handleSetType}
                  onAddChild={handleAddChild}
                  onRemove={handleRemove}
                />
              ))}
            </SortableContext>
          </DndContext>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-xs rounded-lg border border-dashed border-outline-variant py-sm text-label-md text-secondary hover:bg-surface-container-lowest"
            onClick={() => handleAddChild(root.id)}
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Add top-level field
          </button>
        </div>
      </section>

      <section className="flex flex-col">
        <SchemaPreview schema={schema} />
      </section>

      {showImport && <ImportDialog onImport={handleImport} onClose={() => setShowImport(false)} />}
    </div>
  )
}
