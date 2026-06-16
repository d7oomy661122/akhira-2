exports.handler = async function (event, context) {
  const targetUrl = event.queryStringParameters.url;

  if (!targetUrl) {
    return {
      statusCode: 400,
      body: 'Missing URL parameter'
    };
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

    let responseBody;
    let isBase64Encoded = false;

    if (isM3U8) {
      let bodyText = await response.text();
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

      bodyText = bodyText.split('\n').map(line => {
        if (line.trim() && !line.startsWith('#')) {
          const isAbsolute = line.startsWith('http://') || line.startsWith('https://');
          let finalUrl = line;
          if (!isAbsolute) {
            finalUrl = new URL(line, baseUrl).href;
          }
          return '/api/proxy?url=' + encodeURIComponent(finalUrl);
        }
        if (line.startsWith('#') && line.includes('URI="')) {
          return line.replace(/URI="([^"]+)"/, (match, p1) => {
            const isAbsolute = p1.startsWith('http://') || p1.startsWith('https://');
            let finalUrl = p1;
            if (!isAbsolute) {
              finalUrl = new URL(p1, baseUrl).href;
            }
            return `URI="${'/api/proxy?url=' + encodeURIComponent(finalUrl)}"`;
          });
        }
        return line;
      }).join('\n');

      responseBody = bodyText;
    } else {
      const buffer = Buffer.from(await response.arrayBuffer());
      responseBody = buffer.toString('base64');
      isBase64Encoded = true;
    }

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      },
      body: responseBody,
      isBase64Encoded
    };

  } catch (error) {
    console.error('/api/proxy error:', error);
    return {
      statusCode: 500,
      body: 'Proxy error'
    };
  }
};
