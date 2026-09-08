import { kv } from '@vercel/kv';

export async function getState(phone: string) {
  return await kv.get(`wa_state:${phone}`);
}

export async function setState(phone: string, state: any) {
  await kv.set(`wa_state:${phone}`, state, { ex: 600 });
}