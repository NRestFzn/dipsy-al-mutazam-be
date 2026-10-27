import * as yup from 'yup'

export const createRukunWargaSchema = yup.object().shape({
  count: yup
    .number()
    .positive('validation.positive')
    .moreThan(0, 'validation.positive')
    .required('validation.required'),
})

export const updateRukunWargaSchema = yup.object().shape({
  name: yup
    .number()
    .positive('validation.positive')
    .moreThan(0, 'validation.positive')
    .required('validation.required'),
})

export const rukunWargaQuerySchema = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export type RukunWargaQuery = yup.InferType<typeof rukunWargaQuerySchema>
