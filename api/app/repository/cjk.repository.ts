import { BaseRepository } from './base.repository';
import { CjkRepository as DatabaseCjkRepository } from './database/cjk.repository';

export class CjkRepository extends BaseRepository {
  static async findAll() {
    return DatabaseCjkRepository.findAll();
  }

  static async findChineseToolsNotNull(language: string): Promise<any[]> {
    return DatabaseCjkRepository.findChineseToolsNotNull(language);
  }

  static async findChineseToolsIsNull(
    language: string,
    limit: number,
  ): Promise<any[]> {
    return DatabaseCjkRepository.findChineseToolsIsNull(language, limit);
  }

  static async findGlosbeNotNull(language: string): Promise<any[]> {
    return DatabaseCjkRepository.findGlosbeNotNull(language);
  }

  static async findGlosbeIsNull(
    language: string,
    limit: number,
  ): Promise<any[]> {
    return DatabaseCjkRepository.findGlosbeIsNull(language, limit);
  }

  static async findIdeogramRawIsNull(): Promise<any[]> {
    return DatabaseCjkRepository.findIdeogramRawIsNull();
  }

  static async searchPronunciationByWord(ideograms) {
    return DatabaseCjkRepository.searchPronunciationByWord(ideograms);
  }

  static async save(cjk) {
    return DatabaseCjkRepository.save(cjk);
  }

  static async referencePhrases() {
    return DatabaseCjkRepository.referencePhrases();
  }
}
