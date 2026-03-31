import { useState } from 'react'
import './ResultPanel.css'
import { useToast } from './Toast'

interface Props {
  pseudonymized: string
  depseudonymized: string
  onAiResponseChange: (v: string) => void
  aiResponse: string
  active?: boolean
}

export function ResultPanel({ pseudonymized, depseudonymized, onAiResponseChange, aiResponse, active }: Props) {
  const [copied, setCopied] = useState<'pseudo' | 'depseudo' | null>(null)
  const toast = useToast()

  function copy(text: string, key: 'pseudo' | 'depseudo') {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
    toast.show('Copied to clipboard', 'success')
  }

  return (
    <div className="result-panel-wrapper">
      {/* Step 2: Pseudonymized output */}
      <div className="panel" data-active={active}>
        <div className="panel-header">
          <h2>
            <span className="step-badge">2</span>
            Pseudonymized — Send to AI
          </h2>
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
              <div className="result-empty-state">
                <div className="empty-step-number">2</div>
                <h3>Pseudonymized output</h3>
                <p>Your text with sensitive values replaced will appear here. Copy it and send to your AI assistant.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 3: AI response + de-pseudonymized output */}
      <div className="panel" data-active={active}>
        <div className="panel-header">
          <h2>
            <span className="step-badge">3</span>
            AI Response &amp; Result
          </h2>
        </div>
        <div className="panel-body">
          <textarea
            value={aiResponse}
            onChange={e => onAiResponseChange(e.target.value)}
            placeholder="Paste the AI's response here to reveal the original values."
            spellCheck={false}
            className="ai-response-textarea"
            aria-label="AI response"
          />
          <div className="result-arrow-divider">
            <span className="result-arrow">↓</span>
            <span className="result-arrow-label">De-pseudonymized</span>
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
              <div className="result-empty-state">
                <div className="empty-step-number">3</div>
                <h3>De-pseudonymized result</h3>
                <p>Paste the AI's response above and the original values will be restored here automatically.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
