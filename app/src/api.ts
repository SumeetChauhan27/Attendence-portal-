export type User = {
  id: string
  role: 'teacher' | 'student'
  name: string
  roll: string
  classId: string
}

export type StudentWithAttendance = User & {
  attendance: { present: number; total: number; percentage: number }
}

export type ClassRecord = { id: string; name: string }

export type SessionRecord = {
  id: string
  classId: string
  subject: string
  timing: string
  date: string
  status: 'open' | 'closed'
}

export type AttendanceRecord = {
  id: string
  sessionId: string
  studentId: string
  timestamp: string
}

export type AttendanceDetail = AttendanceRecord & {
  student: { id: string; name: string; roll: string }
}

export type SessionSummary = SessionRecord & { presentCount: number }

export type StudentAttendanceSummary = {
  id: string
  subject: string
  timing: string
  date: string
  status: 'open' | 'closed'
  present: boolean
}

export type TeacherStudentAttendance = {
  student: { id: string; name: string; roll: string }
  records: StudentAttendanceSummary[]
}

const apiBase = import.meta.env.VITE_API_URL ?? ''

const toJson = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || 'Request failed')
  }
  return res.json() as Promise<T>
}

const authHeader = () => {
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const login = async (payload: {
  role: 'teacher' | 'student'
  id: string
  password: string
}): Promise<{ token: string; role: string; id: string }> => {
  const res = await fetch(`${apiBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return toJson(res)
}

export const logout = async (): Promise<{ ok: boolean }> => {
  const res = await fetch(`${apiBase}/api/auth/logout`, {
    method: 'POST',
    headers: { ...authHeader() },
  })
  return toJson(res)
}

export const getMe = async (): Promise<User> => {
  const res = await fetch(`${apiBase}/api/me`, {
    headers: { ...authHeader() },
  })
  return toJson(res)
}

export const listClasses = async (): Promise<ClassRecord[]> => {
  const res = await fetch(`${apiBase}/api/classes`, {
    headers: { ...authHeader() },
  })
  return toJson(res)
}

export const createClass = async (name: string): Promise<ClassRecord> => {
  const res = await fetch(`${apiBase}/api/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ name }),
  })
  return toJson(res)
}

export const createStudent = async (payload: {
  id: string
  password: string
  name: string
  roll: string
  classId: string
}): Promise<User> => {
  const res = await fetch(`${apiBase}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  })
  return toJson(res)
}

export const listStudentsByClass = async (
  classId: string,
): Promise<User[]> => {
  const res = await fetch(`${apiBase}/api/classes/${classId}/students`, {
    headers: { ...authHeader() },
  })
  return toJson(res)
}

export const listStudentsWithAttendance = async (
  classId: string,
): Promise<StudentWithAttendance[]> => {
  const res = await fetch(
    `${apiBase}/api/classes/${classId}/students/attendance`,
    {
      headers: { ...authHeader() },
    },
  )
  return toJson(res)
}

export const openSession = async (payload: {
  classId: string
  subject: string
  timing: string
}): Promise<SessionRecord> => {
  const res = await fetch(`${apiBase}/api/sessions/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  })
  return toJson(res)
}

export const closeSession = async (sessionId: string): Promise<SessionRecord> => {
  const res = await fetch(`${apiBase}/api/sessions/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ sessionId }),
  })
  return toJson(res)
}

export const getActiveSession = async (
  classId: string,
): Promise<SessionRecord | null> => {
  const res = await fetch(`${apiBase}/api/sessions/active/${classId}`, {
    headers: { ...authHeader() },
  })
  return toJson(res)
}

export const listAttendance = async (
  sessionId: string,
): Promise<AttendanceRecord[]> => {
  const res = await fetch(`${apiBase}/api/attendance/session/${sessionId}`, {
    headers: { ...authHeader() },
  })
  return toJson(res)
}

export const listAttendanceDetails = async (
  sessionId: string,
): Promise<AttendanceDetail[]> => {
  const res = await fetch(
    `${apiBase}/api/attendance/session/${sessionId}/details`,
    {
      headers: { ...authHeader() },
    },
  )
  return toJson(res)
}

export const listSessionsByClass = async (
  classId: string,
): Promise<SessionSummary[]> => {
  const res = await fetch(`${apiBase}/api/sessions/class/${classId}`, {
    headers: { ...authHeader() },
  })
  return toJson(res)
}

export const getStudentSession = async (): Promise<SessionRecord | null> => {
  const res = await fetch(`${apiBase}/api/student/session`, {
    headers: { ...authHeader() },
  })
  return toJson(res)
}

export const markStudentAttendance = async (): Promise<AttendanceRecord> => {
  const res = await fetch(`${apiBase}/api/student/attendance`, {
    method: 'POST',
    headers: { ...authHeader() },
  })
  return toJson(res)
}

export const getStudentAttendanceHistory = async (): Promise<
  StudentAttendanceSummary[]
> => {
  const res = await fetch(`${apiBase}/api/student/attendance/history`, {
    headers: { ...authHeader() },
  })
  return toJson(res)
}

export const getStudentAttendanceByTeacher = async (
  studentId: string,
): Promise<TeacherStudentAttendance> => {
  const res = await fetch(
    `${apiBase}/api/teachers/students/${studentId}/attendance`,
    {
      headers: { ...authHeader() },
    },
  )
  return toJson(res)
}
