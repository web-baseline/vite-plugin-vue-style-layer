import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  externals: [
    'vite',
    'postcss',
    '@web-baseline/postcss-wrap-up-layer',
  ],
  clean: true,
  declaration: 'compatible',
  rollup: {
    output: {
      exports: 'named',
    },
    emitCJS: true,
    inlineDependencies: true,
  },
});
