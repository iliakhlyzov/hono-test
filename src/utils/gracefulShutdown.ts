import { databaseService } from '../database'
import {Logger} from "./logger";

export const gracefulShutdown = async () => {
  Logger.info('Shutting down server...')
  await databaseService.close()
  process.exit(0)
}
