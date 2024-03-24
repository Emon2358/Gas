class Router {
  constructor() {
    this.routes = new Map();
  }

  // ルートの追加
  addRoute(method, path, handler) {
    const routeKey = `${method}:${path}`;
    this.routes.set(routeKey, handler);
  }

  // GETリクエストのハンドラーの追加
  get(path, handler) {
    this.addRoute('GET', path, handler);
  }

  // POSTリクエストのハンドラーの追加
  post(path, handler) {
    this.addRoute('POST', path, handler);
  }

  // ルーティング処理
  async route(request) {
    const url = new URL(request.url);
    const routeKey = `${request.method}:${url.pathname}`;
    const handler = this.routes.get(routeKey);

    if (handler) {
      return await handler(request);
    } else {
      return new Response('404 Not Found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }
}

class WebFramework {
  constructor() {
    this.router = new Router();
  }

  // ルートの追加
  addRoute(method, path, handler) {
    this.router.addRoute(method, path, handler);
  }

  // GETリクエストのハンドラーの追加
  get(path, handler) {
    this.router.get(path, handler);
  }

  // POSTリクエストのハンドラーの追加
  post(path, handler) {
    this.router.post(path, handler);
  }

  // Cloudflare Workersのfetchイベントハンドラー
  async fetch(event) {
    const request = event.request;
    const response = await this.router.route(request);
    return response;
  }
}

const framework = new WebFramework();

// ルートの設定
framework.get('/', async (request) => {
  return new Response('Hello from Cloudflare Workers!', {
    headers: { 'Content-Type': 'text/plain' },
  });
});

// Cloudflare Workersのfetchイベントにハンドラーを追加
addEventListener('fetch', event => {
  event.respondWith(framework.fetch(event));
});

