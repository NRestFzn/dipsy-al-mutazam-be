import { db } from '@/database/databaseConnection'
import Family from '@/database/model/family'
import User from '@/database/model/user'
import UserDetail from '@/database/model/userDetail'
import UserHasRoles from '@/database/model/userHasRoles'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { RoleId } from '@/libs/constant/roleIds'
import { CreateFamilyDto, UpdateFamilyHeadDto } from '../dto'
import { RegisterDto } from '@/features/auth/dto'
import { AuthRepository } from '@/features/auth/repository/authRepository'

const authRepo = new AuthRepository()

export class FamilyRepository {
  async getAllFamilies(): Promise<Family[]> {
    return await Family.findAll({
      include: [
        {
          model: User,
          as: 'headOfFamily',
          attributes: ['id', 'fullname', 'email'],
        },
        {
          model: UserDetail,
          as: 'members',
          include: [{ model: User, attributes: ['fullname'] }],
        },
      ],
    })
  }

  async getFamilyDetail(id: string): Promise<Family> {
    const family = await Family.findByPk(id, {
      include: [
        {
          model: User,
          as: 'headOfFamily',
          attributes: ['id', 'fullname', 'email'],
        },
        {
          model: UserDetail,
          as: 'members',
          include: [{ model: User, attributes: ['id', 'fullname', 'email'] }],
        },
      ],
    })

    if (!family) throw new ErrorResponse.NotFound('Keluarga tidak ditemukan')
    return family
  }

  async createFamily(data: CreateFamilyDto): Promise<Family> {
    let familyId: string = ''

    await db.sequelize!.transaction(async (transaction) => {
      const family = await Family.create({ ...data }, { transaction })
      familyId = family.id

      await UserDetail.update(
        { FamilyId: family.id },
        { where: { UserId: data.headOfFamilyId }, transaction }
      )

      const roleExists = await UserHasRoles.findOne({
        where: { UserId: data.headOfFamilyId, RoleId: RoleId.kepalaKeluarga },
        transaction,
      })
      if (!roleExists) {
        await UserHasRoles.create(
          { UserId: data.headOfFamilyId, RoleId: RoleId.kepalaKeluarga },
          { transaction }
        )
      }
    })

    return this.getFamilyDetail(familyId)
  }

  async updateFamilyHead(
    id: string,
    data: UpdateFamilyHeadDto
  ): Promise<Family> {
    const family = await Family.findByPk(id)
    if (!family) throw new ErrorResponse.NotFound('Keluarga tidak ditemukan')

    const oldHeadId = family.headOfFamilyId
    const newHeadId = data.headOfFamilyId

    if (oldHeadId === newHeadId) return family

    const newHeadDetail = await UserDetail.findOne({
      where: { UserId: newHeadId },
    })
    if (!newHeadDetail || newHeadDetail.FamilyId !== id) {
      throw new ErrorResponse.BadRequest(
        'Kepala keluarga baru harus berasal dari keluarga yang sama'
      )
    }

    await db.sequelize!.transaction(async (transaction) => {
      await family.update({ headOfFamilyId: newHeadId }, { transaction })

      if (oldHeadId) {
        await UserHasRoles.destroy({
          where: { UserId: oldHeadId, RoleId: RoleId.kepalaKeluarga },
          transaction,
        })
      }

      const roleExists = await UserHasRoles.findOne({
        where: { UserId: newHeadId, RoleId: RoleId.kepalaKeluarga },
        transaction,
      })
      if (!roleExists) {
        await UserHasRoles.create(
          { UserId: newHeadId, RoleId: RoleId.kepalaKeluarga },
          { transaction }
        )
      }
    })

    return this.getFamilyDetail(id)
  }

  async addMemberByNik(familyId: string, nik: string): Promise<UserDetail> {
    const userDetail = await UserDetail.findOne({
      where: { nik },
    })

    if (!userDetail)
      throw new ErrorResponse.NotFound(
        'Penduduk dengan NIK tersebut tidak ditemukan'
      )

    await userDetail.update({ FamilyId: familyId })
    return userDetail
  }

  async registerAndAddMember(
    familyId: string,
    formData: RegisterDto
  ): Promise<any> {
    let newUserId: string = ''

    await db.sequelize!.transaction(async (transaction) => {
      const duplicateNik = await UserDetail.findOne({
        where: { nik: formData.nik },
        transaction,
      })
      if (duplicateNik)
        throw new ErrorResponse.BaseResponse('auth.nikUsed', 'Conflict', 409)

      if (!formData.email) {
        formData.email = authRepo.createEmailFromFullnameAndNik(
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
      newUserId = user.id

      await UserHasRoles.create(
        { UserId: user.id, RoleId: RoleId.user },
        { transaction }
      )

      await UserDetail.create(
        {
          ...formData,
          nik: formData.nik,
          UserId: user.id,
          FamilyId: familyId,
        },
        { transaction }
      )
    })

    return await User.findByPk(newUserId, { include: [{ model: UserDetail }] })
  }

  async removeMember(familyId: string, userId: string): Promise<void> {
    const family = await Family.findByPk(familyId)
    if (!family) throw new ErrorResponse.NotFound('Keluarga tidak ditemukan')

    if (family.headOfFamilyId === userId) {
      throw new ErrorResponse.BadRequest(
        'Tidak dapat menghapus kepala keluarga, ganti kepala keluarga terlebih dahulu'
      )
    }

    const userDetail = await UserDetail.findOne({
      where: { UserId: userId, FamilyId: familyId },
    })
    if (!userDetail)
      throw new ErrorResponse.NotFound('Anggota keluarga tidak ditemukan')

    await userDetail.update({ FamilyId: null })
  }
}
