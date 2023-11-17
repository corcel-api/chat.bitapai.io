import { DEFAULT_SYSTEM_PROMPT, BITAPAI_API_HOST } from '@/utils/app/const';
import { ChatBody, Message } from '@/types/chat';
import fetch from "node-fetch";

export const runtime = 'edge'

const fetch_data = async ({ messages, key, prompt }: ChatBody) => {
  console.log("fetch started");

  let promptToSend = prompt;
  if (!promptToSend) {
    promptToSend = DEFAULT_SYSTEM_PROMPT;
  }

  const url = `${BITAPAI_API_HOST}/cortext`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': `${key ? key : process.env.BITAPAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      messages,
      count: 1, stream: true
    }),
    // responseType: 'stream'
  })

  const reader = response?.body?.getReader();
  console.log("gerReader")
  
  async function* read() {
    while (true) {
      const resp = await reader.read();
      const text = new TextDecoder('utf-8').decode(resp.value);

      if (resp.done) {
        yield {ans: "", done:true};
        return;
      }

      const list = text.split('{"uids":');
      try {
        const parsedData = JSON.parse('{"uids":' + list[list.length - 1]);
        const resp = parsedData?.choices;
        let ans;

        for (let i = 0; i < resp.length; i++) {
          const res = resp[i];
          if (res.is_available && res.message && res.message.content && res.message.content.length) {
            ans = res.message.content;
          }
        }
        if (ans) {
          yield {ans, done: false};
        }
      } catch (e) {
      }
    }
  }

  return read();
}

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const result = await iterator.next();
      if( !result.value?.done && !result.done) {

        const textEncoder = new TextEncoder();
        const chunk = textEncoder.encode(result.value?.ans);
        controller.enqueue(chunk);
      } else {
        console.log("completed")
        controller.close();
      }
    },
  })
}
const handler = async (req: Request, res: Response): Promise<any> => {
  try {
    const body = (await req.json()) as ChatBody;

    const generator = await fetch_data(body)
    const stream = iteratorToStream(generator)
  
    return new Response(stream)
  } catch (error) {
    return new Response('Error', { status: 500 });
  }
};

export default handler;
