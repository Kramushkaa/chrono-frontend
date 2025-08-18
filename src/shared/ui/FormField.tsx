import React from 'react'

interface FormFieldProps {
  label: string
  children: React.ReactNode
  error?: string
  required?: boolean
  helpText?: string
  style?: React.CSSProperties
  labelStyle?: React.CSSProperties
  errorStyle?: React.CSSProperties
  helpStyle?: React.CSSProperties
}

export function FormField({
  label,
  children,
  error,
  required = false,
  helpText,
  style,
  labelStyle,
  errorStyle,
  helpStyle
}: FormFieldProps) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <label style={{ 
        display: 'block', 
        marginBottom: 6, 
        fontWeight: 500,
        fontSize: 14,
        ...labelStyle 
      }}>
        {label}
        {required && <span style={{ color: '#dc3545', marginLeft: 4 }}>*</span>}
      </label>
      
      {children}
      
      {error && (
        <div style={{ 
          color: '#dc3545', 
          fontSize: 12, 
          marginTop: 4,
          ...errorStyle 
        }}>
          {error}
        </div>
      )}
      
      {helpText && !error && (
        <div style={{ 
          color: 'rgba(255,255,255,0.6)', 
          fontSize: 12, 
          marginTop: 4,
          ...helpStyle 
        }}>
          {helpText}
        </div>
      )}
    </div>
  )
}

interface InputFieldProps extends Omit<FormFieldProps, 'children'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'url'
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  inputStyle?: React.CSSProperties
}

export function InputField({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  inputStyle,
  ...formFieldProps
}: InputFieldProps) {
  return (
    <FormField {...formFieldProps}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid rgba(139,69,19,0.4)',
          borderRadius: 4,
          background: 'rgba(44,24,16,0.8)',
          color: 'white',
          fontSize: 14,
          ...inputStyle
        }}
      />
    </FormField>
  )
}

interface SelectFieldProps extends Omit<FormFieldProps, 'children'> {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  disabled?: boolean
  selectStyle?: React.CSSProperties
}

export function SelectField({
  value,
  onChange,
  options,
  disabled = false,
  selectStyle,
  ...formFieldProps
}: SelectFieldProps) {
  return (
    <FormField {...formFieldProps}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid rgba(139,69,19,0.4)',
          borderRadius: 4,
          background: 'rgba(44,24,16,0.8)',
          color: 'white',
          fontSize: 14,
          ...selectStyle
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}

interface TextAreaFieldProps extends Omit<FormFieldProps, 'children'> {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  disabled?: boolean
  textareaStyle?: React.CSSProperties
}

export function TextAreaField({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  textareaStyle,
  ...formFieldProps
}: TextAreaFieldProps) {
  return (
    <FormField {...formFieldProps}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid rgba(139,69,19,0.4)',
          borderRadius: 4,
          background: 'rgba(44,24,16,0.8)',
          color: 'white',
          fontSize: 14,
          resize: 'vertical',
          fontFamily: 'inherit',
          ...textareaStyle
        }}
      />
    </FormField>
  )
}
