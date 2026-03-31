import { useState } from 'react'
import './index.css'
import { useMappings } from './hooks/useMappings'
import { usePipeline } from './hooks/usePipeline'
import { TextPanel } from './components/TextPanel/TextPanel'
import { ResultPanel } from './components/ResultPanel'
import { MappingSidebar } from './components/MappingSidebar/MappingSidebar'
import type { PiiCategory } from './types'

export default function App() {
  const [inputText, setInputText] = useState('')
  const [aiResponse, setAiResponse] = useState('')

  const { mappingSet, addMapping, updateMapping, removeMapping, clearMappings, replaceMappingSet } =
    useMappings()

  const { pseudonymize, depseudonymize } = usePipeline(mappingSet)

  const pseudonymized = pseudonymize(inputText)
  const depseudonymized = depseudonymize(aiResponse)

  function handleAddMapping(realValue: string, pseudonym: string, category: PiiCategory) {
    addMapping(realValue, pseudonym, category)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Prompt Cloak</h1>
        <span className="subtitle">Pseudonymize PII before sending to AI assistants</span>
      </header>

      <div className="main-area" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 12 }}>
        <TextPanel value={inputText} onChange={setInputText} onAddMapping={handleAddMapping} />
        <ResultPanel
          pseudonymized={pseudonymized}
          depseudonymized={depseudonymized}
          aiResponse={aiResponse}
          onAiResponseChange={setAiResponse}
        />
      </div>

      <MappingSidebar
        mappingSet={mappingSet}
        onAdd={handleAddMapping}
        onUpdate={updateMapping}
        onRemove={removeMapping}
        onClear={clearMappings}
        onReplace={replaceMappingSet}
      />
    </div>
  )
}
