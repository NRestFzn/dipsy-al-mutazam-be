import express, { Router } from 'express'
import { RoleController } from './controller/role.controller'
import { AuthController } from './controller/auth.controller'
import { MarriageStatusController } from './controller/marriageStatus.controller'
import { EducationController } from './controller/education.controller'
import { GradeController } from './controller/grade.controller'
import { ClassController } from './controller/class.controller'
import { SalaryRangeController } from './controller/salaryRange.controller'
import { QuestionnaireController } from './controller/questionnaire.controller'
import { QuestionnaireQuestionController } from './controller/questionnaireQuestion.controller'
import { QuestionnaireSubmissionController } from './controller/questionnaireSubmission.controller'
import { StudentController } from './controller/student.controller'
import { UserController } from './controller/user.controller'
import { QuestionnaireCategoryController } from './controller/questionnaireCategory.controller'
import { FamilyController } from './controller/family.controller'
import { OdgjResidentController } from './controller/odgjResident.controller'

const Route: Router = express.Router()

Route.use('/role', RoleController)
Route.use('/auth', AuthController)
Route.use('/marriage-status', MarriageStatusController)
Route.use('/education', EducationController)
Route.use('/grade', GradeController)
Route.use('/class', ClassController)
Route.use('/salary-range', SalaryRangeController)
Route.use('/questionnaire', QuestionnaireController)
Route.use('/questionnaire-question', QuestionnaireQuestionController)
Route.use('/questionnaire-submission', QuestionnaireSubmissionController)
Route.use('/student', StudentController)
Route.use('/user', UserController)
Route.use('/questionnaire-category', QuestionnaireCategoryController)
Route.use('/family', FamilyController)
Route.use('/odgj-resident', OdgjResidentController)

export { Route as v1Route }
