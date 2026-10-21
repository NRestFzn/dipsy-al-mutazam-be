import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  Table,
} from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import Grade from './grade'
import Class from './class'
import User from './user'

@Table({ freezeTableName: true, tableName: 'user_details' })
export default class UserDetail extends BaseSchema {
  @Column({ type: DataType.STRING(10), allowNull: true, unique: true })
  nisn: string

  @Column({ type: DataType.STRING, allowNull: true })
  nis: string

  @Column({ type: DataType.STRING, allowNull: true })
  entryYear: string

  @Column({ type: DataType.STRING, allowNull: true })
  academicYear: string

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  phoneNumber: string

  @Column({ type: DataType.ENUM('m', 'f'), allowNull: false })
  gender: string

  @Column({ type: DataType.DATEONLY, allowNull: false })
  birthDate: Date

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
  @ForeignKey(() => Grade)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  GradeId: string

  @BelongsTo(() => Grade)
  grade: Grade

  @IsUUID(4)
  @ForeignKey(() => Class)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  ClassId: string

  @BelongsTo(() => Class)
  class: Class

  // Backwards compatibility getters
  get RukunWargaId(): string {
    return this.GradeId
  }

  get RukunTetanggaId(): string {
    return this.ClassId
  }
}
