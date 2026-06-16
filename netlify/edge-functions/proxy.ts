export default async (request: Request) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing URL parameter", { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Referer': new URL(targetUrl).origin + '/'
      }
    });

    const contentType = response.headers.get('content-type') || 'text/plain';
    const isM3U8 = targetUrl.split('?')[0].endsWith('.m3u8') || contentType.includes('mpegurl');

    if (isM3U8) {
      let text = await response.text();
      const baseUrlStr = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
      
      text = text.split('\n').map(line => {
        if (line.trim() && !line.startsWith('#')) {
          const isAbsolute = line.startsWith('http://') || line.startsWith('https://');
          let finalUrl = line;
          if (!isAbsolute) {
             finalUrl = new URL(line, baseUrlStr).href;
          }
          return '/api/proxy?url=' + encodeURIComponent(finalUrl);
        }
        if (line.startsWith('#') && line.includes('URI="')) {
          return line.replace(/URI="([^"]+)"/, (match, p1) => {
            const isAbsolute = p1.startsWith('http://') || p1.startsWith('https://');
            let finalUrl = p1;
            if (!isAbsolute) {
               finalUrl = new URL(p1, baseUrlStr).href;
            }
            return `URI="${'/api/proxy?url=' + encodeURIComponent(finalUrl)}"`;
          });
        }
        return line;
      }).join('\n');

      return new Response(text, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Direct streaming for TS segments
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Edge Proxy Error:', error);
    return new Response('Edge Proxy Error', { status: 500 });
  }
};
