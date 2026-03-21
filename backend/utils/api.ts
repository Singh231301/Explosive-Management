export function ok(data: unknown) {
  return { success: true, data };
}

export function fail(message: string, details?: unknown) {
  return { success: false, message, details };
}
