import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup.string().email('validation.email').required('validation.required'),
  password: yup
    .string()
    .min(8, 'validation.min')
    .required('validation.required'),
})

export const loginWithNikSchema = yup.object({
  nik: yup.string().required('validation.required'),
  password: yup
    .string()
    .min(8, 'validation.min')
    .required('validation.required'),
})

export const registerSchema = yup.object({
  fullname: yup.string().required('validation.required'),
  nik: yup
    .string()
    .required('validation.required')
    .min(16, 'validation.min')
    .max(16, 'validation.max'),
  email: yup.string().email('validation.email').optional().nullable(),
  phoneNumber: yup.string().optional().nullable(),
  password: yup
    .string()
    .min(8, 'validation.min')
    .required('validation.required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), undefined], 'validation.same')
    .required('validation.required'),
  gender: yup
    .string()
    .oneOf(['m', 'f'], 'validation.oneOf')
    .required('validation.required'),
  birthDate: yup.date().required('validation.required'),
  profession: yup.string().required('validation.required'),

  RukunWargaId: yup.string().required('validation.required'),
  RukunTetanggaId: yup.string().required('validation.required'),
  MarriageStatusId: yup.string().required('validation.required'),
  EducationId: yup.string().required('validation.required'),
  SalaryRangeId: yup.string().required('validation.required'),
  isKader: yup.boolean().optional().nullable(),
})
