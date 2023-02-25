export interface MetricConfiguration {
  name: string
  description: string
}

export interface Metric<T> extends MetricConfiguration {
  data: T
  type: keyof MetricTypeByName
}

export interface Counter extends Metric<number> {
  increment: (value: number) => void
}

export type MetricInfo<M extends MetricConfiguration, T> = M

export type MetricTypeByName = {
  'counter': MetricInfo<Counter, number>
}

type MetricDefaultValues = {
  [id in keyof MetricTypeByName]: MetricTypeByName[id] extends MetricInfo<any, infer T> ? T : never
}

export const defaultValues: MetricDefaultValues = {
  counter: 0
}
