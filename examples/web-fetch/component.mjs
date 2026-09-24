// web-fetch component for dsh-bridge
// Fetch a URL and extract clean readable text.
const MAX_RESPONSE_BYTES = 2_000_000;

async function fetchUrl(targetUrl, signal) {
  const deadline = AbortSignal.timeout(15000);
  const requestSignal = AbortSignal.any([signal, deadline]);
  let current = targetUrl;
  for (let redirects = 0; redirects <= 3; redirects++) {
    const url = new URL(current);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Only HTTP and HTTPS URLs are supported');
    const response = await fetch(url, {
      redirect: 'manual',
      signal: requestSignal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CoNest example fetch)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
      await response.body?.cancel();
      if (redirects === 3) throw new Error('Too many redirects');
      current = new URL(response.headers.get('location'), url).toString();
      continue;
    }
    const reader = response.body?.getReader();
    const chunks = [];
    let bytes = 0;
    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > MAX_RESPONSE_BYTES) throw new Error('Response is too large');
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
        if (bytes > MAX_RESPONSE_BYTES) await response.body?.cancel();
      }
    }
    requestSignal.throwIfAborted();
    return { statusCode: response.status, body: Buffer.concat(chunks).toString('utf8') };
  }
  throw new Error('Too many redirects');
}

function stripHtml(html) {
  // Remove script and style blocks
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Extract links before stripping tags
  const links = [];
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = linkRegex.exec(text)) !== null) {
    const href = m[1];
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      links.push(href);
    }
  }

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Convert block elements to newlines, then strip remaining tags
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|article|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { title, text, links: links.slice(0, 20) };
}

export default {
  name: 'web-fetch',
  inject: ['bridgeCapabilities'],
  apply(ctx, config) {
    ctx.bridgeCapabilities.register(ctx, 'fetch_url', async (args, invocation) => {
      const { url } = args;
      const maxChars = args.maxChars || 20000;
      invocation.progress(`Fetching ${url}`);

      try {
        const { statusCode, body } = await fetchUrl(url, invocation.signal);
        invocation.progress(`Received ${body.length} bytes, extracting content...`);

        if (statusCode !== 200) {
          return {
            url, statusCode, title: '', text: '', textLength: 0,
            links: [], error: `HTTP ${statusCode}`,
          };
        }

        const { title, text, links } = stripHtml(body);
        const cappedText = text.length > maxChars ? text.slice(0, maxChars) + '\n... [truncated]' : text;

        return {
          url,
          statusCode,
          title,
          text: cappedText,
          textLength: text.length,
          links,
        };
      } catch (err) {
        if (invocation.signal.aborted) throw invocation.signal.reason ?? err;
        return {
          url, statusCode: 0, title: '', text: '', textLength: 0,
          links: [], error: err.message,
        };
      }
    });
  },
};
