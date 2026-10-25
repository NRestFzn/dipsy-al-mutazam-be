import * as yup from 'yup'

export const createResidentSchema = yup.object().shape({
  fullname: yup.string().required('validation.required'),
  nik: yup
    .string()
    .required('validation.required')
    .min(16, 'validation.min')
    .max(16, 'validation.max'),
  email: yup.string().email('validation.email').optional().nullable(),
  phoneNumber: yup.string().required('validation.required'),
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
  isKader: yup.boolean().required('validation.required'),
  RukunWargaId: yup.string().required('validation.required'),
  RukunTetanggaId: yup.string().required('validation.required'),
  MarriageStatusId: yup.string().required('validation.required'),
  EducationId: yup.string().required('validation.required'),
  SalaryRangeId: yup.string().required('validation.required'),
})

export const updateResidentSchema = yup.object().shape({
  fullname: yup.string().required('validation.required'),
  nik: yup
    .string()
    .required('validation.required')
    .min(16, 'validation.min')
    .max(16, 'validation.max'),
  email: yup.string().email('validation.email').required('validation.required'),
  phoneNumber: yup.string().required('validation.required'),

  password: yup
    .string()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .nullable()
    .min(8, 'validation.min'),

  confirmPassword: yup
    .string()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .nullable()
    .when('password', {
      is: (val: string | null | undefined) =>
        val !== null && val !== undefined && val !== '',
      then: (schema) =>
        schema
          .required('validation.required')
          .oneOf([yup.ref('password')], 'validation.same'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  gender: yup
    .string()
    .oneOf(['m', 'f'], 'validation.oneOf')
    .required('validation.required'),
  birthDate: yup.date().required('validation.required'),
  profession: yup.string().required('validation.required'),
  isKader: yup.boolean().required('validation.required'),
  RukunWargaId: yup.string().required('validation.required'),
  RukunTetanggaId: yup.string().required('validation.required'),
  MarriageStatusId: yup.string().required('validation.required'),
  EducationId: yup.string().required('validation.required'),
  SalaryRangeId: yup.string().required('validation.required'),
})

export const updateProfileSchema = yup.object().shape({
  phoneNumber: yup.string().required('validation.required'),

  password: yup
    .string()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .nullable()
    .min(8, 'validation.min'),

  confirmNewPassword: yup
    .string()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .nullable()
    .when('password', {
      is: (val: string | null | undefined) =>
        val !== null && val !== undefined && val !== '',
      then: (schema) =>
        schema
          .required('validation.required')
          .oneOf([yup.ref('password')], 'validation.same'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  profession: yup.string().required('validation.required'),
  EducationId: yup.string().required('validation.required'),
  SalaryRangeId: yup.string().required('validation.required'),
})
export const residentQuerySchema = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export const residentNikQuerySchema = yup.object().shape({
  nik: yup
    .string()
    .required('validation.required')
    .min(16, 'validation.min')
    .max(16, 'validation.max')
    .matches(/^\d+$/, 'validation.number'),
})

export type ResidentQuery = yup.InferType<typeof residentQuerySchema>

export type ResidentNikQuery = yup.InferType<typeof residentNikQuerySchema>

export type CreateResident = yup.InferType<typeof createResidentSchema>

export type UpdateResident = yup.InferType<typeof updateResidentSchema>
