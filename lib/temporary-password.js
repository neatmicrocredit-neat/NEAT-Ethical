export function makeTemporaryPassword() {
  return `Neat-${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}!9`;
}
