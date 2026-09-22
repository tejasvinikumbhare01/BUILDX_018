/**
 * Generates human-readable, trackable disaster management IDs.
 * Format: INC-YYYYMMDD-XXXXX
 */
export function generateIncidentId(): string {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // 5-character alphanumeric uppercase random sequence
  const randomPart = Math.floor(10000 + Math.random() * 90000).toString();

  return `INC-${dateStr}-${randomPart}`;
}

/**
 * Format: RES-YYYYMMDD-XXXXX
 */
export function generateRescueId(): string {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const randomPart = Math.floor(10000 + Math.random() * 90000).toString();

  return `RES-${dateStr}-${randomPart}`;
}
