import "jsr:@std/dotenv/load";

export function getEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw Error(`Missing Environment Variable: "${name}"`);
  return value;
}
