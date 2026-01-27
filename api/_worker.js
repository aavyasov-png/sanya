/**
 * Cloudflare Workers Static Assets + API Functions
 * 
 * Этот Worker обрабатывает:
 * 1. API запросы к /api/* - направляет к Cloudflare Functions
 * 2. Статические файлы - отдает через ASSETS binding
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // API routes обрабатываются Cloudflare Functions из папки /api
    if (url.pathname.startsWith('/api/')) {
      try {
        // Cloudflare Pages автоматически роутит /api/* к файлам в папке api/
        // Этот код не будет вызван, т.к. run_worker_first используется только для логирования/мониторинга
        return env.ASSETS.fetch(request);
      } catch (error) {
        return new Response(JSON.stringify({ error: 'API Error', message: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Все остальное - статические файлы из dist/
    return env.ASSETS.fetch(request);
  }
};
