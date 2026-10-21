import { QuestionnaireDto } from '../questionnaire/dto'
import { UserDto } from '../user/dto'
import { QuestionnaireScoringResult } from '../questionnaire/scoring'

export interface QuestionnaireSubmissionQueryFilterDto {
  UserId: string
  QuestionnaireId: string
}

export interface QuestionnaireSubmissionDto {
  id: string
  UserId: string
  QuestionnaireId: string
  SubmittedBy: string
  isAssisted: boolean
  score: number | null
  resultKey: string | null
  resultLabel: string | null
  isRisk: boolean | null
  scoringResult: QuestionnaireScoringResult | null
  createdAt: Date
  updatedAt: Date
}

export interface QuestionnaireSubmissionDetailDto
  extends QuestionnaireSubmissionDto {
  questionnaire: QuestionnaireDto
  user: UserDto
}

export interface CreateQuestionnaireSubmissionDto {
  UserId: string
  QuestionnaireId: string
  SubmittedBy: string
  isAssisted: boolean
  answers: [
    {
      QuestionId: string
      answerValue: string
    }
  ]
}

export interface ISummarize {
  userCount: number
  submitCount: number
  stableMentalCount: number
  unStableMentalCount: number
  unStableMentalPercentage: number
}

export interface ISummarizePerGrade extends ISummarize {
  gradeId: string
  gradeName: string
  classCount: number
  // Aliases for backward compatibility
  rwId?: string
  rwName?: string
  rtCount?: number
}
export type ISummarizePerRw = ISummarizePerGrade

export interface ISummarizeByGradeId extends ISummarize {
  classId: string
  className: string
  // Aliases for backward compatibility
  rtId?: string
  rtName?: string
}
export type ISummarizeByRwId = ISummarizeByGradeId

export interface IGetSummaryOptions {
  QuestionnaireId: string
  startDate?: Date
  endDate?: Date
}

export interface IGetSummaryOptionsByGrade extends IGetSummaryOptions {
  GradeId: string
}

export interface IGetSummaryOptionsByClass extends IGetSummaryOptionsByGrade {
  ClassId: string
}

export interface IGetSummaryOptionsByStudent extends IGetSummaryOptionsByClass {
  UserId: string
}

export interface ISummarizeStudentByClass {
  UserId: string
  fullname: string
  nisn?: string | null
  lastSubmissionDate: Date | null
  isMentalUnStable: boolean | null
  score?: number | null
  resultKey?: string | null
  resultLabel?: string | null
}
export type ISummarizeUserByRt = ISummarizeStudentByClass

export interface ISummarizeSubmissionByUser {
  submissionId: string
  submissionDate: Date
  score: number
  resultKey: string
  resultLabel: string
  isMentalUnStable: boolean
  scoringResult?: QuestionnaireScoringResult | null
}

export interface ISummarizeByQuestionnaireIdDetailed {
  summarize: ISummarize
  perGrade: ISummarizePerGrade[]
  perRw: ISummarizePerGrade[]
}

export interface ISummarizeByGradeIdDetailed {
  summarize: ISummarize
  perClass: ISummarizeByGradeId[]
  perRt: ISummarizeByGradeId[]
}
export type ISummarizeByRwIdDetailed = ISummarizeByGradeIdDetailed

export interface ISummarizeByClassIdDetailed {
  summarize: ISummarize
  students: ISummarizeStudentByClass[]
  users: ISummarizeStudentByClass[]
}
export type ISummarizeByRtIdDetailed = ISummarizeByClassIdDetailed

export interface ISummarizeByStudentIdDetailed {
  UserId: string
  fullname: string
  nisn?: string | null
  gradeName?: string | null
  className?: string | null
  summarize: Omit<ISummarize, 'userCount'>
  submissions: ISummarizeSubmissionByUser[]
}
export type ISummarizeByUserIdDetailed = ISummarizeByStudentIdDetailed

export interface ISummarizeSubmission extends QuestionnaireSubmissionDetailDto {
  trueCount: number
  falseCount: number
  answeredCount: number
  isMentalUnstable: boolean
  score: number
  resultKey: string
  resultLabel: string
  scoringResult: QuestionnaireScoringResult | null
}
