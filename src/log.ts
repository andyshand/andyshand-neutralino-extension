import { extensionId } from './env'

export function log(message: string, type = 'INFO') {
  let logLine = `[${extensionId}]: `
  switch (type) {
    case 'INFO':
      const greenColor = '\x1b[32m'
      logLine += greenColor + type
      logLine += ' ' + JSON.stringify(message)
      console.log(logLine)
      break
    case 'ERROR':
      const redColor = '\x1b[31m'
      logLine += redColor + type
      logLine += ' ' + JSON.stringify(message)
      console.error(logLine)
      break
  }
}
