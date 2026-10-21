import * as yup from 'yup'

export const createClassSchema = yup.object().shape({
  name: yup.string().required('validation.required'),
  GradeId: yup.string().required('validation.required'),
  homeroomTeacherId: yup.string().optional().nullable(),
  waliKelasId: yup.string().optional().nullable(),
})

export const updateClassSchema = yup.object().shape({
  name: yup.string().optional().nullable(),
  GradeId: yup.string().optional().nullable(),
  homeroomTeacherId: yup.string().optional().nullable(),
  waliKelasId: yup.string().optional().nullable(),
})

export const classQuerySchema = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export type ClassQuery = yup.InferType<typeof classQuerySchema>
export type CreateClass = yup.InferType<typeof createClassSchema>
export type UpdateClass = yup.InferType<typeof updateClassSchema>

// Backwards compatibility aliases
export const createRukunTetanggaSchema = createClassSchema
export const updateRukunTetanggaSchema = updateClassSchema
export const rukunTetanggaQuerySchema = classQuerySchema
export type RukunTetanggaQuery = ClassQuery
