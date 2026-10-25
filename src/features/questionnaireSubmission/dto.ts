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
  answers: Array<{
    QuestionId: string
    answerValue: string
  }>
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
  gradeLevel?: string | null
  classCount: number
}

export interface ISummarizeByGradeId extends ISummarize {
  classId: string
  className: string
}

export interface IGetSummaryOptions {
  QuestionnaireId: string
  startDate?: Date
  endDate?: Date
}

export interface IGetSummaryOptionsByGrade extends IGetSummaryOptions {
  GradeId: string
}

export interface IGetSummaryOptionsByClass extends IGetSummaryOptions {
  GradeId?: string
  ClassId: string
}

export interface IGetSummaryOptionsByStudent extends IGetSummaryOptions {
  UserId: string
}

export interface ISummarizeStudentByClass {
  UserId: string
  fullname: string
  lastSubmissionDate: Date | null
  isMentalUnStable: boolean | null
}

export interface ISummarizeSubmissionByStudent {
  submissionId: string
  submissionDate: Date
  score: number
  resultKey: string
  resultLabel: string
  isMentalUnStable: boolean
}

export interface ISummarizeByQuestionnaireIdDetailed {
  summarize: ISummarize
  perGrade: (ISummarize & ISummarizePerGrade)[]
}

export interface ISummarizeByGradeIdDetailed {
  summarize: ISummarize
  perClass: (ISummarize & ISummarizeByGradeId)[]
}

export interface ISummarizeByClassIdDetailed {
  summarize: ISummarize
  students: ISummarizeStudentByClass[]
}

export interface ISummarizeByStudentIdDetailed {
  UserId: string
  fullname: string
  summarize: Omit<ISummarize, 'userCount'>
  submissions: ISummarizeSubmissionByStudent[]
}

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
