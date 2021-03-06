import * as express from 'express';
import { IdeogramsConverter } from '../core/converter/ideograms.converter';
import * as knex from '../services/knex';

// eslint-disable-next-line new-cap
const ideogramConverter = new IdeogramsConverter();
const router = express.Router();

router.post('/get', async (req: any, res) => {
  const result = await knex('my_cjk')
    .select('my_cjk.ideogram')
    .where({
      user_id: req.user.id,
      'my_cjk.source': req.body.source,
      'my_cjk.type': req.body.type,
    });

  const ideograms: any[] = [];
  result.forEach((item: any) => {
    item.ideogram = ideogramConverter.convertUtf16ToIdeograms(item.ideogram);
    ideograms.push(item);
  });

  res.send({ ideograms });
});

router.get('/report', (req: any, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where: any = {
    'cjk.type': 'C',
    main: 1,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  let countPercent = 'COUNT(my_cjk.id) / COUNT(*)';
  if (req.query.type === 'unknown') {
    countPercent = '(COUNT(*) - COUNT(my_cjk.id)) / COUNT(*)';
  }

  let totalMy = 'COUNT(my_cjk.id)';
  if (req.query.type === 'unknown') {
    totalMy = 'COUNT(*) - COUNT(my_cjk.id)';
  }

  knex('cjk')
    .select(
      knex.raw(`
        cjk.frequency,
        COUNT(*) as total,
        ${totalMy} total_my,
        ROUND(${countPercent} * 100) percent`),
    )
    .leftJoin('my_cjk', function leftJoin() {
      this.on('my_cjk.ideogram', '=', 'cjk.ideogram')
        .on('my_cjk.user_id', '=', req.user.id)
        .on(knex.raw('my_cjk.type = :type', { type: req.query.type }))
        .on(knex.raw('my_cjk.source = :source', { source: req.query.source }));
    })
    .where(where)
    .orderBy('cjk.frequency')
    .groupBy('cjk.frequency')
    .then(report => {
      let total = 0;
      report.forEach(item => {
        total += item.total_my;
      });
      res.send({ total, report });
    });
});

router.get('/report_words', async (req: any, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where: any = {
    main: 1,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  let countPercent = 'COUNT(my_cjk.id) / COUNT(*)';
  if (req.query.type === 'unknown') {
    countPercent = '(COUNT(*) - COUNT(my_cjk.id)) / COUNT(*)';
  }

  let totalMy = 'COUNT(my_cjk.id)';
  if (req.query.type === 'unknown') {
    totalMy = 'COUNT(*) - COUNT(my_cjk.id)';
  }

  const report = await knex('cjk')
    .select(
      knex.raw(`
        cjk.hsk,
        COUNT(cjk.id) as total,
        ${totalMy} total_my,
        ROUND(${countPercent} * 100) percent`),
    )
    .leftJoin('my_cjk', function leftJoin() {
      this.on('my_cjk.ideogram', '=', 'cjk.ideogram')
        .on('my_cjk.user_id', '=', req.user.id)
        .on(knex.raw('my_cjk.type = :type', { type: req.query.type }))
        .on(knex.raw('my_cjk.source = :source', { source: req.query.source }));
    })
    .where(where)
    .orderBy('cjk.hsk')
    .groupBy('cjk.hsk');

  let total = 0;
  report.forEach(item => {
    total += item.total_my;
  });

  res.send({ total, report });
});

router.get('/report_unknown', async (req: any, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where: any = {
    'cjk.type': 'C',
    main: 1,
    frequency: req.query.frequency,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  const query = knex('cjk')
    .select('my_cjk.id', 'cjk.ideogram', 'cjk.frequency', 'cjk.pronunciation')
    .leftJoin('my_cjk', function leftJoin() {
      this.on('my_cjk.ideogram', '=', 'cjk.ideogram')
        .on('my_cjk.user_id', '=', req.user.id)
        .on(knex.raw('my_cjk.type = :type', { type: req.query.type }))
        .on(knex.raw('my_cjk.source = :source', { source: req.query.source }));
    })
    .where(where);

  if (req.query.type === 'known') {
    query.whereNull('my_cjk.id');
  } else {
    query.whereNotNull('my_cjk.id');
  }

  const result = await query.limit(2500);

  const ideograms: any[] = [];
  result.forEach(item => {
    item.ideogram = ideogramConverter.convertUtf16ToIdeograms(item.ideogram);
    ideograms.push(item);
  });

  res.send({ ideograms });
});

router.get('/report_known', async (req: any, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where: any = {
    'cjk.type': 'C',
    main: 1,
    frequency: req.query.frequency,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  const query = knex('cjk')
    .select('my_cjk.id', 'cjk.ideogram', 'cjk.frequency', 'cjk.pronunciation')
    .leftJoin('my_cjk', function leftJoin() {
      this.on('my_cjk.ideogram', '=', 'cjk.ideogram')
        .on('my_cjk.user_id', '=', req.user.id)
        .on(knex.raw('my_cjk.type = :type', { type: req.query.type }))
        .on(knex.raw('my_cjk.source = :source', { source: req.query.source }));
    })
    .where(where);

  if (req.query.type === 'known') {
    query.whereNotNull('my_cjk.id');
  } else {
    query.whereNull('my_cjk.id');
  }

  const result = await query.limit(2500);

  const ideograms: any[] = [];
  result.forEach(item => {
    item.ideogram = ideogramConverter.convertUtf16ToIdeograms(item.ideogram);
    ideograms.push(item);
  });

  res.send({ ideograms });
});

router.get('/report_unknown_words', async (req: any, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where: any = {
    main: 1,
    hsk: req.query.hsk,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  const query = knex('cjk')
    .select('my_cjk.id', 'cjk.ideogram', 'cjk.hsk', 'cjk.pronunciation')
    .leftJoin('my_cjk', function leftJoin() {
      this.on('my_cjk.ideogram', '=', 'cjk.ideogram')
        .on('my_cjk.user_id', '=', req.user.id)
        .on(knex.raw('my_cjk.type = :type', { type: req.query.type }))
        .on(knex.raw('my_cjk.source = :source', { source: req.query.source }));
    })
    .where(where);

  if (req.query.type === 'known') {
    query.whereNull('my_cjk.id');
  } else {
    query.whereNotNull('my_cjk.id');
  }

  const result = await query.limit(2500);

  const ideograms: any[] = [];
  result.forEach(item => {
    item.ideogram = ideogramConverter.convertUtf16ToIdeograms(item.ideogram);
    ideograms.push(item);
  });

  res.send({ ideograms });
});

router.get('/report_known_words', async (req: any, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where: any = {
    main: 1,
    hsk: req.query.hsk,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  const query = knex('cjk')
    .select('my_cjk.id', 'cjk.ideogram', 'cjk.hsk', 'cjk.pronunciation')
    .leftJoin('my_cjk', function leftJoin() {
      this.on('my_cjk.ideogram', '=', 'cjk.ideogram')
        .on('my_cjk.user_id', '=', req.user.id)
        .on(knex.raw('my_cjk.type = :type', { type: req.query.type }))
        .on(knex.raw('my_cjk.source = :source', { source: req.query.source }));
    })
    .where(where);
  if (req.query.type === 'known') {
    query.whereNotNull('my_cjk.id');
  } else {
    query.whereNull('my_cjk.id');
  }

  const result = await query.limit(2500);

  const ideograms: any[] = [];
  result.forEach(item => {
    item.ideogram = ideogramConverter.convertUtf16ToIdeograms(item.ideogram);
    ideograms.push(item);
  });

  res.send({ ideograms });
});

router.get('/ideograms_known_words', async (req: any, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where: any = {
    main: 1,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  let ideograms = {};

  const items = await knex('cjk')
    .select(knex.raw(`cjk.ideogram_raw`))
    .join('my_cjk', function join() {
      this.on('my_cjk.ideogram', '=', 'cjk.ideogram')
        .on('my_cjk.user_id', '=', req.user.id)
        .on(knex.raw('my_cjk.type = :type', { type: req.query.type }))
        .on(knex.raw('my_cjk.source = :source', { source: req.query.source }));
    })
    .where(where);

  for (const item of items) {
    for (let i = 0; i < item.ideogram_raw.length; i++) {
      if (!ideograms[item.ideogram_raw[i]]) {
        ideograms[item.ideogram_raw[i]] = 1;
      }
    }
  }

  res.send({ total: Object.keys(ideograms).length });
});

router.post('/', async (req: any, res) => {
  try {
    const ideogramConverted = ideogramConverter.convertIdeogramsToUtf16(
      req.body.ideogram,
    );

    let result = await knex('my_cjk')
      .where({
        ideogram: ideogramConverted,
        user_id: req.user.id,
        type: req.body.type,
        source: req.body.source,
      })
      .select('id');

    if (result.length === 0) {
      await knex('my_cjk').insert({
        ideogram: ideogramConverted,
        user_id: req.user.id,
        type: req.body.type,
        source: req.body.source,
        created_at: new Date(),
      });
    }

    res.send({ status: 'SUCCESS' });
  } catch (e) {
    res.status(500);
    res.send({
      status: 'ERROR',
      message: e.message,
    });
  }
});

router.delete('/', async (req: any, res) => {
  try {
    const ideogramConverted = ideogramConverter.convertIdeogramsToUtf16(
      req.body.ideogram,
    );

    await knex('my_cjk')
      .where({
        ideogram: ideogramConverted,
        user_id: req.user.id,
        type: req.body.type,
        source: req.body.source,
      })
      .del();

    res.send({ status: 'SUCCESS' });
  } catch (e) {
    res.status(500);
    res.send({
      status: 'ERROR',
      message: e.message,
    });
  }
});

module.exports = router;
