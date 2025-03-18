import { databaseService } from '../database'

export const gracefulShutdown = async () => {
  console.log('Shutting down server...')
  await databaseService.close()
  process.exit(0)
}
