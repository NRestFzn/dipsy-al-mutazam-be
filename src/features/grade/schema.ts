import * as yup from 'yup'

export const createGradeSchema = yup.object().shape({
  name: yup.string().required('validation.required'),
  level: yup
    .string()
    .oneOf(['SMP', 'SMA'], 'validation.oneOf')
    .optional()
    .nullable(),
})

export const updateGradeSchema = yup.object().shape({
  name: yup.string().optional().nullable(),
  level: yup
    .string()
    .oneOf(['SMP', 'SMA'], 'validation.oneOf')
    .optional()
    .nullable(),
})

export const gradeQuerySchema = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export type GradeQuery = yup.InferType<typeof gradeQuerySchema>
export type CreateGrade = yup.InferType<typeof createGradeSchema>
export type UpdateGrade = yup.InferType<typeof updateGradeSchema>
