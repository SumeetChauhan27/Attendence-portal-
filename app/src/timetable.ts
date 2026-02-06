export type DayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'

export type SlotType = 'Lecture' | 'Practical' | 'Project'

export type TimetableEntry = {
  day: DayName
  startTime: string
  endTime: string
  subject: string
  batch?: 'A1' | 'A2' | 'A3' | null
  room?: string | null
  faculty?: string | null
  type: SlotType
  className: string
}

export type SlotGroup = {
  day: DayName
  startTime: string
  endTime: string
  type: SlotType
  entries: TimetableEntry[]
}

export const CLASS_NAME = 'SE-A'

export const LUNCH_BREAK = { startTime: '13:15', endTime: '13:45' }

export const TIMETABLE: TimetableEntry[] = [
  // Monday
  {
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    subject: 'DBMS',
    faculty: 'PBM',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Monday',
    startTime: '10:00',
    endTime: '11:00',
    subject: 'OS',
    faculty: 'UVG',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Monday',
    startTime: '11:15',
    endTime: '12:15',
    subject: 'DBMS',
    faculty: 'PBM',
    room: '336',
    batch: 'A1',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Monday',
    startTime: '11:15',
    endTime: '12:15',
    subject: 'OS',
    faculty: 'UVG',
    room: '330',
    batch: 'A2',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Monday',
    startTime: '11:15',
    endTime: '12:15',
    subject: 'MDM',
    faculty: 'VAP',
    room: '329',
    batch: 'A3',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Monday',
    startTime: '13:45',
    endTime: '14:45',
    subject: 'DT',
    faculty: 'UBM',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Monday',
    startTime: '14:45',
    endTime: '15:45',
    subject: 'Mini Project',
    type: 'Project',
    className: CLASS_NAME,
  },

  // Tuesday
  {
    day: 'Tuesday',
    startTime: '09:00',
    endTime: '10:00',
    subject: 'DT',
    faculty: 'UBM',
    room: '331',
    batch: 'A1',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Tuesday',
    startTime: '09:00',
    endTime: '10:00',
    subject: 'DBMS',
    faculty: 'PBM',
    room: '336',
    batch: 'A2',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Tuesday',
    startTime: '09:00',
    endTime: '10:00',
    subject: 'OS',
    faculty: 'UVG',
    room: '330',
    batch: 'A3',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Tuesday',
    startTime: '10:00',
    endTime: '11:00',
    subject: 'BMD',
    faculty: 'AK',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Tuesday',
    startTime: '11:15',
    endTime: '12:15',
    subject: 'MDM',
    faculty: 'RDP',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Tuesday',
    startTime: '13:45',
    endTime: '14:45',
    subject: 'CT',
    faculty: 'MRC',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Tuesday',
    startTime: '14:45',
    endTime: '15:45',
    subject: 'BMD',
    faculty: 'AK',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Tuesday',
    startTime: '15:45',
    endTime: '16:45',
    subject: 'Mini Project',
    type: 'Project',
    className: CLASS_NAME,
  },

  // Wednesday
  {
    day: 'Wednesday',
    startTime: '09:00',
    endTime: '10:00',
    subject: 'MDM',
    faculty: 'RDP',
    room: '329',
    batch: 'A1',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Wednesday',
    startTime: '09:00',
    endTime: '10:00',
    subject: 'BMD',
    faculty: 'HSG',
    room: '32',
    batch: 'A2',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Wednesday',
    startTime: '09:00',
    endTime: '10:00',
    subject: 'DT',
    faculty: 'UBM',
    room: '325',
    batch: 'A3',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Wednesday',
    startTime: '10:00',
    endTime: '11:00',
    subject: 'OEAK119',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Wednesday',
    startTime: '13:45',
    endTime: '14:45',
    subject: 'CT',
    faculty: 'MRC',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Wednesday',
    startTime: '14:45',
    endTime: '15:45',
    subject: 'OS',
    faculty: 'UVG',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Wednesday',
    startTime: '15:45',
    endTime: '16:45',
    subject: 'Mini Project',
    type: 'Project',
    className: CLASS_NAME,
  },

  // Thursday
  {
    day: 'Thursday',
    startTime: '09:00',
    endTime: '10:00',
    subject: 'MDM',
    faculty: 'RDP',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Thursday',
    startTime: '10:00',
    endTime: '11:00',
    subject: 'OS',
    faculty: 'UVG',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Thursday',
    startTime: '11:15',
    endTime: '12:15',
    subject: 'OS',
    faculty: 'UVG',
    room: '330',
    batch: 'A1',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Thursday',
    startTime: '11:15',
    endTime: '12:15',
    subject: 'MDM',
    faculty: 'VAP',
    room: '333',
    batch: 'A2',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Thursday',
    startTime: '11:15',
    endTime: '12:15',
    subject: 'BMD',
    faculty: 'HSG',
    room: '326',
    batch: 'A3',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Thursday',
    startTime: '13:45',
    endTime: '14:45',
    subject: 'DT',
    faculty: 'UBM',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Thursday',
    startTime: '14:45',
    endTime: '15:45',
    subject: 'DBMS',
    faculty: 'PBM',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },

  // Friday
  {
    day: 'Friday',
    startTime: '09:00',
    endTime: '10:00',
    subject: 'CT',
    faculty: 'MRC',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Friday',
    startTime: '10:00',
    endTime: '11:00',
    subject: 'MDM',
    faculty: 'RDP',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Friday',
    startTime: '11:15',
    endTime: '12:15',
    subject: 'BMD',
    faculty: 'HSG',
    room: '329',
    batch: 'A1',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Friday',
    startTime: '11:15',
    endTime: '12:15',
    subject: 'DT',
    faculty: 'UBM',
    room: '42',
    batch: 'A2',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Friday',
    startTime: '11:15',
    endTime: '12:15',
    subject: 'DBMS',
    faculty: 'PBM',
    room: '336',
    batch: 'A3',
    type: 'Practical',
    className: CLASS_NAME,
  },
  {
    day: 'Friday',
    startTime: '13:45',
    endTime: '14:45',
    subject: 'DBMS',
    faculty: 'PBM',
    room: '328',
    type: 'Lecture',
    className: CLASS_NAME,
  },
  {
    day: 'Friday',
    startTime: '14:45',
    endTime: '15:45',
    subject: 'Mini Project',
    type: 'Project',
    className: CLASS_NAME,
  },
]

const dayNames: DayName[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
]

const timeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

const getDayName = (date: Date): DayName | null => {
  const dayIndex = date.getDay()
  if (dayIndex === 0 || dayIndex === 6) return null
  return dayNames[dayIndex - 1] ?? null
}

const slotKey = (entry: Pick<TimetableEntry, 'day' | 'startTime' | 'endTime'>) =>
  `${entry.day}-${entry.startTime}-${entry.endTime}`

const groupEntries = (entries: TimetableEntry[]) => {
  const map = new Map<string, SlotGroup>()
  entries.forEach((entry) => {
    const key = slotKey(entry)
    if (!map.has(key)) {
      map.set(key, {
        day: entry.day,
        startTime: entry.startTime,
        endTime: entry.endTime,
        type: entry.type,
        entries: [entry],
      })
      return
    }
    map.get(key)?.entries.push(entry)
  })
  return Array.from(map.values())
}

export const getSlotsForDay = (day: DayName) => {
  const dayEntries = TIMETABLE.filter((entry) => entry.day === day)
  return groupEntries(dayEntries).sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  )
}

const sortSlots = (slots: SlotGroup[]) =>
  [...slots].sort((a, b) => {
    if (a.day !== b.day) {
      return dayNames.indexOf(a.day) - dayNames.indexOf(b.day)
    }
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  })

export const isLunchTime = (date: Date) => {
  const minutes = date.getHours() * 60 + date.getMinutes()
  return (
    minutes >= timeToMinutes(LUNCH_BREAK.startTime) &&
    minutes < timeToMinutes(LUNCH_BREAK.endTime)
  )
}

export const getCurrentSlot = (date = new Date()): SlotGroup | null => {
  const day = getDayName(date)
  if (!day) return null
  const minutes = date.getHours() * 60 + date.getMinutes()
  const dayEntries = TIMETABLE.filter((entry) => entry.day === day)
  const slots = groupEntries(dayEntries)
  return (
    slots.find((slot) => {
      const start = timeToMinutes(slot.startTime)
      const end = timeToMinutes(slot.endTime)
      return minutes >= start && minutes < end
    }) ?? null
  )
}

export const getNextSlot = (date = new Date()): SlotGroup | null => {
  const currentDay = getDayName(date)
  const minutes = date.getHours() * 60 + date.getMinutes()
  const allSlots = sortSlots(groupEntries(TIMETABLE))

  if (currentDay) {
    const todaySlots = allSlots.filter((slot) => slot.day === currentDay)
    const nextToday = todaySlots.find(
      (slot) => timeToMinutes(slot.startTime) > minutes,
    )
    if (nextToday) return nextToday
  }

  const currentDayIndex = currentDay ? dayNames.indexOf(currentDay) : -1
  const futureSlots = allSlots.filter(
    (slot) => dayNames.indexOf(slot.day) > currentDayIndex,
  )
  return futureSlots[0] ?? null
}

export const formatRange = (slot: SlotGroup) =>
  `${slot.startTime} - ${slot.endTime}`

export const getEntryForBatch = (slot: SlotGroup, batch: string | null) => {
  if (!batch) return slot.entries[0]
  return slot.entries.find((entry) => entry.batch === batch) ?? slot.entries[0]
}
