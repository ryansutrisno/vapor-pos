import crypto from 'crypto';

export interface RequestMetadata {
  ip: string | undefined;
  userAgent: string | undefined;
  requestId: string;
  timestamp: string;
  referer?: string;
  method: string;
  path: string;
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}

export function createRequestMetadata(
  ip: string | undefined,
  userAgent: string | undefined,
  method: string,
  path: string,
  referer?: string
): RequestMetadata {
  return {
    ip,
    userAgent,
    requestId: generateRequestId(),
    timestamp: new Date().toISOString(),
    referer,
    method,
    path
  };
}

export function metadataToJSON(metadata: RequestMetadata): string {
  return JSON.stringify(metadata);
}

export function parseRequestMetadata(json: string): RequestMetadata | null {
  try {
    return JSON.parse(json) as RequestMetadata;
  } catch {
    return null;
  }
}

export function getClientIP(req: { headers: Record<string, string | string[] | undefined>; socket: { remoteAddress?: string } }): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
    return ips[0]?.trim();
  }
  return req.socket.remoteAddress;
}
