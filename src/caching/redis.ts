import { CachingBackend } from './backend.js'
import { createClient, RedisClientType, RedisModules } from 'redis'
import { error, grey } from '../logging.js'

export class RedisBackend extends CachingBackend {
  public client?: RedisClientType<RedisModules>

  constructor () {
    super()

    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: () => {
          return 5
        }
      }
    })
  }

  async start () {
    // noinspection ExceptionCaughtLocallyJS
    try {
      const now = Date.now()
      await this.client!.connect()

      // wait for the client to be ready or timeout after 5 seconds
      while (!this.client!.isOpen || Date.now() - now > 5000) {
      }

      if (!this.client!.isReady) {
        await this.client!.disconnect()
        throw new Error('Redis client is not ready')
      }

      this.#registerErrorListener()
      return true
    } catch (e) {
      error('cachingEngine.redis', `unable to connect to redis\n${grey(e.stack)}`)
      throw e
    }
  }

  async get (key: string): Promise<any | undefined> {
    return this.client!.get(key)
  }

  async setTTL (key: string, value: any, ttl: number) {
    await this.client!.set(key, value, {
      EX: ttl / 1000
    })
  }

  async set (key: string, value: any) {
    await this.client!.set(key, value)
  }

  async delete (key: string) {
    await this.client!.del(key)
  }

  async clear () {
    // UNIMPLEMENTED
  }

  #registerErrorListener () {
    this.client!.on('error', (err) => {
      error('cachingEngine.redis', `The Redis client encountered an error: ${err}`)
    })
  }
}