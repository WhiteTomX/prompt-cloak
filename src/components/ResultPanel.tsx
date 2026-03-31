import { useState } from 'react'

interface Props {
  pseudonymized: string
  depseudonymized: string
  onAiResponseChange: (v: string) => void
  aiResponse: string
}

export function ResultPanel({ pseudonymized, depseudonymized, onAiResponseChange, aiResponse }: Props) {
  const [copied, setCopied] = useState<'pseudo' | 'depseudo' | null>(null)

  function copy(text: string, key: 'pseudo' | 'depseudo') {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 12, minHeight: 0 }}>
      {/* Pseudonymized output */}
      <div className="panel" style={{ flex: 1 }}>
        <div className="panel-header">
          <h2>Pseudonymized — Send to AI</h2>
          <button
            className="btn-ghost"
            onClick={() => copy(pseudonymized, 'pseudo')}
            disabled={!pseudonymized}
          >
            {copied === 'pseudo' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="panel-body">
          {pseudonymized ? (
            <div className="output-text">{pseudonymized}</div>
          ) : (
            <div className="output-text placeholder">
              Pseudonymized output will appear here once you add mappings and type in the input.
            </div>
          )}
        </div>
      </div>

      {/* AI response input + de-pseudonymized output */}
      <div className="panel" style={{ flex: 1 }}>
        <div className="panel-header">
          <h2>AI Response — Paste Here</h2>
        </div>
        <div className="panel-body">
          <textarea
            value={aiResponse}
            onChange={e => onAiResponseChange(e.target.value)}
            placeholder="Paste the AI's response here to reveal the original values."
            spellCheck={false}
            style={{ flex: '0 0 40%', borderBottom: '1px solid var(--color-border)' }}
          />
          <div
            className="panel-header"
            style={{ borderTop: 'none', borderBottom: '1px solid var(--color-border)' }}
          >
            <h2>De-pseudonymized</h2>
            <button
              className="btn-ghost"
              onClick={() => copy(depseudonymized, 'depseudo')}
              disabled={!depseudonymized}
            >
              {copied === 'depseudo' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          {depseudonymized ? (
            <div className="output-text">{depseudonymized}</div>
          ) : (
            <div className="output-text placeholder">
              De-pseudonymized response will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
