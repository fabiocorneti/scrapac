import { copyFile } from 'fs/promises';
import { build, context } from 'esbuild';
import { lessLoader } from 'esbuild-plugin-less';
import copyStaticFiles from 'esbuild-copy-static-files';

const env = process.env.NODE_ENV || 'development';

async function buildCli() {
  await build({
    entryPoints: ['packages/cli/src/index.ts'],
    outfile: 'dist/cli/index.js',
    platform: 'node',
    target: 'node18',
    bundle: true,
    minify: env === 'production',
    sourcemap: env === 'development',
    external: ['express']
  });
  // TODO: need to copy gpt-3-encoder fs imports manually
  await copyFile('./node_modules/gpt-3-encoder/encoder.json', 'dist/cli/encoder.json');
  await copyFile('./node_modules/gpt-3-encoder/vocab.bpe', 'dist/cli/vocab.bpe');
}

async function buildWebApp() {
  const ctx = await context({
    entryPoints: ['packages/web/src/index.tsx'],
    outfile: 'dist/cli/web/public/index.js',
    bundle: true,
    minify: env === 'production',
    sourcemap: env === 'development',
    logLevel: 'debug',
    plugins: [lessLoader(), copyStaticFiles({
      src: 'packages/web/public',
      dest: 'dist/cli/web/public'
    })]
  });
  if (process.argv.includes('--watch')) {
    return ctx.watch();
  } else {
    await ctx.rebuild();
    return ctx.dispose();
  }
}

async function buildDist() {
  await Promise.all([
    buildCli(),
    buildWebApp()
  ]);
}

buildDist();
