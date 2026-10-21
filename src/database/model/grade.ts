import { Column, DataType, HasMany, Table } from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import Class from './class'
import UserDetail from './userDetail'

@Table({ freezeTableName: true, tableName: 'grades' })
export default class Grade extends BaseSchema {
  @Column({ allowNull: false, type: DataType.STRING })
  name: string

  @HasMany(() => Class)
  classes: Class[]

  @HasMany(() => UserDetail)
  userDetails: UserDetail[]
}
