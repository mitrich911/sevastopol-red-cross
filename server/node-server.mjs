// Тот же приёмник заявок, но как обычный Node-сервер (Node 20+), например на российском VPS.
// Запуск: TELEGRAM_BOT_TOKEN=... MAX_BOT_TOKEN=... MAX_CHAT_ID=... PORT=8787 node server/node-server.mjs
// Для хоста platform-api2.max.ru нужен корневой сертификат Минцифры:
//   NODE_EXTRA_CA_CERTS=/path/to/russian_trusted_root_ca.pem MAX_API_URL=https://platform-api2.max.ru ...
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import worker from './worker.js';

const port = Number(process.env.PORT) || 8787;

createServer(async (req, res) => {
  try {
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const request = new Request(`http://localhost${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: hasBody ? Readable.toWeb(req) : undefined,
      duplex: 'half',
    });
    const response = await worker.fetch(request, process.env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (e) {
    console.error(e);
    res.writeHead(500).end();
  }
}).listen(port, () => console.log(`Приём заявок: http://localhost:${port}`));
