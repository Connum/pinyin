import * as backHtmlTags from 'pdf-pinyin/src/core/pinyin/back.html.tags';
import * as fillBoldItalic from 'pdf-pinyin/src/core/pinyin/fill.bold.italic';
import * as replaceall from 'replaceall';
import * as striptags from 'striptags';
import * as isChinese from '../../../../../../shared/helpers/is-chinese';
import * as replaceIdeogramsToSpace from '../../../../../../shared/helpers/special-ideograms-chars';
import { BlockInterface } from '../../../../core/interfaces/block.interface';
import { replaceWords } from '../../../../core/sites/helpers/replace.words';
import { segmentText } from '../../../../core/sites/helpers/segment.text';
// @ts-ignore
import * as UnihanSearch from '../../../../services/UnihanSearch';
import { parseBible } from '../helpers/parse.bible';
import { ParseItemInterface } from '../interfaces/parse.item.interface';
import * as separatePinyinInSyllables from '../../../../../../shared/helpers/separate-pinyin-in-syllables';

export class WithoutPdfParser {
  public async parse(item: ParseItemInterface): Promise<BlockInterface[]> {
    const text = item.chinese.text!;

    const numberRegex = new RegExp('^[0-9]+$');

    let lineText = '';
    const lineWithoutTags = striptags(text);
    lineText = segmentText(lineWithoutTags);

    const specialWord = 'JOIN_SPECIAL';

    // separate by numbers
    lineText = lineText
      .split(/(\d+)/)
      .map(item => {
        if (numberRegex.test(item)) {
          item = ` ${item}${specialWord} `;
        }
        return item;
      })
      .join('');

    replaceIdeogramsToSpace.forEach(item => {
      lineText = replaceall(item, ` ${item}${specialWord} `, lineText);
    });

    // remove double spaces
    if (lineText) {
      lineText = lineText.replace(/\s{2,}/g, ' ').trim();
    }

    const ideograms = lineText.split(' ');
    const ideogramsFiltered: any[] = [];

    let joinSpecial = '';

    ideograms.forEach(ideogram => {
      if (ideogram === specialWord) {
        return;
      }

      if (
        ideogram.substring(ideogram.length - specialWord.length) === specialWord
      ) {
        joinSpecial += ideogram.replace(specialWord, '');
        return;
      } else if (joinSpecial) {
        ideogramsFiltered.push(joinSpecial);
        joinSpecial = '';
      }

      ideogramsFiltered.push(ideogram);
    });

    if (joinSpecial) {
      ideogramsFiltered.push(joinSpecial);
    }

    lineText = ` ${ideogramsFiltered.join(' ')} `;
    lineText = replaceWords(lineText);

    let response: any[] = lineText
      .split(' ')
      .filter(item => item)
      .map(item => {
        return {
          c: item.split(''),
          p: [],
        };
      });

    response = backHtmlTags(response, text);

    response = fillBoldItalic(text, response);

    if (response.length > 0) {
      response[0].line = {
        type: item.chinese.type,
        pinyin_source: 'no_pdf',
      };
    }

    let bible;
    for (let item of response) {
      delete item.tagsStart;
      delete item.tagsEnd;

      item.c = item.c.join('');
      item.p = '';

      if (item.isBold) {
        item.isBold = 1;
      }

      if (item.isItalic) {
        item.isItalic = 1;
      }

      // @ts-ignore
      const tempBible = parseBible(item.tagsStart);
      if (tempBible) {
        bible = tempBible;
      }

      if (bible && !isChinese(item.c, true)) {
        item.b = bible;
        bible = null;
      }
    }

    return await this.pinyin(response);
  }

  public async pinyin(blocks: BlockInterface[]): Promise<BlockInterface[]> {
    let text = '';
    for (const block of blocks) {
      text += block.c + ' ';
    }

    text = text.trim();

    const pinyinList = await UnihanSearch.toPinyin(text.split(' '));
    let i = 0;
    for (const pinyinReturn of pinyinList) {
      blocks[i].p = separatePinyinInSyllables(pinyinReturn.pinyin).join(
        String.fromCharCode(160),
      );
      i++;
    }

    return blocks;
  }
}