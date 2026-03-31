import './StepIndicator.css'

interface Props {
  currentStep: 1 | 2 | 3
}

const STEPS = [
  { number: 1, label: 'Paste & Map' },
  { number: 2, label: 'Send to AI' },
  { number: 3, label: 'Get Result' },
]

export function StepIndicator({ currentStep }: Props) {
  return (
    <nav className="step-indicator" aria-label="Workflow steps">
      {STEPS.map((step, i) => {
        const state = step.number < currentStep ? 'done' : step.number === currentStep ? 'active' : 'upcoming'
        return (
          <div key={step.number} className={`step step-${state}`} aria-current={state === 'active' ? 'step' : undefined}>
            {i > 0 && <div className="step-connector" />}
            <span className="step-number">{state === 'done' ? '✓' : step.number}</span>
            <span className="step-label">{step.label}</span>
          </div>
        )
      })}
    </nav>
  )
}
