import React from 'react'

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
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        <button 
          type="button"
          disabled={disabled || saving}
          onClick={handleSaveDraft}
          style={{ 
            flex: 1, 
            padding: '12px 16px', 
            background: '#6c757d', 
            color: 'white', 
            border: mode === 'create' ? '1px solid #6c757d' : 'none', 
            borderRadius: '4px',
            cursor: (disabled || saving) ? 'not-allowed' : 'pointer',
            opacity: (disabled || saving) ? 0.6 : 1
          }}
          aria-label="Сохранить как черновик для редактирования позже"
        >
          {saving ? 'Сохраняем…' : 'Сохранить как черновик'}
        </button>
        <button 
          type="button"
          disabled={disabled || saving}
          onClick={handleSubmitModeration}
          style={{ 
            flex: 1, 
            padding: '12px 16px', 
            background: mode === 'create' ? '#4CAF50' : '#007bff', 
            color: 'white', 
            border: mode === 'create' ? '1px solid #4CAF50' : 'none', 
            borderRadius: '4px',
            cursor: (disabled || saving) ? 'not-allowed' : 'pointer',
            opacity: (disabled || saving) ? 0.6 : 1
          }}
          aria-label="Отправить на проверку модераторам"
        >
          {saving ? 'Отправляем…' : 'Отправить на модерацию'}
        </button>
      </div>
      
      {showDescription && (
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          <strong>Сохранить как черновик:</strong> изменения сохранятся, можно продолжить редактирование позже.<br/>
          <strong>Отправить на модерацию:</strong> {mode === 'create' ? 'личность' : 'изменения'} будут отправлены на проверку модераторам.
        </div>
      )}
    </div>
  )
}
