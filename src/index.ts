import minimist from 'minimist'
import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid'
const args = minimist(process.argv.slice(2))
const PORT = args['nl-port']
const NL_TOKEN = args['nl-token']
const NL_EXTID = args['nl-extension-id']
const wsUrl = `ws://localhost:${PORT}?extensionId=${NL_EXTID}`
const client = NL_EXTID ? new WebSocket(wsUrl) : {}

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

client.onmessage = function (e) {
  if (typeof e.data === 'string') {
    let message = JSON.parse(e.data)

    // Use extensions.dispatch or extensions.broadcast from the app,
    // to send an event here
    switch (message.event) {
      case 'eventToExtension':
        log(message.data)
        // Use Neutralinojs server's messaging protocol to trigger native API functions
        // Use app.broadcast method to send an event to all app instances
        client.send(
          JSON.stringify({
            id: uuidv4(),
            method: 'app.broadcast',
            accessToken: NL_TOKEN,
            data: {
              event: 'eventFromExtension',
              data: 'Hello app!',
            },
          })
        )
        break
    }
  }
}

function log(message: string, type = 'INFO') {
  let logLine = `[${NL_EXTID}]: `
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

export interface ExtensionOptions {}

export default function createExtension(options: ExtensionOptions) {
  return {
    sendEvent: (event: string, detail: any) => {
      client.send(
        JSON.stringify({
          id: uuidv4(),
          method: 'app.broadcast',
          accessToken: NL_TOKEN,
          data: {
            event,
            data: detail,
          },
        })
      )
    },
  }
}
