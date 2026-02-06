import express from 'express'
import cors from 'cors'
import {
  createClass,
  createStudent,
  getActiveSession,
  getUserById,
  initDb,
  listAttendanceBySession,
  listAttendanceDetailed,
  listClasses,
  listSessionsByClass,
  listStudentAttendanceSummary,
  listStudentsByClass,
  listStudentsWithAttendance,
  markAttendance,
  openSession,
  closeSession,
  seedTeacher,
  getStudentById,
} from './db.js'

const app = express()
const port = process.env.PORT || 4000
const teacherId = process.env.TEACHER_ID || 'admin'
const teacherPass = process.env.TEACHER_PASS || 'admin123'
const tokenStore = new Map()
const tokenExpiryMs = 1000 * 60 * 60 * 8

app.use(cors())
app.use(express.json())

await initDb()
await seedTeacher(teacherId, teacherPass)

const issueToken = (userId, role) => {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
  tokenStore.set(token, { userId, role, expiresAt: Date.now() + tokenExpiryMs })
  return token
}

const requireAuth = (role) => (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.replace('Bearer ', '')
  const entry = tokenStore.get(token)
  if (!entry || Date.now() > entry.expiresAt) {
    res.status(401).send('Unauthorized')
    return
  }
  if (role && entry.role !== role) {
    res.status(403).send('Forbidden')
    return
  }
  req.auth = entry
  next()
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/auth/login', async (req, res) => {
  const { role, id, password } = req.body ?? {}
  if (!role || !id || !password) {
    res.status(400).send('Role, ID, and password are required')
    return
  }
  const user = await getUserById(id)
  if (!user || user.role !== role || user.password !== password) {
    res.status(401).send('Invalid credentials')
    return
  }
  const token = issueToken(user.id, user.role)
  res.json({ token, role: user.role, id: user.id })
})

app.post('/api/auth/logout', requireAuth(), (req, res) => {
  const header = req.headers.authorization || ''
  const token = header.replace('Bearer ', '')
  if (tokenStore.has(token)) {
    tokenStore.delete(token)
  }
  res.json({ ok: true })
})

app.get('/api/me', requireAuth(), async (req, res) => {
  const user = await getUserById(req.auth.userId)
  if (!user) {
    res.status(404).send('User not found')
    return
  }
  res.json({
    id: user.id,
    role: user.role,
    name: user.name,
    roll: user.roll,
    classId: user.classId,
  })
})

// Teacher endpoints
app.get('/api/classes', requireAuth('teacher'), async (_req, res) => {
  res.json(await listClasses())
})

app.post('/api/classes', requireAuth('teacher'), async (req, res) => {
  const { name } = req.body ?? {}
  if (!name) {
    res.status(400).send('Class name required')
    return
  }
  res.json(await createClass(name))
})

app.get('/api/classes/:id/students', requireAuth('teacher'), async (req, res) => {
  res.json(await listStudentsByClass(req.params.id))
})

app.get(
  '/api/classes/:id/students/attendance',
  requireAuth('teacher'),
  async (req, res) => {
    res.json(await listStudentsWithAttendance(req.params.id))
  },
)

app.post('/api/students', requireAuth('teacher'), async (req, res) => {
  const { id, password, name, roll, classId } = req.body ?? {}
  if (!id || !password || !name || !roll || !classId) {
    res.status(400).send('Missing student fields')
    return
  }
  try {
    res.json(await createStudent({ id, password, name, roll, classId }))
  } catch (error) {
    res.status(400).send(error.message || 'Unable to create student')
  }
})

app.post('/api/sessions/open', requireAuth('teacher'), async (req, res) => {
  const { classId, subject, timing } = req.body ?? {}
  if (!classId || !subject || !timing) {
    res.status(400).send('Class, subject, and timing required')
    return
  }
  res.json(await openSession({ classId, subject, timing }))
})

app.post('/api/sessions/close', requireAuth('teacher'), async (req, res) => {
  const { sessionId } = req.body ?? {}
  if (!sessionId) {
    res.status(400).send('Session ID required')
    return
  }
  const updated = await closeSession(sessionId)
  if (!updated) {
    res.status(404).send('Session not found')
    return
  }
  res.json(updated)
})

app.get('/api/sessions/active/:classId', requireAuth('teacher'), async (req, res) => {
  const session = await getActiveSession(req.params.classId)
  res.json(session ?? null)
})

app.get('/api/attendance/session/:sessionId', requireAuth('teacher'), async (req, res) => {
  const records = await listAttendanceBySession(req.params.sessionId)
  res.json(records)
})

app.get(
  '/api/teachers/students/:studentId/attendance',
  requireAuth('teacher'),
  async (req, res) => {
    const student = await getStudentById(req.params.studentId)
    if (!student || student.role !== 'student') {
      res.status(404).send('Student not found')
      return
    }
    const records = await listStudentAttendanceSummary(req.params.studentId)
    res.json({
      student: { id: student.id, name: student.name, roll: student.roll },
      records,
    })
  },
)

app.get(
  '/api/attendance/session/:sessionId/details',
  requireAuth('teacher'),
  async (req, res) => {
    const records = await listAttendanceDetailed(req.params.sessionId)
    res.json(records)
  },
)

app.get('/api/sessions/class/:classId', requireAuth('teacher'), async (req, res) => {
  const sessions = await listSessionsByClass(req.params.classId)
  const attendance = await Promise.all(
    sessions.map(async (session) => {
      const records = await listAttendanceBySession(session.id)
      return { ...session, presentCount: records.length }
    }),
  )
  attendance.sort((a, b) => {
    const dateA = a.date || ''
    const dateB = b.date || ''
    if (dateA !== dateB) return dateB.localeCompare(dateA)
    return (b.createdAt || '').localeCompare(a.createdAt || '')
  })
  res.json(attendance)
})

// Student endpoints
app.get('/api/student/session', requireAuth('student'), async (req, res) => {
  const user = await getUserById(req.auth.userId)
  if (!user) {
    res.status(404).send('User not found')
    return
  }
  if (!user.classId) {
    res.status(400).send('Student not assigned to class')
    return
  }
  const session = await getActiveSession(user.classId)
  res.json(session ?? null)
})

app.post('/api/student/attendance', requireAuth('student'), async (req, res) => {
  const user = await getUserById(req.auth.userId)
  if (!user) {
    res.status(404).send('User not found')
    return
  }
  const session = await getActiveSession(user.classId)
  if (!session) {
    res.status(403).send('No active session')
    return
  }
  const record = await markAttendance({
    sessionId: session.id,
    studentId: user.id,
  })
  res.json(record)
})

app.get('/api/student/attendance/history', requireAuth('student'), async (req, res) => {
  const records = await listStudentAttendanceSummary(req.auth.userId)
  records.sort((a, b) => {
    const dateA = a.date || ''
    const dateB = b.date || ''
    if (dateA !== dateB) return dateB.localeCompare(dateA)
    return (b.id || '').localeCompare(a.id || '')
  })
  res.json(records)
})

app.listen(port, () => {
  console.log(`Attendance API running on http://localhost:${port}`)
})
