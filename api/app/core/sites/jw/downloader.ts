import { http } from '../../../helpers/http';
import * as profiler from '../../../helpers/profiler';
import * as cheerio from 'cheerio';
import { Parser } from './parser';
import * as UnihanSearch from '../../../services/UnihanSearch';
import * as bluebird from 'bluebird';
import { Curl } from 'node-libcurl';
import { orderBy } from 'lodash';
import { Encoder } from './encoder';

export class Downloader {
  public async download(
    url: string,
    language: string,
    ideogramType: string,
    convertPinyin: boolean = true,
  ) {
    const encoder = new Encoder();

    profiler(`Download JW Start - ${encoder.encodeUrl(url)}`);

    if (!ideogramType) {
      ideogramType = 's';
    }

    const chineseSites = [
      'https://www.jw.org/cmn-hans',
      'https://www.jw.org/cmn-hant',
    ];
    let isChinese = false;
    let newLanguage: string = '';
    chineseSites.forEach(chineseSite => {
      if (url.substring(0, chineseSite.length) === chineseSite) {
        isChinese = true;
      }
    });

    const parser = new Parser();

    let response;

    try {
      response = await this.downloadUrl(encoder.encodeUrl(url));
    } catch (e) {
      profiler('Download on exception: ' + url);
      response = await this.downloadUrl(url);
    }

    profiler('Download JW End');

    try {
      response = JSON.parse(response);
      if (response.items[0].content) {
        response = '<div id="article">' + response.items[0].content + '</div>';
      }
    } catch (e) {}

    let $ = cheerio.load(response);
    if (!isChinese) {
      newLanguage = String(url.replace('https://www.jw.org/', '')).split(
        '/',
      )[0];

      const chineseLink = $(`link[hreflang="cmn-han${ideogramType}"]`);
      if (chineseLink.length > 0) {
        const link = `https://www.jw.org${chineseLink.attr('href')}`;
        profiler(`Download JW Start - Chinese - ${encoder.encodeUrl(link)}`);
        try {
          response = await this.downloadUrl(encoder.encodeUrl(link));
        } catch (e) {
          response = await this.downloadUrl(link);
        }

        profiler('Download JW End - Chinese');
        $ = cheerio.load(response);
      }
    }

    profiler('Parse JW Start');

    const parsedDownload: any = await parser.parse($, true);

    if (language) {
      if (newLanguage) {
        language = newLanguage;
      }
      const translateLink = $(`link[hreflang="${language}"]`);
      if (translateLink.length > 0) {
        const link = `https://www.jw.org${translateLink.attr('href')}`;
        profiler('Download JW (Language) Start');
        response = await http.get(link);
        profiler('Parse JW (Language) Start');
        $ = cheerio.load(response.data);
        const parsedDownloadLanguage: any = await parser.parse($, false);
        parsedDownloadLanguage.text.forEach((item, i) => {
          if (item.type === 'img') {
            return;
          }

          if (item.type === 'box-img') {
            return;
          }

          if (!parsedDownload.text[i]) {
            parsedDownload.text[i] = {};
          }

          parsedDownload.text[i].trans = item.text;
        });
      }
    }

    if (parsedDownload.links) {
      profiler('Getting links');
      const responseLinks: any = { links: [] };
      await bluebird.map(
        parsedDownload.links,
        async (l: any, i) => {
          if (!l.link) {
            return;
          }

          const jwLink = l.link.includes('https://www.jw.org')
            ? l.link
            : `https://www.jw.org${l.link}`;

          const linkResponse = await this.download(
            encoder.decodeUrl(jwLink),
            language,
            ideogramType,
            convertPinyin,
          );

          responseLinks.links.push({
            number: l.number,
            title: l.title,
            title_pinyin: l.title_pinyin,
            link: encoder.decodeUrl(jwLink),
            content: linkResponse,
          });
        },
        { concurrency: 4 },
      );

      responseLinks.links = orderBy(responseLinks.links, ['number']);

      return responseLinks;
    }

    if (convertPinyin) {
      profiler('Pinyin Start');

      await bluebird.map(
        parsedDownload.text,
        async (item: any, i) => {
          if (item.type === 'img') {
            return;
          }

          if (item.type === 'box-img') {
            return;
          }

          if (!item.text) {
            item.text = '';
          }

          const ideograms = item.text.split(' ');
          const pinyin = await UnihanSearch.toPinyin(ideograms);
          const pinynReturn: any[] = [];
          pinyin.forEach(pinyinItem => {
            pinynReturn.push(pinyinItem.pinyin);
          });

          parsedDownload.text[i].pinyin = pinynReturn;
        },
        { concurrency: 4 },
      );
    }

    profiler('End');

    return parsedDownload;
  }

  protected async downloadUrl(url: string) {
    const curl = new Curl();
    curl.setOpt('URL', url);
    curl.setOpt('FOLLOWLOCATION', true);
    return new Promise((done, reject) => {
      curl.on('end', (statusCode, body, headers) => {
        if (statusCode > 400) {
          reject();
          return;
        }

        curl.close.bind(curl);
        done(body);
      });

      curl.on('error', () => {
        curl.close.bind(curl);
        reject();
      });
      curl.perform();
    });
  }
}
