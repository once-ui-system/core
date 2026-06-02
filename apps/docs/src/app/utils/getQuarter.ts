export function getQuarter(date: Date = new Date()): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

export function getQuarterLabel(date: Date = new Date()): string {
  return `Q${getQuarter(date)} ${date.getFullYear()}`;
}
