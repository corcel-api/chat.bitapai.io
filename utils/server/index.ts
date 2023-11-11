import { Message } from '@/types/chat';

import { BITAPAI_API_HOST } from '../app/const';

export class BitAPAIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BitAPAIError';
  }
}

export const BitAPAIConversation = async (
  key: string,
  messages: Message[],
  systemPrompt: string,
) => {
  const url = `${BITAPAI_API_HOST}/cortext`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': `${key ? key : process.env.BITAPAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      messages: [
        ...messages,
      ],
      count: 1
    }),
  });

  const json = await res.json();

  if (res.status !== 200) {
    throw new BitAPAIError(`BitAPAI error: ${json.error || 'Unknown error'}`);
  }

  const resp = json?.['choices'];

  for (let i = 0; i < resp.length; i++) {
    const res = resp[i];
    if (
      res.is_available &&
      res.message &&
      res.message.content &&
      res.message.content.length
    ) {
      return res.message.content;
    }
  }

  throw new BitAPAIError(`No valid response returned. Please try again.`);
};
