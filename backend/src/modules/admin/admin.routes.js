const router = require('express').Router();

router.get('/health', (req, res) => {
  res.json({ module: 'admin', ok: true });
});

module.exports = router;
