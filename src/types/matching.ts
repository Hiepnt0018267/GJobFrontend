export type MatchEvidenceSource = 'CV_SKILL' | 'PROJECT_TECHNOLOGY'

export type MatchExplanationCode = 'SKILL_COVERAGE' | 'SKILL_NOT_FOUND_IN_CV'

export type MatchComponentErrorCode =
  | 'INSUFFICIENT_MATCHING_SIGNALS'
  | 'EMBEDDING_PROVIDER_UNAVAILABLE'
  | 'EMBEDDING_INPUT_TOO_LONG'
  | 'EMBEDDING_FAILED'

export type MatchedSkillEvidence = {
  skill: string
  normalized_name: string
  sources: MatchEvidenceSource[]
}

export type SkillMatchComponent = {
  available: boolean
  score: number
  configured_weight: number
  effective_weight: number
  job_skills: string[]
  matched_skills: string[]
  missing_skills: string[]
  evidence: MatchedSkillEvidence[]
}

export type MatchExplanation = {
  code: MatchExplanationCode
  message: string
  evidence: string[]
}

export type BaselineMatchResult = {
  algorithm_version: string
  cv_id: string
  job_id: string
  overall_score: number
  components: { skills: SkillMatchComponent }
  strengths: MatchExplanation[]
  gaps: MatchExplanation[]
}

export type SemanticMatchingResult = {
  cv_id: string
  job_id: string
  semantic_similarity: number
  provider: string
  model: string
  dimensions: number
  engine_version: string
}

export type BaselineMatchComponent =
  | { status: 'AVAILABLE'; result: BaselineMatchResult | null; error_code: MatchComponentErrorCode | null }
  | { status: 'INSUFFICIENT_SIGNALS'; result: null; error_code: 'INSUFFICIENT_MATCHING_SIGNALS' | null }

export type SemanticMatchComponent =
  | { status: 'AVAILABLE'; result: SemanticMatchingResult | null; error_code: MatchComponentErrorCode | null }
  | { status: 'UNAVAILABLE'; result: null; error_code: Exclude<MatchComponentErrorCode, 'INSUFFICIENT_MATCHING_SIGNALS'> | null }

export type CVJobMatchResponse = {
  cv_id: string
  job_id: string
  baseline: BaselineMatchComponent
  semantic: SemanticMatchComponent
  baseline_engine_version: string
  semantic_engine_version: string
  computed_at: string
  cached: boolean
}
