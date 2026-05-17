import { defineConfig } from '@tarojs/cli';

export default defineConfig(async (merge) => {
  const baseConfig = {
    projectName: 'aquarium-master',
    date: '2026-05-16',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    framework: 'react',
    compiler: 'webpack5',
    cache: { enable: false },
    mini: {
      postcss: {
        pxtransform: { enable: true },
        cssModules: { enable: false },
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      devServer: {
        host: '0.0.0.0',
        port: 10086,
        open: false,
      },
    },
    env: {
      TARO_APP_API_BASE_URL: JSON.stringify(process.env.TARO_APP_API_BASE_URL ?? 'http://localhost:3000'),
    },
  };

  if (process.env.NODE_ENV === 'production') {
    return merge({}, baseConfig, require('./prod'));
  }
  return merge({}, baseConfig, require('./dev'));
});
