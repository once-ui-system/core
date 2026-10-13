import { createOgProxyRoute } from '@once-ui-system/core/next';

export const { GET } = createOgProxyRoute({
  userAgent: 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
  cacheMaxAge: 86400,
});
