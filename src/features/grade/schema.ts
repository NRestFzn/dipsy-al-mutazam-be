import * as yup from 'yup'

export const gradeQuerySchema = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export type GradeQuery = yup.InferType<typeof gradeQuerySchema>
