class Router {
  constructor() {
    this.routes = new Map();
  }

  addRoute(method, path, handler) {
    const routes = this.routes.get(method) || new Map();
    routes.set(path, handler);
    this.routes.set(method, routes);
  }

  async route(request) {
    const { method, url } = request;
    const routes = this.routes.get(method);

    if (!routes) {
      return new Response('404 Not Found', { status: 404 });
    }

    const pathname = new URL(url).pathname;
    const handler = routes.get(pathname);

    if (!handler) {
      return new Response('404 Not Found', { status: 404 });
    }

    return await handler(request);
  }
}

class WebFramework {
  constructor() {
    this.router = new Router();
    this.middlewares = [];
  }

  get(path, handler) {
    this.router.addRoute('GET', path, handler);
  }

  post(path, handler) {
    this.router.addRoute('POST', path, handler);
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  async fetch(event) {
    let request = event.request;
    
    for (const middleware of this.middlewares) {
      request = await middleware(request);
    }

    return await this.router.route(request);
  }
}

const framework = new WebFramework();

framework.get('/', async (request) => new Response('Hello from Cloudflare Workers!', { headers: { 'Content-Type': 'text/plain' } }));

addEventListener('fetch', event => event.respondWith(framework.fetch(event)));

