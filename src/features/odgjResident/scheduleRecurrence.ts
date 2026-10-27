import { addMonths, addWeeks } from 'date-fns'
import {
  OdgjScheduleCreationSummaryDto,
  OdgjScheduleRecurrenceType,
} from './dto'

export const buildOdgjScheduleDates = (
  examinationDate: Date,
  recurrenceType?: OdgjScheduleRecurrenceType | null,
  recurrenceCount?: number
): Date[] => {
  const count = recurrenceType ? recurrenceCount || 1 : 1

  return Array.from({ length: count }, (_, index) => {
    if (!recurrenceType || index === 0) return examinationDate

    return recurrenceType === 'weekly'
      ? addWeeks(examinationDate, index)
      : addMonths(examinationDate, index)
  })
}

export const buildOdgjScheduleCreationSummary = (
  dates: Date[],
  recurrenceType?: OdgjScheduleRecurrenceType | null
): OdgjScheduleCreationSummaryDto => ({
  recurrenceType: recurrenceType || null,
  recurrenceCount: dates.length,
  startDate: dates[0],
  endDate: dates[dates.length - 1],
})
