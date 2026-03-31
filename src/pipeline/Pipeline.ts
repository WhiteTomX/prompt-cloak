import type {
  DetectionStrategy,
  GenerationStrategy,
  ReplacementStrategy,
  PipelineResult,
  IPipeline,
} from './types'
import type { MappingSet } from '../types'

export class Pipeline implements IPipeline {
  private detection: DetectionStrategy
  private generation: GenerationStrategy
  private replacement: ReplacementStrategy

  constructor(
    detection: DetectionStrategy,
    generation: GenerationStrategy,
    replacement: ReplacementStrategy,
  ) {
    this.detection = detection
    this.generation = generation
    this.replacement = replacement
  }

  pseudonymize(text: string, mappings: MappingSet): PipelineResult {
    // Stage 1: detect entities in text
    const newEntities = this.detection.detect(text)

    // Stage 2: generate pseudonyms for new entities (manual generation returns '' — UI fills it in)
    for (const entity of newEntities) {
      entity.value = this.generation.generate(entity) || entity.value
    }

    // Build replacement pairs from existing mappings (real → pseudonym)
    const pairs = mappings.mappings.map(m => ({
      source: m.realValue,
      target: m.pseudonym,
      caseSensitive: m.caseSensitive,
    }))

    // Stage 3: replace
    const result = this.replacement.replace(text, pairs)

    return { result, newEntities }
  }

  depseudonymize(text: string, mappings: MappingSet): string {
    // Swap direction: pseudonym → real
    const pairs = mappings.mappings.map(m => ({
      source: m.pseudonym,
      target: m.realValue,
      caseSensitive: m.caseSensitive,
    }))

    return this.replacement.replace(text, pairs)
  }
}
