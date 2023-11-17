import { FetchStream } from "fetch";
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
  console.log("Start streaming...")

  let count = 1;
  var fetch = new FetchStream(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': `${key ? key : process.env.BITAPAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      messages: [
        ...messages,
      ],
      count: 1, stream: true
    }),
  })
  
  fetch.on("data", function(chunk:any) {
    const hexString = chunk;
    const buffer = Buffer.from(hexString);
    const decodedString = buffer.toString('utf-8');

    console.log("------------------------");
    console.log("------------------------", decodedString);
  })

  let ans = {}

  // const json = await res.json();
  // console.log("======================", json)

  // if (res.status !== 200) {
  //   throw new BitAPAIError(`BitAPAI error: ${json.error || 'Unknown error'}`);
  // }

  // const resp = json?.['choices'];
  // let ans;

  // for (let i = 0; i < resp.length; i++) {
  //   const res = resp[i];
  //   if (
  //     res.is_available &&
  //     res.message &&
  //     res.message.content &&
  //     res.message.content.length
  //   ) {
  //     ans = res.message.content;
  //   }
  // }

  return ans;

  throw new BitAPAIError(`No valid response returned. Please try again.`);
};