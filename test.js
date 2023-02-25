import {cache, log, metrics} from './dist/index.js'

metrics.setAppName('test')
const metric = metrics.register('counter', {
    name: 'test',
    description: 'test metric'
})
metric.increment()
metrics.get('test').increment()
await cache.set('test', 'hello world')
log.info('test.main', `test key value: ${await cache.get('test')}`)
log.info('test.main', `metric data: ${metrics.getData('test')}`)
log.error('test.main', 'bye there!')