import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  closeSession,
  createClass,
  createStudent,
  getActiveSession,
  getMe,
  getStudentSession,
  listAttendance,
  listAttendanceDetails,
  listClasses,
  listSessionsByClass,
  listStudentsByClass,
  listStudentsWithAttendance,
  getStudentAttendanceByTeacher,
  login,
  logout,
  markStudentAttendance,
  openSession,
  getStudentAttendanceHistory,
  type AttendanceRecord,
  type AttendanceDetail,
  type ClassRecord,
  type StudentWithAttendance,
  type SessionSummary,
  type SessionRecord,
  type StudentAttendanceSummary,
  type TeacherStudentAttendance,
  type User,
} from './api'
import {
  CLASS_NAME,
  formatRange,
  getCurrentSlot,
  getEntryForBatch,
  getNextSlot,
  getSlotsForDay,
  isLunchTime,
  type DayName,
  type SlotGroup,
} from './timetable'

type Role = 'teacher' | 'student'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

function App() {
  const [role, setRole] = useState<Role>('teacher')
  const [loginId, setLoginId] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [classes, setClasses] = useState<ClassRecord[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [students, setStudents] = useState<StudentWithAttendance[]>([])
  const [activeSession, setActiveSession] = useState<SessionRecord | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [pastSessions, setPastSessions] = useState<SessionSummary[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [attendanceDetails, setAttendanceDetails] = useState<AttendanceDetail[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(
    null,
  )
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [teacherStudentAttendance, setTeacherStudentAttendance] =
    useState<TeacherStudentAttendance | null>(null)
  const [teacherStudentLoading, setTeacherStudentLoading] = useState(false)
  const [showTeacherStudentModal, setShowTeacherStudentModal] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [showClassModal, setShowClassModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [autoSlot, setAutoSlot] = useState<SlotGroup | null>(null)
  const [nextSlot, setNextSlot] = useState<SlotGroup | null>(null)
  const [autoSlotKey, setAutoSlotKey] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [manualDay, setManualDay] = useState<DayName>('Monday')
  const [manualTime, setManualTime] = useState('09:00')
  const [studentForm, setStudentForm] = useState({
    id: '',
    password: '',
    name: '',
    roll: '',
  })
  const [sessionForm, setSessionForm] = useState({
    subject: '',
    timing: '',
  })
  const [studentSession, setStudentSession] = useState<SessionRecord | null>(null)
  const [studentMarked, setStudentMarked] = useState(false)
  const [studentHistory, setStudentHistory] = useState<
    StudentAttendanceSummary[]
  >([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showStudentHistory, setShowStudentHistory] = useState(false)

  const isAuthed = Boolean(localStorage.getItem('auth_token'))

  const refreshTeacherData = async () => {
    const classList = await listClasses()
    setClasses(classList)
    if (classList.length && !selectedClass) {
      setSelectedClass(classList[0].id)
    }
  }

  const refreshStudents = async (classId: string) => {
    if (!classId) return
    const list = await listStudentsWithAttendance(classId)
    setStudents(list)
  }

  const refreshSession = async (classId: string) => {
    if (!classId) return
    const session = await getActiveSession(classId)
    setActiveSession(session)
    if (session) {
      const records = await listAttendance(session.id)
      setAttendance(records)
    } else {
      setAttendance([])
    }
  }

  const refreshPastSessions = async (classId: string) => {
    if (!classId) return
    setSessionsLoading(true)
    try {
      const sessions = await listSessionsByClass(classId)
      setPastSessions(sessions)
    } catch {
      setPastSessions([])
    } finally {
      setSessionsLoading(false)
    }
  }

  const refreshStudentSession = async () => {
    const session = await getStudentSession()
    setStudentSession(session)
  }

  const refreshStudentHistory = async () => {
    setHistoryLoading(true)
    try {
      const records = await getStudentAttendanceHistory()
      setStudentHistory(records)
    } catch {
      setStudentHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    const bootstrap = async () => {
      if (!isAuthed) return
      try {
        const me = await getMe()
        setUser(me)
        setRole(me.role)
      } catch {
        localStorage.removeItem('auth_token')
      }
    }
    bootstrap()
  }, [isAuthed])

  useEffect(() => {
    if (user?.role === 'teacher') {
      refreshTeacherData()
    }
  }, [user?.role])

  useEffect(() => {
    if (user?.role === 'teacher' && selectedClass) {
      refreshStudents(selectedClass)
      refreshSession(selectedClass)
      refreshPastSessions(selectedClass)
    }
  }, [user?.role, selectedClass])

  useEffect(() => {
    if (user?.role === 'student') {
      refreshStudentSession()
    }
  }, [user?.role])

  const buildSubject = (
    entry: { subject: string; room?: string | null },
    batch?: string,
    includeRoom = true,
  ) => {
    const parts = [entry.subject]
    if (batch) parts.push(`(${batch})`)
    if (includeRoom && entry.room) parts.push(`Room ${entry.room}`)
    return parts.join(' ')
  }

  const stripRoom = (value: string) =>
    value.replace(/\s*Room\s+\w+\b/i, '').trim()

  const makeDateFromDayTime = (day: DayName, time: string) => {
    const now = new Date()
    const dayMap: Record<DayName, number> = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
    }
    const targetDow = dayMap[day]
    const date = new Date(now)
    const currentDow = date.getDay()
    const diff = targetDow - currentDow
    date.setDate(date.getDate() + diff)
    const [hours, minutes] = time.split(':').map(Number)
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  useEffect(() => {
    if (user?.role !== 'teacher') return
    const updateSlots = () => {
      const baseDate = makeDateFromDayTime(manualDay, manualTime)
      const current = getCurrentSlot(baseDate)
      const next = getNextSlot(baseDate)
      setAutoSlot(current)
      setNextSlot(next)
      if (!current) {
        setSelectedBatch('')
        return
      }
      const key = `${current.day}-${current.startTime}-${current.endTime}`
      if (key === autoSlotKey) return
      const defaultEntry = current.entries[0]
      const nextBatch = defaultEntry.batch ?? ''
      setSelectedBatch(nextBatch)
      setAutoSlotKey(key)
      setSessionForm({
        subject: buildSubject(defaultEntry, nextBatch),
        timing: formatRange(current),
      })
    }
    updateSlots()
  }, [autoSlotKey, manualDay, manualTime, user?.role])

  useEffect(() => {
    if (!autoSlot) return
    const entry = getEntryForBatch(autoSlot, selectedBatch || null)
    setSessionForm((prev) => ({
      ...prev,
      subject: buildSubject(entry, selectedBatch || entry.batch || undefined),
      timing: formatRange(autoSlot),
    }))
  }, [autoSlot, selectedBatch])

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPass.trim()) {
      toast.error('Enter ID and password.')
      return
    }
    try {
      const result = await login({
        role,
        id: loginId.trim(),
        password: loginPass.trim(),
      })
      localStorage.setItem('auth_token', result.token)
      const me = await getMe()
      setUser(me)
      setRole(me.role)
      setLoginId('')
      setLoginPass('')
      toast.success('Logged in.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      toast.error(message)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem('auth_token')
    setUser(null)
    setAttendance([])
    setStudents([])
    setActiveSession(null)
    setStudentSession(null)
    setStudentMarked(false)
  }

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      toast.error('Enter class name.')
      return
    }
    try {
      const created = await createClass(newClassName.trim())
      setClasses((prev) => [...prev, created])
      setSelectedClass(created.id)
      setNewClassName('')
      toast.success('Class created.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Create failed')
    }
  }

  const handleCreateStudent = async () => {
    if (!selectedClass) {
      toast.error('Select class first.')
      return
    }
    const { id, password, name, roll } = studentForm
    if (!id || !password || !name || !roll) {
      toast.error('Fill all student fields.')
      return
    }
    try {
      await createStudent({
        id,
        password,
        name,
        roll,
        classId: selectedClass,
      })
      setStudentForm({ id: '', password: '', name: '', roll: '' })
      await refreshStudents(selectedClass)
      toast.success('Student created.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Create failed')
    }
  }

  const handleOpenSession = async () => {
    if (!selectedClass) {
      toast.error('Select class first.')
      return
    }
    if (!sessionForm.subject.trim() || !sessionForm.timing.trim()) {
      toast.error('Enter subject and timing.')
      return
    }
    const now = makeDateFromDayTime(manualDay, manualTime)
    const current = getCurrentSlot(now)
    const outsideSchedule = !current
    const duringLunch = isLunchTime(now)
    if (duringLunch || outsideSchedule) {
      const ok = window.confirm(
        'This is outside scheduled hours. Continue?',
      )
      if (!ok) return
    }
    try {
      const session = await openSession({
        classId: selectedClass,
        subject: sessionForm.subject.trim(),
        timing: sessionForm.timing.trim(),
      })
      setActiveSession(session)
      setAttendance([])
      toast.success('Session opened.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Open failed')
    }
  }

  const handleCloseSession = async () => {
    if (!activeSession) return
    try {
      const closed = await closeSession(activeSession.id)
      setActiveSession(closed)
      toast.success('Session closed.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Close failed')
    }
  }

  const handleMarkAttendance = async () => {
    try {
      await markStudentAttendance()
      setStudentMarked(true)
      toast.success('Attendance marked.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Mark failed')
    }
  }

  const attendanceCount = useMemo(
    () => attendance.length,
    [attendance.length],
  )

  const activeClassLabel =
    classes.find((cls) => cls.id === selectedClass)?.name ?? CLASS_NAME

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students
    const term = studentSearch.trim().toLowerCase()
    return students.filter((student) => {
      const roll = student.roll?.toLowerCase() ?? ''
      const name = student.name?.toLowerCase() ?? ''
      return roll.includes(term) || name.includes(term)
    })
  }, [studentSearch, students])

  const currentEntry =
    autoSlot && selectedBatch
      ? getEntryForBatch(autoSlot, selectedBatch)
      : autoSlot?.entries[0]

  const daySlots = useMemo(() => getSlotsForDay(manualDay), [manualDay])

  const handleViewSession = async (session: SessionSummary) => {
    setSelectedSession(session)
    setShowDetailsModal(true)
    setDetailsLoading(true)
    try {
      const details = await listAttendanceDetails(session.id)
      setAttendanceDetails(details)
    } catch {
      setAttendanceDetails([])
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleViewStudentAttendance = async (student: User) => {
    setShowTeacherStudentModal(true)
    setTeacherStudentLoading(true)
    try {
      const payload = await getStudentAttendanceByTeacher(student.id)
      setTeacherStudentAttendance(payload)
    } catch {
      setTeacherStudentAttendance(null)
    } finally {
      setTeacherStudentLoading(false)
    }
  }

  const teacherStudentSummary = useMemo(() => {
    if (!teacherStudentAttendance) return []
    const map = new Map<
      string,
      { subject: string; timing: string; total: number; present: number }
    >()
    teacherStudentAttendance.records.forEach((record) => {
      const key = `${record.subject}__${record.timing}`
      const entry = map.get(key) ?? {
        subject: record.subject,
        timing: record.timing,
        total: 0,
        present: 0,
      }
      entry.total += 1
      if (record.present) entry.present += 1
      map.set(key, entry)
    })
    return Array.from(map.values()).map((entry) => ({
      ...entry,
      percentage: entry.total ? Math.round((entry.present / entry.total) * 100) : 0,
    }))
  }, [teacherStudentAttendance])

  const studentSummary = useMemo(() => {
    const map = new Map<
      string,
      { subject: string; timing: string; total: number; present: number }
    >()
    studentHistory.forEach((record) => {
      const key = `${record.subject}__${record.timing}`
      const entry = map.get(key) ?? {
        subject: record.subject,
        timing: record.timing,
        total: 0,
        present: 0,
      }
      entry.total += 1
      if (record.present) entry.present += 1
      map.set(key, entry)
    })
    return Array.from(map.values()).map((entry) => ({
      ...entry,
      percentage: entry.total ? Math.round((entry.present / entry.total) * 100) : 0,
    }))
  }, [studentHistory])

  const handleSlotPick = (slot: SlotGroup) => {
    setManualTime(slot.startTime)
    setAutoSlot(slot)
    setNextSlot(getNextSlot(makeDateFromDayTime(manualDay, slot.startTime)))
    const defaultEntry = slot.entries[0]
    const nextBatch = defaultEntry.batch ?? ''
    setSelectedBatch(nextBatch)
    setAutoSlotKey(`${slot.day}-${slot.startTime}-${slot.endTime}`)
    setSessionForm({
      subject: buildSubject(defaultEntry, nextBatch),
      timing: formatRange(slot),
    })
    setShowSlotModal(false)
  }

  if (!user) {
    return (
      <div className="page">
        <header className="topbar">
          <div className="topbar-inner">
            <div>
              <h1>Attendance Management System</h1>
              <p>Secure Role-Based Access</p>
            </div>
          </div>
        </header>
        <main className="content single">
          <section className="card">
            <h2>Sign In</h2>
            <div className="role-toggle">
              <button
                className={`btn ${role === 'teacher' ? '' : 'btn-outline'}`}
                onClick={() => setRole('teacher')}
              >
                Teacher
              </button>
              <button
                className={`btn ${role === 'student' ? '' : 'btn-outline'}`}
                onClick={() => setRole('student')}
              >
                Student
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="login-id">
                {role === 'teacher' ? 'Teacher ID' : 'Student ID'}
              </label>
              <input
                id="login-id"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter ID"
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-pass">Password</label>
              <input
                id="login-pass"
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Enter password"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin()
                }}
              />
            </div>
            <div className="actions">
              <button className="btn" onClick={handleLogin}>
                Sign In
              </button>
            </div>
          </section>
        </main>
      </div>
    )
  }

  if (user.role === 'student') {
    const studentSubject = studentSession
      ? stripRoom(buildSubject(studentSession, undefined, false))
      : ''
    return (
      <div className="page">
        <header className="topbar">
          <div className="topbar-inner">
            <div>
              <h1>Student Attendance</h1>
              <p>Welcome, {user.name}</p>
            </div>
            <div className="topbar-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowStudentHistory(true)
                  refreshStudentHistory()
                }}
              >
                My Attendance
              </button>
              <button className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="content single">
          <section className="card">
            <h2>Your Profile</h2>
            <div className="profile-grid">
              <div><strong>Student ID:</strong> {user.id}</div>
              <div><strong>Roll:</strong> {user.roll}</div>
              <div><strong>Name:</strong> {user.name}</div>
              <div><strong>Class:</strong> {user.classId || '--'}</div>
            </div>
            <div className="divider" />
            <h3>Attendance Session</h3>
            <div className="auto-panel">
              <div className="auto-row">
                <span className="auto-label">Current Class</span>
                {studentSession ? (
                  <span className="auto-value">{studentSubject}</span>
                ) : (
                  <span className="auto-muted">No active class</span>
                )}
              </div>
              <div className="auto-row">
                <span className="auto-label">Time</span>
                {studentSession ? (
                  <span className="auto-value">
                    {studentSession.timing}
                  </span>
                ) : (
                  <span className="auto-muted">--</span>
                )}
              </div>
            </div>
            {studentSession ? (
              <div className="session-card">
                <div><strong>Subject:</strong> {studentSubject}</div>
                <div><strong>Timing:</strong> {studentSession.timing}</div>
                <div><strong>Date:</strong> {formatDate(studentSession.date)}</div>
                <div><strong>Status:</strong> {studentSession.status}</div>
              </div>
            ) : (
              <div className="empty">No active session.</div>
            )}
            <div className="actions">
              <button
                className="btn"
                onClick={handleMarkAttendance}
                disabled={!studentSession || studentMarked}
              >
                {studentMarked ? 'Marked Present' : 'Present'}
              </button>
            </div>
          </section>
        </main>
        {showStudentHistory && (
          <div
            className="modal-backdrop"
            role="presentation"
            onClick={() => setShowStudentHistory(false)}
          >
            <div
              className="modal details-modal"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <h4>My Attendance</h4>
              {historyLoading ? (
                <div className="muted compact-text">Loading attendance...</div>
              ) : (
                <div className="summary-table">
                  <div className="summary-head">
                    <div>Lecture</div>
                    <div>Time</div>
                    <div>Count</div>
                    <div>Present</div>
                    <div>%</div>
                  </div>
                  {studentSummary.map((row) => (
                    <div
                      key={`${row.subject}-${row.timing}`}
                      className="summary-row"
                    >
                    <div className="summary-title">
                      {stripRoom(row.subject)}
                    </div>
                      <div className="summary-time">{row.timing}</div>
                      <div>{row.total}</div>
                      <div>{row.present}</div>
                      <div>{row.percentage}%</div>
                    </div>
                  ))}
                  {studentSummary.length === 0 && (
                    <div className="muted compact-text">No sessions found.</div>
                  )}
                </div>
              )}
              <div className="modal-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowStudentHistory(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <h1>Teacher Dashboard</h1>
            <p>Manage classes, students, and attendance</p>
            <div className="active-class">Class: {activeClassLabel}</div>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="content teacher-grid">
        <section className="card compact teacher-classes">
          <h2>Classes</h2>
          <div className="form-group">
            <label htmlFor="class-select">Select Class</label>
            <select
              id="class-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">-- Select --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="link-btn subtle"
            type="button"
            onClick={() => setShowClassModal(true)}
          >
            + Create New Class
          </button>
        </section>

        <section className="card primary teacher-session">
          <h2>Attendance Session</h2>
          {/* Compact day selector and slot action kept inline for fast daily use */}
          <div className="manual-panel">
            <div className="day-picker">
              {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as DayName[]).map(
                (day) => (
                  <button
                    key={day}
                    type="button"
                    className={`day-btn ${manualDay === day ? 'active' : ''}`}
                    onClick={() => {
                      setManualDay(day)
                      setShowSlotModal(true)
                    }}
                  >
                    {day.slice(0, 3)}
                  </button>
                ),
              )}
              <button
                type="button"
                className="day-btn outline"
                onClick={() => setShowSlotModal(true)}
              >
                Pick Slot
              </button>
              <span className="time-chip">{manualTime}</span>
            </div>
          </div>
          <div className="auto-panel compact-info">
            <div className="auto-row">
              <span className="auto-label">Current Class</span>
              {autoSlot ? (
                <span className="auto-value right">
                  {currentEntry?.subject ?? '--'}
                  {currentEntry?.batch ? ` (${currentEntry.batch})` : ''} (
                  {activeClassLabel})
                </span>
              ) : (
                <span className="auto-muted right">No active class</span>
              )}
            </div>
            <div className="auto-row">
              <span className="auto-label">Time</span>
              {autoSlot ? (
                <span className="auto-value right">{formatRange(autoSlot)}</span>
              ) : (
                <span className="auto-muted right">--</span>
              )}
            </div>
            <div className="auto-row">
              <span className="auto-label">Next</span>
              {nextSlot ? (
                <span className="auto-muted right">
                  {nextSlot.entries[0].subject} · {formatRange(nextSlot)}
                </span>
              ) : (
                <span className="auto-muted right">No upcoming class</span>
              )}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="session-subject">Subject</label>
            <input
              id="session-subject"
              value={sessionForm.subject}
              onChange={(e) =>
                setSessionForm((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="e.g. Data Structures"
            />
          </div>
          {autoSlot?.entries.length ? (
            autoSlot.entries.length > 1 && (
              <div className="form-group">
                <label htmlFor="session-batch">Batch</label>
                <select
                  id="session-batch"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  {autoSlot.entries.map((entry) => (
                    <option key={entry.batch} value={entry.batch ?? ''}>
                      {entry.batch ?? 'All'}
                    </option>
                  ))}
                </select>
              </div>
            )
          ) : null}
          <div className="form-group">
            <label htmlFor="session-timing">Timing</label>
            <input
              id="session-timing"
              value={sessionForm.timing}
              onChange={(e) =>
                setSessionForm((prev) => ({ ...prev, timing: e.target.value }))
              }
              placeholder="e.g. 10:30 - 11:30"
            />
          </div>
          <div className="actions">
            <button className="btn" onClick={handleOpenSession}>
              Open Session
            </button>
            <button
              className="btn btn-outline"
              onClick={handleCloseSession}
              disabled={!activeSession || activeSession.status === 'closed'}
            >
              Close Session
            </button>
          </div>
          <div className="divider" />
          {activeSession ? (
            <div className="session-card">
              <div><strong>Subject:</strong> {activeSession.subject}</div>
              <div><strong>Timing:</strong> {activeSession.timing}</div>
              <div><strong>Date:</strong> {formatDate(activeSession.date)}</div>
              <div><strong>Status:</strong> {activeSession.status}</div>
              <div><strong>Present Count:</strong> {attendanceCount}</div>
            </div>
          ) : (
            <div className="info-banner">No active session.</div>
          )}
          <div className="status-row">
            <span className={`status-pill ${activeSession ? 'active' : ''}`}>
              {activeSession ? 'Session Active' : 'No Active Session'}
            </span>
          </div>
          <details className="collapsible">
            <summary>View Past Sessions</summary>
            {sessionsLoading ? (
              <div className="muted compact-text">Loading sessions...</div>
            ) : (
              <div className="past-list">
                {pastSessions.map((session) => (
                  <div key={session.id} className="past-row">
                    <div className="past-main">
                      <div className="past-title">{session.subject}</div>
                      <div className="past-meta">
                        {formatDate(session.date)} · {session.timing}
                      </div>
                    </div>
                    <div className="past-stats">
                      <div className="past-count">
                        {session.presentCount} present
                      </div>
                      <div className="past-status">{session.status}</div>
                    </div>
                    <button
                      className="btn btn-outline btn-xs"
                      type="button"
                      onClick={() => handleViewSession(session)}
                    >
                      View
                    </button>
                  </div>
                ))}
                {pastSessions.length === 0 && (
                  <div className="muted compact-text">No sessions yet.</div>
                )}
              </div>
            )}
          </details>
        </section>

        <section className="card teacher-students">
          <div className="card-header">
            <h2>Students</h2>
            <button
              className="link-btn subtle"
              type="button"
              onClick={() => setShowStudentModal(true)}
            >
              + Add Student
            </button>
          </div>
          <div className="form-group">
            <label htmlFor="student-search">Search</label>
            <input
              id="student-search"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search by roll or name"
            />
          </div>
          {/* Keep list height stable to avoid layout jump when expanding past sessions */}
          <div className="list scroll student-list">
            {filteredStudents.map((student) => (
              <div className="list-row compact-row" key={student.id}>
                <div className="muted">{student.roll}</div>
                <div className="student-name">
                  {student.name}
                  <span className="student-percent">
                    {student.attendance.percentage}%
                  </span>
                </div>
                <button
                  className="btn btn-outline btn-xs"
                  type="button"
                  onClick={() => handleViewStudentAttendance(student)}
                >
                  Attendance
                </button>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <div className="empty">No students found.</div>
            )}
          </div>
        </section>
      </main>
      <footer className="footer">
        © QR Attendance System 2026 - Team AbsentMinded
      </footer>
      {showSlotModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setShowSlotModal(false)}
        >
          <div
            className="modal slot-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>{manualDay} Slots</h4>
            <div className="slot-grid modal-grid">
              {daySlots.map((slot) => {
                const isActive =
                  autoSlot?.day === slot.day &&
                  autoSlot?.startTime === slot.startTime &&
                  autoSlot?.endTime === slot.endTime
                return (
                  <button
                    key={`${slot.day}-${slot.startTime}`}
                    className={`slot-card ${isActive ? 'active' : ''}`}
                    type="button"
                    onClick={() => handleSlotPick(slot)}
                  >
                    <div className="slot-time">{formatRange(slot)}</div>
                    {slot.entries.length > 1 ? (
                      <div className="slot-lines">
                        {slot.entries.map((entry) => (
                          <div key={`${entry.batch}-${entry.subject}`}>
                            {entry.batch ?? 'All'} · {entry.subject}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="slot-subject">
                        {slot.entries[0].subject}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowSlotModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showClassModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setShowClassModal(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Create New Class</h4>
            <div className="form-group">
              <label htmlFor="new-class">Class Name</label>
              <input
                id="new-class"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g. SE-A"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowClassModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={async () => {
                  await handleCreateClass()
                  setShowClassModal(false)
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {showDetailsModal && selectedSession && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="modal details-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Attendance Details</h4>
            <div className="details-header">
              <div className="details-title">{selectedSession.subject}</div>
              <div className="details-meta">
                {formatDate(selectedSession.date)} · {selectedSession.timing}
              </div>
            </div>
            {detailsLoading ? (
              <div className="muted compact-text">Loading attendance...</div>
            ) : (
              <div className="details-list">
                {attendanceDetails.map((record) => (
                  <div key={record.id} className="details-row">
                    <div className="details-name">
                      {record.student.name}
                    </div>
                    <div className="details-roll">
                      {record.student.roll || '--'}
                    </div>
                    <div className="details-id">{record.student.id}</div>
                  </div>
                ))}
                {attendanceDetails.length === 0 && (
                  <div className="muted compact-text">No attendance marked.</div>
                )}
              </div>
            )}
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showStudentModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setShowStudentModal(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Add Student</h4>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="student-id">Student ID</label>
                <input
                  id="student-id"
                  value={studentForm.id}
                  onChange={(e) =>
                    setStudentForm((prev) => ({ ...prev, id: e.target.value }))
                  }
                  placeholder="e.g. STU1001"
                />
              </div>
              <div className="form-group">
                <label htmlFor="student-pass">Password</label>
                <input
                  id="student-pass"
                  value={studentForm.password}
                  onChange={(e) =>
                    setStudentForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Temp password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="student-name">Full Name</label>
                <input
                  id="student-name"
                  value={studentForm.name}
                  onChange={(e) =>
                    setStudentForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Sumeet Chauhan"
                />
              </div>
              <div className="form-group">
                <label htmlFor="student-roll">Roll Number</label>
                <input
                  id="student-roll"
                  value={studentForm.roll}
                  onChange={(e) =>
                    setStudentForm((prev) => ({ ...prev, roll: e.target.value }))
                  }
                  placeholder="e.g. A42"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowStudentModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={async () => {
                  await handleCreateStudent()
                  setShowStudentModal(false)
                }}
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
      {showTeacherStudentModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setShowTeacherStudentModal(false)}
        >
          <div
            className="modal details-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Student Attendance</h4>
            {teacherStudentLoading ? (
              <div className="muted compact-text">Loading attendance...</div>
            ) : teacherStudentAttendance ? (
              <>
                <div className="details-header">
                  <div className="details-title">
                    {teacherStudentAttendance.student.name}
                  </div>
                  <div className="details-meta">
                    {teacherStudentAttendance.student.roll || '--'} ·{' '}
                    {teacherStudentAttendance.student.id}
                  </div>
                </div>
                <div className="summary-table">
                  <div className="summary-head">
                    <div>Lecture</div>
                    <div>Time</div>
                    <div>Count</div>
                    <div>Present</div>
                    <div>%</div>
                  </div>
                  {teacherStudentSummary.map((row) => (
                    <div
                      key={`${row.subject}-${row.timing}`}
                      className="summary-row"
                    >
                      <div className="summary-title">{stripRoom(row.subject)}</div>
                      <div className="summary-time">{row.timing}</div>
                      <div>{row.total}</div>
                      <div>{row.present}</div>
                      <div>{row.percentage}%</div>
                    </div>
                  ))}
                  {teacherStudentSummary.length === 0 && (
                    <div className="muted compact-text">No sessions found.</div>
                  )}
                </div>
              </>
            ) : (
              <div className="muted compact-text">No data available.</div>
            )}
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowTeacherStudentModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
