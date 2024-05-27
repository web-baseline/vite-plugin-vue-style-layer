import type { Plugin } from 'vite';
import { parse, atRule } from 'postcss';
import { relative } from 'path';

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
        const nodes = parse(code).nodes;
        if (nodes.filter((node) => node.type !== 'comment').length <= 0) {
          return;
        }
        const layer = atRule({
          name: 'layer',
          params: query.layer,
          nodes: nodes,
        });
        return {
          code: layer.toString(),
          map: null,
        };
      }
    },
  };
}
