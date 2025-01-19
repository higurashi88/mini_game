import { defineConfig } from 'vite';

export default defineConfig({
    base: '/mini_game/', // GitHub Pages用に設定
    build: {
        outDir: 'dist', // 出力先ディレクトリ
        rollupOptions: {
            input: './index.html', // エントリポイント
        },
    },
});