export function supportsRefCleanup(version: string | undefined) {
  return version?.startsWith("19.") ?? false;
}
