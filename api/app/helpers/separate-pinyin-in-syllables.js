const vowels = 'aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜ';
const tones = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ';
function separate(pinyin) {
  return pinyin
    .replace(new RegExp(`([${vowels}])([^${vowels}nr])`, 'g'), '$1 $2') // This line does most of the work
    // eslint-disable-next-line
    .replace(new RegExp('(\w)([csz]h)'), '$1 $2') // double-consonant initials

    .replace(new RegExp(`(n)([^${vowels}vg])`), '$1 $2') // cleans up most n compounds
    // eslint-disable-next-line
    .replace(new RegExp('([' + vowels + 'v])([^' + vowels + '\w\s])([' + vowels + 'v])'), '$1 $2$3') // assumes correct Pinyin (i.e., no missing apostrophes)
    // eslint-disable-next-line
    .replace(new RegExp('([' + vowels + 'v])(n)(g)([' + vowels + 'v])'), '$1$2 $3$4') // assumes correct Pinyin, i.e. changan = chan + gan
    // eslint-disable-next-line
    .replace(new RegExp('([gr])([^' + vowels + '])'), '$1 $2'); // fixes -ng and -r finals not followed by vowels
    // eslint-disable-next-line
    //.replace(new RegExp('([^e\w\s])(r)'), '$1 $2'); // r an initial, except in er
}

module.exports = function (pinyin) {
  const pinyinSeparated = separate(pinyin).split(' ');
  const newPinyin = [];
  pinyinSeparated.forEach((p) => {
    let totalTones = 1;
    const pregMatch = p.match(new RegExp(`([${tones}])`, 'g'));
    if (pregMatch) {
      totalTones = pregMatch.length;
    }

    if (p.length > 6 || totalTones > 1) {
      separate(p).split(' ').forEach((newP) => {
        newPinyin.push(newP);
      });
    } else {
      newPinyin.push(p);
    }
  });

  return newPinyin.join(' ');
}