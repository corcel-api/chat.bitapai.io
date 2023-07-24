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
  const url = `${BITAPAI_API_HOST}/v2/conversation`;

  const roles: string[] = [
    'system',
    ...messages.map((message) => message.role),
  ];
  const msgs: string[] = [
    systemPrompt,
    ...messages.map((message) => message.content),
  ];

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': `${key ? key : process.env.BITAPAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      count: 10,
      roles: roles,
      messages: msgs,
      return_all: true,
    }),
  });

  const json = await res.json();

  if (res.status !== 200) {
    throw new BitAPAIError(`BitAPAI error: ${json || 'Unknown error'}`);
  }

  const resp = json?.['assistant'];

  for (let i = 1; i < resp.length; i++) {
    const res = resp[i];
    if (res.response.length) {
      return res.response;
    }
  }

  throw new BitAPAIError(`BitAPAI error: No response from API`);
};
