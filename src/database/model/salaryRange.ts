import { Column, Table } from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import { DataTypes } from 'sequelize'

@Table({ freezeTableName: true, tableName: 'salary_ranges' })
export default class SalaryRange extends BaseSchema {
  @Column({ allowNull: false, type: DataTypes.DECIMAL(12, 2) })
  minRange: number

  @Column({ allowNull: false, type: DataTypes.DECIMAL(12, 2) })
  maxRange: number
}
