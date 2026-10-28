'use strict'

import { DataTypes, QueryInterface } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { env } from '@/config/env.config'
import Hashing from '@/config/hash.config'
import { RoleId } from '@/libs/constant/roleIds'
import { evaluateQuestionnaire } from '@/features/questionnaire/scoring'

const hashing = new Hashing()

/**
 * Comprehensive & idempotent seeder simulating realistic school data
 * for SMP & SMA Al-Multazam across academic years 2024/2025 and 2025/2026.
 */
export async function up(
  queryInterface: QueryInterface,
  _Sequelize: typeof DataTypes
) {
  const now = new Date()
  const defaultPasswordHash = await hashing.hash(env.APP_DEFAULT_PASS)

  // 1. Fetch Grades
  const [gradeRows]: any = await queryInterface.sequelize.query(
    `SELECT id, name, level FROM grades`
  )
  const gradeByName = new Map<string, string>()
  for (const g of gradeRows || []) {
    gradeByName.set(g.name, g.id)
  }

  // 2. Ensure Realistic Teachers exist (Guru BK & Wali Kelas)
  const teacherSpecs = [
    {
      fullname: 'Ust. Ahmad Fauzi, S.Psi. (Guru BK)',
      email: 'gurubk@al-multazam.sch.id',
      roleIds: [RoleId.gurubk],
      updateNameIfDefault: true,
    },
    {
      fullname: 'Ustadzah Siti Aisyah, M.Psi.',
      email: 'siti.aisyah.bk@al-multazam.sch.id',
      roleIds: [RoleId.gurubk],
    },
    {
      fullname: 'Ust. Rizky Pratama, S.Pd.',
      email: 'rizky.pratama.bk@al-multazam.sch.id',
      roleIds: [RoleId.gurubk],
    },
    {
      fullname: 'Ust. Hendra Wijaya, S.Pd.',
      email: 'walikelas@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
      updateNameIfDefault: true,
    },
    {
      fullname: 'Ustadzah Nurul Hidayah, S.Pd.',
      email: 'nurul.hidayah@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ust. Budi Santoso, M.Pd.',
      email: 'budi.santoso@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ustadzah Dewi Lestari, S.Pd.',
      email: 'dewi.lestari@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ust. Farhan Hakim, S.Pd.',
      email: 'farhan.hakim@al-multazam.sch.id',
      roleIds: [RoleId.walikelas, RoleId.gurubk],
    },
  ]

  const teacherIdByEmail = new Map<string, string>()

  for (const t of teacherSpecs) {
    const [existingUser]: any = await queryInterface.sequelize.query(
      `SELECT id, fullname FROM users WHERE email = :email LIMIT 1`,
      { replacements: { email: t.email } }
    )

    let userId: string
    if (existingUser && existingUser.length > 0) {
      userId = existingUser[0].id
      if (t.updateNameIfDefault) {
        await queryInterface.sequelize.query(
          `UPDATE users SET fullname = :fullname WHERE id = :id`,
          { replacements: { fullname: t.fullname, id: userId } }
        )
      }
    } else {
      userId = uuidv4()
      await queryInterface.bulkInsert('users', [
        {
          id: userId,
          fullname: t.fullname,
          email: t.email,
          password: defaultPasswordHash,
          createdAt: now,
          updatedAt: now,
        },
      ])
    }

    for (const rId of t.roleIds) {
      const [existingRole]: any = await queryInterface.sequelize.query(
        `SELECT id FROM user_has_roles WHERE UserId = :userId AND RoleId = :roleId LIMIT 1`,
        { replacements: { userId, roleId: rId } }
      )
      if (!existingRole || existingRole.length === 0) {
        await queryInterface.bulkInsert('user_has_roles', [
          {
            id: uuidv4(),
            UserId: userId,
            RoleId: rId,
            createdAt: now,
            updatedAt: now,
          },
        ])
      }
    }

    teacherIdByEmail.set(t.email, userId)
  }

  // 3. Ensure Classes across SMP (VII, VIII, IX) and SMA (X, XI, XII)
  const classSpecs = [
    { name: 'VII-A', gradeName: 'VII', homeroom2025: 'dewi.lestari@al-multazam.sch.id', homeroom2024: 'dewi.lestari@al-multazam.sch.id' },
    { name: 'VII-B', gradeName: 'VII', homeroom2025: 'dewi.lestari@al-multazam.sch.id', homeroom2024: 'farhan.hakim@al-multazam.sch.id' },
    { name: 'VIII-A', gradeName: 'VIII', homeroom2025: 'farhan.hakim@al-multazam.sch.id', homeroom2024: 'dewi.lestari@al-multazam.sch.id' },
    { name: 'IX-A', gradeName: 'IX', homeroom2025: 'farhan.hakim@al-multazam.sch.id', homeroom2024: 'farhan.hakim@al-multazam.sch.id' },
    { name: 'X-A', gradeName: 'X', homeroom2025: 'walikelas@al-multazam.sch.id', homeroom2024: 'nurul.hidayah@al-multazam.sch.id' },
    { name: 'X-B', gradeName: 'X', homeroom2025: 'walikelas@al-multazam.sch.id', homeroom2024: 'walikelas@al-multazam.sch.id' },
    { name: 'X-C', gradeName: 'X', homeroom2025: 'nurul.hidayah@al-multazam.sch.id', homeroom2024: 'nurul.hidayah@al-multazam.sch.id' },
    { name: 'XI-A', gradeName: 'XI', homeroom2025: 'nurul.hidayah@al-multazam.sch.id', homeroom2024: 'walikelas@al-multazam.sch.id' },
    { name: 'XI-B', gradeName: 'XI', homeroom2025: 'budi.santoso@al-multazam.sch.id', homeroom2024: 'budi.santoso@al-multazam.sch.id' },
    { name: 'XII-A', gradeName: 'XII', homeroom2025: 'budi.santoso@al-multazam.sch.id', homeroom2024: 'budi.santoso@al-multazam.sch.id' },
    { name: 'XII-B', gradeName: 'XII', homeroom2025: 'budi.santoso@al-multazam.sch.id', homeroom2024: 'nurul.hidayah@al-multazam.sch.id' },
  ]

  const classIdByName = new Map<string, string>()

  for (const c of classSpecs) {
    const gradeId = gradeByName.get(c.gradeName)
    if (!gradeId) continue

    const [existingClass]: any = await queryInterface.sequelize.query(
      `SELECT id FROM classes WHERE name = :name AND GradeId = :gradeId LIMIT 1`,
      { replacements: { name: c.name, gradeId } }
    )

    let classId: string
    if (existingClass && existingClass.length > 0) {
      classId = existingClass[0].id
    } else {
      classId = uuidv4()
      await queryInterface.bulkInsert('classes', [
        {
          id: classId,
          name: c.name,
          GradeId: gradeId,
          createdAt: now,
          updatedAt: now,
        },
      ])
    }

    classIdByName.set(c.name, classId)

    // Seed homeroom_assignments for 2025/2026 and 2024/2025
    const pairs = [
      { year: '2025/2026', email: c.homeroom2025 },
      { year: '2024/2025', email: c.homeroom2024 },
    ]

    for (const p of pairs) {
      const teacherId = teacherIdByEmail.get(p.email)
      if (!teacherId) continue

      const [existingHa]: any = await queryInterface.sequelize.query(
        `SELECT id FROM homeroom_assignments WHERE ClassId = :classId AND academicYear = :year LIMIT 1`,
        { replacements: { classId, year: p.year } }
      )

      if (existingHa && existingHa.length > 0) {
        await queryInterface.sequelize.query(
          `UPDATE homeroom_assignments SET UserId = :teacherId, updatedAt = :now WHERE id = :id`,
          { replacements: { teacherId, now, id: existingHa[0].id } }
        )
      } else {
        await queryInterface.bulkInsert('homeroom_assignments', [
          {
            id: uuidv4(),
            ClassId: classId,
            UserId: teacherId,
            academicYear: p.year,
            createdAt: now,
            updatedAt: now,
          },
        ])
      }
    }
  }

  // 4. Seed Counselor Class Assignments (counselor_class_assignments)
  const counselorAssignmentsSpec = [
    {
      email: 'gurubk@al-multazam.sch.id',
      academicYear: '2025/2026',
      classNames: ['VII-A', 'VIII-A', 'IX-A', 'X-A', 'X-B', 'XI-A', 'XII-A'],
    },
    {
      email: 'gurubk@al-multazam.sch.id',
      academicYear: '2024/2025',
      classNames: ['X-A', 'X-B', 'XI-A', 'XII-A'],
    },
    {
      email: 'siti.aisyah.bk@al-multazam.sch.id',
      academicYear: '2025/2026',
      classNames: ['VII-A', 'VII-B', 'VIII-A', 'IX-A'],
    },
    {
      email: 'rizky.pratama.bk@al-multazam.sch.id',
      academicYear: '2025/2026',
      classNames: ['X-A', 'X-B', 'X-C', 'XI-A', 'XI-B', 'XII-A', 'XII-B'],
    },
  ]

  for (const ca of counselorAssignmentsSpec) {
    const counselorId = teacherIdByEmail.get(ca.email)
    if (!counselorId) continue

    for (const cName of ca.classNames) {
      const classId = classIdByName.get(cName)
      if (!classId) continue

      const [existingCa]: any = await queryInterface.sequelize.query(
        `SELECT id FROM counselor_class_assignments WHERE UserId = :userId AND ClassId = :classId AND academicYear = :year LIMIT 1`,
        {
          replacements: {
            userId: counselorId,
            classId,
            year: ca.academicYear,
          },
        }
      )

      if (!existingCa || existingCa.length === 0) {
        await queryInterface.bulkInsert('counselor_class_assignments', [
          {
            id: uuidv4(),
            UserId: counselorId,
            ClassId: classId,
            academicYear: ca.academicYear,
            createdAt: now,
            updatedAt: now,
          },
        ])
      }
    }
  }

  // 5. Seed Realistic Students across Classes + Alumni + Transferred + Class History
  const [existingSeedStudent]: any = await queryInterface.sequelize.query(
    `SELECT id FROM user_details WHERE nisn = '0084010042' LIMIT 1`
  )
  if (existingSeedStudent && existingSeedStudent.length > 0) {
    return
  }

  interface SeedStudentSpec {
    nisn: string
    nis: string
    fullname: string
    gender: 'm' | 'f'
    birthDate: string
    phone: string
    entryYear: string
    gradeName: string
    className: string
    pastGradeName?: string
    pastClassName?: string
    status?: 'aktif' | 'lulus' | 'pindah'
    graduationYear?: string | null
    srqYesCount?: number // out of 20 (>= 6 is risk)
    sdqPattern?: 'normal' | 'borderline' | 'abnormal' | null
    isAssisted?: boolean
  }

  const studentsSpec: SeedStudentSpec[] = [
    // X-A (6 students)
    { nisn: '0085010001', nis: '252610001', fullname: 'Muhammad Zaki Al-Fatih', gender: 'm', birthDate: '2010-03-14', phone: '081234560001', entryYear: '2025', gradeName: 'X', className: 'X-A', srqYesCount: 2, sdqPattern: 'normal' },
    { nisn: '0085010002', nis: '252610002', fullname: 'Aisyah Putri Ramadhani', gender: 'f', birthDate: '2010-07-22', phone: '081234560002', entryYear: '2025', gradeName: 'X', className: 'X-A', srqYesCount: 8, sdqPattern: 'abnormal' },
    { nisn: '0085010003', nis: '252610003', fullname: 'Naufal Rizqullah Pratama', gender: 'm', birthDate: '2010-01-19', phone: '081234560003', entryYear: '2025', gradeName: 'X', className: 'X-A', srqYesCount: 1, sdqPattern: 'normal' },
    { nisn: '0085010004', nis: '252610004', fullname: 'Zahra Amalia Khairunnisa', gender: 'f', birthDate: '2010-05-08', phone: '081234560004', entryYear: '2025', gradeName: 'X', className: 'X-A', srqYesCount: 7, sdqPattern: 'borderline', isAssisted: true },
    { nisn: '0085010005', nis: '252610005', fullname: 'Fikri Haikal Maulana', gender: 'm', birthDate: '2010-11-30', phone: '081234560005', entryYear: '2025', gradeName: 'X', className: 'X-A', srqYesCount: 3, sdqPattern: 'normal' },
    { nisn: '0085010006', nis: '252610006', fullname: 'Nabila Syifa Azzahra', gender: 'f', birthDate: '2010-09-12', phone: '081234560006', entryYear: '2025', gradeName: 'X', className: 'X-A' },

    // X-B (5 students)
    { nisn: '0085010007', nis: '252610007', fullname: 'Dimas Aditya Saputra', gender: 'm', birthDate: '2010-04-05', phone: '081234560007', entryYear: '2025', gradeName: 'X', className: 'X-B', srqYesCount: 9, sdqPattern: 'abnormal' },
    { nisn: '0085010008', nis: '252610008', fullname: 'Salma Nadia Fitriani', gender: 'f', birthDate: '2010-08-17', phone: '081234560008', entryYear: '2025', gradeName: 'X', className: 'X-B', srqYesCount: 2, sdqPattern: 'normal' },
    { nisn: '0085010009', nis: '252610009', fullname: 'Rafi Ahmad Baihaqi', gender: 'm', birthDate: '2010-02-25', phone: '081234560009', entryYear: '2025', gradeName: 'X', className: 'X-B', srqYesCount: 4, sdqPattern: 'normal' },
    { nisn: '0085010010', nis: '252610010', fullname: 'Keisya Maharani Putri', gender: 'f', birthDate: '2010-06-11', phone: '081234560010', entryYear: '2025', gradeName: 'X', className: 'X-B', srqYesCount: 6, sdqPattern: 'borderline' },
    { nisn: '0085010011', nis: '252610011', fullname: 'Alif Rahman Hakim', gender: 'm', birthDate: '2010-12-03', phone: '081234560011', entryYear: '2025', gradeName: 'X', className: 'X-B' },

    // X-C (4 students)
    { nisn: '0085010012', nis: '252610012', fullname: 'Fadhil Akbar Nugraha', gender: 'm', birthDate: '2010-03-29', phone: '081234560012', entryYear: '2025', gradeName: 'X', className: 'X-C', srqYesCount: 1, sdqPattern: 'normal' },
    { nisn: '0085010013', nis: '252610013', fullname: 'Yasmin Aulia Rahma', gender: 'f', birthDate: '2010-10-15', phone: '081234560013', entryYear: '2025', gradeName: 'X', className: 'X-C', srqYesCount: 7, sdqPattern: 'borderline' },
    { nisn: '0085010014', nis: '252610014', fullname: 'Bagas Satrio Wibowo', gender: 'm', birthDate: '2010-05-20', phone: '081234560014', entryYear: '2025', gradeName: 'X', className: 'X-C', srqYesCount: 3, sdqPattern: 'normal' },
    { nisn: '0085010015', nis: '252610015', fullname: 'Hana Sofia Salsabila', gender: 'f', birthDate: '2010-07-07', phone: '081234560015', entryYear: '2025', gradeName: 'X', className: 'X-C', srqYesCount: 2, sdqPattern: 'normal' },

    // XI-A (5 students — promoted from X-A in 2024/2025)
    { nisn: '0084010016', nis: '242510016', fullname: 'Faris Daffa Hidayat', gender: 'm', birthDate: '2009-02-14', phone: '081234560016', entryYear: '2024', gradeName: 'XI', className: 'XI-A', pastGradeName: 'X', pastClassName: 'X-A', srqYesCount: 2, sdqPattern: 'normal' },
    { nisn: '0084010017', nis: '242510017', fullname: 'Intan Permata Sari', gender: 'f', birthDate: '2009-06-21', phone: '081234560017', entryYear: '2024', gradeName: 'XI', className: 'XI-A', pastGradeName: 'X', pastClassName: 'X-A', srqYesCount: 10, sdqPattern: 'abnormal', isAssisted: true },
    { nisn: '0084010018', nis: '242510018', fullname: 'Reza Pahlevi Ramadhan', gender: 'm', birthDate: '2009-09-09', phone: '081234560018', entryYear: '2024', gradeName: 'XI', className: 'XI-A', pastGradeName: 'X', pastClassName: 'X-A', srqYesCount: 3, sdqPattern: 'normal' },
    { nisn: '0084010019', nis: '242510019', fullname: 'Anisa Fitri Oktaviani', gender: 'f', birthDate: '2009-10-28', phone: '081234560019', entryYear: '2024', gradeName: 'XI', className: 'XI-A', pastGradeName: 'X', pastClassName: 'X-B', srqYesCount: 6, sdqPattern: 'borderline' },
    { nisn: '0084010020', nis: '242510020', fullname: 'Ilham Kurniawan Putra', gender: 'm', birthDate: '2009-01-12', phone: '081234560020', entryYear: '2024', gradeName: 'XI', className: 'XI-A', pastGradeName: 'X', pastClassName: 'X-B', srqYesCount: 1, sdqPattern: 'normal' },

    // XI-B (4 students — promoted from X-B/X-C in 2024/2025)
    { nisn: '0084010021', nis: '242510021', fullname: 'Lutfi Hakim Syahputra', gender: 'm', birthDate: '2009-04-18', phone: '081234560021', entryYear: '2024', gradeName: 'XI', className: 'XI-B', pastGradeName: 'X', pastClassName: 'X-B', srqYesCount: 4, sdqPattern: 'normal' },
    { nisn: '0084010022', nis: '242510022', fullname: 'Tiara Kusuma Wardhani', gender: 'f', birthDate: '2009-08-03', phone: '081234560022', entryYear: '2024', gradeName: 'XI', className: 'XI-B', pastGradeName: 'X', pastClassName: 'X-C', srqYesCount: 8, sdqPattern: 'abnormal' },
    { nisn: '0084010023', nis: '242510023', fullname: 'Iqbal Maulana Siddiq', gender: 'm', birthDate: '2009-11-25', phone: '081234560023', entryYear: '2024', gradeName: 'XI', className: 'XI-B', pastGradeName: 'X', pastClassName: 'X-C', srqYesCount: 2, sdqPattern: 'normal' },
    { nisn: '0084010024', nis: '242510024', fullname: 'Dinda Ayu Lestari', gender: 'f', birthDate: '2009-03-07', phone: '081234560024', entryYear: '2024', gradeName: 'XI', className: 'XI-B', pastGradeName: 'X', pastClassName: 'X-C' },

    // XII-A (5 students — promoted from XI-A in 2024/2025)
    { nisn: '0083010025', nis: '232410025', fullname: 'Arkananta Firdaus', gender: 'm', birthDate: '2008-05-16', phone: '081234560025', entryYear: '2023', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XI', pastClassName: 'XI-A', srqYesCount: 9, sdqPattern: 'abnormal' },
    { nisn: '0083010026', nis: '232410026', fullname: 'Shafira Nur Azizah', gender: 'f', birthDate: '2008-09-23', phone: '081234560026', entryYear: '2023', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XI', pastClassName: 'XI-A', srqYesCount: 3, sdqPattern: 'normal' },
    { nisn: '0083010027', nis: '232410027', fullname: 'Hafiz Abdurrahman', gender: 'm', birthDate: '2008-01-30', phone: '081234560027', entryYear: '2023', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XI', pastClassName: 'XI-A', srqYesCount: 7, sdqPattern: 'borderline' },
    { nisn: '0083010028', nis: '232410028', fullname: 'Mutia Rahmawati', gender: 'f', birthDate: '2008-07-14', phone: '081234560028', entryYear: '2023', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XI', pastClassName: 'XI-A', srqYesCount: 2, sdqPattern: 'normal' },
    { nisn: '0083010029', nis: '232410029', fullname: 'Gilang Prasetyo Adi', gender: 'm', birthDate: '2008-12-19', phone: '081234560029', entryYear: '2023', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XI', pastClassName: 'XI-B', srqYesCount: 1, sdqPattern: 'normal' },

    // XII-B (3 students)
    { nisn: '0083010030', nis: '232410030', fullname: 'Alya Khansa Humaira', gender: 'f', birthDate: '2008-04-02', phone: '081234560030', entryYear: '2023', gradeName: 'XII', className: 'XII-B', pastGradeName: 'XI', pastClassName: 'XI-B', srqYesCount: 6, sdqPattern: 'borderline' },
    { nisn: '0083010031', nis: '232410031', fullname: 'Rayhan Fadhlurrahman', gender: 'm', birthDate: '2008-08-11', phone: '081234560031', entryYear: '2023', gradeName: 'XII', className: 'XII-B', pastGradeName: 'XI', pastClassName: 'XI-B', srqYesCount: 2, sdqPattern: 'normal' },
    { nisn: '0083010032', nis: '232410032', fullname: 'Nadira Putri Kinanti', gender: 'f', birthDate: '2008-10-05', phone: '081234560032', entryYear: '2023', gradeName: 'XII', className: 'XII-B', pastGradeName: 'XI', pastClassName: 'XI-B', srqYesCount: 3, sdqPattern: 'normal' },

    // SMP Classes (VII-A, VIII-A, IX-A)
    { nisn: '0115010033', nis: '252607001', fullname: 'Azkaidan Putra Pratama', gender: 'm', birthDate: '2013-02-10', phone: '081234560033', entryYear: '2025', gradeName: 'VII', className: 'VII-A', srqYesCount: 2, sdqPattern: 'normal' },
    { nisn: '0115010034', nis: '252607002', fullname: 'Kayla Syafiqah Husna', gender: 'f', birthDate: '2013-06-18', phone: '081234560034', entryYear: '2025', gradeName: 'VII', className: 'VII-A', srqYesCount: 7, sdqPattern: 'borderline', isAssisted: true },
    { nisn: '0115010035', nis: '252607003', fullname: 'Danish Faeyza Alfarizqi', gender: 'm', birthDate: '2013-09-27', phone: '081234560035', entryYear: '2025', gradeName: 'VII', className: 'VII-A', srqYesCount: 1, sdqPattern: 'normal' },
    { nisn: '0104010036', nis: '242508001', fullname: 'Nizam Althafurrahman', gender: 'm', birthDate: '2012-03-15', phone: '081234560036', entryYear: '2024', gradeName: 'VIII', className: 'VIII-A', pastGradeName: 'VII', pastClassName: 'VII-A', srqYesCount: 3, sdqPattern: 'normal' },
    { nisn: '0104010037', nis: '242508002', fullname: 'Aqila Zahratunnisa', gender: 'f', birthDate: '2012-11-04', phone: '081234560037', entryYear: '2024', gradeName: 'VIII', className: 'VIII-A', pastGradeName: 'VII', pastClassName: 'VII-A', srqYesCount: 8, sdqPattern: 'abnormal' },
    { nisn: '0093010038', nis: '232409001', fullname: 'Dzaky Almair Jamil', gender: 'm', birthDate: '2011-01-22', phone: '081234560038', entryYear: '2023', gradeName: 'IX', className: 'IX-A', pastGradeName: 'VIII', pastClassName: 'VIII-A', srqYesCount: 2, sdqPattern: 'normal' },
    { nisn: '0093010039', nis: '232409002', fullname: 'Khaira Lubna Asshofa', gender: 'f', birthDate: '2011-07-30', phone: '081234560039', entryYear: '2023', gradeName: 'IX', className: 'IX-A', pastGradeName: 'VIII', pastClassName: 'VIII-A', srqYesCount: 6, sdqPattern: 'borderline' },

    // Graduated Alumni (status: 'lulus', graduationYear: '2025')
    { nisn: '0072010040', nis: '222310040', fullname: 'Rizwan Kamil Al-Farisi', gender: 'm', birthDate: '2007-04-12', phone: '081234560040', entryYear: '2022', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XII', pastClassName: 'XII-A', status: 'lulus', graduationYear: '2025' },
    { nisn: '0072010041', nis: '222310041', fullname: 'Nadia Хаsana Putri', gender: 'f', birthDate: '2007-08-29', phone: '081234560041', entryYear: '2022', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XII', pastClassName: 'XII-A', status: 'lulus', graduationYear: '2025' },

    // Transferred Student (status: 'pindah')
    { nisn: '0084010042', nis: '242510042', fullname: 'Aldi Pratama Wijaya', gender: 'm', birthDate: '2009-05-19', phone: '081234560042', entryYear: '2024', gradeName: 'XI', className: 'XI-B', pastGradeName: 'X', pastClassName: 'X-B', status: 'pindah' },
  ]

  // Fetch questionnaires & questions for generating realistic submissions
  const [srqRows]: any = await queryInterface.sequelize.query(
    `SELECT id, scoringType, riskThreshold, scoringConfig FROM questionnaires WHERE title = 'Self-Reporting Questionnaire' LIMIT 1`
  )
  const [sdqRows]: any = await queryInterface.sequelize.query(
    `SELECT id, scoringType, riskThreshold, scoringConfig FROM questionnaires WHERE id = '7a5975f9-0fda-4a81-912c-12a6fdfc3934' LIMIT 1`
  )

  const srqQuestionnaire = srqRows?.[0]
  const sdqQuestionnaire = sdqRows?.[0]

  const [srqQuestions]: any = srqQuestionnaire
    ? await queryInterface.sequelize.query(
        `SELECT id, \`order\`, questionText, questionType, options, scoringCategory, scoreOverrides FROM questionnaire_questions WHERE QuestionnaireId = :qId ORDER BY \`order\` ASC`,
        { replacements: { qId: srqQuestionnaire.id } }
      )
    : [[]]

  const [sdqQuestions]: any = sdqQuestionnaire
    ? await queryInterface.sequelize.query(
        `SELECT id, \`order\`, questionText, questionType, options, scoringCategory, scoreOverrides FROM questionnaire_questions WHERE QuestionnaireId = :qId ORDER BY \`order\` ASC`,
        { replacements: { qId: sdqQuestionnaire.id } }
      )
    : [[]]

  const mainCounselorId = teacherIdByEmail.get('gurubk@al-multazam.sch.id')!
  const mainWaliId = teacherIdByEmail.get('walikelas@al-multazam.sch.id')!

  for (const s of studentsSpec) {
    const [existingUd]: any = await queryInterface.sequelize.query(
      `SELECT id, UserId FROM user_details WHERE nisn = :nisn LIMIT 1`,
      { replacements: { nisn: s.nisn } }
    )
    if (existingUd && existingUd.length > 0) {
      continue
    }

    const gradeId = gradeByName.get(s.gradeName)
    const classId = classIdByName.get(s.className)
    if (!gradeId || !classId) continue

    const studentUserId = uuidv4()
    const studentEmail = `${s.nisn}@siswa.al-multazam.sch.id`
    const studentStatus = s.status || 'aktif'
    const academicYear = studentStatus === 'lulus' ? '2024/2025' : '2025/2026'

    await queryInterface.bulkInsert('users', [
      {
        id: studentUserId,
        fullname: s.fullname,
        email: studentEmail,
        password: defaultPasswordHash,
        createdAt: now,
        updatedAt: now,
      },
    ])

    await queryInterface.bulkInsert('user_has_roles', [
      {
        id: uuidv4(),
        UserId: studentUserId,
        RoleId: RoleId.siswa,
        createdAt: now,
        updatedAt: now,
      },
    ])

    await queryInterface.bulkInsert('user_details', [
      {
        id: uuidv4(),
        UserId: studentUserId,
        nisn: s.nisn,
        nis: s.nis,
        gender: s.gender,
        birthDate: new Date(s.birthDate),
        phoneNumber: s.phone,
        entryYear: s.entryYear,
        academicYear,
        GradeId: gradeId,
        ClassId: classId,
        studentStatus,
        graduationYear: s.graduationYear ?? null,
        createdAt: now,
        updatedAt: now,
      },
    ])

    // Past academic year history (2024/2025)
    if (s.pastGradeName && s.pastClassName) {
      const pastGradeId = gradeByName.get(s.pastGradeName)
      const pastClassId = classIdByName.get(s.pastClassName)
      const pastSpec = classSpecs.find((cs) => cs.name === s.pastClassName)
      const pastHomeroomId = pastSpec
        ? teacherIdByEmail.get(pastSpec.homeroom2024) ?? mainWaliId
        : mainWaliId

      if (pastGradeId && pastClassId) {
        await queryInterface.bulkInsert('student_class_histories', [
          {
            id: uuidv4(),
            UserId: studentUserId,
            academicYear: '2024/2025',
            GradeId: pastGradeId,
            ClassId: pastClassId,
            homeroomTeacherId: pastHomeroomId,
            notes:
              studentStatus === 'lulus'
                ? 'Lulus Tahun Ajaran 2024/2025'
                : 'Kenaikan kelas reguler TP 2024/2025',
            createdAt: new Date('2025-06-20T08:00:00Z'),
            updatedAt: new Date('2025-06-20T08:00:00Z'),
          },
        ])
      }
    }

    // Create SRQ-20 submission if specified
    if (
      srqQuestionnaire &&
      srqQuestions.length === 20 &&
      s.srqYesCount !== undefined
    ) {
      const answers = srqQuestions.map((q: any, idx: number) => ({
        QuestionId: q.id,
        answerValue: idx < s.srqYesCount! ? 'true' : 'false',
      }))

      const evaluated = evaluateQuestionnaire({
        scoringType: srqQuestionnaire.scoringType || 'binary_threshold',
        riskThreshold: srqQuestionnaire.riskThreshold ?? 6,
        scoringConfig: srqQuestionnaire.scoringConfig
          ? typeof srqQuestionnaire.scoringConfig === 'string'
            ? JSON.parse(srqQuestionnaire.scoringConfig)
            : srqQuestionnaire.scoringConfig
          : null,
        questions: srqQuestions,
        answers,
      })

      const submissionId = uuidv4()
      const submittedBy = s.isAssisted ? mainCounselorId : studentUserId

      await queryInterface.bulkInsert('questionnaire_submissions', [
        {
          id: submissionId,
          UserId: studentUserId,
          QuestionnaireId: srqQuestionnaire.id,
          SubmittedBy: submittedBy,
          isAssisted: Boolean(s.isAssisted),
          score: evaluated.score,
          resultKey: evaluated.resultKey,
          resultLabel: evaluated.resultLabel,
          isRisk: evaluated.isRisk,
          scoringResult: JSON.stringify(evaluated),
          createdAt: now,
          updatedAt: now,
        },
      ])

      await queryInterface.bulkInsert(
        'questionnaire_answers',
        evaluated.answers.map((ans) => ({
          id: uuidv4(),
          QuestionnaireSubmissionId: submissionId,
          QuestionnaireQuestionId: ans.QuestionId,
          answerValue: ans.answerValue,
          answerLabel: ans.answerLabel,
          score: ans.score,
          createdAt: now,
          updatedAt: now,
        }))
      )
    }

    // Create SDQ submission if specified
    if (sdqQuestionnaire && sdqQuestions.length === 25 && s.sdqPattern) {
      const parsedConfig =
        typeof sdqQuestionnaire.scoringConfig === 'string'
          ? JSON.parse(sdqQuestionnaire.scoringConfig)
          : sdqQuestionnaire.scoringConfig

      const parsedQuestions = sdqQuestions.map((q: any) => ({
        ...q,
        scoreOverrides:
          typeof q.scoreOverrides === 'string'
            ? JSON.parse(q.scoreOverrides)
            : q.scoreOverrides,
      }))

      const answers = parsedQuestions.map((q: any, idx: number) => {
        const isReverse = Boolean(q.scoreOverrides)
        const isProsocial = q.scoringCategory === 'prosocial'

        if (s.sdqPattern === 'normal') {
          if (isProsocial) return { QuestionId: q.id, answerValue: 'certainly_true' }
          if (isReverse) return { QuestionId: q.id, answerValue: 'certainly_true' }
          return {
            QuestionId: q.id,
            answerValue: idx % 7 === 0 ? 'somewhat_true' : 'not_true',
          }
        } else if (s.sdqPattern === 'borderline') {
          if (isProsocial) return { QuestionId: q.id, answerValue: 'somewhat_true' }
          if (isReverse) return { QuestionId: q.id, answerValue: 'somewhat_true' }
          return {
            QuestionId: q.id,
            answerValue: idx % 2 === 0 ? 'somewhat_true' : 'not_true',
          }
        } else {
          // abnormal
          if (isProsocial) return { QuestionId: q.id, answerValue: 'somewhat_true' }
          if (isReverse) return { QuestionId: q.id, answerValue: 'not_true' }
          return {
            QuestionId: q.id,
            answerValue: idx % 3 === 0 ? 'certainly_true' : 'somewhat_true',
          }
        }
      })

      const evaluated = evaluateQuestionnaire({
        scoringType: sdqQuestionnaire.scoringType || 'weighted_score',
        riskThreshold: sdqQuestionnaire.riskThreshold ?? 0,
        scoringConfig: parsedConfig,
        questions: parsedQuestions,
        answers,
      })

      const submissionId = uuidv4()
      const submittedBy = s.isAssisted ? mainCounselorId : studentUserId

      await queryInterface.bulkInsert('questionnaire_submissions', [
        {
          id: submissionId,
          UserId: studentUserId,
          QuestionnaireId: sdqQuestionnaire.id,
          SubmittedBy: submittedBy,
          isAssisted: Boolean(s.isAssisted),
          score: evaluated.score,
          resultKey: evaluated.resultKey,
          resultLabel: evaluated.resultLabel,
          isRisk: evaluated.isRisk,
          scoringResult: JSON.stringify(evaluated),
          createdAt: now,
          updatedAt: now,
        },
      ])

      await queryInterface.bulkInsert(
        'questionnaire_answers',
        evaluated.answers.map((ans) => ({
          id: uuidv4(),
          QuestionnaireSubmissionId: submissionId,
          QuestionnaireQuestionId: ans.QuestionId,
          answerValue: ans.answerValue,
          answerLabel: ans.answerLabel,
          score: ans.score,
          createdAt: now,
          updatedAt: now,
        }))
      )
    }
  }
}

export async function down(
  queryInterface: QueryInterface,
  _Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('questionnaire_answers', {})
  await queryInterface.bulkDelete('questionnaire_submissions', {})
  await queryInterface.bulkDelete('student_class_histories', {})
  await queryInterface.bulkDelete('counselor_class_assignments', {})
  await queryInterface.bulkDelete('homeroom_assignments', {})
}
