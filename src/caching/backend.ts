export abstract class CachingBackend {
  abstract get (key: string): Promise<string | undefined>

  abstract set (key: string, value: string, ttlInSeconds?: number): Promise<void>

  abstract delete (key: string): Promise<void>

  abstract clear (): Promise<void>
}
