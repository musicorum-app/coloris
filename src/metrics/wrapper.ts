// wrapper for getting/setting metrics
import { Metric } from './types.js'
import { MetricsClient } from './client.js'

export class MetricWrapper {
  constructor (
    public metric: Metric<any>,
    public client: MetricsClient
  ) {
  }

  get isCounter () {
    return this.metric.type === 'counter'
  }

  increment (value: number = 1) {
    if (!this.isCounter) {
      throw new Error(`metric ${this.metric.name} is not a counter`)
    }

    this.metric.data += value
    this.client.registry.set(this.metric.name, this.metric)
  }
}