import React from 'react'

interface EditWarningModalProps {
  isOpen: boolean
  personName: string
  onRevertToDraft: () => Promise<void>
  onCancel: () => void
  isReverting?: boolean
}

export function EditWarningModal({
  isOpen,
  personName,
  onRevertToDraft,
  onCancel,
  isReverting = false
}: EditWarningModalProps) {
  if (!isOpen) return null

  const handleRevertToDraft = async () => {
    if (isReverting) return
    await onRevertToDraft()
  }

  return (
    <div role="dialog" aria-modal="true" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'rgba(44,24,16,0.95)',
        border: '1px solid rgba(139,69,19,0.4)',
        borderRadius: 8,
        padding: 16,
        minWidth: 360,
        maxWidth: 500,
        width: '90%'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: 8
        }}>
          <div style={{ 
            fontWeight: 'bold',
            color: '#f4e4c1'
          }}>
            ⚠️ Редактирование недоступно
          </div>
        </div>

        <div style={{ marginBottom: 16, lineHeight: 1.5, color: '#f4e4c1' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: 16 }}>
            Личность <strong>«{personName}»</strong> находится на модерации.
          </p>
          <p style={{ margin: '0 0 12px 0', opacity: 0.8 }}>
            Редактировать можно только черновики или опубликованные личности.
          </p>
          <p style={{ margin: 0, opacity: 0.7, fontSize: 14 }}>
            Вы можете вернуть личность в черновики для редактирования. При этом связанные периоды и достижения также станут черновиками.
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: 8, 
          justifyContent: 'flex-end' 
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isReverting}
            style={{
              padding: '6px 12px',
              border: '1px solid rgba(244, 228, 193, 0.3)',
              borderRadius: 4,
              backgroundColor: 'transparent',
              color: '#f4e4c1',
              cursor: isReverting ? 'not-allowed' : 'pointer',
              opacity: isReverting ? 0.6 : 1
            }}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleRevertToDraft}
            disabled={isReverting}
            style={{
              padding: '6px 12px',
              border: '1px solid #f39c12',
              borderRadius: 4,
              backgroundColor: '#f39c12',
              color: 'white',
              cursor: isReverting ? 'not-allowed' : 'pointer',
              opacity: isReverting ? 0.6 : 1
            }}
          >
            {isReverting ? 'Возвращаем...' : 'Вернуть в черновики'}
          </button>
        </div>
      </div>
    </div>
  )
}



