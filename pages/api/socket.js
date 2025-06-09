// pages/api/socket.js

import httpProxy from 'http-proxy';

export const config = {
  api: {
    bodyParser: false, // necessário para proxy
    externalResolver: true,
  },
};

const proxy = httpProxy.createProxyServer({
  target: 'http://n2.enigmaa.me:25616',
  ws: true, // habilita WebSocket
  changeOrigin: true,
});

export default function handler(req, res) {
  // Trata WebSocket upgrade
  if (req.method === 'GET' && req.url === '/api/socket') {
    req.url = '/socket.io/';
  }

  proxy.web(req, res, {}, (e) => {
    console.error('Proxy error:', e);
    res.status(500).send('Proxy error');
  });
}
