import * as yup from 'yup'

export const createQuestionnaireSubmissionSchema = yup.object().shape({
  QuestionnaireId: yup.string().required('validation.required'),
  UserId: yup.string().required('validation.required'),
  SubmittedBy: yup.string().required('validation.required'),
  isAssisted: yup.boolean().required('validation.required'),
  answers: yup
    .array(
      yup.object().shape({
        QuestionId: yup.string().required('validation.required'),
        answerValue: yup.string().required('validation.required'),
      })
    )
    .required('validation.required'),
})

export const submissionParams = yup.object().shape({
  id: yup.string().required('validation.required'),
})

export const summarizeByQuestionnaireIdParams = yup.object().shape({
  QuestionnaireId: yup.string().required('validation.required'),
})

export const summarizeByQuestionnaireIdQuery = yup.object().shape({
  startDate: yup.date().optional(),
  endDate: yup.date().optional(),
})

export const summarizeByGradeIdQuery = summarizeByQuestionnaireIdQuery.shape({
  GradeId: yup.string().optional(),
})

export const summarizeByClassIdQuery = summarizeByGradeIdQuery.shape({
  ClassId: yup.string().optional(),
})

export const summarizeByStudentIdQuery = summarizeByClassIdQuery.shape({
  UserId: yup.string().optional(),
  StudentId: yup.string().optional(),
})

export type SubmissionParams = yup.InferType<typeof submissionParams>
export type SummarizeByQuestionnaireIdQuery = yup.InferType<
  typeof summarizeByQuestionnaireIdQuery
>
export type SummarizeByQuestionnaireIdParams = yup.InferType<
  typeof summarizeByQuestionnaireIdParams
>
export type SummarizeByGradeIdQuery = yup.InferType<
  typeof summarizeByGradeIdQuery
>
export type SummarizeByRwIdQuery = SummarizeByGradeIdQuery

export type SummarizeByClassIdQuery = yup.InferType<
  typeof summarizeByClassIdQuery
>
export type SummarizeByRtIdQuery = SummarizeByClassIdQuery

export type SummarizeByStudentIdQuery = yup.InferType<
  typeof summarizeByStudentIdQuery
>
export type SummarizeByUserIdQuery = SummarizeByStudentIdQuery
