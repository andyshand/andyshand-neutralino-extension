export interface ExtensionOptions {
  handlers: { [eventName: string]: (...args: any[]) => Promise<void> }
  apiOutputDir?: string
  name: string
}
