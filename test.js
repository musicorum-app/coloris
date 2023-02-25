import {cache, log, metrics} from './dist/index.js'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

await cache.start()
metrics.setAppName('test')

const metric = metrics.register('counter', {
    name: 'test',
    description: 'test metric'
})

metric.increment()
metrics.get('test').increment()

const hist = metrics.register('histogram', {
    name: 'testhi',
    description: 'test metric'
})

log.info('test.main', 'testing histogram capabilities')
hist.observe()
hist.end()
hist.observe()
await sleep(5000)
hist.end()
log.info('test.main', 'testing histogram capabilities done')
console.log(log.grey(metrics.toPrometheus()))

await cache.set('test', 'hello world')
await cache.set('objTest', {hello: 'world'})

log.info('test.main', `test key value: ${await cache.get('test')}`)
log.info('test.main', `objTest key value: ${JSON.stringify(await cache.get('objTest'))}`)

log.info('test.main', `metric data: ${metrics.getData('test')}`)

const checkpoint = metrics.mark('hello')
const a = checkpoint.mark('one')
await sleep(50)
a.done()
const b = checkpoint.mark('two')
await sleep(50)
const c = b.mark('three')
await sleep(50)
const dangling = b.mark('dangling')
c.done()
b.done()
checkpoint.done()
console.log(checkpoint.toString())

log.error('test.main', 'bye there!')