import { UploadCloud } from 'lucide-react'

const FileUpload = ({
  label,
  value,
  onChange,
  accept = 'application/pdf',
  helper = 'PDF uploads only',
}) => {
  const displayName = value?.name || value || 'Drag & drop PDF or click to upload'
  return (
    <div className="flex flex-col gap-2">
      <span className="label">{label}</span>
      <label className="glass-card flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed border-cloud-300 px-6 py-8 text-center text-sm text-ink-600">
        <UploadCloud className="h-6 w-6 text-azure-500" />
        <div>
          <p className="font-semibold text-ink-800">
            {displayName}
          </p>
          <p className="mt-1 text-xs text-ink-500">{helper}</p>
        </div>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              onChange(file)
            }
          }}
        />
      </label>
    </div>
  )
}

export default FileUpload
