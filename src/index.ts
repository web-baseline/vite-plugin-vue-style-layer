import type { Plugin } from 'vite';
import { parse } from 'postcss';
import { relative } from 'path';
import { transform } from '@web-baseline/postcss-wrap-up-layer/transform';

export interface QueryWithLayer {
  type?: 'script' | 'template' | 'style' | 'custom';
  layer?: string;
}

export interface PluginOptions {
  includes: RegExp | ((path: string, id: string) => boolean);
}

export const defaultOptions: PluginOptions = {
  includes: /^(?!node_modules\/)(?!\.nuxt\/)(?!virtual:).*/,
};

export default function plugin (opts?: Partial<PluginOptions>): Plugin {
  const includes = opts?.includes ?? defaultOptions.includes;

  return {
    name: 'vite-plugin-vue-style-block-layer',
    transform (code, id) {
      const [filename, rawQuery] = id.split(`?`, 2);
      const query = Object.fromEntries(new URLSearchParams(rawQuery)) as QueryWithLayer;
      if (query.type !== 'style' || typeof query.layer !== 'string') {
        return;
      }
      const path = relative(process.cwd(), filename);
      if (includes instanceof RegExp ? includes.test(path) : includes(path, id)) {
        const root = parse(code, { from: id });
        if (root.nodes.filter((node) => node.type !== 'comment').length <= 0) {
          return;
        }
        const transformedNodes = transform(root.nodes, query.layer, root.source);
        root.nodes = transformedNodes;
        return {
          code: root.toString(),
          map: null,
        };
      }
    },
  };
}
