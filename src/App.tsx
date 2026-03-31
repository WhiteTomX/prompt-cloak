import { useState } from 'react'
import './index.css'
import './App.css'
import { useMappings } from './hooks/useMappings'
import { usePipeline } from './hooks/usePipeline'
import { TextPanel } from './components/TextPanel/TextPanel'
import { ResultPanel } from './components/ResultPanel'
import { MappingSidebar } from './components/MappingSidebar/MappingSidebar'
import { StepIndicator } from './components/StepIndicator'
import { ToastProvider } from './components/Toast'
import type { PiiCategory } from './types'

export default function App() {
  const [inputText, setInputText] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { mappingSet, addMapping, updateMapping, removeMapping, clearMappings, replaceMappingSet, saveCount } =
    useMappings()

  const { pseudonymize, depseudonymize } = usePipeline(mappingSet)

  const pseudonymized = pseudonymize(inputText)
  const depseudonymized = depseudonymize(aiResponse)

  const hasMappings = mappingSet.mappings.length > 0
  const currentStep: 1 | 2 | 3 = aiResponse ? 3 : hasMappings ? 2 : 1

  function handleAddMapping(realValue: string, pseudonym: string, category: PiiCategory) {
    return addMapping(realValue, pseudonym, category)
  }

  return (
    <ToastProvider>
      <div className="app">
        <header className="app-header">
          <h1>Prompt Cloak</h1>
          <span className="subtitle">Pseudonymize PII before sending to AI assistants</span>
          <button
            className="btn-ghost sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle mappings panel"
          >
            {sidebarOpen ? 'Close' : 'Mappings'}
          </button>
        </header>

        <StepIndicator currentStep={currentStep} />

        <div className="main-area">
          <TextPanel
            value={inputText}
            onChange={setInputText}
            mappings={mappingSet.mappings}
            onAddMapping={handleAddMapping}
            onUpdateMapping={updateMapping}
            active={currentStep === 1}
          />
          <ResultPanel
            pseudonymized={pseudonymized}
            depseudonymized={depseudonymized}
            aiResponse={aiResponse}
            onAiResponseChange={setAiResponse}
            active={currentStep >= 2}
          />
        </div>

        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <MappingSidebar
          mappingSet={mappingSet}
          onAdd={handleAddMapping}
          onUpdate={updateMapping}
          onRemove={removeMapping}
          onClear={clearMappings}
          onReplace={replaceMappingSet}
          open={sidebarOpen}
          saveCount={saveCount}
        />
      </div>
    </ToastProvider>
  )
}
