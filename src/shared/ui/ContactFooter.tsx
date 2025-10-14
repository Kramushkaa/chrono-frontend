import React from 'react'

type ContactFooterProps = {
  fixed?: boolean
}

export const ContactFooter: React.FC<ContactFooterProps> = ({ fixed = false }) => {
  return (
    <footer style={{
      marginTop: fixed ? 0 : 8,
      padding: '8px 12px',
      borderTop: '1px solid rgba(139,69,19,0.2)',
      color: '#ccbfa3',
      fontSize: 14,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'center',
      justifyContent: 'center',
      position: fixed ? 'fixed' as const : 'static' as const,
      left: fixed ? 0 : undefined,
      right: fixed ? 0 : undefined,
      bottom: fixed ? 0 : undefined,
      zIndex: fixed ? 5 : undefined,
      background: fixed ? 'rgba(24, 17, 9, 0.92)' : 'transparent',
      backdropFilter: fixed ? 'blur(2px)' : undefined
    }}>
      <span>Связь:</span>
      <a href="mailto:admin@chrono.ninja" style={{ color: '#e6d7b2' }}>admin@chrono.ninja</a>
      <span>·</span>
      <a href="https://t.me/chrono_ninja" target="_blank" rel="noopener noreferrer" style={{ color: '#e6d7b2' }}>t.me/chrono_ninja</a>
    </footer>
  )
}

export default ContactFooter


