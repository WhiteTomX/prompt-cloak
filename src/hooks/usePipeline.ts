import { useMemo, useCallback } from 'react'
import type { MappingSet } from '../types'
import { Pipeline } from '../pipeline/Pipeline'
import { ManualDetection } from '../pipeline/detection/ManualDetection'
import { ManualGeneration } from '../pipeline/generation/ManualGeneration'
import { DirectReplacement } from '../pipeline/replacement/DirectReplacement'

const pipeline = new Pipeline(
  new ManualDetection(),
  new ManualGeneration(),
  new DirectReplacement(),
)

export function usePipeline(mappingSet: MappingSet) {
  const pseudonymize = useCallback(
    (text: string) => pipeline.pseudonymize(text, mappingSet).result,
    [mappingSet],
  )

  const depseudonymize = useCallback(
    (text: string) => pipeline.depseudonymize(text, mappingSet),
    [mappingSet],
  )

  return useMemo(() => ({ pseudonymize, depseudonymize }), [pseudonymize, depseudonymize])
}
