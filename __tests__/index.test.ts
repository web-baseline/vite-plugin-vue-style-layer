import { expect, test, vi } from 'vitest';
import createPlugin from '~/index';
import { resolve } from 'path';
import { parse, atRule } from 'postcss';

test('Create Plugin', () => {
  const plugin = createPlugin();
  expect(plugin.name).toBe('vite-plugin-vue-style-block-layer');
  expect(typeof plugin.transform).toBe('function');
});

test('Transform without style layer define', () => {
  const plugin = createPlugin();
  const file = 'src/test.vue';
  [
    '',
    'vue&type=style&index=0&scoped=aa43858a&lang.css',
  ].forEach((query) => {
    expect((plugin.transform as Function)('.test-class {}', `${resolve(file)}?${query}`)).toBeUndefined();
  });
});

test('Transform excluded files', () => {
  const plugin = createPlugin();
  const query = 'vue&type=style&index=0&scoped=aa43858a&layer=test&lang.css';
  [
    'node_modules/test/test.vue',
    '.nuxt/test/test.vue',
    'virtual:virtual-file/test.vue',
  ].forEach((file) => {
    expect((plugin.transform as Function)('.test-class {}', `${resolve(file)}?${query}`)).toBeUndefined();
  });
});

test('Transform void file', () => {
  const plugin = createPlugin();
  const query = 'vue&type=style&index=0&scoped=aa43858a&layer=test&lang.css';
  const file = 'src/test.vue';
  [
    '',
    '/* Some comments */',
    '/* Some comments */\n/* Some comments */',
  ].forEach((code) => {
    expect((plugin.transform as Function)(code, `${resolve(file)}?${query}`)).toBeUndefined();
  });
});

function transform (input: string, layerName: string) {
  const nodes = parse(input).nodes;
  const layer = atRule({
    name: 'layer',
    params: layerName,
    nodes: nodes,
  });
  return layer.toString();
}

test('Reset includes', () => {
  const inputCode = '.test-class {}';
  const layerName = 'test';
  const outputCode = transform(inputCode, layerName);
  const query = `vue&type=style&index=0&scoped=aa43858a&layer=${layerName}&lang.css`;
  const files = [
    'node_modules/test/test.vue',
    '.nuxt/test/test.vue',
    'virtual:virtual-file/test.vue',
    'src/test.vue',
    'test.vue',
  ];
  ([
    [undefined, [false, false, false, true, true]],
    [/^(?!\.nuxt\/)(?!virtual:).*/, [true, false, false, true, true]],
    [/^(?!node_modules\/)(?!virtual:).*/, [false, true, false, true, true]],
    [/^(?!node_modules\/)(?!\.nuxt\/).*/, [false, false, true, true, true]],
    [() => true, [true, true, true, true, true]],
    [() => false, [false, false, false, false, false]],
  ] as const).forEach(([includes, values]) => {
    const plugin = createPlugin({ includes });
    for (let i = 0; i < files.length; ++i) {
      if (values[i]) {
        expect((plugin.transform as Function)('.test-class {}', `${resolve(files[i])}?${query}`)).toEqual({ code: outputCode, map: null });
      } else {
        expect((plugin.transform as Function)('.test-class {}', `${resolve(files[i])}?${query}`)).toBeUndefined();
      }
    }
  });
});

test('Set includes as function', () => {
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
  for (const file of files) {
    includes.mockClear();
    const id = `${resolve(file)}?${query}`;
    (plugin.transform as Function)(code, id);
    expect(includes).toHaveBeenCalledOnce();
    expect(includes).toHaveBeenCalledWith(file, id);
  }
});
