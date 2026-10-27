export interface OdgjResidentDto {
  id: string
  UserId: string
  notes?: string | null
  resident?: any
  schedules?: OdgjExaminationScheduleDto[]
  createdAt: Date
  updatedAt: Date
}

export type OdgjExaminationStatus = 'scheduled' | 'completed' | 'missed'
export type OdgjScheduleRecurrenceType = 'weekly' | 'monthly'

export interface OdgjExaminationScheduleDto {
  id: string
  OdgjResidentId: string
  examinationDate: Date
  status: OdgjExaminationStatus
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface OdgjScheduleRecurrenceDto {
  recurrenceType?: OdgjScheduleRecurrenceType | null
  recurrenceCount?: number
}

export interface OdgjScheduleCreationSummaryDto {
  recurrenceType: OdgjScheduleRecurrenceType | null
  recurrenceCount: number
  startDate: Date
  endDate: Date
}

export interface OdgjResidentCreationResultDto {
  data: OdgjResidentDto
  schedule?: OdgjScheduleCreationSummaryDto
}

export interface CreateOdgjResidentDto extends OdgjScheduleRecurrenceDto {
  UserId: string
  examinationDate?: Date | null
  status?: OdgjExaminationStatus
  notes?: string | null
}

export interface UpdateOdgjResidentDto {
  notes?: string | null
}

export interface CreateOdgjScheduleDto extends OdgjScheduleRecurrenceDto {
  examinationDate: Date
  status?: OdgjExaminationStatus
  notes?: string | null
}

export interface UpdateOdgjScheduleDto {
  examinationDate: Date
  status: OdgjExaminationStatus
  notes?: string | null
}

export interface OdgjResidentQueryFilterDto {
  fullname?: string
  startDate?: string
  endDate?: string
}
