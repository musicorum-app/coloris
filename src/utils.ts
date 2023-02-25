export const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production'

// @ts-ignore
export const isBun = (typeof process !== 'undefined') && process.isBun

export const randomString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
