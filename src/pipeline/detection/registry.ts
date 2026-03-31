import type { DetectionStrategy } from '../types'
import { ManualDetection } from './ManualDetection'

const registry = new Map<string, DetectionStrategy>()

function register(strategy: DetectionStrategy) {
  registry.set(strategy.id, strategy)
}

register(new ManualDetection())

export function getDetectionStrategy(id: string): DetectionStrategy {
  const strategy = registry.get(id)
  if (!strategy) throw new Error(`Unknown detection strategy: ${id}`)
  return strategy
}

export function listDetectionStrategies(): DetectionStrategy[] {
  return Array.from(registry.values())
}
