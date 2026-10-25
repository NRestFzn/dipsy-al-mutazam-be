import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  IsUUID,
  Table,
} from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import User from './user'
import UserDetail from './userDetail'

@Table({ freezeTableName: true, tableName: 'families' })
export default class Family extends BaseSchema {
  @Column({ type: DataType.STRING, allowNull: true })
  familyCardNumber: string

  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  headOfFamilyId: string

  @BelongsTo(() => User)
  headOfFamily: User

  @HasMany(() => UserDetail)
  members: UserDetail[]
}
