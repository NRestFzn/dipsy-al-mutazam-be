import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup.string().email('validation.email').required('validation.required'),
  password: yup
    .string()
    .min(8, 'validation.min')
    .required('validation.required'),
})

export const loginWithNisnSchema = yup.object({
  nisn: yup
    .string()
    .required('validation.required')
    .min(10, 'validation.min')
    .max(10, 'validation.max')
    .matches(/^\d{10}$/, 'validation.number'),
  password: yup
    .string()
    .min(8, 'validation.min')
    .required('validation.required'),
})


export const registerSchema = yup.object({
  fullname: yup.string().required('validation.required'),
  nisn: yup
    .string()
    .required('validation.required')
    .min(10, 'validation.min')
    .max(10, 'validation.max')
    .matches(/^\d{10}$/, 'validation.number'),
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
  GradeId: yup.string().required('validation.required'),
  ClassId: yup.string().required('validation.required'),
  nis: yup.string().optional().nullable(),
  entryYear: yup.string().optional().nullable(),
  academicYear: yup.string().optional().nullable(),
})
