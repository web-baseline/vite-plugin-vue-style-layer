# Vue style layer (@web-baseline/vite-plugin-vue-style-layer)

_✨ 允许 Vue SFC 的 `<style>` 块设置 CSS 级联层 ✨_

[![License](https://img.shields.io/github/license/web-baseline/vite-plugin-vue-style-layer)](https://github.com/web-baseline/vite-plugin-vue-style-layer/blob/main/LICENSE)
[![Typescript](https://img.shields.io/npm/types/@web-baseline/vite-plugin-vue-style-layer)](https://www.typescriptlang.org/)
[![NPM Download](https://img.shields.io/npm/dw/@web-baseline/vite-plugin-vue-style-layer)](https://www.npmjs.com/package/@web-baseline/vite-plugin-vue-style-layer)
[![GitHub star](https://img.shields.io/github/stars/web-baseline/vite-plugin-vue-style-layer?style=social)](https://github.com/web-baseline/vite-plugin-vue-style-layer)

## 功能

为 Vue 添加新的 SFC 语法，允许通过使用 layer 属性添加 [CSS 级联层](https://developer.mozilla.org/docs/Web/CSS/@layer)。

Input:

```vue
<style layer="pages">
/* <main> style */
main {
  height: 100vh;
}
/* <p> style */
p {
  margin-bottom: 0.2em;
}
</style>
```

Output:

```css
@layer pages {
  /* <main> style */
  main {
    height: 100vh;
  }
  /* <p> style */
  p {
    margin-bottom: 0.2em;
  }
}
```


## 如何使用

### 安装

```shell
npm install @web-baseline/vite-plugin-vue-style-layer
```

### 使用

```ts filename="vite.config.ts"
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueStyleLayer from '@web-baseline/vite-plugin-vue-style-layer'
export default defineConfig({
  plugins: [
    vue(),
    VueStyleLayer(),
  ],
});
```

### Options

| Option   | Description      | Type                                                | Default                                           |
| -------- | ---------------- | --------------------------------------------------- | ------------------------------------------------- |
| includes | 需要被处理的文件 | `RegExp \| ((path: string, id: string) => boolean)` | `/^(?!node_modules[\\/])(?!\.nuxt[\\/])(?!virtual:).*/` |


## 已知问题

当 `<style layer="...">` 的 layer 属性变化时无法触发热重载（HMR）。


本人技术力不够，尚且没有找到合适的方式处理，欢迎大佬提 PR，感谢！  (๑•̀ㅂ•́)و✧
