import type { CVCreateRequest, CVPresentationLocale } from '../../types/cv'
import { CVInlineAddButton, CVInlineInput } from './CVInlineFields'
import CVInlineItemWrapper from './CVInlineItemWrapper'

type Props = {
  skills: CVCreateRequest['skills']
  locale: CVPresentationLocale
  onChange: (index: number, changes: Partial<CVCreateRequest['skills'][number]>) => void
  onAdd: () => void
  onDelete: (index: number) => void
  onMoveUp?: (index: number) => void
  onMoveDown?: (index: number) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
}

export default function CVInlineSkillsEditor({
  skills,
  locale,
  onChange,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
  onReorder,
}: Props) {
  const emptyLabel = locale === 'en' ? 'No skills yet. Add your first skill.' : 'Chưa có kỹ năng. Hãy thêm kỹ năng đầu tiên.'
  const nameLabel = locale === 'en' ? 'Skill name' : 'Tên kỹ năng'
  const addLabel = locale === 'en' ? 'Add skill' : 'Thêm kỹ năng'

  return (
    <div className="space-y-2">
      {skills.length === 0 && <p className="rounded-lg border border-dashed border-current/20 px-3 py-2 text-[10px] opacity-60">{emptyLabel}</p>}
      {skills.map((skill, index) => (
        <CVInlineItemWrapper
          key={index}
          index={index}
          total={skills.length}
          collectionKey="skills"
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          onReorder={onReorder}
          deleteLabel={locale === 'en' ? 'Delete skill' : 'Xóa kỹ năng'}
        >
          <CVInlineInput
            fieldId={`skill.${index}.name`}
            value={skill.name}
            onChange={(name) => onChange(index, { name })}
            label={`${nameLabel} ${index + 1}`}
            placeholder={nameLabel}
            maxLength={100}
            className="text-xs font-semibold"
          />
        </CVInlineItemWrapper>
      ))}
      <CVInlineAddButton onClick={onAdd}>{addLabel}</CVInlineAddButton>
    </div>
  )
}
