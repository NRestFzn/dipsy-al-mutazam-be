import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  Table,
} from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import RukunWarga from './rukunWarga'
import RukunTetangga from './rukunTetangga'
import MarriageStatus from './marriageStatus'
import Education from './education'
import SalaryRange from './salaryRange'
import User from './user'
import Family from './family'

@Table({ freezeTableName: true, tableName: 'user_details' })
export default class UserDetail extends BaseSchema {
  @Column({ type: DataType.STRING(16), allowNull: true, unique: true })
  nik: string

  @Column({ type: DataType.STRING, allowNull: false })
  profession: string

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  phoneNumber: string

  @Column({ type: DataType.ENUM('m', 'f'), allowNull: false })
  gender: string

  @Column({ type: DataType.DATEONLY, allowNull: false })
  birthDate: Date

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  isKader: boolean

  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  UserId: string

  @BelongsTo(() => User)
  user: User

  @IsUUID(4)
  @ForeignKey(() => RukunWarga)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  RukunWargaId: string

  @BelongsTo(() => RukunWarga)
  rukunWarga: RukunWarga

  @IsUUID(4)
  @ForeignKey(() => RukunTetangga)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  RukunTetanggaId: string

  @BelongsTo(() => RukunTetangga)
  rukunTetangga: RukunTetangga

  @IsUUID(4)
  @ForeignKey(() => MarriageStatus)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  MarriageStatusId: string

  @BelongsTo(() => MarriageStatus)
  marriageStatus: MarriageStatus

  @IsUUID(4)
  @ForeignKey(() => Education)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  EducationId: string

  @BelongsTo(() => Education)
  education: Education

  @IsUUID(4)
  @ForeignKey(() => SalaryRange)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  SalaryRangeId: string

  @BelongsTo(() => SalaryRange)
  salaryRange: SalaryRange

  @IsUUID(4)
  @ForeignKey(() => Family)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  FamilyId: string

  @BelongsTo(() => Family)
  family: Family
}
