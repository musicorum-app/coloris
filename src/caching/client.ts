import { CachingBackend } from './backend.js'
import { debug, error, info, warn } from '../logging.js'
import { RedisBackend } from './redis.js'
import { isBun, isDevelopment, randomString } from '../utils.js'
import { InMemoryBackend } from './memory.js'

class CachingWrapper extends CachingBackend {
  backend: CachingBackend = new InMemoryBackend()

  constructor () {
    super()
  }

  async start () {
    debug('cachingEngine.start', 'starting cachingEngine engine')
    if (isBun) {
      info('cachingEngine.start', 'app is running under bun, using in-memory cache')
      return
    }

    const redisBackend: RedisBackend = new RedisBackend()

    if (await redisBackend.start()) {
      info('cachingEngine.start', 'using redis as cache backend')
      this.backend = redisBackend
    } else {
      if (!isDevelopment) {
        error('cachingEngine.start', 'preposterous caching configuration! redis was not found, exiting')
        process.exit(1)
      }
      warn('cachingEngine.start', 'redis was not found, using simple in-memory')
    }
  }

  async get (key: string) {
    const value = await this.backend.get(key)
    if (typeof value === 'string' && value.startsWith('jsonObject:')) {
      return JSON.parse(value.slice(11))
    }
    return value
  }

  set (key: string, value: any, ttlInSeconds?: number) {
    if (typeof value === 'object') {
      value = 'jsonObject:' + JSON.stringify(value)
    }

    return this.backend.set(key, value, ttlInSeconds)
  }

  delete (key: string) {
    return this.backend.delete(key)
  }

  clear () {
    return this.backend.clear()
  }

  async quickSave (data: string, timeInSeconds = 5 * 60) {
    const id = randomString()
    await this.set(id, data, timeInSeconds)
    return id
  }

  async quickEdit (id: string, data: string, timeInSeconds = 5 * 60) {
    await this.set(id, data, timeInSeconds)
  }
}

export default new CachingWrapper()