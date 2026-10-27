import { Column, Table } from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import { DataTypes } from 'sequelize'

@Table({
  freezeTableName: true,
  tableName: 'educations',
})
export default class Education extends BaseSchema {
  @Column({ allowNull: false, type: DataTypes.STRING })
  name: string
}
