import { Arguments, CommandModule } from 'yargs';
// @ts-ignore
import * as JWDownloader from '../services/JWDownloader';

export class JwBibleTraditionalCommand implements CommandModule {
  public command = 'jw:bible-traditional';
  public describe = 'JW Bible Traditional';

  public async handler(argv: Arguments) {
    await JWDownloader.getTraditionalBible();
    process.exit();
  }
}
