import type { ReactNode } from 'react'

interface TwoColumnRowProps {
  label: string
  bold?: boolean
  muted?: boolean
  children: ReactNode
}

export function TwoColumnRow({ label, bold, muted, children }: TwoColumnRowProps) {
  const labelClass = [
    'two-col-label',
    bold ? 'two-col-label--bold' : '',
    muted ? 'two-col-label--muted' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="two-col-row">
      <span className={labelClass}>{label}</span>
      <div className="two-col-content">{children}</div>
    </div>
  )
}

export function TwoColumnSection({ children }: { children: ReactNode }) {
  return (
    <div className="two-col-section">
      {children}
    </div>
  )
}

export function TwoColumnSpacer() {
  return <div className="two-col-spacer" />
}
