export interface MetricConfiguration {
  name: string
  description: string
  buckets?: number[]
}

export interface Metric<T> extends MetricConfiguration {
  data: T
  type: keyof MetricTypeByName
}

export type MetricInfo<T> = T

export type MetricTypeByName = {
  'counter': MetricInfo<number>
  'histogram': MetricInfo<undefined>
}

type MetricDefaultValues = {
  [id in keyof MetricTypeByName]: MetricTypeByName[id] extends MetricInfo<infer T> ? T : never
}

export const defaultValues: MetricDefaultValues = {
  counter: 0,
  histogram: undefined
}
