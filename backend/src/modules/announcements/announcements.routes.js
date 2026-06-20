const router = require('express').Router();

router.get('/health', (req, res) => {
  res.json({ module: 'announcements', ok: true });
});

module.exports = router;
