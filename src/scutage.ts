/**
 * Mutate the provided HTML filenames and create the output directory
 */

import { JSDOM } from 'jsdom';
import { readFile, writeFile, copyFile } from 'mz/fs';
import * as mkdirp from 'mkdirp-promise';
import { minify } from 'html-minifier';
import { basename, dirname } from 'path';
import * as uglifyEs from 'uglify-es';

import * as globby from 'globby';

/**
 * @param string glob-compatible string of html file inputs
 * @param string output directory name relative to CWD
 */
export const scutage = async ({
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
    htmlFiles
      .filter(filename => !filename.includes('node_modules/'))
      .map(async filename => {
        const dir = dirname(filename);
        const relativeDir = dir.replace(cwd, '').replace(/\/[^\/]*(\/|$)/, '');
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

        // Copy all images that match with `img` elements with `src` attributes
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

        await mkdirp(`${outputDir}/${relativeDir}`);
        await writeFile(
          `${outputDir}/${relativeDir}/${basename(filename)}`,
          content,
        );
      }),
  );
};
