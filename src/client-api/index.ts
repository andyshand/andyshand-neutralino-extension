declare const window: any
const v4 = require('uuid').v4
const N = window.Neutralino

const waitingPromisesById: {
  [key: string]: { resolve: Function; reject: Function }
} = {}

export default function createClientApi({
  extensionId,
}: {
  extensionId: string
}) {
  N.events.on(`${extensionId}.return`, async (event: any) => {
    const { detail } = event
    const { id, data, error } = detail
    if (id in waitingPromisesById) {
      const { resolve, reject } = waitingPromisesById[id]
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
      delete waitingPromisesById[id]
    }
  })

  return {
    call: (name: string, ...args: any) => {
      const id = v4()
      return new Promise((resolve, reject) => {
        waitingPromisesById[id] = { resolve, reject }
        N.extensions.dispatch(extensionId, name, { detail: args, id })
      })
    },
  }
}
