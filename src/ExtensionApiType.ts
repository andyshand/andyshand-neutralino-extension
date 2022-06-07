export interface ExtensionApiType {
  log: (message: string, type?: string) => void
  sendEvent: (details: { event: string; detail: any }) => void
}
