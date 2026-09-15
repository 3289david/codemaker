export function getAppOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3014";
}
