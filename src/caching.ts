import { CachingBackend } from './caching/backend.js'
import { debug, error, info, warn } from './logging.js'
import { RedisBackend } from './caching/redis.js'
import { isBun, isDevelopment, randomString } from './utils.js'
import { InMemoryBackend } from './caching/memory.js'

class CachingWrapper extends CachingBackend {
  backend: CachingBackend

  constructor () {
    super()

    debug('cachingEngine.start', 'starting cachingEngine engine')
    if (isBun) {
      info('cachingEngine.start', 'app is running under bun, using in-memory cache')
      this.backend = new InMemoryBackend()
      return
    }
    const redisBackend: RedisBackend = new RedisBackend()
    redisBackend.start()
      .then(() => {
        info('cachingEngine.start', 'using redis as cache backend')
        this.backend = redisBackend
      })
      .catch(() => {
        if (!isDevelopment) {
          error('cachingEngine.start', 'preposterous caching configuration! redis was not found, exiting')
          process.exit(1)
        }
        warn('cachingEngine.start', 'redis was not found, using simple in-memory')
        this.backend = new InMemoryBackend()
      })
  }

  get (key: string) {
    return this.backend.get(key)
  }

  set (key: string, value: string) {
    return this.backend.set(key, value)
  }

  setTTL (key: string, value: string, ttl: number) {
    return this.backend.setTTL(key, value, ttl)
  }

  delete (key: string) {
    return this.backend.delete(key)
  }

  clear () {
    return this.backend.clear()
  }

  async quickSave (data: string) {
    const id = randomString()
    await this.setTTL(id, data, 5 * 60 * 1000)
    return id
  }

  async quickEdit (id: string, data: string) {
    await this.setTTL(id, data, 5 * 60 * 1000)
  }
}

export default new CachingWrapper()