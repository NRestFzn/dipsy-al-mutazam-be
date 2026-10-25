import * as yup from 'yup'

export const educationSchema = yup.object().shape({
  name: yup.string().required('validation.required'),
})

export const educationQuerySchema = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export type EducationQuery = yup.InferType<typeof educationQuerySchema>
