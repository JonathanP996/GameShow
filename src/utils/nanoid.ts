// Tiny id generator to avoid external deps
export function nanoid(size = 12): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let id = ''
  const bytes = crypto.getRandomValues(new Uint8Array(size))
  for (let i = 0; i < size; i++) {
    id += chars[bytes[i] % chars.length]
  }
  return id
}


