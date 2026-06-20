const router = require('express').Router();

router.get('/health', (req, res) => {
  res.json({ module: 'appointments', ok: true });
});

module.exports = router;
