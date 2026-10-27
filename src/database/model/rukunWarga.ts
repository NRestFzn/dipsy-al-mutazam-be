import { Column, HasMany, Table } from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import { DataTypes } from 'sequelize'
import RukunTetangga from './rukunTetangga'

@Table({ freezeTableName: true, tableName: 'rukun_wargas' })
export default class RukunWarga extends BaseSchema {
  @Column({ allowNull: false, type: DataTypes.NUMBER })
  name: number

  @Column({ type: DataTypes.VIRTUAL })
  rtCount: number

  @Column({ type: DataTypes.VIRTUAL })
  userCount: number

  @HasMany(() => RukunTetangga)
  rukunTetangga: RukunTetangga[]
}
