import * as yup from 'yup'

export const marriageStatusSchema = yup.object().shape({
  name: yup.string().required('validation.required'),
})

export const marriageStatusQuerySchema = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export type MarriageStatusQuery = yup.InferType<typeof marriageStatusQuerySchema>
