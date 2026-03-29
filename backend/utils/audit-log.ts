type AuditPayload = Record<string, unknown>;

export function logAuditEvent(action: string, payload: AuditPayload = {}) {
  console.info(
    JSON.stringify({
      level: "audit",
      action,
      timestamp: new Date().toISOString(),
      ...payload
    })
  );
}
