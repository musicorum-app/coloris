import { CachingBackend } from './backend.js'
import { Redis } from 'ioredis'
import { error, warn } from '../logging.js'

export class RedisBackend extends CachingBackend {
  public client?: Redis

  constructor () {
    super()

    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      keyPrefix: 'coloris:',
      lazyConnect: true
    })

    this.#registerErrorListener()
  }

  async start () {
    try {
      await this.client!.connect()
      return true
    } catch (e) {
      this.client!.disconnect()
      return false
    }
  }

  async get (key: string): Promise<any | undefined> {
    return this.client!.get(key)
  }

  async set (key: string, value: any, ttlInSeconds?: number) {
    if (ttlInSeconds) {
      await this.client!.setex(key, ttlInSeconds, value)
    } else {
      await this.client!.set(key, value)
    }
  }

  async delete (key: string) {
    await this.client!.del(key)
  }

  async clear () {
    // UNIMPLEMENTED
  }

  #registerErrorListener () {
    this.client!.on('error', (err) => {
      warn('cachingEngine.redis', `the redis client encountered an error: ${err}`)
    })
  }
}