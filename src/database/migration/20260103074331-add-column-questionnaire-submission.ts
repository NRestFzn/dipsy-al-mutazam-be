'use strict'

import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.addColumn(
      'questionnaire_submissions',
      'SubmittedBy',
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'questionnaire_submissions',
      'isAssisted',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      { transaction }
    )

    await queryInterface.sequelize.query(
      `UPDATE questionnaire_submissions 
       SET 
        SubmittedBy = UserId, 
        isAssisted = false
       WHERE SubmittedBy IS NULL`,
      {
        type: QueryTypes.UPDATE,
        transaction,
      }
    )

    await queryInterface.changeColumn(
      'questionnaire_submissions',
      'SubmittedBy',
      {
        type: Sequelize.UUID,
        allowNull: false,
      },
      { transaction }
    )

    await queryInterface.changeColumn(
      'questionnaire_submissions',
      'isAssisted',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      { transaction }
    )

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    console.error('Migration Failed:', error)
    throw error
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.removeColumn(
      'questionnaire_submissions',
      'SubmittedBy',
      { transaction }
    )
    await queryInterface.removeColumn(
      'questionnaire_submissions',
      'isAssisted',
      { transaction }
    )

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
