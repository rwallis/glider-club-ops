import { CLUB_MEMBERS } from '../../data/members'

interface PilotNameFieldProps {
  id: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
}

export function PilotNameField({
  id,
  value,
  onChange,
  required,
  placeholder = 'Select or type pilot name',
}: PilotNameFieldProps) {
  const listId = `${id}-pilots`

  return (
    <>
      <input
        id={id}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete="name"
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-base text-white placeholder:text-slate-500"
      />
      <datalist id={listId}>
        {CLUB_MEMBERS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </>
  )
}
