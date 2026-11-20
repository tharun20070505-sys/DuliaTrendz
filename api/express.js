const expressApp = import('../backend/app.js');

module.exports = async function handler(req, res) {
  const requestUrl = new URL(req.url, 'http://localhost');
  const rewrittenPath = requestUrl.searchParams.get('__dulia_route');

  if (rewrittenPath !== null) {
    requestUrl.pathname = '/api/' + rewrittenPath;
    requestUrl.searchParams.delete('__dulia_route');
    req.url = requestUrl.pathname + requestUrl.search;
  }

  const { default: app } = await expressApp;
  return app(req, res);
};
