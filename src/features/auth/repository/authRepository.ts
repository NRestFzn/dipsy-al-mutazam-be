import { db } from '@/database/databaseConnection'
import User from '@/database/model/user'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import JwtToken from '@/libs/jwtToken'
import { env } from '@/config/env.config'
import {
  AuthResponseDto,
  LoginDto,
  LoginWithNikDto,
  LoginWithNisnDto,
  RegisterDto,
} from '../dto'
import { RoleId } from '@/libs/constant/roleIds'
import UserDetail from '@/database/model/userDetail'
import Role from '@/database/model/role'
import UserHasRoles from '@/database/model/userHasRoles'

const jwt = new JwtToken({ secret: env.JWT_SECRET, expires: env.JWT_EXPIRES })

export class AuthRepository {
  public createEmailFromNisn(nisn: string): string {
    return `${nisn}@al-multazam.sch.id`
  }

  public createEmailFromFullnameAndNik(fullname: string, nik: string): string {
    return `${nik}@al-multazam.sch.id`
  }

  async login(formData: LoginDto): Promise<AuthResponseDto> {
    let data: any

    await db.sequelize!.transaction(async (transaction) => {
      const getUser = await User.findOne({
        attributes: ['id', 'fullname', 'email', 'password'],
        where: { email: formData.email },
        include: [{ model: Role }],
        transaction,
      })

      if (!getUser) {
        throw new ErrorResponse.NotFound('auth.loginFailed')
      }

      const isPasswordMatch = await getUser.comparePassword(formData.password)

      if (!isPasswordMatch) {
        throw new ErrorResponse.BadRequest('auth.loginFailed')
      }

      const RoleIds = getUser.roles.map((role) => role.id)

      const payload = JSON.parse(
        JSON.stringify({
          uid: getUser.id,
          RoleIds,
        })
      )

      const { token, expiresIn } = jwt.generate(payload)

      data = {
        fullname: getUser.fullname,
        email: getUser.email,
        RoleIds,
        uid: getUser.id,
        accessToken: token,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        expiresIn: expiresIn,
      }
    })

    return data
  }

  async loginWithNisn(formData: LoginWithNisnDto): Promise<AuthResponseDto> {
    const nisn = formData.nisn || (formData as any).nik
    const getUser = await UserDetail.findOne({
      where: { nisn },
      include: [{ model: User.scope('withPassword') }],
    })

    if (!getUser) throw new ErrorResponse.NotFound('auth.loginNisnFailed')

    const isPasswordMatch = await getUser.user.comparePassword(
      formData.password
    )

    if (!isPasswordMatch)
      throw new ErrorResponse.BadRequest('auth.loginNisnFailed')

    const data = await this.login({
      email: getUser.user.email,
      password: formData.password,
    })

    return data
  }

  async loginWithNik(formData: LoginWithNikDto): Promise<AuthResponseDto> {
    return this.loginWithNisn(formData)
  }

  async register(formData: RegisterDto): Promise<AuthResponseDto> {
    const nisn = formData.nisn || (formData as any).nik
    const GradeId = formData.GradeId || formData.TingkatId
    const ClassId = formData.ClassId || formData.KelasId

    await db.sequelize!.transaction(async (transaction) => {
      const duplicateNisn = await UserDetail.findOne({
        where: { nisn },
        transaction,
      })

      if (duplicateNisn)
        throw new ErrorResponse.BaseResponse('auth.nisnUsed', 'Conflict', 409)

      if (!formData.email) {
        formData.email = this.createEmailFromNisn(nisn)
      }

      const duplicateEmail = await User.findOne({
        where: { email: formData.email },
        transaction,
      })

      if (duplicateEmail)
        throw new ErrorResponse.BaseResponse('auth.emailUsed', 'Conflict', 409)

      if (formData.phoneNumber) {
        const duplicatePhoneNumber = await UserDetail.findOne({
          where: { phoneNumber: formData.phoneNumber },
          transaction,
        })

        if (duplicatePhoneNumber)
          throw new ErrorResponse.BaseResponse(
            'auth.phoneUsed',
            'Conflict',
            409
          )
      }

      const user = await User.create({ ...formData }, { transaction })

      await UserHasRoles.create(
        {
          UserId: user.id,
          RoleId: RoleId.user,
        },
        { transaction }
      )

      await UserDetail.create(
        {
          ...formData,
          nisn,
          GradeId,
          ClassId,
          UserId: user.id,
        },
        { transaction }
      )
    })

    const data = await this.loginWithNisn({
      nisn,
      password: formData.password,
    })

    return data
  }
}
