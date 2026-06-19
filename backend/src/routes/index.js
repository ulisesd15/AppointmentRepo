const router = require('express').Router();

router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/appointments', require('../modules/appointments/appointments.routes'));
router.use('/schedule', require('../modules/schedule/schedule.routes'));
router.use('/admin', require('../modules/admin/admin.routes'));
router.use('/announcements', require('../modules/announcements/announcements.routes'));

module.exports = router;