import WebSocket from 'ws'
import { wsUrl } from './env'
import { log } from './log'

export const client = new WebSocket(wsUrl)
client.onerror = function () {
  log('Connection error!', 'ERROR')
}
client.onopen = function () {
  log('Connected')
}
client.onclose = function () {
  log('Connection closed')
  // Make sure to exit the extension process when WS extension is closed (when Neutralino app exits)
  process.exit()
}
