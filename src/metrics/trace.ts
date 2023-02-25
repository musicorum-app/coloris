import { bold, grey, italic, strikethrough, underline } from '../logging.js'

export class MetricTimeTracer {
  public readonly startedAt: number
  public endedAt?: number
  public children: MetricTimeTracer[] = []

  constructor (
    public label: string,
    public isRoot: boolean,
    public parent?: MetricTimeTracer
  ) {
    this.startedAt = Date.now()
  }

  static mark (label: string) {
    return new MetricTimeTracer(label, true)
  }

  mark (label: string) {
    const child = new MetricTimeTracer(this.label + '.' + label, false, this)
    this.children.push(child)
    return child
  }

  done () {
    this.endedAt = Date.now()
  }

  prettyPrint (indent = 2) {
    const lines: string[] = []
    const prefix = ' '.repeat(indent)
    const finishedIn = this.endedAt ? grey(italic(`- finished in ${bold((this.endedAt - this.startedAt).toString(), false)}ms`)) : '- ' + underline(`still running`) + grey(italic(` (started ${bold((Date.now() - this.startedAt).toString(), false)}ms ago)`))

    if (this.isRoot) {
      lines.push(`time trace for ${underline(this.label)} ${finishedIn}`)
    }

    lines.push(`${prefix}${strikethrough('>')} ${bold(this.label)} ${finishedIn}`)
    for (const child of this.children) {
      lines.push(...child.prettyPrint(indent + 2))
    }
    return lines
  }

  toString () {
    return this.prettyPrint().join('\n')
  }
}