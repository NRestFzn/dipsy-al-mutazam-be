import * as yup from 'yup'

const isRecurring = (value: unknown) =>
  value === 'weekly' || value === 'monthly'

const recurrenceFields = {
  recurrenceType: yup
    .string()
    .oneOf(['weekly', 'monthly'], 'validation.oneOf')
    .nullable()
    .optional(),
  recurrenceCount: yup.number().typeError('validation.number').when('recurrenceType', {
    is: isRecurring,
    then: (schema) =>
      schema
        .required('validation.required')
        .integer('validation.integer')
        .min(2, 'odgjResident.recurrenceCountMin')
        .max(120, 'odgjResident.recurrenceCountMax'),
    otherwise: (schema) => schema.strip(),
  }),
}

export const createOdgjResidentSchema = yup.object().shape({
  UserId: yup.string().required('validation.required'),
  recurrenceType: recurrenceFields.recurrenceType,
  recurrenceCount: recurrenceFields.recurrenceCount,
  examinationDate: yup
    .date()
    .nullable()
    .optional()
    .when('recurrenceType', {
      is: isRecurring,
      then: (schema) => schema.required('validation.required'),
    }),
  status: yup
    .string()
    .oneOf(['scheduled', 'completed', 'missed'], 'validation.oneOf')
    .optional(),
  notes: yup.string().nullable().optional(),
})

export const updateOdgjResidentSchema = yup.object().shape({
  notes: yup.string().nullable().optional(),
})

export const createOdgjScheduleSchema = yup.object().shape({
  recurrenceType: recurrenceFields.recurrenceType,
  recurrenceCount: recurrenceFields.recurrenceCount,
  examinationDate: yup.date().required('validation.required'),
  status: yup
    .string()
    .oneOf(['scheduled', 'completed', 'missed'], 'validation.oneOf')
    .optional(),
  notes: yup.string().nullable().optional(),
})

export const updateOdgjScheduleSchema = yup.object().shape({
  examinationDate: yup.date().required('validation.required'),
  status: yup
    .string()
    .oneOf(['scheduled', 'completed', 'missed'], 'validation.oneOf')
    .required('validation.required'),
  notes: yup.string().nullable().optional(),
})

export const odgjResidentParamSchema = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export const odgjScheduleParamSchema = yup.object().shape({
  id: yup.string().required('validation.required'),
  scheduleId: yup.string().required('validation.required'),
})

export type CreateOdgjResident = yup.InferType<
  typeof createOdgjResidentSchema
>
export type UpdateOdgjResident = yup.InferType<
  typeof updateOdgjResidentSchema
>
export type CreateOdgjSchedule = yup.InferType<typeof createOdgjScheduleSchema>
export type UpdateOdgjSchedule = yup.InferType<typeof updateOdgjScheduleSchema>
export type OdgjResidentParam = yup.InferType<typeof odgjResidentParamSchema>
export type OdgjScheduleParam = yup.InferType<typeof odgjScheduleParamSchema>
