const express = require('express');

const JWDownloader = require('../services/JWDownloader');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/download', (req, res) => {
  JWDownloader.download(req.query.url)
  .then((text) => {
    res.send({ status: 200, text });
  })
  .catch((e) => {
    res.send({ status: 500, error: e });
  });
});

module.exports = router;
