import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { nanoid } from 'nanoid'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataFile = path.join(__dirname, '..', 'data', 'attendance.json')

const defaultData = {
  users: [],
  classes: [],
  sessions: [],
  attendance: [],
}

const adapter = new JSONFile(dataFile)
export const db = new Low(adapter, defaultData)

export const initDb = async () => {
  await db.read()
  if (!db.data) {
    db.data = { ...defaultData }
  }
  await db.write()
}

export const seedTeacher = async (teacherId, password) => {
  await db.read()
  const existing = db.data.users.find((u) => u.id === teacherId)
  if (!existing) {
    db.data.users.push({
      id: teacherId,
      role: 'teacher',
      password,
      name: 'Teacher',
      roll: '',
      classId: '',
    })
    await db.write()
  }
}

export const getUserById = async (id) => {
  await db.read()
  return db.data.users.find((u) => u.id === id) || null
}

export const createClass = async (name) => {
  await db.read()
  const exists = db.data.classes.find((c) => c.name === name)
  if (exists) return exists
  const record = { id: nanoid(), name }
  db.data.classes.push(record)
  await db.write()
  return record
}

export const listClasses = async () => {
  await db.read()
  return db.data.classes
}

export const createStudent = async ({ id, password, name, roll, classId }) => {
  await db.read()
  const exists = db.data.users.find((u) => u.id === id)
  if (exists) {
    throw new Error('Student ID already exists')
  }
  const record = {
    id,
    role: 'student',
    password,
    name,
    roll,
    classId,
  }
  db.data.users.push(record)
  await db.write()
  return record
}

export const listStudentsByClass = async (classId) => {
  await db.read()
  return db.data.users.filter((u) => u.role === 'student' && u.classId === classId)
}

export const listStudentsWithAttendance = async (classId) => {
  await db.read()
  const students = db.data.users.filter(
    (u) => u.role === 'student' && u.classId === classId,
  )
  const sessions = db.data.sessions.filter((s) => s.classId === classId)
  const sessionIds = new Set(sessions.map((s) => s.id))
  const total = sessions.length
  const attendanceByStudent = new Map()
  db.data.attendance.forEach((record) => {
    if (!sessionIds.has(record.sessionId)) return
    const count = attendanceByStudent.get(record.studentId) ?? 0
    attendanceByStudent.set(record.studentId, count + 1)
  })
  return students.map((student) => {
    const present = attendanceByStudent.get(student.id) ?? 0
    const percentage = total ? Math.round((present / total) * 100) : 0
    return {
      ...student,
      attendance: { present, total, percentage },
    }
  })
}

export const openSession = async ({ classId, subject, timing }) => {
  await db.read()
  const active = db.data.sessions.find(
    (s) => s.classId === classId && s.status === 'open',
  )
  if (active) return active
  const record = {
    id: nanoid(),
    classId,
    subject,
    timing,
    date: new Date().toISOString().slice(0, 10),
    status: 'open',
    createdAt: new Date().toISOString(),
  }
  db.data.sessions.push(record)
  await db.write()
  return record
}

export const closeSession = async (sessionId) => {
  await db.read()
  const session = db.data.sessions.find((s) => s.id === sessionId)
  if (!session) return null
  session.status = 'closed'
  session.closedAt = new Date().toISOString()
  await db.write()
  return session
}

export const getActiveSession = async (classId) => {
  await db.read()
  return db.data.sessions.find(
    (s) => s.classId === classId && s.status === 'open',
  )
}

export const markAttendance = async ({ sessionId, studentId }) => {
  await db.read()
  const existing = db.data.attendance.find(
    (a) => a.sessionId === sessionId && a.studentId === studentId,
  )
  if (existing) return existing
  const record = {
    id: nanoid(),
    sessionId,
    studentId,
    timestamp: new Date().toISOString(),
  }
  db.data.attendance.push(record)
  await db.write()
  return record
}

export const listAttendanceBySession = async (sessionId) => {
  await db.read()
  return db.data.attendance.filter((a) => a.sessionId === sessionId)
}

export const listSessionsByClass = async (classId) => {
  await db.read()
  return db.data.sessions.filter((s) => s.classId === classId)
}

export const listAttendanceDetailed = async (sessionId) => {
  await db.read()
  const records = db.data.attendance.filter((a) => a.sessionId === sessionId)
  return records.map((record) => {
    const student = db.data.users.find((u) => u.id === record.studentId)
    return {
      ...record,
      student: student
        ? { id: student.id, name: student.name, roll: student.roll }
        : { id: record.studentId, name: 'Unknown', roll: '' },
    }
  })
}

export const listStudentAttendanceSummary = async (studentId) => {
  await db.read()
  const student = db.data.users.find((u) => u.id === studentId)
  if (!student || !student.classId) return []
  const sessions = db.data.sessions.filter((s) => s.classId === student.classId)
  const attendance = db.data.attendance.filter((a) => a.studentId === studentId)
  const attendanceSet = new Set(attendance.map((a) => a.sessionId))
  return sessions.map((session) => ({
    id: session.id,
    subject: session.subject,
    timing: session.timing,
    date: session.date,
    status: session.status,
    present: attendanceSet.has(session.id),
  }))
}

export const getStudentById = async (studentId) => {
  await db.read()
  return db.data.users.find((u) => u.id === studentId) || null
}
