import type { GenerationStrategy, DetectedEntity } from '../types'

export class ManualGeneration implements GenerationStrategy {
  id = 'manual'
  label = 'Manual'

  generate(_entity: DetectedEntity): string {
    return ''
  }
}
