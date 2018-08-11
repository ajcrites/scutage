# scutage (pre alpha, placeholder)
`scutage` is an opinionated static site generator for HTML.

Scutage was created out of my frustration from a lack of static site generators
that would do what I wanted working with HTML, but was inspired by
https://github.com/11ty/eleventy. If I only use it only for my own website,
that's fine with me.

Scutage's goal is to provide a convention-over-configuration mechanism for static
site generation from mostly static HTML, CSS, and some JavaScript.

If you want more customization / configuration or code splitting, you're
probably better off using something like Parcel, eleventy, or some combined
custom solution. This does not and will never support CSS preprocessing and any
sort of templates other than mostly static HTML.

## Purpose
Scutage is a basic and naive static site generator. Its purpose is to work with
minimal preprocessing.

It takes html file(s) as input and creates an output retaining directory
structure with the following modifications:
* HTML is minified
* `<link rel="stylesheet" href>` elements are replaced with `<style>` with
minified CSS as the contents of the linked href file. Globbing is allowed.
* `<script src>` elements are replaced with `<script>` with
minified JS as the contents of the linked src file. Globbing is allowed.

## Installation
You can install it globally and use the `scutage` binary.

You can also install it locally, e.g. `yarn add --dev scutage`.

## Usage
You can use the scutage CLI or API.

### CLI
Run The `scutage` command with the optional input argument and optional options.

The command takes one argument which is a glob-compatible string of html files
to be moved to the output directory. You can simply use `src/index.html` for
example, or `"src/*.html"`. Note that this needs to be a _string_, so use
`"src/*.html"` rather than `src/*.html` or else the shell might expand the
argument inappropriately.

If no argument is provided, `**/*.html` is used by default.

#### CLI Arguments

| Short Name | Long Name | Purpose |
| ---------- | --------- | ------- |
| `-o`       | `--output` | Output directory to copy files. Defaults to `dist` |
| `-h`       | `--help`  | Help (essentially this) |
| `-v`       | `--version` | Print `scutage`'s version.

### API
```ts
import { scutage } from 'scutage';
scutage(inputFilesGlob, options);
```

The `options` available are camelCased versions of the long form API options
listed above. _Currently only `output` does anything_.

### Template Syntax
Templates are largely logicless with a couple of extra attributes.

* `<link rel="stylesheet" href load>` will be replaced with a corresponding
`<link rel="stylesheet" href>` for each css file found according to the glob
pattern. The contents of the CSS files will still be minified.
* `<script src load>` functions similarly.

Keep in mind that you can't specify a particular order when globbing. Most
likely it will be alphabetical, but I don't think that's guaranteed. If you want
to retain an order in your CSS/JS, you're better off using separate tags in
the order you want.

HTML minification is also largely untested and it's probable that `<pre>` gets
screwed up, and definitely that `white-space: pre<-wrap>` does as well. This may
be handled later.
