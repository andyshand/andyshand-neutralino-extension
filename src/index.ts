import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { client } from './client'
import { extensionId, NL_TOKEN } from './env'
import { ExtensionApiType } from './ExtensionApiType'
import { ExtensionOptions } from './ExtensionOptions'
import { log } from './log'
let extensionApi: ExtensionApiType

export function getExtensionApi() {
  return extensionApi
}

export default function createExtension(options: ExtensionOptions) {
  const { handlers, apiOutputDir } = options
  extensionApi = {
    log,
    sendEvent: ({ event, detail }: { event: string; detail: any }) => {
      const data = {
        id: uuidv4(),
        method: 'app.broadcast',
        accessToken: NL_TOKEN,
        data: {
          event,
          data: detail,
        },
      }
      client.send(JSON.stringify(data))
    },
  }

  client.onmessage = async function (e) {
    if (typeof e.data === 'string') {
      const { event, data } = JSON.parse(e.data)
      if (typeof data === 'object' && !!data && ('detail' in data ?? {})) {
        const { detail, id } = data
        log(`Received event: ${event}`, 'DEBUG')
        if (event in handlers) {
          try {
            const result = await handlers[event](...detail)
            extensionApi.sendEvent({
              event: `${extensionId}.return`,
              detail: { id, data: result },
            })
          } catch (e: any) {
            extensionApi.sendEvent({
              event: `${extensionId}.return`,
              detail: { id, error: e.message },
            })
          }
        } else {
          log(`No handler for event: ${event}`, 'WARN')
        }
      }
    }
  }

  // Create a require-able api for this extension
  const nodeModulesPath = path.join(
    apiOutputDir ?? process.cwd(),
    'node_modules',
    '@mtyk/neutralino-extension'
  )
  try {
    fs.mkdirSync(nodeModulesPath, { recursive: true })
  } catch (e) {}

  let jsApi = `
    import createClientApi from '@mtyk/neutralino-extension/client-api'
    const api = createClientApi(${JSON.stringify({ extensionId })})
  `
  let typedApi = ``
  for (const handler in options.handlers) {
    jsApi += `export const ${handler} = (data) => api.call(${JSON.stringify(
      handler
    )}, data)`
    typedApi += `export declare const ${handler}: (data) => Promise<any>`
  }

  fs.writeFileSync(path.join(nodeModulesPath, extensionId) + '.js', jsApi)
  fs.writeFileSync(path.join(nodeModulesPath, extensionId) + '.d.ts', typedApi)
  fs.writeFileSync(
    path.join(nodeModulesPath, 'client-api.js'),
    fs.readFileSync(path.join(__dirname, 'client-api', 'index.js'))
  )
  return extensionApi
}
