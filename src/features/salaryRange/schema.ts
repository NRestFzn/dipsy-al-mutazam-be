import * as yup from 'yup'

export const salaryRangeSchema = yup.object().shape({
  minRange: yup.number().required('validation.required'),
  maxRange: yup.number().required('validation.required'),
})

export const salaryRangeQuerySchema = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export type SalaryRangeQuery = yup.InferType<typeof salaryRangeQuerySchema>
