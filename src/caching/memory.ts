import { CachingBackend } from './backend.js'

export class InMemoryBackend extends CachingBackend {
  private cache: Record<string, any> = {}

  constructor () {
    super()
  }

  async get (key: string) {
    return this.cache[key]
  }

  async set (key: string, value: any, ttlInSeconds?: number) {
    this.cache[key] = value
    if (ttlInSeconds) {
      setTimeout(() => {
        delete this.cache[key]
      }, ttlInSeconds * 1000)
    }
  }

  async delete (key: string) {
    delete this.cache[key]
  }

  async clear () {
    this.cache = {}
  }
}