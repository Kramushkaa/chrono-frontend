import React from 'react'

export const ContactFooter: React.FC = () => {
  return (
    <footer style={{
      marginTop: 8,
      padding: '8px 12px',
      borderTop: '1px solid rgba(139,69,19,0.2)',
      color: '#ccbfa3',
      fontSize: 14,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <span>Связь:</span>
      <a href="mailto:admin@chrono.ninja" style={{ color: '#e6d7b2' }}>admin@chrono.ninja</a>
      <span>·</span>
      <a href="https://t.me/chrono_ninja" target="_blank" rel="noopener noreferrer" style={{ color: '#e6d7b2' }}>t.me/chrono_ninja</a>
    </footer>
  )
}

export default ContactFooter


