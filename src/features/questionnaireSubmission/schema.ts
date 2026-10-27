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

export const summarizeByRwIdQuery = summarizeByQuestionnaireIdQuery.shape({
  RukunWargaId: yup.string().required('validation.required'),
})

export const summarizeByRtIdQuery = summarizeByRwIdQuery.shape({
  RukunTetanggaId: yup.string().required('validation.required'),
})

export const summarizeByUserIdQuery = summarizeByRtIdQuery.shape({
  UserId: yup.string().required('validation.required'),
})
export type SubmissionParams = yup.InferType<typeof submissionParams>

export type SummarizeByQuestionnaireIdQuery = yup.InferType<
  typeof summarizeByQuestionnaireIdQuery
>

export type SummarizeByQuestionnaireIdParams = yup.InferType<
  typeof summarizeByQuestionnaireIdParams
>

export type SummarizeByRwIdQuery = yup.InferType<typeof summarizeByRwIdQuery>

export type SummarizeByRtIdQuery = yup.InferType<typeof summarizeByRtIdQuery>

export type SummarizeByUserIdQuery = yup.InferType<
  typeof summarizeByUserIdQuery
>
