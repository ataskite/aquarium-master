import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'api',
      root: 'apps/api',
    },
  },
  {
    test: {
      name: 'weapp',
      root: 'apps/weapp',
    },
  },
]);
