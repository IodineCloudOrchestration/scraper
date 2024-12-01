import {config} from "dotenv";

config();

export function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw Error(`Missing Environment Variable: "${name}"`);
  return value;
}

