## @musicorum/coloris

coloris is a set of tools for back-end applications, providing things such as logging, prometheus metrics,
configuration, and more.

### how?

overly complex hello world:

```js
import {log, metrics, cache} from '@musicorum/coloris'

await cache.start()
metrics.setAppName('test')

const metric = metrics.register('counter', {
    name: 'server.totalRequests',
    description: 'total number of http requests'
})

server.get('/', (req, res) => {
    log.info('server.handler', 'got a request!')
    metric.increase()
    res.send('hello world!')
})

server.get('/metrics', (req, res) => {
    res.send(metrics.toPrometheus())
})

server.listen(3000)
```

## what does it look like?

![example](https://i.imgur.com/h46s283.jpg)