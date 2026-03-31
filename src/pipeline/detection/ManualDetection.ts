import type { DetectionStrategy, DetectedEntity } from '../types'

export class ManualDetection implements DetectionStrategy {
  id = 'manual'
  label = 'Manual'

  detect(_text: string): DetectedEntity[] {
    return []
  }
}
