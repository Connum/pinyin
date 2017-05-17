const express = require('express');

const JWDownloader = require('../services/JWDownloader');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/download', async (req, res) => {
  try {
    const response = await JWDownloader.download(req.query.url, req.query.language);
    res.send({ status: 200, audio: response.audio, text: response.text });
  } catch (e) {
    // eslint-disable-next-line
    console.log(e.message);
    res.send({ status: 500, error: e.message });
  }
});

router.get('/track', (req, res) => {
  JWDownloader.track(req.query.url, req.query.type)
  .then((track) => {
    res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(track);
  })
  .catch((e) => {
    // eslint-disable-next-line
    console.log(e.message);
    res.send({ status: 500, error: e.message });
  });
});

router.get('/test', (req, res) => {
  const html = '<html><body><video autoplay controls><source src="https://download-a.akamaihd.net/files/media_video/d9/pk_CHS_026_r240P.mp4" ></source><track src="http://127.0.0.1:9090/jw/track?url=https://download-a.akamaihd.net/files/media_video/56/pk_CHS_026_r720P.vtt" default></track></video></body></html>';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

module.exports = router;

