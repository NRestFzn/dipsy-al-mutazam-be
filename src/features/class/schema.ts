import * as yup from 'yup'

const academicYearSchema = yup
  .string()
  .transform((val) => (val === '' ? undefined : val))
  .optional()
  .nullable()
  .matches(/^\d{4}\/\d{4}$/, 'validation.academicYear')

export const createClassSchema = yup.object().shape({
  name: yup.string().required('validation.required'),
  GradeId: yup.string().required('validation.required'),
  academicYear: academicYearSchema,
  homeroomTeacherId: yup
    .string()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
})

export const updateClassSchema = yup.object().shape({
  name: yup.string().optional().nullable(),
  GradeId: yup.string().optional().nullable(),
  academicYear: academicYearSchema,
  homeroomTeacherId: yup
    .string()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
})

export const classListQuerySchema = yup.object().shape({
  academicYear: academicYearSchema,
})

export const classQuerySchema = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export type ClassQuery = yup.InferType<typeof classQuerySchema>
export type CreateClass = yup.InferType<typeof createClassSchema>
export type UpdateClass = yup.InferType<typeof updateClassSchema>
