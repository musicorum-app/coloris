import { defaultValues, Metric, MetricConfiguration, MetricTypeByName } from './types.js'
import { MetricWrapper } from './wrapper.js'
import { MetricTimeTracer } from './trace.js'

export class MetricsClient {
  public registry = new Map<string, Metric<any>>()
  public histogramRegistry = new Map<string, number[]>()
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
      type: metric,
      buckets: config.buckets || (metric === 'histogram' ? [0.1, 0.5, 1, 5, 10] : undefined)
    }
    this.registry.set(config.name, data)

    return new MetricWrapper(data, this)
  }

  mark (label: string) {
    return MetricTimeTracer.mark(label)
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

  // return buckets and inf
  getHistogramData (name: string): [string | number, number][] {
    const metric = this.histogramRegistry.get(name)
    if (metric === undefined) {
      return []
    }
    const buckets = this.get(name)?.metric.buckets!

    return metric.map((value, index) => {
      if (index === metric.length - 1) {
        return ['+Inf', value]
      }

      return [buckets[index], value]
    })
  }

  toPrometheus () {
    const lines: string[] = []
    for (const metric of this.registry.values()) {
      let data = metric.data
      switch (metric.type) {
        case 'counter':
          lines.push(`# HELP ${metric.name} ${metric.description}`)
          lines.push(`# TYPE ${metric.name} counter`)
          lines.push(`${metric.name} ${data}`)
          break
        case 'histogram':
          data = data as undefined
          const histogramData = this.getHistogramData(metric.name)
          lines.push(`# HELP ${metric.name} ${metric.description}`)
          lines.push(`# TYPE ${metric.name} histogram`)
          for (const [bucket, value] of histogramData) {
            lines.push(`${metric.name}_bucket{le="${bucket}"} ${value}`)
          }
          lines.push(`${metric.name}_count ${histogramData.reduce((acc, [_, value]) => acc + value, 0)}`)
          lines.push(`${metric.name}_sum ${histogramData.reduce((acc, [bucket, value]) => acc + (bucket === '+Inf' ? 0 : bucket as number) * value, 0)}`)
          break
        /*case 'gauge':
          lines.push(`# HELP ${metric.name} ${metric.description}`)
          lines.push(`# TYPE ${metric.name} gauge`)
          lines.push(`${metric.name} ${data}`)
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