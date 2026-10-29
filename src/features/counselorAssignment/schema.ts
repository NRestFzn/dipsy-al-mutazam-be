import * as yup from 'yup'

export const counselorAssignmentQuerySchema = yup.object().shape({
  UserId: yup
    .string()
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  academicYear: yup
    .string()
    .transform((val) => (val === '' ? undefined : val))
    .optional()
    .matches(/^\d{4}\/\d{4}$/, 'validation.academicYear'),
})

export const counselorAssignmentMeQuerySchema = yup.object().shape({
  academicYear: yup
    .string()
    .transform((val) => (val === '' ? undefined : val))
    .optional()
    .matches(/^\d{4}\/\d{4}$/, 'validation.academicYear'),
})

export const replaceCounselorAssignmentSchema = yup.object().shape({
  UserId: yup.string().required('validation.required'),
  academicYear: yup
    .string()
    .required('validation.required')
    .matches(/^\d{4}\/\d{4}$/, 'validation.academicYear'),
  ClassIds: yup
    .array(yup.string().required('validation.required'))
    .required('validation.required'),
})

export type CounselorAssignmentQuery = yup.InferType<
  typeof counselorAssignmentQuerySchema
>
export type CounselorAssignmentMeQuery = yup.InferType<
  typeof counselorAssignmentMeQuerySchema
>
export type ReplaceCounselorAssignmentInput = yup.InferType<
  typeof replaceCounselorAssignmentSchema
>
