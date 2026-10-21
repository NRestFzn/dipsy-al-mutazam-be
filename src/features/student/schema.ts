import * as yup from 'yup'

export const createStudentSchema = yup.object().shape({
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

export const updateStudentSchema = yup.object().shape({
  fullname: yup.string().required('validation.required'),
  nisn: yup
    .string()
    .required('validation.required')
    .min(10, 'validation.min')
    .max(10, 'validation.max')
    .matches(/^\d{10}$/, 'validation.number'),
  email: yup.string().email('validation.email').required('validation.required'),
  phoneNumber: yup.string().optional().nullable(),

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
  GradeId: yup.string().required('validation.required'),
  ClassId: yup.string().required('validation.required'),
  nis: yup.string().optional().nullable(),
  entryYear: yup.string().optional().nullable(),
  academicYear: yup.string().optional().nullable(),
})

export const updateProfileSchema = yup.object().shape({
  phoneNumber: yup.string().optional().nullable(),

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
})

export const studentQuerySchema = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export const studentNisnQuerySchema = yup.object().shape({
  nisn: yup
    .string()
    .required('validation.required')
    .min(10, 'validation.min')
    .max(10, 'validation.max')
    .matches(/^\d{10}$/, 'validation.number'),
})

export type StudentQuery = yup.InferType<typeof studentQuerySchema>
export type StudentNisnQuery = yup.InferType<typeof studentNisnQuerySchema>
export type CreateStudent = yup.InferType<typeof createStudentSchema>
export type UpdateStudent = yup.InferType<typeof updateStudentSchema>

// Backwards compatibility aliases
export const createResidentSchema = createStudentSchema
export const updateResidentSchema = updateStudentSchema
export const residentQuerySchema = studentQuerySchema
export const residentNikQuerySchema = studentNisnQuerySchema
export type ResidentQuery = StudentQuery
export type ResidentNikQuery = StudentNisnQuery
export type CreateResident = CreateStudent
export type UpdateResident = UpdateStudent
