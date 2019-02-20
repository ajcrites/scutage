/**
 * Mutate the provided HTML filenames and create the output directory
 */

import { JSDOM } from 'jsdom';
import { readFile, writeFile, copyFile, exists } from 'mz/fs';
import * as mkdirp from 'mkdirp-promise';
import * as rmfr from 'rmfr';
import { minify as htmlMinify } from 'html-minifier';
import { basename, dirname } from 'path';
import { minify as jsMinify } from 'terser';

import * as globby from 'globby';

/**
 * @param string glob-compatible string of html file inputs
 * @param string output directory name relative to CWD
 */
export const scutage = async ({
  source,
  output,
  keepExisting,
  override,
}: {
  source: string;
  output: string;
  keepExisting: boolean;
  override: boolean;
}) => {
  const cwd = process.cwd();
  const outputDir = `${cwd}/${output}`;
  const sourceDir = `${cwd}/${source}`;
  if (!keepExisting) {
    await rmfr(outputDir);
  }
  await mkdirp(outputDir);
  const htmlFiles = await globby([sourceDir, `!${outputDir}/*`]);

  await Promise.all(
    htmlFiles
      .filter(filename => !filename.includes('node_modules/'))
      .map(async filename => {
        if (!/\.html$/.test(filename)) {
          console.warn(`
WARNING: Found a non-HTML file ${filename}.
This will probably not work as intended. If you want to copy over a file that is
not loaded by your static HTML file, you should copy it to ${output} after \`scutage\`.

\`scutage\` will proceed with treating this file as if it were HTML.
`);
        }
        const dir = dirname(filename);
        const relativeDir = dir.replace(cwd, '').replace(/\/[^\/]*(\/|$)/, '');
        const dom = await JSDOM.fromFile(filename);
        const doc = dom.window.document;

        // Minify all script tags with JavaScript text
        [].slice.call(doc.querySelectorAll('script:not([src])')).map(elem => {
          const minifyResult = jsMinify(elem.textContent);
          if (minifyResult.error) {
            throw minifyResult.error;
          }
          elem.textContent = minifyResult.code;
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
            const targetFilename = `${outputDir}/${imgFilename}`;
            if (override || !(await exists(targetFilename))) {
              await copyFile(`${dir}/${imgFilename}`, targetFilename);
            }
          }),
        );

        const content = htmlMinify(dom.serialize(), {
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
        const targetFilename = `${outputDir}/${relativeDir}/${basename(
          filename,
        )}`;
        if (override || !(await exists(targetFilename))) {
          await writeFile(targetFilename, content);
        }
      }),
  );
};
