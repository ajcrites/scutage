import { JSDOM } from 'jsdom';
import { readFile, writeFile, copyFile } from 'mz/fs';
import * as mkdirp from 'mkdirp-promise';
import { minify } from 'html-minifier';
import { basename, dirname } from 'path';
import * as uglifyEs from 'uglify-es';

import * as globby from 'globby';

export const scutate = async ({
  source,
  output,
}: {
  source: string;
  output: string;
}) => {
  const cwd = process.cwd();
  const outputDir = `${cwd}/${output}`;
  const sourceDir = `${cwd}/${source}`;
  await mkdirp(outputDir);
  const htmlFiles = await globby([sourceDir, `!${outputDir}/*`]);

  await Promise.all(
    htmlFiles.map(async filename => {
      const dir = dirname(filename);
      const dom = await JSDOM.fromFile(filename);
      const doc = dom.window.document;

      // Minify all script tags with JavaScript text
      [].slice.call(doc.querySelectorAll('script:not([src])')).map(elem => {
        elem.textContent = uglifyEs.minify(elem.textContent).code;
      });

      // Transform all link tags into style tags with their contents
      await Promise.all(
        [].slice
          .call(doc.querySelectorAll('link[rel=stylesheet][href]'))
          .map(async elem => {
            const cssFile = elem.getAttribute('href');
            if (!/^(https?:\/\/|\/\/)/.test(cssFile)) {
              const styleTag = doc.createElement('style');
              styleTag.textContent = await readFile(`${dir}/${cssFile}`);

              elem.replaceWith(styleTag);
            }
          }),
      );

      await Promise.all(
        [].slice.call(doc.querySelectorAll('img[src]')).map(async elem => {
          const imgFilename = elem.getAttribute('src');
          await mkdirp(`${outputDir}/${dirname(imgFilename)}`);
          await copyFile(
            `${dir}/${imgFilename}`,
            `${outputDir}/${imgFilename}`,
          );
        }),
      );

      const content = minify(dom.serialize(), {
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyCSS: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true,
        minifyJS: true,
      });

      await writeFile(`${outputDir}/${basename(filename)}`, content);
    }),
  );
};
