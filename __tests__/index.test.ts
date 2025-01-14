import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import createPlugin from '~/index.js';
import { resolve } from 'path';
import { parse } from 'postcss';
import { transform } from '@web-baseline/postcss-wrap-up-layer/transform';

vi.mock('@web-baseline/postcss-wrap-up-layer/transform', { spy: true });

beforeEach(() => {
  vi.clearAllMocks();
});

test('Create Plugin', () => {
  const plugin = createPlugin();
  expect(plugin.name).toBe('vite-plugin-vue-style-block-layer');
  expect(typeof plugin.transform).toBe('function');
});

describe('Transform without style layer define', () => {
  const plugin = createPlugin();
  const file = 'src/test.vue';
  test.each([
    '',
    'vue&type=style&index=0&scoped=aa43858a&lang.css',
  ])('%# query = "%s"', (query) => {
    expect((plugin.transform as Function)('.test-class {}', `${resolve(file)}?${query}`)).toBeUndefined();
  });
});

describe('Transform excluded files', () => {
  const plugin = createPlugin();
  const query = 'vue&type=style&index=0&scoped=aa43858a&layer=test&lang.css';
  test.each([
    'node_modules/test/test.vue',
    'node_modules\\test\\test.vue',
    '.nuxt/test/test.vue',
    '.nuxt\\test\\test.vue',
    'virtual:virtual-file/test.vue',
    'virtual:virtual-file\\test.vue',
  ])('%# file = "%s"', (file) => {
    expect((plugin.transform as Function)('.test-class {}', `${resolve(file)}?${query}`)).toBeUndefined();
  });
});

describe('Transform void file', () => {
  const plugin = createPlugin();
  const query = 'vue&type=style&index=0&scoped=aa43858a&layer=test&lang.css';
  const file = 'src/test.vue';
  test.each([
    '',
    '/* Some comments */',
    '/* Some comments */\n/* Some comments */',
  ])('%#', (code) => {
    expect((plugin.transform as Function)(code, `${resolve(file)}?${query}`)).toBeUndefined();
  });
});

describe('Set includes as function', () => {
  const layerName = 'test';
  const query = `vue&type=style&index=0&scoped=aa43858a&layer=${layerName}&lang.css`;
  const files = [
    'node_modules/test/test.vue',
    '.nuxt/test/test.vue',
    'src/test.vue',
    'test.vue',
  ];
  const includes = vi.fn(() => false);
  const plugin = createPlugin({ includes });
  const code = '.test-class {}';
  test.each(files)('file = %s', (file) => {
    includes.mockClear();
    const id = `${resolve(file)}?${query}`;
    (plugin.transform as Function)(code, id);
    expect(includes).toHaveBeenCalledOnce();
    expect(includes).toHaveBeenCalledWith(file, id);
  });
});

function transformCode (input: string, layerName: string) {
  const root = parse(input);
  root.nodes = transform(root.nodes, layerName, root.source);
  return root.toString();
}

describe('Reset includes', () => {
  const inputCode = '.test-class {}';
  const layerName = 'test';
  const outputCode = transformCode(inputCode, layerName);
  const query = `vue&type=style&index=0&scoped=aa43858a&layer=${layerName}&lang.css`;
  const files = [
    'node_modules/test/test.vue',
    '.nuxt/test/test.vue',
    'virtual:virtual-file/test.vue',
    'src/test.vue',
    'test.vue',
  ];
  describe.each([
    { includes: /^(?!\.nuxt\/)(?!virtual:).*/, values: [true, false, false, true, true] },
    { includes: /^(?!node_modules\/)(?!virtual:).*/, values: [false, true, false, true, true] },
    { includes: /^(?!node_modules\/)(?!\.nuxt\/).*/, values: [false, false, true, true, true] },
    { includes: (): boolean => true, values: [true, true, true, true, true] },
    { includes: (): boolean => false, values: [false, false, false, false, false] },
  ])('%#', ({ includes, values }) => {
    const plugin = createPlugin({ includes });
    test.each(files.map((file, index) => ({ file, result: values[index] })))('file = $file', ({ file, result }) => {
      (transform as Mock).mockClear();
      if (result) {
        expect((plugin.transform as Function)(inputCode, `${resolve(file)}?${query}`)).toEqual({ code: outputCode, map: null });
        expect(transform).toHaveBeenCalledTimes(1);
      } else {
        expect((plugin.transform as Function)(inputCode, `${resolve(file)}?${query}`)).toBeUndefined();
        expect(transform).toHaveBeenCalledTimes(0);
      }
    });
  });
});
