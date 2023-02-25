import { defaultValues, Metric, MetricConfiguration, MetricTypeByName } from './types.js'
import { MetricWrapper } from './wrapper.js'

export class MetricsClient {
  public registry = new Map<string, Metric<any>>()
  appName: string | undefined = undefined

  setAppName (name: string) {
    this.appName = name
  }

  register<T extends keyof MetricTypeByName> (metric: T, config: MetricConfiguration): MetricWrapper {
    this.validateName(config.name)
    const data = {
      name: config.name,
      description: config.description,
      data: defaultValues[metric],
      type: metric
    }
    this.registry.set(config.name, data)

    return new MetricWrapper(data, this)
  }

  get (name: string) {
    const metric = this.registry.get(name)
    if (metric === undefined) {
      throw new Error(`metric ${name} not found`)
    }

    return new MetricWrapper(metric, this)
  }

  validateName (name: string) {
    if (this.appName === undefined) {
      throw new Error('app name not set')
    }

    if (name.includes(' ')) {
      throw new Error('metric name must not contain spaces')
    }
  }

  getData (name: string) {
    const metric = this.registry.get(name)
    return metric?.data
  }

  toPrometheus () {
    const lines: string[] = []
    for (const metric of this.registry.values()) {
      const data = metric.data
      switch (metric.type) {
        case 'counter':
          lines.push(`# HELP ${metric.name} ${metric.description}`)
          lines.push(`# TYPE ${metric.name} counter`)
          lines.push(`${metric.name} ${data}`)
          break
        /*case 'gauge':
          lines.push(`# HELP ${metric.name} ${metric.description}`)
          lines.push(`# TYPE ${metric.name} gauge`)
          lines.push(`${metric.name} ${data}`)
          break
        case 'histogram':
          lines.push(`# HELP ${metric.name} ${metric.description}`)
          lines.push(`# TYPE ${metric.name} histogram`)
          for (const [key, value] of Object.entries(data)) {
            lines.push(`${metric.name}_bucket{le="${key}"} ${value}`)
          }
          lines.push(`${metric.name}_count ${data.count}`)
          lines.push(`${metric.name}_sum ${data.sum}`)
          break
        case 'summary':
          lines.push(`# HELP ${metric.name} ${metric.description}`)
          lines.push(`# TYPE ${metric.name} summary`)
          for (const [key, value] of Object.entries(data.quantiles)) {
            lines.push(`${metric.name}_quantile{quantile="${key}"} ${value}`)
          }
          lines.push(`${metric.name}_count ${data.count}`)
          lines.push(`${metric.name}_sum ${data.sum}`)
          break*/
      }
    }

    return lines.join('\n')
  }
}

export default new MetricsClient()