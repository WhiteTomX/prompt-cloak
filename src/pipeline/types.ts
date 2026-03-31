import type { PiiCategory, MappingSet } from '../types'

export interface DetectedEntity {
  value: string
  startIndex: number
  endIndex: number
  category: PiiCategory
}

export interface DetectionStrategy {
  id: string
  label: string
  detect(text: string): DetectedEntity[]
}

export interface GenerationStrategy {
  id: string
  label: string
  generate(entity: DetectedEntity): string
}

export interface ReplacementPair {
  source: string
  target: string
  caseSensitive?: boolean
}

export interface ReplacementStrategy {
  id: string
  replace(text: string, pairs: ReplacementPair[]): string
}

export interface PipelineResult {
  result: string
  newEntities: DetectedEntity[]
}

export interface IPipeline {
  pseudonymize(text: string, mappings: MappingSet): PipelineResult
  depseudonymize(text: string, mappings: MappingSet): string
}
