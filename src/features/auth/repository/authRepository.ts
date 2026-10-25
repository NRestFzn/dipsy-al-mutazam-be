import { db } from '@/database/databaseConnection'
import User from '@/database/model/user'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import JwtToken from '@/libs/jwtToken'
import { env } from '@/config/env.config'
import { AuthResponseDto, LoginDto, LoginWithNikDto, RegisterDto } from '../dto'
import { RoleId } from '@/libs/constant/roleIds'
import UserDetail from '@/database/model/userDetail'
import Role from '@/database/model/role'
import UserHasRoles from '@/database/model/userHasRoles'

const jwt = new JwtToken({ secret: env.JWT_SECRET, expires: env.JWT_EXPIRES })

export class AuthRepository {
  public createEmailFromFullnameAndNik(fullname: string, nik: string): string {
    const nameForEmail = fullname.toLowerCase().split(' ').slice(0, 2).join('')
    const lastDigitNik = nik.slice(-4)
    return `${nameForEmail}.${lastDigitNik}@cibiru.wetan`
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

  async loginWithNik(formData: LoginWithNikDto): Promise<AuthResponseDto> {
    const getUser = await UserDetail.findOne({
      where: { nik: formData.nik },
      include: [{ model: User.scope('withPassword') }],
    })

    if (!getUser) throw new ErrorResponse.NotFound('auth.loginNikFailed')

    const isPasswordMatch = await getUser.user.comparePassword(
      formData.password
    )

    if (!isPasswordMatch)
      throw new ErrorResponse.BadRequest('auth.loginNikFailed')

    const data = await this.login({
      email: getUser.user.email,
      password: formData.password,
    })

    return data
  }

  async register(formData: RegisterDto): Promise<AuthResponseDto> {
    await db.sequelize!.transaction(async (transaction) => {
      const duplicateNik = await UserDetail.findOne({
        where: { nik: formData.nik },
        transaction,
      })

      if (duplicateNik)
        throw new ErrorResponse.BaseResponse('auth.nikUsed', 'Conflict', 409)

      if (!formData.email) {
        formData.email = this.createEmailFromFullnameAndNik(
          formData.fullname,
          formData.nik
        )
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
          nik: formData.nik,
          UserId: user.id,
        },
        { transaction }
      )
    })

    const data = await this.loginWithNik({
      nik: formData.nik,
      password: formData.password,
    })

    return data
  }
}
