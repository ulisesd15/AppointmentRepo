const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Appointment, User } = require('../../models');
const authenticateToken = require('../../middleware/authenticateToken');
const {
  buildAvailability,
  isValidDateString,
  normalizeTime,
  formatDisplayTime,
  appointmentDateWhere,
} = require('../schedule/schedule.routes');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-only-change-me';
}

function optionalAuthenticateToken(req, _res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return next();

  try {
    req.user = jwt.verify(token, getJwtSecret());
  } catch (_error) {
    req.user = null;
  }

  return next();
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
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateAppointmentPayload(body) {
  const fullName = String(body.fullName || '').trim();
  const email = normalizeEmail(body.email);
  const phone = String(body.phone || '').trim();
  const date = String(body.date || '').trim();
  const time = normalizeTime(body.time);
  const note = String(body.note || '').trim() || null;

  if (!fullName || !email || !phone || !date || !time) {
    return { error: 'Full name, email, phone, date, and time are required.' };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: 'A valid email address is required.' };
  }

  if (!isValidDateString(date)) {
    return { error: 'Date must use YYYY-MM-DD format.' };
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    return { error: 'Time must use HH:mm format.' };
  }

  return { fullName, email, phone, date, time, note };
}

router.get('/health', (req, res) => {
  res.json({ module: 'appointments', ok: true });
});

router.post('/', optionalAuthenticateToken, async (req, res, next) => {
  try {
    const payload = validateAppointmentPayload(req.body);

    if (payload.error) {
      return res.status(400).json({ error: payload.error });
    }

    const availability = await buildAvailability(payload.date);
    const selectedSlot = availability.slots.find((slot) => slot.time === payload.time);

    if (!availability.isOpen || !selectedSlot || !selectedSlot.available) {
      return res.status(409).json({ error: 'That appointment slot is no longer available.' });
    }

    const existingAppointment = await Appointment.findOne({
      where: {
        [Op.and]: [
          appointmentDateWhere(payload.date),
          { time: payload.time, status: { [Op.notIn]: ['cancelled'] } },
        ],
      },
    });

    if (existingAppointment) {
      return res.status(409).json({ error: 'That appointment slot has already been booked.' });
    }

    const appointment = await Appointment.create({
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      date: payload.date,
      time: payload.time,
      note: payload.note,
      status: 'pending',
      userId: req.user?.id || null,
    });

    return res.status(201).json({ appointment: sanitizeAppointment(appointment) });
  } catch (error) {
    return next(error);
  }
});

router.get('/my-appointments', authenticateToken, async (req, res, next) => {
  try {
    const appointments = await Appointment.findAll({
      where: { userId: req.user.id },
      order: [['date', 'ASC'], ['time', 'ASC']],
    });

    return res.json({ appointments: appointments.map(sanitizeAppointment) });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'role'] }],
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const ownsAppointment = appointment.userId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!ownsAppointment && !isAdmin) {
      return res.status(403).json({ error: 'You do not have access to this appointment.' });
    }

    return res.json({ appointment: sanitizeAppointment(appointment) });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id/cancel', authenticateToken, async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const ownsAppointment = appointment.userId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!ownsAppointment && !isAdmin) {
      return res.status(403).json({ error: 'You can only cancel your own appointments.' });
    }

    if (appointment.status === 'cancelled') {
      return res.json({ appointment: sanitizeAppointment(appointment) });
    }

    await appointment.update({ status: 'cancelled' });

    return res.json({ appointment: sanitizeAppointment(appointment) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
