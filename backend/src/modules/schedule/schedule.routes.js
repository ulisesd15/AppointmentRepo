const router = require('express').Router();
const { Op, fn, col, where } = require('sequelize');
const { Appointment, BusinessHour, ScheduleException, BlockedTimeSlot } = require('../../models');

const SLOT_MINUTES = Number(process.env.APPOINTMENT_SLOT_MINUTES || 30);
const DEFAULT_OPEN_TIME = process.env.DEFAULT_OPEN_TIME || '09:00';
const DEFAULT_CLOSE_TIME = process.env.DEFAULT_CLOSE_TIME || '17:00';
const DEFAULT_CLOSED_DAYS = ['sunday'];

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function isValidDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function normalizeTime(value) {
  if (!value) return null;
  return String(value).slice(0, 5);
}

function timeToMinutes(value) {
  const [hours, minutes] = normalizeTime(value).split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function overlaps(startA, endA, startB, endB) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(endA) > timeToMinutes(startB);
}

function formatDisplayTime(value) {
  const [hourString, minuteString] = normalizeTime(value).split(':');
  const hour = Number(hourString);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteString} ${suffix}`;
}

function dateOnlyWhere(columnName, date) {
  return where(fn('DATE', col(columnName)), date);
}

function appointmentDateWhere(date) {
  return dateOnlyWhere('date', date);
}

async function getBusinessHoursForDate(date) {
  const dayName = DAY_NAMES[new Date(`${date}T00:00:00`).getDay()];
  const fallback = {
    isOpen: !DEFAULT_CLOSED_DAYS.includes(dayName),
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    breakStart: null,
    breakEnd: null,
  };

  try {
    const configuredHours = await BusinessHour.findOne({
      where: {
        dayOfWeek: dayName,
        [Op.or]: [{ effectiveDate: null }, { effectiveDate: { [Op.lte]: date } }],
      },
      order: [['effectiveDate', 'DESC']],
    });

    if (!configuredHours) return fallback;

    return {
      isOpen: Boolean(configuredHours.isOpen),
      openTime: normalizeTime(configuredHours.openTime) || DEFAULT_OPEN_TIME,
      closeTime: normalizeTime(configuredHours.closeTime) || DEFAULT_CLOSE_TIME,
      breakStart: normalizeTime(configuredHours.breakStart),
      breakEnd: normalizeTime(configuredHours.breakEnd),
    };
  } catch (_error) {
    return fallback;
  }
}

async function getExceptionForDate(date) {
  try {
    return await ScheduleException.findOne({
      where: {
        isActive: true,
        [Op.or]: [
          {
            startDate: { [Op.lte]: date },
            endDate: { [Op.gte]: date },
          },
          {
            startDate: date,
            endDate: null,
          },
        ],
      },
      order: [['createdAt', 'DESC']],
    });
  } catch (_error) {
    return null;
  }
}

async function getBlockedSlots(date) {
  try {
    return await BlockedTimeSlot.findAll({
      where: dateOnlyWhere('blockDate', date),
      order: [['startTime', 'ASC']],
    });
  } catch (_error) {
    return [];
  }
}

async function getBookedTimes(date) {
  const appointments = await Appointment.findAll({
    where: {
      [Op.and]: [
        appointmentDateWhere(date),
        { status: { [Op.notIn]: ['cancelled'] } },
      ],
    },
    attributes: ['time'],
  });

  return new Set(appointments.map((appointment) => normalizeTime(appointment.time)));
}

async function buildAvailability(date) {
  const businessHours = await getBusinessHoursForDate(date);
  const exception = await getExceptionForDate(date);

  if (exception?.type === 'BLOCK') {
    return {
      date,
      isOpen: false,
      reason: exception.name || exception.reason || 'Closed for this date.',
      slots: [],
    };
  }

  const effectiveHours = { ...businessHours };

  if (exception?.type === 'CUSTOM_HOURS') {
    effectiveHours.isOpen = true;
    effectiveHours.openTime = normalizeTime(exception.customOpenTime) || effectiveHours.openTime;
    effectiveHours.closeTime = normalizeTime(exception.customCloseTime) || effectiveHours.closeTime;
  }

  if (!effectiveHours.isOpen) {
    return {
      date,
      isOpen: false,
      reason: 'The clinic is closed on this date.',
      slots: [],
    };
  }

  const bookedTimes = await getBookedTimes(date);
  const blockedSlots = await getBlockedSlots(date);
  const openMinutes = timeToMinutes(effectiveHours.openTime);
  const closeMinutes = timeToMinutes(effectiveHours.closeTime);
  const now = new Date();
  const isToday = date === now.toISOString().slice(0, 10);

  const slots = [];

  for (let minutes = openMinutes; minutes + SLOT_MINUTES <= closeMinutes; minutes += SLOT_MINUTES) {
    const time = minutesToTime(minutes);
    const slotEnd = minutesToTime(minutes + SLOT_MINUTES);
    const isDuringBreak = effectiveHours.breakStart && effectiveHours.breakEnd
      ? overlaps(time, slotEnd, effectiveHours.breakStart, effectiveHours.breakEnd)
      : false;
    const isBlocked = blockedSlots.some((slot) => overlaps(time, slotEnd, slot.startTime, slot.endTime));
    const isPast = isToday && minutes <= now.getHours() * 60 + now.getMinutes();
    const isBooked = bookedTimes.has(time);

    slots.push({
      time,
      displayTime: formatDisplayTime(time),
      available: !isDuringBreak && !isBlocked && !isPast && !isBooked,
      reason: isBooked
        ? 'Booked'
        : isPast
          ? 'Past time'
          : isBlocked
            ? 'Blocked'
            : isDuringBreak
              ? 'Break'
              : null,
    });
  }

  return {
    date,
    isOpen: true,
    openTime: effectiveHours.openTime,
    closeTime: effectiveHours.closeTime,
    slotMinutes: SLOT_MINUTES,
    slots,
  };
}

router.get('/health', (req, res) => {
  res.json({ module: 'schedule', ok: true });
});

router.get('/available-slots/:date', async (req, res, next) => {
  try {
    const { date } = req.params;

    if (!isValidDateString(date)) {
      return res.status(400).json({ error: 'Date must use YYYY-MM-DD format.' });
    }

    return res.json(await buildAvailability(date));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
module.exports.buildAvailability = buildAvailability;
module.exports.isValidDateString = isValidDateString;
module.exports.normalizeTime = normalizeTime;
module.exports.formatDisplayTime = formatDisplayTime;
module.exports.appointmentDateWhere = appointmentDateWhere;
