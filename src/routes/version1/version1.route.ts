import express, { Router } from 'express'
import { RoleController } from './controller/role.controller'
import { AuthController } from './controller/auth.controller'
import { GradeController } from './controller/grade.controller'
import { ClassController } from './controller/class.controller'
import { QuestionnaireController } from './controller/questionnaire.controller'
import { QuestionnaireQuestionController } from './controller/questionnaireQuestion.controller'
import { QuestionnaireSubmissionController } from './controller/questionnaireSubmission.controller'
import { StudentController } from './controller/student.controller'
import { UserController } from './controller/user.controller'
import { QuestionnaireCategoryController } from './controller/questionnaireCategory.controller'
import { CounselorAssignmentController } from './controller/counselorAssignment.controller'

const Route: Router = express.Router()

Route.use('/role', RoleController)
Route.use('/auth', AuthController)
Route.use('/grade', GradeController)
Route.use('/class', ClassController)
Route.use('/questionnaire', QuestionnaireController)
Route.use('/questionnaire-question', QuestionnaireQuestionController)
Route.use('/questionnaire-submission', QuestionnaireSubmissionController)
Route.use('/student', StudentController)
Route.use('/user', UserController)
Route.use('/questionnaire-category', QuestionnaireCategoryController)
Route.use('/counselor-assignment', CounselorAssignmentController)

export { Route as v1Route }
