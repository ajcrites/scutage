# scutage (pre alpha)
`scutage` is an opinionated static site generator for HTML.

[![version](https://img.shields.io/npm/v/scutage.svg)](https://www.npmjs.com/package/scutage)

Scutage was created out of my frustration from a lack of static site generators
that would do what I wanted working with HTML, but was inspired by
https://github.com/11ty/eleventy. If I only use it only for my own website,
that's fine with me.

Scutage's goal is to provide a convention-over-configuration mechanism for
static site generation from mostly static HTML, CSS, and some JavaScript.

If you want more customization / configuration or code splitting, you're
probably better off using something like Parcel, eleventy, or some combined
custom solution. This does not and will never support CSS preprocessing and any
sort of templates other than mostly static HTML. That being said, you can
use other libraries to create static CSS/HTML files that you can give to
scutage.

## Purpose
Scutage is a basic and naive static site generator. Its purpose is to work with
minimal preprocessing.

It takes html file(s) as input and creates an output bundle retaining directory
structure with the following modifications:
* HTML is minified
* `<link rel="stylesheet" href>` elements are replaced with `<style>` with
minified CSS as the contents of the linked href file. Globbing is allowed for
the `href` property to replace multiple files at once.
* `<script src>` elements are replaced with `<script>` with
minified JS as the contents of the linked src file. Globbing is allowed for
the `src` property to replace multiple files at once.

Scutage will maintain the directory structure of the topmost directories it
finds html files and put them in the output directory keeping the rest of its
directory structure. Files found in the current directory as well as files
found one directory down will be placed directly in the output directory.
For example, a file structure like:

```sh
bar.html
src/
  index.html
src2/
  dir/
    foo.html
```

Will result in:

```sh
dist/
  bar.html
  index.html
  dir/
    foo.html
```

It is recommended that you keep all of your html source files in a directory
such as `src` and use, for example, `scutage src/**/*.html`.

**Scutage is intended only to work with HTML files**. It will treat any files
given to it as HTML files although it will print a warning if it encounters
a file without a `.html` extension.

Scutage will include asset files (scripts, styles, images) that are imported by
your static HTML files in its output. If you want to copy a separate file over,
scutage will not do that for you. You'll have to copy it to scutage's output.

## Installation
You can install it globally and use the `scutage` binary.

You can also install it locally, e.g. `yarn add --dev scutage`.

## Usage
You can use the scutage CLI or API.

### CLI
Run The `scutage` command with the optional input argument and options.

The command takes one argument which is a glob-compatible string of html files
to be moved to the output directory. You can simply use `src/index.html` for
example, or `"src/*.html"`. Note that this needs to be a _string_, so use
`"src/*.html"` rather than `src/*.html` or else the shell might expand the
argument inappropriately.

If no argument is provided, `"**/*.html"` is used by default (`node_modules and
the provided `output` directories are ignored).

#### CLI Arguments

| Short Name | Long Name | Purpose |
| ---------- | --------- | ------- |
| `-o`       | `--output`        | Output directory to copy files. Defaults to `dist` |
| `-k`       | `--keep-existing` | Do not delete the output directory if it already exists (by default it is deleted) |
|            | `--override`      | Replace existing matching files in the output directory (by default they are replaced, use `--no-override` to not replace) |
|            | `--version`       | Print `scutage`'s version. |
| `-h`       | `--help`          | Help (essentially this) |

### API
```ts
import { scutage } from 'scutage';
scutage(inputFilesGlobString, outputDirectoryNameString);
```

The `options` available are camelCased versions of the long form API options
listed above.

### Template Syntax (coming soon)
Templates are largely logicless with a couple of extra attributes.

* `<link rel="stylesheet" href load>` will be replaced with a corresponding
`<link rel="stylesheet" href>` for each css file found according to the glob
pattern. The contents of the CSS files will still be minified.
* `<script src load>` functions similarly.

Keep in mind that you can't specify a particular order when globbing. Most
likely it will be alphabetical, but I don't think that's guaranteed. If you want
to retain an order in your CSS/JS, you're better off using separate tags in
the order you want. You of course have the option of using a separate library
for managing CSS imports that can compile to what is used by your `link` tags.

HTML minification is also largely untested and it's probable that `<pre>` gets
screwed up, and definitely that `white-space: pre<-wrap>` does as well. This may
be handled later.

## Todo
* [ ] `load` attribute for link/script
* [ ] attempt to copy over images that are part of css files (`url()`).
* [ ] `force` and `clear` options for managing existing dist files.

## The Name
Originally I wanted to name this `scutum`. I think I came up with the word from
someone saying `sputum` in response to my cat's sneezing. `scutum` is apparently
something to do with turtle shells. It would make a lot more sense for something
security-related. I couldn't think of anything else, and I didn't want a generic
static site generation related name. I sort of made up `scutage`, but apparently
it's a real word that means money paid by a fuedal vassal so that they don't
have to perform military service. I don't know what that has to do with this
library... maybe it's my payment to the OSS community.
