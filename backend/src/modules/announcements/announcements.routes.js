const router = require('express').Router();
const { Op } = require('sequelize');
const { Announcement } = require('../../models');

function sanitizeAnnouncement(announcement) {
  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    startDate: announcement.startDate,
    endDate: announcement.endDate,
    isActive: Boolean(announcement.isActive),
  };
}

router.get('/health', (req, res) => {
  res.json({ module: 'announcements', ok: true });
});

router.get('/', async (_req, res, next) => {
  try {
    const now = new Date();
    const announcements = await Announcement.findAll({
      where: {
        isActive: true,
        [Op.and]: [
          {
            [Op.or]: [
              { startDate: null },
              { startDate: { [Op.lte]: now } },
            ],
          },
          {
            [Op.or]: [
              { endDate: null },
              { endDate: { [Op.gte]: now } },
            ],
          },
        ],
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    return res.json({ announcements: announcements.map(sanitizeAnnouncement) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
