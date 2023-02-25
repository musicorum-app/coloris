## coloris metrics

```ts
import { metrics } from '@musicorum/coloris'

// metric name must be composed of the following parts, separated by dots:
// - the name of the application
// - the name of the module/engine/feature
// - the name of the metric itself

// if you use the catallena function, the first part will be automatically added

metrics.setAppName('catallena')

const metric = metrics.register('counter', {
  name: 'catallena.database.savedTracks',
  description: 'Number of tracks saved in the database'
})

metrics.get('database.savedTracks').increase()
// or...
metric.increase()

const checkpoint = metrics.trace('database.myHeavyOperation')
await someHeavyOperation()
// this will automatically measure the time between the checkpoint creation and the call to this function
// if the app is not running in production, it will also log the time it took to execute the operation
checkpoint()
```