import minimist from 'minimist'
const args = minimist(process.argv.slice(2))
export const PORT = args['nl-port']
export const NL_TOKEN = args['nl-token']
export const extensionId = args['nl-extension-id']
export const wsUrl = `ws://localhost:${PORT}?extensionId=${extensionId}`
