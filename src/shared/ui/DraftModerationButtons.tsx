
interface DraftModerationButtonsProps {
  mode: 'create' | 'edit'
  disabled?: boolean
  saving?: boolean
  onSaveDraft: () => Promise<void>
  onSubmitModeration: () => Promise<void>
  showDescription?: boolean
}

export function DraftModerationButtons({
  mode,
  disabled = false,
  saving = false,
  onSaveDraft,
  onSubmitModeration,
  showDescription = false
}: DraftModerationButtonsProps) {
  
  const handleSaveDraft = async () => {
    if (disabled || saving) return
    await onSaveDraft()
  }
  
  const handleSubmitModeration = async () => {
    if (disabled || saving) return
    await onSubmitModeration()
  }

  return (
    <div>
      <div className="modal-button-group" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(8px, 2vw, 12px)'
      }}>
        <button 
          type="button"
          className="modal-button"
          disabled={disabled || saving}
          onClick={handleSaveDraft}
          style={{ 
            padding: 'clamp(12px, 3vw, 16px)', 
            background: '#6c757d', 
            color: 'white', 
            border: mode === 'create' ? '1px solid #6c757d' : 'none', 
            borderRadius: '8px',
            cursor: (disabled || saving) ? 'not-allowed' : 'pointer',
            opacity: (disabled || saving) ? 0.6 : 1,
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            fontWeight: '500'
          }}
          aria-label="Сохранить как черновик для редактирования позже"
        >
          {saving ? 'Сохраняем…' : 'Сохранить как черновик'}
        </button>
        <button 
          type="button"
          className="modal-button"
          disabled={disabled || saving}
          onClick={handleSubmitModeration}
          style={{ 
            padding: 'clamp(12px, 3vw, 16px)', 
            background: mode === 'create' ? '#4CAF50' : '#007bff', 
            color: 'white', 
            border: mode === 'create' ? '1px solid #4CAF50' : 'none', 
            borderRadius: '8px',
            cursor: (disabled || saving) ? 'not-allowed' : 'pointer',
            opacity: (disabled || saving) ? 0.6 : 1,
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            fontWeight: '500'
          }}
          aria-label="Отправить на проверку модераторам"
        >
          {saving ? 'Отправляем…' : 'Отправить на модерацию'}
        </button>
      </div>
      
      {showDescription && (
        <div className="modal-help-text" style={{ 
          fontSize: 'clamp(12px, 3vw, 14px)', 
          color: '#666', 
          marginTop: 'clamp(8px, 2vw, 16px)',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          <strong>Сохранить как черновик:</strong> изменения сохранятся, можно продолжить редактирование позже.<br/>
          <strong>Отправить на модерацию:</strong> {mode === 'create' ? 'личность' : 'изменения'} будут отправлены на проверку модераторам.
        </div>
      )}
    </div>
  )
}



