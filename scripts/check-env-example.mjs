import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { envSchema } from '../dist/config/env.schema.js';

const schemaKeys = Object.keys(envSchema.shape).sort();
const fileKeys = Object.keys(
  parse(readFileSync(new URL('../.env.example', import.meta.url))),
).sort();

const missing = schemaKeys.filter((k) => !fileKeys.includes(k));
const extra = fileKeys.filter((k) => !schemaKeys.includes(k));

if (missing.length || extra.length) {
  if (missing.length)
    console.error(`✗ Doesn't exist in .env.example: ${missing.join(', ')}`);
  if (extra.length)
    console.error(
      `✗ Not necessart in .env.example (abcent in shcema): ${extra.join(', ')}`,
    );
  process.exit(1);
}
console.log(
  `✓ .env.example in sync with schema (${schemaKeys.length} variables)`,
);
