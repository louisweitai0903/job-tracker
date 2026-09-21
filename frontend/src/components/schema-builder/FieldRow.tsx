import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FIELD_TYPES, FieldNode, FieldType, duplicateNames } from 'schema-builder'

const inputClass =
  'w-full bg-surface-container-low border-2 border-transparent focus:border-secondary rounded-lg px-sm py-xs text-label-md outline-none transition-all'

interface FieldRowProps {
  node: FieldNode
  /** True for the implicit root object; hides name/required/delete controls. */
  isRoot?: boolean
  /** True for an array's item schema; hides name/required/delete/drag controls. */
  isArrayItem?: boolean
  duplicate?: boolean
  onUpdate: (id: string, patch: Partial<FieldNode>) => void
  onSetType: (id: string, type: FieldType) => void
  onAddChild: (parentId: string) => void
  onRemove: (id: string) => void
}

export function FieldRow({
  node,
  isRoot,
  isArrayItem,
  duplicate,
  onUpdate,
  onSetType,
  onAddChild,
  onRemove,
}: FieldRowProps) {
  const sortable = useSortable({ id: node.id, disabled: isRoot || isArrayItem })
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  }
  const draggable = !isRoot && !isArrayItem

  const children = node.children ?? []
  const childDuplicates = duplicateNames(children)

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={`rounded-xl border ${duplicate ? 'border-error' : 'border-outline-variant/40'} bg-surface-container-lowest p-sm ${sortable.isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex flex-wrap items-start gap-sm">
        {draggable && (
          <button
            type="button"
            aria-label="Drag to reorder"
            className="mt-1 cursor-grab touch-none text-on-surface-variant hover:text-secondary"
            {...sortable.attributes}
            {...sortable.listeners}
          >
            <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
          </button>
        )}

        {!isRoot && !isArrayItem && (
          <div className="min-w-[140px] flex-1">
            <label className="mb-0.5 block text-label-sm text-on-surface-variant">Field name</label>
            <input
              className={inputClass}
              value={node.name}
              onChange={(e) => onUpdate(node.id, { name: e.target.value })}
            />
            {duplicate && <p className="mt-0.5 text-label-sm text-error">Duplicate name in this object</p>}
          </div>
        )}

        <div className="w-32">
          <label className="mb-0.5 block text-label-sm text-on-surface-variant">Type</label>
          <select
            className={inputClass}
            value={node.type}
            onChange={(e) => onSetType(node.id, e.target.value as FieldType)}
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[180px] flex-[2]">
          <label className="mb-0.5 block text-label-sm text-on-surface-variant">Description</label>
          <input
            className={inputClass}
            placeholder="Shown to the model as field guidance"
            value={node.description}
            onChange={(e) => onUpdate(node.id, { description: e.target.value })}
          />
        </div>

        {(node.type === 'integer' || node.type === 'number') && (
          <>
            <div className="w-24">
              <label className="mb-0.5 block text-label-sm text-on-surface-variant">Min</label>
              <input
                type="number"
                className={inputClass}
                value={node.minimum ?? ''}
                onChange={(e) =>
                  onUpdate(node.id, { minimum: e.target.value === '' ? undefined : Number(e.target.value) })
                }
              />
            </div>
            <div className="w-24">
              <label className="mb-0.5 block text-label-sm text-on-surface-variant">Max</label>
              <input
                type="number"
                className={inputClass}
                value={node.maximum ?? ''}
                onChange={(e) =>
                  onUpdate(node.id, { maximum: e.target.value === '' ? undefined : Number(e.target.value) })
                }
              />
            </div>
          </>
        )}

        {!isRoot && (
          <div className="mt-5 flex items-center gap-xs">
            <label className="flex items-center gap-xs text-label-sm text-on-surface-variant">
              <input
                type="checkbox"
                checked={node.required}
                disabled={isArrayItem}
                onChange={(e) => onUpdate(node.id, { required: e.target.checked })}
              />
              Required
            </label>
          </div>
        )}

        {!isRoot && !isArrayItem && (
          <button
            type="button"
            aria-label="Remove field"
            className="mt-5 text-on-surface-variant hover:text-error"
            onClick={() => onRemove(node.id)}
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        )}
      </div>

      {node.type === 'string' && (
        <div className="mt-sm">
          <label className="mb-0.5 block text-label-sm text-on-surface-variant">
            Enum values (comma-separated, optional)
          </label>
          <input
            className={inputClass}
            placeholder="e.g. high, medium, low"
            value={node.enumValues.join(', ')}
            onChange={(e) =>
              onUpdate(node.id, {
                enumValues: e.target.value.split(',').map((v) => v.trim()),
              })
            }
          />
        </div>
      )}

      {node.type === 'object' && (
        <div className="mt-sm space-y-xs border-l-2 border-outline-variant/40 pl-sm">
          <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {children.map((child) => (
              <FieldRow
                key={child.id}
                node={child}
                duplicate={childDuplicates.has(child.name)}
                onUpdate={onUpdate}
                onSetType={onSetType}
                onAddChild={onAddChild}
                onRemove={onRemove}
              />
            ))}
          </SortableContext>
          <button
            type="button"
            className="flex items-center gap-xs rounded-lg border border-dashed border-outline-variant px-sm py-xs text-label-sm text-secondary hover:bg-surface-container-low"
            onClick={() => onAddChild(node.id)}
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add field
          </button>
        </div>
      )}

      {node.type === 'array' && node.items && (
        <div className="mt-sm border-l-2 border-outline-variant/40 pl-sm">
          <p className="mb-1 text-label-sm text-on-surface-variant">Item schema</p>
          <FieldRow
            node={node.items}
            isArrayItem
            onUpdate={onUpdate}
            onSetType={onSetType}
            onAddChild={onAddChild}
            onRemove={onRemove}
          />
        </div>
      )}
    </div>
  )
}
