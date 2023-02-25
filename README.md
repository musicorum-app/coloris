## @musicorum/coloris

coloris is a set of tools for back-end applications, providing things such as logging, prometheus metrics,
configuration, and more.

### how?

overly complex hello world:

```js
import {log, metrics} from '@musicorum/coloris'

metrics.setAppName('test')

const metric = metrics.register('counter', {
    name: 'http_requests_total',
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
