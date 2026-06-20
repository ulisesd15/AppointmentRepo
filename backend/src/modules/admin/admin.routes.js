const router = require('express').Router();
const { Op } = require('sequelize');
const requireAdmin = require('../../middleware/requireAdmin');
const {
  Appointment,
  User,
  BusinessHour,
  ScheduleException,
  BlockedTimeSlot,
} = require('../../models');
const { normalizeTime, formatDisplayTime } = require('../schedule/schedule.routes');

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
const EXCEPTION_TYPES = ['BLOCK', 'CUSTOM_HOURS', 'YEARLY_FIXED', 'YEARLY_CALCULATED'];

function cleanTime(value) {
  const time = normalizeTime(value);
  return /^\d{2}:\d{2}$/.test(time || '') ? time : null;
}

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : null;
}

function sanitizeAppointment(appointment) {
  return {
    id: appointment.id,
    fullName: appointment.fullName,
    email: appointment.email,
    phone: appointment.phone,
    date: appointment.date,
    time: normalizeTime(appointment.time),
    displayTime: appointment.time ? formatDisplayTime(appointment.time) : null,
    note: appointment.note,
    status: appointment.status,
    userId: appointment.userId,
    user: appointment.user
      ? {
          id: appointment.user.id,
          fullName: appointment.user.fullName,
          email: appointment.user.email,
          phone: appointment.user.phone,
          role: appointment.user.role,
        }
      : null,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
}

function sanitizeBusinessHour(hour) {
  return {
    id: hour.id,
    effectiveDate: hour.effectiveDate,
    dayOfWeek: hour.dayOfWeek,
    isOpen: Boolean(hour.isOpen),
    openTime: normalizeTime(hour.openTime),
    closeTime: normalizeTime(hour.closeTime),
    breakStart: normalizeTime(hour.breakStart),
    breakEnd: normalizeTime(hour.breakEnd),
  };
}

function sanitizeException(exception) {
  return {
    id: exception.id,
    name: exception.name,
    type: exception.type,
    startDate: exception.startDate,
    endDate: exception.endDate,
    customOpenTime: normalizeTime(exception.customOpenTime),
    customCloseTime: normalizeTime(exception.customCloseTime),
    reason: exception.reason,
    isActive: Boolean(exception.isActive),
  };
}

function sanitizeBlockedSlot(slot) {
  return {
    id: slot.id,
    blockDate: slot.blockDate,
    startTime: normalizeTime(slot.startTime),
    endTime: normalizeTime(slot.endTime),
    reason: slot.reason,
    isRecurring: Boolean(slot.isRecurring),
    recurringType: slot.recurringType,
  };
}

router.get('/health', (req, res) => {
  res.json({ module: 'admin', ok: true });
});

router.use(requireAdmin);

router.get('/dashboard/stats', async (_req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const todayStart = new Date(`${today}T00:00:00`);
    const todayEnd = new Date(`${today}T23:59:59`);

    const [totalUsers, totalAppointments, pendingAppointments, todayAppointments, upcomingAppointments] = await Promise.all([
      User.count(),
      Appointment.count(),
      Appointment.count({ where: { status: 'pending' } }),
      Appointment.count({ where: { date: { [Op.between]: [todayStart, todayEnd] } } }),
      Appointment.count({
        where: {
          date: { [Op.gte]: todayStart },
          status: { [Op.notIn]: ['cancelled', 'completed'] },
        },
      }),
    ]);

    return res.json({
      stats: {
        totalUsers,
        totalAppointments,
        pendingAppointments,
        todayAppointments,
        upcomingAppointments,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/appointments', async (req, res, next) => {
  try {
    const where = {};

    if (APPOINTMENT_STATUSES.includes(req.query.status)) {
      where.status = req.query.status;
    }

    if (req.query.date) {
      where.date = {
        [Op.between]: [new Date(`${req.query.date}T00:00:00`), new Date(`${req.query.date}T23:59:59`)],
      };
    }

    const appointments = await Appointment.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone', 'role'] }],
      order: [['date', 'ASC'], ['time', 'ASC']],
    });

    return res.json({ appointments: appointments.map(sanitizeAppointment) });
  } catch (error) {
    return next(error);
  }
});

router.put('/appointments/:id/status', async (req, res, next) => {
  try {
    if (!APPOINTMENT_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid appointment status.' });
    }

    const appointment = await Appointment.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone', 'role'] }],
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    await appointment.update({ status: req.body.status });
    await appointment.reload({ include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone', 'role'] }] });

    return res.json({ appointment: sanitizeAppointment(appointment) });
  } catch (error) {
    return next(error);
  }
});

router.get('/business-hours', async (_req, res, next) => {
  try {
    const businessHours = await BusinessHour.findAll({ order: [['dayOfWeek', 'ASC'], ['effectiveDate', 'DESC']] });
    return res.json({ businessHours: businessHours.map(sanitizeBusinessHour) });
  } catch (error) {
    return next(error);
  }
});

router.put('/business-hours', async (req, res, next) => {
  try {
    const businessHours = Array.isArray(req.body.businessHours) ? req.body.businessHours : [];

    if (!businessHours.length) {
      return res.status(400).json({ error: 'businessHours must be a non-empty array.' });
    }

    const savedHours = [];

    for (const item of businessHours) {
      const dayOfWeek = String(item.dayOfWeek || '').toLowerCase();

      if (!DAY_NAMES.includes(dayOfWeek)) {
        return res.status(400).json({ error: `Invalid dayOfWeek: ${item.dayOfWeek}` });
      }

      const payload = {
        dayOfWeek,
        effectiveDate: item.effectiveDate || null,
        isOpen: Boolean(item.isOpen),
        openTime: cleanTime(item.openTime) || '09:00',
        closeTime: cleanTime(item.closeTime) || '17:00',
        breakStart: cleanTime(item.breakStart),
        breakEnd: cleanTime(item.breakEnd),
      };

      const existing = item.id
        ? await BusinessHour.findByPk(item.id)
        : await BusinessHour.findOne({ where: { dayOfWeek, effectiveDate: null } });

      if (existing) {
        await existing.update(payload);
        savedHours.push(existing);
      } else {
        savedHours.push(await BusinessHour.create(payload));
      }
    }

    return res.json({ businessHours: savedHours.map(sanitizeBusinessHour) });
  } catch (error) {
    return next(error);
  }
});

router.get('/schedule-exceptions', async (_req, res, next) => {
  try {
    const exceptions = await ScheduleException.findAll({ order: [['startDate', 'ASC']] });
    return res.json({ exceptions: exceptions.map(sanitizeException) });
  } catch (error) {
    return next(error);
  }
});

router.post('/schedule-exceptions', async (req, res, next) => {
  try {
    const type = req.body.type || 'BLOCK';

    if (!EXCEPTION_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid schedule exception type.' });
    }

    if (!req.body.startDate) {
      return res.status(400).json({ error: 'startDate is required.' });
    }

    const exception = await ScheduleException.create({
      name: String(req.body.name || '').trim() || (type === 'BLOCK' ? 'Closed day' : 'Custom hours'),
      type,
      startDate: dateOnly(req.body.startDate),
      endDate: dateOnly(req.body.endDate) || dateOnly(req.body.startDate),
      customOpenTime: cleanTime(req.body.customOpenTime),
      customCloseTime: cleanTime(req.body.customCloseTime),
      reason: String(req.body.reason || '').trim() || null,
      isActive: req.body.isActive !== false,
    });

    return res.status(201).json({ exception: sanitizeException(exception) });
  } catch (error) {
    return next(error);
  }
});

router.put('/schedule-exceptions/:id', async (req, res, next) => {
  try {
    const exception = await ScheduleException.findByPk(req.params.id);

    if (!exception) {
      return res.status(404).json({ error: 'Schedule exception not found.' });
    }

    await exception.update({
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : exception.isActive,
      reason: req.body.reason !== undefined ? String(req.body.reason || '').trim() || null : exception.reason,
    });

    return res.json({ exception: sanitizeException(exception) });
  } catch (error) {
    return next(error);
  }
});

router.get('/blocked-slots', async (_req, res, next) => {
  try {
    const blockedSlots = await BlockedTimeSlot.findAll({ order: [['blockDate', 'ASC'], ['startTime', 'ASC']] });
    return res.json({ blockedSlots: blockedSlots.map(sanitizeBlockedSlot) });
  } catch (error) {
    return next(error);
  }
});

router.post('/blocked-slots', async (req, res, next) => {
  try {
    if (!req.body.blockDate || !req.body.startTime || !req.body.endTime) {
      return res.status(400).json({ error: 'blockDate, startTime, and endTime are required.' });
    }

    const blockedSlot = await BlockedTimeSlot.create({
      blockDate: dateOnly(req.body.blockDate),
      startTime: cleanTime(req.body.startTime),
      endTime: cleanTime(req.body.endTime),
      reason: String(req.body.reason || '').trim() || null,
      isRecurring: Boolean(req.body.isRecurring),
      recurringType: req.body.recurringType || null,
    });

    return res.status(201).json({ blockedSlot: sanitizeBlockedSlot(blockedSlot) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
