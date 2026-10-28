'use strict'

import { DataTypes, QueryInterface } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { env } from '@/config/env.config'
import Hashing from '@/config/hash.config'
import { RoleId } from '@/libs/constant/roleIds'
import { evaluateQuestionnaire } from '@/features/questionnaire/scoring'

const hashing = new Hashing()

async function bulkInsertChunked(
  queryInterface: QueryInterface,
  tableName: string,
  rows: Record<string, any>[],
  chunkSize = 500
) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    if (chunk.length > 0) {
      await queryInterface.bulkInsert(tableName, chunk)
    }
  }
}

/**
 * Comprehensive & idempotent seeder simulating large-scale realistic school data
 * for SMP & SMA Al-Multazam across academic years 2023/2024, 2024/2025, and 2025/2026:
 * - 18 Classes across 6 Grades (VII-A..C, VIII-A..C, IX-A..C, X-A..C, XI-A..C, XII-A..C)
 * - 21 Teachers (5 Guru BK + 16 Wali Kelas)
 * - 265 Students (234 Active across 18 classes + 21 Alumni/Lulus + 10 Pindah)
 * - Multi-year student_class_histories & homeroom_assignments
 * - 420+ SRQ-20 & SDQ Questionnaire Submissions with realistic scores & timestamps
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

  // 2. Ensure Realistic Teachers exist (5 Guru BK & 16 Wali Kelas)
  const teacherSpecs = [
    // Guru BK
    {
      fullname: 'Ust. Ahmad Fauzi, S.Psi. (Koordinator BK)',
      email: 'gurubk@al-multazam.sch.id',
      roleIds: [RoleId.gurubk],
      updateNameIfDefault: true,
    },
    {
      fullname: 'Ustadzah Siti Aisyah, M.Psi. (BK SMP)',
      email: 'siti.aisyah.bk@al-multazam.sch.id',
      roleIds: [RoleId.gurubk],
    },
    {
      fullname: 'Ust. Rizky Pratama, S.Pd. (BK SMA)',
      email: 'rizky.pratama.bk@al-multazam.sch.id',
      roleIds: [RoleId.gurubk],
    },
    {
      fullname: 'Ustadzah Dewi Kartika, S.Psi. (BK Kelas Akhir)',
      email: 'dewi.kartika.bk@al-multazam.sch.id',
      roleIds: [RoleId.gurubk],
    },
    {
      fullname: 'Ust. Fajar Nugroho, M.Pd. (BK Kelas Awal)',
      email: 'fajar.nugroho.bk@al-multazam.sch.id',
      roleIds: [RoleId.gurubk],
    },
    // Wali Kelas
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
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ustadzah Rina Marlina, S.Pd.',
      email: 'rina.marlina@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ust. Agus Setiawan, S.Si.',
      email: 'agus.setiawan@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ustadzah Fitriani Zahra, M.Pd.',
      email: 'fitriani.zahra@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ust. Lukmanul Hakim, Lc.',
      email: 'lukmanul.hakim@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ustadzah Halimah Sa’diyah, S.Pd.',
      email: 'halimah.sadiyah@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ust. Ridwan Kamiluddin, S.Kom.',
      email: 'ridwan.kamiluddin@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ustadzah Nisa Rahmawati, S.Pd.',
      email: 'nisa.rahmawati@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ust. Taufiq Hidayatullah, M.Ag.',
      email: 'taufiq.hidayatullah@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ustadzah Yulia Citra, S.Pd.',
      email: 'yulia.citra@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ust. Salman Al-Farisi, S.Pd.',
      email: 'salman.alfarisi@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ustadzah Maryam Qonita, S.S.',
      email: 'maryam.qonita@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ust. Zaki Mubarak, M.Pd.',
      email: 'zaki.mubarak@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
    },
    {
      fullname: 'Ustadzah Nabila Syakieb, M.Pd.',
      email: 'nabila.syakieb@al-multazam.sch.id',
      roleIds: [RoleId.walikelas],
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
      await queryInterface.sequelize.query(
        `UPDATE users SET fullname = :fullname, password = :password, updatedAt = :now WHERE id = :id`,
        {
          replacements: {
            fullname: t.updateNameIfDefault
              ? t.fullname
              : existingUser[0].fullname,
            password: defaultPasswordHash,
            now,
            id: userId,
          },
        }
      )
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

    // Ensure teacher only has the exact single role specified in t.roleIds
    await queryInterface.sequelize.query(
      `DELETE FROM user_has_roles WHERE UserId = :userId AND RoleId NOT IN (:roleIds)`,
      { replacements: { userId, roleIds: t.roleIds } }
    )

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

  // 3. Clean up any legacy mis-linked classes (e.g. X-A accidentally attached to Grade IX)
  await queryInterface.sequelize.query(`
    DELETE c FROM classes c
    JOIN grades g ON c.GradeId = g.id
    WHERE c.name NOT LIKE CONCAT(g.name, '-%')
      AND NOT EXISTS (SELECT 1 FROM user_details ud WHERE ud.ClassId = c.id)
  `)

  // Ensure 18 Classes across SMP (VII, VIII, IX) and SMA (X, XI, XII)
  // Each of the 18 classes has its own distinct homeroom teacher in 2025/2026 (1 teacher = 1 active class)
  const classSpecs = [
    // SMP Grade VII
    { name: 'VII-A', gradeName: 'VII', homeroom2025: 'dewi.lestari@al-multazam.sch.id', homeroom2024: 'rina.marlina@al-multazam.sch.id' },
    { name: 'VII-B', gradeName: 'VII', homeroom2025: 'rina.marlina@al-multazam.sch.id', homeroom2024: 'dewi.lestari@al-multazam.sch.id' },
    { name: 'VII-C', gradeName: 'VII', homeroom2025: 'agus.setiawan@al-multazam.sch.id', homeroom2024: 'agus.setiawan@al-multazam.sch.id' },
    // SMP Grade VIII
    { name: 'VIII-A', gradeName: 'VIII', homeroom2025: 'farhan.hakim@al-multazam.sch.id', homeroom2024: 'dewi.lestari@al-multazam.sch.id' },
    { name: 'VIII-B', gradeName: 'VIII', homeroom2025: 'fitriani.zahra@al-multazam.sch.id', homeroom2024: 'fitriani.zahra@al-multazam.sch.id' },
    { name: 'VIII-C', gradeName: 'VIII', homeroom2025: 'lukmanul.hakim@al-multazam.sch.id', homeroom2024: 'lukmanul.hakim@al-multazam.sch.id' },
    // SMP Grade IX
    { name: 'IX-A', gradeName: 'IX', homeroom2025: 'halimah.sadiyah@al-multazam.sch.id', homeroom2024: 'farhan.hakim@al-multazam.sch.id' },
    { name: 'IX-B', gradeName: 'IX', homeroom2025: 'ridwan.kamiluddin@al-multazam.sch.id', homeroom2024: 'halimah.sadiyah@al-multazam.sch.id' },
    { name: 'IX-C', gradeName: 'IX', homeroom2025: 'nisa.rahmawati@al-multazam.sch.id', homeroom2024: 'ridwan.kamiluddin@al-multazam.sch.id' },
    // SMA Grade X
    { name: 'X-A', gradeName: 'X', homeroom2025: 'walikelas@al-multazam.sch.id', homeroom2024: 'nurul.hidayah@al-multazam.sch.id' },
    { name: 'X-B', gradeName: 'X', homeroom2025: 'yulia.citra@al-multazam.sch.id', homeroom2024: 'walikelas@al-multazam.sch.id' },
    { name: 'X-C', gradeName: 'X', homeroom2025: 'nurul.hidayah@al-multazam.sch.id', homeroom2024: 'taufiq.hidayatullah@al-multazam.sch.id' },
    // SMA Grade XI
    { name: 'XI-A', gradeName: 'XI', homeroom2025: 'nabila.syakieb@al-multazam.sch.id', homeroom2024: 'walikelas@al-multazam.sch.id' },
    { name: 'XI-B', gradeName: 'XI', homeroom2025: 'budi.santoso@al-multazam.sch.id', homeroom2024: 'budi.santoso@al-multazam.sch.id' },
    { name: 'XI-C', gradeName: 'XI', homeroom2025: 'taufiq.hidayatullah@al-multazam.sch.id', homeroom2024: 'yulia.citra@al-multazam.sch.id' },
    // SMA Grade XII
    { name: 'XII-A', gradeName: 'XII', homeroom2025: 'zaki.mubarak@al-multazam.sch.id', homeroom2024: 'budi.santoso@al-multazam.sch.id' },
    { name: 'XII-B', gradeName: 'XII', homeroom2025: 'salman.alfarisi@al-multazam.sch.id', homeroom2024: 'nurul.hidayah@al-multazam.sch.id' },
    { name: 'XII-C', gradeName: 'XII', homeroom2025: 'maryam.qonita@al-multazam.sch.id', homeroom2024: 'salman.alfarisi@al-multazam.sch.id' },
  ]

  const allClassNames = classSpecs.map((c) => c.name)
  const smpClassNames = classSpecs
    .filter((c) => ['VII', 'VIII', 'IX'].includes(c.gradeName))
    .map((c) => c.name)
  const smaClassNames = classSpecs
    .filter((c) => ['X', 'XI', 'XII'].includes(c.gradeName))
    .map((c) => c.name)

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
  // gurubk@al-multazam.sch.id is assigned ALL 18 classes so the main account sees 100% of data.
  // Secondary BK accounts are scoped by level/grade for testing scoping.
  const counselorAssignmentsSpec = [
    {
      email: 'gurubk@al-multazam.sch.id',
      academicYear: '2025/2026',
      classNames: allClassNames,
    },
    {
      email: 'gurubk@al-multazam.sch.id',
      academicYear: '2024/2025',
      classNames: allClassNames,
    },
    {
      email: 'siti.aisyah.bk@al-multazam.sch.id',
      academicYear: '2025/2026',
      classNames: smpClassNames,
    },
    {
      email: 'rizky.pratama.bk@al-multazam.sch.id',
      academicYear: '2025/2026',
      classNames: smaClassNames,
    },
    {
      email: 'dewi.kartika.bk@al-multazam.sch.id',
      academicYear: '2025/2026',
      classNames: ['IX-A', 'IX-B', 'IX-C', 'XII-A', 'XII-B', 'XII-C'],
    },
    {
      email: 'fajar.nugroho.bk@al-multazam.sch.id',
      academicYear: '2025/2026',
      classNames: ['VII-A', 'VII-B', 'VII-C', 'X-A', 'X-B', 'X-C'],
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

  // 5. Seed Large-Scale Realistic Students across all 18 Classes + Alumni + Transferred
  const [existingExistingNisnRows]: any = await queryInterface.sequelize.query(
    `SELECT nisn FROM user_details`
  )
  const existingNisnSet = new Set<string>(
    (existingExistingNisnRows || []).map((r: any) => String(r.nisn))
  )

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
    past2GradeName?: string
    past2ClassName?: string
    status?: 'aktif' | 'lulus' | 'pindah'
    graduationYear?: string | null
    srqYesCount?: number // out of 20 (>= 6 is risk)
    sdqPattern?: 'normal' | 'borderline' | 'abnormal' | null
    isAssisted?: boolean
    daysAgo?: number
  }

  const maleFirstNames = [
    'Muhammad', 'Ahmad', 'Rizky', 'Naufal', 'Fikri', 'Dimas', 'Rafi', 'Alif',
    'Fadhil', 'Bagas', 'Faris', 'Reza', 'Ilham', 'Lutfi', 'Iqbal', 'Arkananta',
    'Hafiz', 'Gilang', 'Rayhan', 'Azkaidan', 'Danish', 'Nizam', 'Dzaky', 'Rizwan',
    'Zaidan', 'Faiq', 'Haikal', 'Syafiq', 'Gibran', 'Farel', 'Daffa', 'Bintang',
    'Akmal', 'Zaki', 'Fauzan', 'Rasyid', 'Salman', 'Hamzah', 'Umar', 'Ammar',
  ]
  const maleMiddleNames = [
    'Zaki', 'Rizqullah', 'Haikal', 'Aditya', 'Ahmad', 'Rahman', 'Akbar', 'Satrio',
    'Daffa', 'Pahlevi', 'Kurniawan', 'Hakim', 'Maulana', 'Firdaus', 'Abdurrahman',
    'Prasetyo', 'Fadhlurrahman', 'Putra', 'Faeyza', 'Althaf', 'Almair', 'Kamil',
    'Pratama', 'Hidayat', 'Saputra', 'Wibowo', 'Nugraha', 'Ramadhan', 'Syahputra', 'Siddiq',
  ]
  const maleLastNames = [
    'Al-Fatih', 'Pratama', 'Maulana', 'Saputra', 'Baihaqi', 'Hakim', 'Nugraha', 'Wibowo',
    'Hidayat', 'Ramadhan', 'Putra', 'Syahputra', 'Siddiq', 'Al-Farisi', 'Adi', 'Alfarizqi',
    'Jamil', 'Wijaya', 'Santoso', 'Kusuma', 'Mubarok', 'Muttaqin', 'Hidayatullah', 'Rabbani',
  ]

  const femaleFirstNames = [
    'Aisyah', 'Zahra', 'Nabila', 'Salma', 'Keisya', 'Yasmin', 'Hana', 'Intan',
    'Anisa', 'Tiara', 'Dinda', 'Shafira', 'Mutia', 'Alya', 'Nadira', 'Kayla',
    'Aqila', 'Khaira', 'Nadia', 'Salsabila', 'Syifa', 'Fathiya', 'Khansa', 'humaira',
    'Nayla', 'Aulia', 'Rahma', 'Putri', 'Laila', 'Rania', 'Hasna', 'Kamilia',
    'Najwa', 'Safira', 'Qonita', 'Inayah', 'balqis', 'Farah', 'Nadhifa', 'tazkia',
  ]
  const femaleMiddleNames = [
    'Putri', 'Amalia', 'Syifa', 'Nadia', 'Maharani', 'Aulia', 'Sofia', 'Permata',
    'Fitri', 'Kusuma', 'Ayu', 'Nur', 'Rahma', 'Khansa', 'Syafiqah', 'Zahratun',
    'Lubna', 'Hasana', 'Fathiya', 'Salsabila', 'kinanti', 'Wardhani', 'Lestari', 'Azizah',
  ]
  const femaleLastNames = [
    'Ramadhani', 'Khairunnisa', 'Azzahra', 'Fitriani', 'Putri', 'Rahma', 'Salsabila', 'Sari',
    'Oktaviani', 'Wardhani', 'Lestari', 'Azizah', 'Rahmawati', 'Humaira', 'Kinanti', 'Husna',
    'Nisa', 'Asshofa', 'Qonita', 'Mardhiyah', 'Sakinah', 'Sholihah', 'Kamilah', 'Nabila',
  ]

  function generateStudentName(gender: 'm' | 'f', index: number): string {
    if (gender === 'm') {
      const f = maleFirstNames[index % maleFirstNames.length]
      const m = maleMiddleNames[(index * 3 + 1) % maleMiddleNames.length]
      const l = maleLastNames[(index * 7 + 2) % maleLastNames.length]
      return `${f} ${m} ${l}`
    } else {
      const f = femaleFirstNames[index % femaleFirstNames.length]
      const fCap = f.charAt(0).toUpperCase() + f.slice(1)
      const m = femaleMiddleNames[(index * 5 + 2) % femaleMiddleNames.length]
      const mCap = m.charAt(0).toUpperCase() + m.slice(1)
      const l = femaleLastNames[(index * 7 + 3) % femaleLastNames.length]
      return `${fCap} ${mCap} ${l}`
    }
  }

  // Keep the initial 42 well-known students so nothing breaks, and add 223 more across all 18 classes
  const studentsSpec: SeedStudentSpec[] = [
    // X-A
    { nisn: '0085010001', nis: '252610001', fullname: 'Muhammad Zaki Al-Fatih', gender: 'm', birthDate: '2010-03-14', phone: '081234560001', entryYear: '2025', gradeName: 'X', className: 'X-A', srqYesCount: 2, sdqPattern: 'normal', daysAgo: 12 },
    { nisn: '0085010002', nis: '252610002', fullname: 'Aisyah Putri Ramadhani', gender: 'f', birthDate: '2010-07-22', phone: '081234560002', entryYear: '2025', gradeName: 'X', className: 'X-A', srqYesCount: 8, sdqPattern: 'abnormal', daysAgo: 10 },
    { nisn: '0085010003', nis: '252610003', fullname: 'Naufal Rizqullah Pratama', gender: 'm', birthDate: '2010-01-19', phone: '081234560003', entryYear: '2025', gradeName: 'X', className: 'X-A', srqYesCount: 1, sdqPattern: 'normal', daysAgo: 9 },
    { nisn: '0085010004', nis: '252610004', fullname: 'Zahra Amalia Khairunnisa', gender: 'f', birthDate: '2010-05-08', phone: '081234560004', entryYear: '2025', gradeName: 'X', className: 'X-A', srqYesCount: 7, sdqPattern: 'borderline', isAssisted: true, daysAgo: 8 },
    { nisn: '0085010005', nis: '252610005', fullname: 'Fikri Haikal Maulana', gender: 'm', birthDate: '2010-11-30', phone: '081234560005', entryYear: '2025', gradeName: 'X', className: 'X-A', srqYesCount: 3, sdqPattern: 'normal', daysAgo: 7 },
    { nisn: '0085010006', nis: '252610006', fullname: 'Nabila Syifa Azzahra', gender: 'f', birthDate: '2010-09-12', phone: '081234560006', entryYear: '2025', gradeName: 'X', className: 'X-A', daysAgo: 6 },

    // X-B
    { nisn: '0085010007', nis: '252610007', fullname: 'Dimas Aditya Saputra', gender: 'm', birthDate: '2010-04-05', phone: '081234560007', entryYear: '2025', gradeName: 'X', className: 'X-B', srqYesCount: 9, sdqPattern: 'abnormal', daysAgo: 15 },
    { nisn: '0085010008', nis: '252610008', fullname: 'Salma Nadia Fitriani', gender: 'f', birthDate: '2010-08-17', phone: '081234560008', entryYear: '2025', gradeName: 'X', className: 'X-B', srqYesCount: 2, sdqPattern: 'normal', daysAgo: 14 },
    { nisn: '0085010009', nis: '252610009', fullname: 'Rafi Ahmad Baihaqi', gender: 'm', birthDate: '2010-02-25', phone: '081234560009', entryYear: '2025', gradeName: 'X', className: 'X-B', srqYesCount: 4, sdqPattern: 'normal', daysAgo: 13 },
    { nisn: '0085010010', nis: '252610010', fullname: 'Keisya Maharani Putri', gender: 'f', birthDate: '2010-06-11', phone: '081234560010', entryYear: '2025', gradeName: 'X', className: 'X-B', srqYesCount: 6, sdqPattern: 'borderline', daysAgo: 11 },
    { nisn: '0085010011', nis: '252610011', fullname: 'Alif Rahman Hakim', gender: 'm', birthDate: '2010-12-03', phone: '081234560011', entryYear: '2025', gradeName: 'X', className: 'X-B', daysAgo: 10 },

    // X-C
    { nisn: '0085010012', nis: '252610012', fullname: 'Fadhil Akbar Nugraha', gender: 'm', birthDate: '2010-03-29', phone: '081234560012', entryYear: '2025', gradeName: 'X', className: 'X-C', srqYesCount: 1, sdqPattern: 'normal', daysAgo: 20 },
    { nisn: '0085010013', nis: '252610013', fullname: 'Yasmin Aulia Rahma', gender: 'f', birthDate: '2010-10-15', phone: '081234560013', entryYear: '2025', gradeName: 'X', className: 'X-C', srqYesCount: 7, sdqPattern: 'borderline', daysAgo: 18 },
    { nisn: '0085010014', nis: '252610014', fullname: 'Bagas Satrio Wibowo', gender: 'm', birthDate: '2010-05-20', phone: '081234560014', entryYear: '2025', gradeName: 'X', className: 'X-C', srqYesCount: 3, sdqPattern: 'normal', daysAgo: 17 },
    { nisn: '0085010015', nis: '252610015', fullname: 'Hana Sofia Salsabila', gender: 'f', birthDate: '2010-07-07', phone: '081234560015', entryYear: '2025', gradeName: 'X', className: 'X-C', srqYesCount: 2, sdqPattern: 'normal', daysAgo: 16 },

    // XI-A
    { nisn: '0084010016', nis: '242510016', fullname: 'Faris Daffa Hidayat', gender: 'm', birthDate: '2009-02-14', phone: '081234560016', entryYear: '2024', gradeName: 'XI', className: 'XI-A', pastGradeName: 'X', pastClassName: 'X-A', srqYesCount: 2, sdqPattern: 'normal', daysAgo: 25 },
    { nisn: '0084010017', nis: '242510017', fullname: 'Intan Permata Sari', gender: 'f', birthDate: '2009-06-21', phone: '081234560017', entryYear: '2024', gradeName: 'XI', className: 'XI-A', pastGradeName: 'X', pastClassName: 'X-A', srqYesCount: 10, sdqPattern: 'abnormal', isAssisted: true, daysAgo: 22 },
    { nisn: '0084010018', nis: '242510018', fullname: 'Reza Pahlevi Ramadhan', gender: 'm', birthDate: '2009-09-09', phone: '081234560018', entryYear: '2024', gradeName: 'XI', className: 'XI-A', pastGradeName: 'X', pastClassName: 'X-A', srqYesCount: 3, sdqPattern: 'normal', daysAgo: 21 },
    { nisn: '0084010019', nis: '242510019', fullname: 'Anisa Fitri Oktaviani', gender: 'f', birthDate: '2009-10-28', phone: '081234560019', entryYear: '2024', gradeName: 'XI', className: 'XI-A', pastGradeName: 'X', pastClassName: 'X-B', srqYesCount: 6, sdqPattern: 'borderline', daysAgo: 19 },
    { nisn: '0084010020', nis: '242510020', fullname: 'Ilham Kurniawan Putra', gender: 'm', birthDate: '2009-01-12', phone: '081234560020', entryYear: '2024', gradeName: 'XI', className: 'XI-A', pastGradeName: 'X', pastClassName: 'X-B', srqYesCount: 1, sdqPattern: 'normal', daysAgo: 18 },

    // XI-B
    { nisn: '0084010021', nis: '242510021', fullname: 'Lutfi Hakim Syahputra', gender: 'm', birthDate: '2009-04-18', phone: '081234560021', entryYear: '2024', gradeName: 'XI', className: 'XI-B', pastGradeName: 'X', pastClassName: 'X-B', srqYesCount: 4, sdqPattern: 'normal', daysAgo: 28 },
    { nisn: '0084010022', nis: '242510022', fullname: 'Tiara Kusuma Wardhani', gender: 'f', birthDate: '2009-08-03', phone: '081234560022', entryYear: '2024', gradeName: 'XI', className: 'XI-B', pastGradeName: 'X', pastClassName: 'X-C', srqYesCount: 8, sdqPattern: 'abnormal', daysAgo: 27 },
    { nisn: '0084010023', nis: '242510023', fullname: 'Iqbal Maulana Siddiq', gender: 'm', birthDate: '2009-11-25', phone: '081234560023', entryYear: '2024', gradeName: 'XI', className: 'XI-B', pastGradeName: 'X', pastClassName: 'X-C', srqYesCount: 2, sdqPattern: 'normal', daysAgo: 26 },
    { nisn: '0084010024', nis: '242510024', fullname: 'Dinda Ayu Lestari', gender: 'f', birthDate: '2009-03-07', phone: '081234560024', entryYear: '2024', gradeName: 'XI', className: 'XI-B', pastGradeName: 'X', pastClassName: 'X-C', daysAgo: 24 },

    // XII-A
    { nisn: '0083010025', nis: '232410025', fullname: 'Arkananta Firdaus', gender: 'm', birthDate: '2008-05-16', phone: '081234560025', entryYear: '2023', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XI', pastClassName: 'XI-A', past2GradeName: 'X', past2ClassName: 'X-A', srqYesCount: 9, sdqPattern: 'abnormal', daysAgo: 30 },
    { nisn: '0083010026', nis: '232410026', fullname: 'Shafira Nur Azizah', gender: 'f', birthDate: '2008-09-23', phone: '081234560026', entryYear: '2023', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XI', pastClassName: 'XI-A', past2GradeName: 'X', past2ClassName: 'X-A', srqYesCount: 3, sdqPattern: 'normal', daysAgo: 29 },
    { nisn: '0083010027', nis: '232410027', fullname: 'Hafiz Abdurrahman', gender: 'm', birthDate: '2008-01-30', phone: '081234560027', entryYear: '2023', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XI', pastClassName: 'XI-A', past2GradeName: 'X', past2ClassName: 'X-A', srqYesCount: 7, sdqPattern: 'borderline', daysAgo: 28 },
    { nisn: '0083010028', nis: '232410028', fullname: 'Mutia Rahmawati', gender: 'f', birthDate: '2008-07-14', phone: '081234560028', entryYear: '2023', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XI', pastClassName: 'XI-A', past2GradeName: 'X', past2ClassName: 'X-A', srqYesCount: 2, sdqPattern: 'normal', daysAgo: 27 },
    { nisn: '0083010029', nis: '232410029', fullname: 'Gilang Prasetyo Adi', gender: 'm', birthDate: '2008-12-19', phone: '081234560029', entryYear: '2023', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XI', pastClassName: 'XI-B', past2GradeName: 'X', past2ClassName: 'X-B', srqYesCount: 1, sdqPattern: 'normal', daysAgo: 26 },

    // XII-B
    { nisn: '0083010030', nis: '232410030', fullname: 'Alya Khansa Humaira', gender: 'f', birthDate: '2008-04-02', phone: '081234560030', entryYear: '2023', gradeName: 'XII', className: 'XII-B', pastGradeName: 'XI', pastClassName: 'XI-B', past2GradeName: 'X', past2ClassName: 'X-B', srqYesCount: 6, sdqPattern: 'borderline', daysAgo: 35 },
    { nisn: '0083010031', nis: '232410031', fullname: 'Rayhan Fadhlurrahman', gender: 'm', birthDate: '2008-08-11', phone: '081234560031', entryYear: '2023', gradeName: 'XII', className: 'XII-B', pastGradeName: 'XI', pastClassName: 'XI-B', past2GradeName: 'X', past2ClassName: 'X-B', srqYesCount: 2, sdqPattern: 'normal', daysAgo: 34 },
    { nisn: '0083010032', nis: '232410032', fullname: 'Nadira Putri Kinanti', gender: 'f', birthDate: '2008-10-05', phone: '081234560032', entryYear: '2023', gradeName: 'XII', className: 'XII-B', pastGradeName: 'XI', pastClassName: 'XI-B', past2GradeName: 'X', past2ClassName: 'X-B', srqYesCount: 3, sdqPattern: 'normal', daysAgo: 33 },

    // SMP initial students
    { nisn: '0115010033', nis: '252607001', fullname: 'Azkaidan Putra Pratama', gender: 'm', birthDate: '2013-02-10', phone: '081234560033', entryYear: '2025', gradeName: 'VII', className: 'VII-A', srqYesCount: 2, sdqPattern: 'normal', daysAgo: 5 },
    { nisn: '0115010034', nis: '252607002', fullname: 'Kayla Syafiqah Husna', gender: 'f', birthDate: '2013-06-18', phone: '081234560034', entryYear: '2025', gradeName: 'VII', className: 'VII-A', srqYesCount: 7, sdqPattern: 'borderline', isAssisted: true, daysAgo: 4 },
    { nisn: '0115010035', nis: '252607003', fullname: 'Danish Faeyza Alfarizqi', gender: 'm', birthDate: '2013-09-27', phone: '081234560035', entryYear: '2025', gradeName: 'VII', className: 'VII-A', srqYesCount: 1, sdqPattern: 'normal', daysAgo: 3 },
    { nisn: '0104010036', nis: '242508001', fullname: 'Nizam Althafurrahman', gender: 'm', birthDate: '2012-03-15', phone: '081234560036', entryYear: '2024', gradeName: 'VIII', className: 'VIII-A', pastGradeName: 'VII', pastClassName: 'VII-A', srqYesCount: 3, sdqPattern: 'normal', daysAgo: 15 },
    { nisn: '0104010037', nis: '242508002', fullname: 'Aqila Zahratunnisa', gender: 'f', birthDate: '2012-11-04', phone: '081234560037', entryYear: '2024', gradeName: 'VIII', className: 'VIII-A', pastGradeName: 'VII', pastClassName: 'VII-A', srqYesCount: 8, sdqPattern: 'abnormal', daysAgo: 14 },
    { nisn: '0093010038', nis: '232409001', fullname: 'Dzaky Almair Jamil', gender: 'm', birthDate: '2011-01-22', phone: '081234560038', entryYear: '2023', gradeName: 'IX', className: 'IX-A', pastGradeName: 'VIII', pastClassName: 'VIII-A', past2GradeName: 'VII', past2ClassName: 'VII-A', srqYesCount: 2, sdqPattern: 'normal', daysAgo: 20 },
    { nisn: '0093010039', nis: '232409002', fullname: 'Khaira Lubna Asshofa', gender: 'f', birthDate: '2011-07-30', phone: '081234560039', entryYear: '2023', gradeName: 'IX', className: 'IX-A', pastGradeName: 'VIII', pastClassName: 'VIII-A', past2GradeName: 'VII', past2ClassName: 'VII-A', srqYesCount: 6, sdqPattern: 'borderline', daysAgo: 19 },

    // Graduated Alumni
    { nisn: '0072010040', nis: '222310040', fullname: 'Rizwan Kamil Al-Farisi', gender: 'm', birthDate: '2007-04-12', phone: '081234560040', entryYear: '2022', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XII', pastClassName: 'XII-A', status: 'lulus', graduationYear: '2025' },
    { nisn: '0072010041', nis: '222310041', fullname: 'Nadia Hasana Putri', gender: 'f', birthDate: '2007-08-29', phone: '081234560041', entryYear: '2022', gradeName: 'XII', className: 'XII-A', pastGradeName: 'XII', pastClassName: 'XII-A', status: 'lulus', graduationYear: '2025' },

    // Transferred Student
    { nisn: '0084010042', nis: '242510042', fullname: 'Aldi Pratama Wijaya', gender: 'm', birthDate: '2009-05-19', phone: '081234560042', entryYear: '2024', gradeName: 'XI', className: 'XI-B', pastGradeName: 'X', pastClassName: 'X-B', status: 'pindah' },
  ]

  // Count how many active students each class already has in studentsSpec
  const activeCountByClass = new Map<string, number>()
  for (const s of studentsSpec) {
    if (!s.status || s.status === 'aktif') {
      activeCountByClass.set(
        s.className,
        (activeCountByClass.get(s.className) || 0) + 1
      )
    }
  }

  // Top up every single one of the 18 classes to 13 active students each (18 * 13 = 234 active students)
  const gradeConfig: Record<
    string,
    {
      birthYear: number
      entryYear: string
      nisPrefix: string
      nisnPrefix: string
      pastGradeName?: string
      past2GradeName?: string
    }
  > = {
    VII: { birthYear: 2013, entryYear: '2025', nisPrefix: '252607', nisnPrefix: '0135' },
    VIII: { birthYear: 2012, entryYear: '2024', nisPrefix: '242508', nisnPrefix: '0124', pastGradeName: 'VII' },
    IX: { birthYear: 2011, entryYear: '2023', nisPrefix: '232409', nisnPrefix: '0113', pastGradeName: 'VIII', past2GradeName: 'VII' },
    X: { birthYear: 2010, entryYear: '2025', nisPrefix: '252610', nisnPrefix: '0105' },
    XI: { birthYear: 2009, entryYear: '2024', nisPrefix: '242511', nisnPrefix: '0094', pastGradeName: 'X' },
    XII: { birthYear: 2008, entryYear: '2023', nisPrefix: '232412', nisnPrefix: '0083', pastGradeName: 'XI', past2GradeName: 'X' },
  }

  let seq = 101
  for (const cSpec of classSpecs) {
    const currentCount = activeCountByClass.get(cSpec.name) || 0
    const targetCount = 13
    const needed = Math.max(0, targetCount - currentCount)
    const gConf = gradeConfig[cSpec.gradeName]
    const sectionSuffix = cSpec.name.split('-')[1] || 'A' // 'A', 'B', or 'C'

    for (let i = 0; i < needed; i++) {
      const idx = seq++
      const gender: 'm' | 'f' = idx % 2 === 0 ? 'm' : 'f'
      const fullname = generateStudentName(gender, idx)
      const month = String((idx % 12) + 1).padStart(2, '0')
      const day = String((idx % 27) + 1).padStart(2, '0')
      const birthDate = `${gConf.birthYear}-${month}-${day}`
      const nisn = `${gConf.nisnPrefix}${String(idx).padStart(6, '0')}`
      const nis = `${gConf.nisPrefix}${String(idx).padStart(3, '0')}`
      const phone = `0813${String(20000000 + idx)}`

      // ~92% of active students submit questionnaires; ~27% of respondents are at-risk
      const hasSubmitted = idx % 12 !== 0
      const isRiskStudent = hasSubmitted && (idx % 4 === 0 || idx % 9 === 0)
      const srqYesCount = !hasSubmitted
        ? undefined
        : isRiskStudent
          ? 6 + (idx % 7) // 6..12 (at-risk)
          : idx % 5 // 0..4 (stable)

      const sdqPattern: 'normal' | 'borderline' | 'abnormal' | null = !hasSubmitted
        ? null
        : isRiskStudent
          ? idx % 2 === 0
            ? 'abnormal'
            : 'borderline'
          : 'normal'

      const isAssisted = isRiskStudent && idx % 3 === 0

      studentsSpec.push({
        nisn,
        nis,
        fullname,
        gender,
        birthDate,
        phone,
        entryYear: gConf.entryYear,
        gradeName: cSpec.gradeName,
        className: cSpec.name,
        pastGradeName: gConf.pastGradeName,
        pastClassName: gConf.pastGradeName
          ? `${gConf.pastGradeName}-${sectionSuffix}`
          : undefined,
        past2GradeName: gConf.past2GradeName,
        past2ClassName: gConf.past2GradeName
          ? `${gConf.past2GradeName}-${sectionSuffix}`
          : undefined,
        status: 'aktif',
        srqYesCount,
        sdqPattern,
        isAssisted,
        daysAgo: (idx % 90) + 1,
      })
    }
  }

  // Add 19 More Alumni (Lulus 2024 & 2025) across XII-A..C and IX-A..C
  const alumniClasses = ['XII-A', 'XII-B', 'XII-C', 'IX-A', 'IX-B', 'IX-C']
  for (let i = 0; i < 19; i++) {
    const idx = seq++
    const gender: 'm' | 'f' = idx % 2 === 0 ? 'm' : 'f'
    const cName = alumniClasses[i % alumniClasses.length]
    const gName = cName.startsWith('XII') ? 'XII' : 'IX'
    const section = cName.split('-')[1]
    const gradYear = i % 2 === 0 ? '2025' : '2024'
    const entryYear = gName === 'XII' ? (gradYear === '2025' ? '2022' : '2021') : (gradYear === '2025' ? '2022' : '2021')
    const birthYear = gName === 'XII' ? 2007 : 2010

    studentsSpec.push({
      nisn: `0071${String(idx).padStart(6, '0')}`,
      nis: `222399${String(idx).padStart(3, '0')}`,
      fullname: generateStudentName(gender, idx + 50),
      gender,
      birthDate: `${birthYear}-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 27) + 1).padStart(2, '0')}`,
      phone: `0813${String(30000000 + idx)}`,
      entryYear,
      gradeName: gName,
      className: cName,
      pastGradeName: gName,
      pastClassName: cName,
      past2GradeName: gName === 'XII' ? 'XI' : 'VIII',
      past2ClassName: `${gName === 'XII' ? 'XI' : 'VIII'}-${section}`,
      status: 'lulus',
      graduationYear: gradYear,
      srqYesCount: idx % 5 === 0 ? 7 : 2,
      sdqPattern: idx % 5 === 0 ? 'borderline' : 'normal',
      daysAgo: 150 + (i * 3),
    })
  }

  // Add 9 More Transferred ('pindah') Students across various grades
  const pindahClasses = ['VII-B', 'VIII-B', 'VIII-C', 'X-B', 'X-C', 'XI-A', 'XI-C', 'XII-B', 'XII-C']
  for (let i = 0; i < pindahClasses.length; i++) {
    const idx = seq++
    const gender: 'm' | 'f' = idx % 2 === 0 ? 'm' : 'f'
    const cName = pindahClasses[i]
    const gName = cName.split('-')[0]
    const gConf = gradeConfig[gName]

    studentsSpec.push({
      nisn: `0099${String(idx).padStart(6, '0')}`,
      nis: `242588${String(idx).padStart(3, '0')}`,
      fullname: generateStudentName(gender, idx + 120),
      gender,
      birthDate: `${gConf.birthYear}-${String((idx % 12) + 1).padStart(2, '0')}-15`,
      phone: `0813${String(40000000 + idx)}`,
      entryYear: gConf.entryYear,
      gradeName: gName,
      className: cName,
      pastGradeName: gConf.pastGradeName,
      pastClassName: gConf.pastGradeName ? `${gConf.pastGradeName}-B` : undefined,
      status: 'pindah',
    })
  }

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

  const parsedSdqConfig =
    sdqQuestionnaire?.scoringConfig &&
    typeof sdqQuestionnaire.scoringConfig === 'string'
      ? JSON.parse(sdqQuestionnaire.scoringConfig)
      : sdqQuestionnaire?.scoringConfig

  const parsedSdqQuestions = (sdqQuestions || []).map((q: any) => ({
    ...q,
    scoreOverrides:
      typeof q.scoreOverrides === 'string'
        ? JSON.parse(q.scoreOverrides)
        : q.scoreOverrides,
  }))

  const parsedSrqConfig =
    srqQuestionnaire?.scoringConfig &&
    typeof srqQuestionnaire.scoringConfig === 'string'
      ? JSON.parse(srqQuestionnaire.scoringConfig)
      : srqQuestionnaire?.scoringConfig

  const mainCounselorId = teacherIdByEmail.get('gurubk@al-multazam.sch.id')!
  const mainWaliId = teacherIdByEmail.get('walikelas@al-multazam.sch.id')!

  // Batch arrays for fast insertion
  const usersToInsert: Record<string, any>[] = []
  const rolesToInsert: Record<string, any>[] = []
  const detailsToInsert: Record<string, any>[] = []
  const historiesToInsert: Record<string, any>[] = []
  const submissionsToInsert: Record<string, any>[] = []
  const answersToInsert: Record<string, any>[] = []

  for (const s of studentsSpec) {
    if (existingNisnSet.has(s.nisn)) {
      continue
    }
    existingNisnSet.add(s.nisn)

    const gradeId = gradeByName.get(s.gradeName)
    const classId = classIdByName.get(s.className)
    if (!gradeId || !classId) continue

    const studentUserId = uuidv4()
    const studentEmail = `${s.nisn}@siswa.al-multazam.sch.id`
    const studentStatus = s.status || 'aktif'
    const academicYear =
      studentStatus === 'lulus'
        ? s.graduationYear === '2024'
          ? '2023/2024'
          : '2024/2025'
        : '2025/2026'

    const submissionDate = new Date(
      now.getTime() - (s.daysAgo ?? 7) * 24 * 60 * 60 * 1000
    )

    usersToInsert.push({
      id: studentUserId,
      fullname: s.fullname,
      email: studentEmail,
      password: defaultPasswordHash,
      createdAt: now,
      updatedAt: now,
    })

    rolesToInsert.push({
      id: uuidv4(),
      UserId: studentUserId,
      RoleId: RoleId.siswa,
      createdAt: now,
      updatedAt: now,
    })

    detailsToInsert.push({
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
    })

    // Past academic year history (2024/2025)
    if (s.pastGradeName && s.pastClassName) {
      const pastGradeId = gradeByName.get(s.pastGradeName)
      const pastClassId = classIdByName.get(s.pastClassName)
      const pastSpec = classSpecs.find((cs) => cs.name === s.pastClassName)
      const pastHomeroomId = pastSpec
        ? teacherIdByEmail.get(pastSpec.homeroom2024) ?? mainWaliId
        : mainWaliId

      if (pastGradeId && pastClassId) {
        historiesToInsert.push({
          id: uuidv4(),
          UserId: studentUserId,
          academicYear: '2024/2025',
          GradeId: pastGradeId,
          ClassId: pastClassId,
          homeroomTeacherId: pastHomeroomId,
          notes:
            studentStatus === 'lulus'
              ? `Lulus Tahun Ajaran ${academicYear}`
              : 'Kenaikan kelas reguler TP 2024/2025',
          createdAt: new Date('2025-06-20T08:00:00Z'),
          updatedAt: new Date('2025-06-20T08:00:00Z'),
        })
      }
    }

    // 2 years ago academic history (2023/2024)
    if (s.past2GradeName && s.past2ClassName) {
      const past2GradeId = gradeByName.get(s.past2GradeName)
      const past2ClassId = classIdByName.get(s.past2ClassName)
      const past2Spec = classSpecs.find((cs) => cs.name === s.past2ClassName)
      const past2HomeroomId = past2Spec
        ? teacherIdByEmail.get(past2Spec.homeroom2024) ?? mainWaliId
        : mainWaliId

      if (past2GradeId && past2ClassId) {
        historiesToInsert.push({
          id: uuidv4(),
          UserId: studentUserId,
          academicYear: '2023/2024',
          GradeId: past2GradeId,
          ClassId: past2ClassId,
          homeroomTeacherId: past2HomeroomId,
          notes: 'Kenaikan kelas reguler TP 2023/2024',
          createdAt: new Date('2024-06-20T08:00:00Z'),
          updatedAt: new Date('2024-06-20T08:00:00Z'),
        })
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
        scoringConfig: parsedSrqConfig,
        questions: srqQuestions,
        answers,
      })

      const submissionId = uuidv4()
      const submittedBy = s.isAssisted ? mainCounselorId : studentUserId

      submissionsToInsert.push({
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
        createdAt: submissionDate,
        updatedAt: submissionDate,
      })

      for (const ans of evaluated.answers) {
        answersToInsert.push({
          id: uuidv4(),
          QuestionnaireSubmissionId: submissionId,
          QuestionnaireQuestionId: ans.QuestionId,
          answerValue: ans.answerValue,
          answerLabel: ans.answerLabel,
          score: ans.score,
          createdAt: submissionDate,
          updatedAt: submissionDate,
        })
      }
    }

    // Create SDQ submission if specified
    if (sdqQuestionnaire && parsedSdqQuestions.length === 25 && s.sdqPattern) {
      const answers = parsedSdqQuestions.map((q: any, idx: number) => {
        const isReverse = Boolean(q.scoreOverrides)
        const isProsocial = q.scoringCategory === 'prosocial'

        if (s.sdqPattern === 'normal') {
          if (isProsocial)
            return { QuestionId: q.id, answerValue: 'certainly_true' }
          if (isReverse)
            return { QuestionId: q.id, answerValue: 'certainly_true' }
          return {
            QuestionId: q.id,
            answerValue: idx % 7 === 0 ? 'somewhat_true' : 'not_true',
          }
        } else if (s.sdqPattern === 'borderline') {
          if (isProsocial)
            return { QuestionId: q.id, answerValue: 'somewhat_true' }
          if (isReverse)
            return { QuestionId: q.id, answerValue: 'somewhat_true' }
          return {
            QuestionId: q.id,
            answerValue: idx % 2 === 0 ? 'somewhat_true' : 'not_true',
          }
        } else {
          // abnormal
          if (isProsocial)
            return { QuestionId: q.id, answerValue: 'somewhat_true' }
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
        scoringConfig: parsedSdqConfig,
        questions: parsedSdqQuestions,
        answers,
      })

      const submissionId = uuidv4()
      const submittedBy = s.isAssisted ? mainCounselorId : studentUserId

      submissionsToInsert.push({
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
        createdAt: submissionDate,
        updatedAt: submissionDate,
      })

      for (const ans of evaluated.answers) {
        answersToInsert.push({
          id: uuidv4(),
          QuestionnaireSubmissionId: submissionId,
          QuestionnaireQuestionId: ans.QuestionId,
          answerValue: ans.answerValue,
          answerLabel: ans.answerLabel,
          score: ans.score,
          createdAt: submissionDate,
          updatedAt: submissionDate,
        })
      }
    }
  }

  // Execute batched inserts
  await bulkInsertChunked(queryInterface, 'users', usersToInsert)
  await bulkInsertChunked(queryInterface, 'user_has_roles', rolesToInsert)
  await bulkInsertChunked(queryInterface, 'user_details', detailsToInsert)
  await bulkInsertChunked(
    queryInterface,
    'student_class_histories',
    historiesToInsert
  )
  await bulkInsertChunked(
    queryInterface,
    'questionnaire_submissions',
    submissionsToInsert
  )
  await bulkInsertChunked(
    queryInterface,
    'questionnaire_answers',
    answersToInsert,
    1000
  )

  // Ensure all seeded accounts (TU, teachers, students) share the consistent default password
  await queryInterface.sequelize.query(
    `UPDATE users SET password = :password WHERE email LIKE '%@al-multazam.sch.id' OR email LIKE '%@siswa.al-multazam.sch.id'`,
    { replacements: { password: defaultPasswordHash } }
  )
}

export async function down(
  queryInterface: QueryInterface,
  _Sequelize: typeof DataTypes
) {
  await queryInterface.sequelize.query(
    `DELETE FROM users WHERE email LIKE '%@siswa.al-multazam.sch.id'`
  )
}
