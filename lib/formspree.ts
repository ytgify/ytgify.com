import { FORMSPREE_ENDPOINT } from './constants';

interface SubmitEmailOptions {
  source?: string;
  [key: string]: string | undefined;
}

export async function submitEmail(email: string, options?: SubmitEmailOptions): Promise<{ ok: boolean }> {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email,
      ...options,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit email');
  }

  return response.json();
}
