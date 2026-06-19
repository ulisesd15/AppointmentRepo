const router = require('express').Router();

router.get('/health', (req, res) => {
  res.json({ module: 'auth', ok: true });
});

module.exports = router;