import type { RequestHandler } from '@sveltejs/kit';
import { env as priv } from '$env/dynamic/private';

const DEFAULT_BINARY = 'https://pytorch-binary-screening-97937849866.us-central1.run.app/predict';
const DEFAULT_MULTICLASS = 'https://pytorch-multiclass-diagnostic-97937849866.us-central1.run.app/predict';

function getEndpoint(stage: 'binary' | 'multiclass') {
  // Allow either PUBLIC_ or server-side variables if defined
  const be = priv.PUBLIC_BINARY_ENDPOINT || priv.BINARY_ENDPOINT || DEFAULT_BINARY;
  const me = priv.PUBLIC_MULTICLASS_ENDPOINT || priv.MULTICLASS_ENDPOINT || DEFAULT_MULTICLASS;
  return stage === 'binary' ? be : me;
}

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const stageParam = (url.searchParams.get('stage') || 'binary').toLowerCase();
    const stage = stageParam === 'multiclass' ? 'multiclass' : 'binary';
    const { image, apply_medical_enhancement } = await request.json();
    if (!image || typeof image !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Missing image (base64) in body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const endpoint = getEndpoint(stage);

    const payload = stage === 'binary'
      ? { image, apply_medical_enhancement: apply_medical_enhancement ?? true }
      : { image };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? JSON.parse(text) : { raw: text };

    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : res.status || 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e?.message || 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

