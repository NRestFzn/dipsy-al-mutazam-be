import * as yup from 'yup'

export const createRukunTetanggaSchema = yup.object().shape({
  count: yup
    .number()
    .positive('validation.positive')
    .moreThan(0, 'validation.positive')
    .required('validation.required'),
  RukunWargaId: yup.string().required('validation.required'),
})

export const updateRukunTetanggaSchema = yup.object().shape({
  name: yup
    .number()
    .positive('validation.positive')
    .moreThan(0, 'validation.positive')
    .required('validation.required'),
})

export const rukunTetanggaQuerySchema = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export type RukunTetanggaQuery = yup.InferType<typeof rukunTetanggaQuerySchema>
