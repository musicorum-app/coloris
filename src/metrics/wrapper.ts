// wrapper for getting/setting metrics
import { Metric } from './types.js'
import { MetricsClient } from './client.js'

export class MetricWrapper {
  private internalData: Metric<any>['data']

  constructor (
    public metric: Metric<any>,
    public client: MetricsClient
  ) {
  }

  get isCounter () {
    return this.metric.type === 'counter'
  }

  get isHistogram () {
    return this.metric.type === 'histogram'
  }

  increment (value: number = 1) {
    if (!this.isCounter) {
      throw new Error(`metric ${this.metric.name} is not a counter`)
    }

    this.metric.data += value
    this.client.registry.set(this.metric.name, this.metric)
  }

  observe () {
    if (!this.isHistogram) {
      throw new Error(`metric ${this.metric.name} is not a histogram`)
    }

    this.internalData = [Date.now(), null]
    this.client.registry.set(this.metric.name, this.metric)
  }

  end () {
    if (!this.isHistogram) {
      throw new Error(`metric ${this.metric.name} is not a histogram`)
    }

    if (this.internalData === undefined) {
      throw new Error(`metric ${this.metric.name} has not been observed`)
    }

    const [start, end] = [this.internalData[0], Date.now()]
    const duration = (end - start) / 1000

    const data = this.client.histogramRegistry.get(this.metric.name) || new Array(this.metric.buckets!.length + 1).fill(0)

    let i = 0
    for (const bucket of this.metric.buckets!) {
      if (duration <= bucket) {
        // push to client.histogramRegistry
        data[i] += 1
      }
      i++
    }

    data[data.length - 1] += 1
    this.client.histogramRegistry.set(this.metric.name, data)
  }
}