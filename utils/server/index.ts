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
  const url = `${BITAPAI_API_HOST}/text`;

  const msgs: string[] = [
    systemPrompt,
    ...messages.map((message) => message.prompt),
  ];

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': `${key ? key : process.env.BITAPAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      // count: 10,
      uids: [387, 158, 40, 410, 187, 500, 846],
      return_all: true,
      conversation: [
        {
          role: 'system',
          prompt: systemPrompt,
        },
        ...messages,
      ],
    }),
  });

  const json = await res.json();

  if (res.status !== 200) {
    throw new BitAPAIError(`BitAPAI error: ${json || 'Unknown error'}`);
  }

  const resp = json?.['response_data'];

  for (let i = 1; i < resp.length; i++) {
    const res = resp[i];
    if (res.response.length) {
      return res.response;
    }
  }

  throw new BitAPAIError(`BitAPAI error: No response from API`);
};
