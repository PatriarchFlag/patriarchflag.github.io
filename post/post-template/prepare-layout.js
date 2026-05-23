/**
 * One-time helper: patches layout.html with placeholders and post-template asset paths.
 * Run from repo root: node post/post-template/prepare-layout.js
 */
const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'layout.html');
let html = fs.readFileSync(layoutPath, 'utf8');

html = html.replace(/\.\/august-is-patriarch-month2_files\//g, './post-template/');
html = html.replace(/\.\/august-is-patriarch-month_files\//g, './post-template/');

html = html.replace(/<title>[^<]*<\/title>/, '<title>@@PATRIARCH_TITLE@@</title>');
html = html.replace(
	/<meta property="og:title" content="[^"]*">/,
	'<meta property="og:title" content="@@PATRIARCH_TITLE@@">'
);
html = html.replace(
	/<meta name="twitter:title" content="[^"]*">/,
	'<meta name="twitter:title" content="@@PATRIARCH_TITLE@@">'
);
html = html.replace(/"headline": "[^"]*",/, '"headline": "@@PATRIARCH_TITLE@@",');
html = html.replace(
	/<span style="text-decoration:underline;" class="wixui-rich-text__text">[^<]*<\/span>/,
	'<span style="text-decoration:underline;" class="wixui-rich-text__text">@@PATRIARCH_TITLE@@</span>'
);
html = html.replace(/"name": "PatriarchFlag\.com"/, '"name": "@@PATRIARCH_AUTHOR@@"');
html = html.replace(
	/<meta property="article:author" content="[^"]*">/,
	'<meta property="article:author" content="@@PATRIARCH_AUTHOR@@">'
);

html = html.replace(
	/<h1 class="H3vOVf" data-hook="post-title">[^<]*<\/h1>/,
	'<h1 class="H3vOVf" data-hook="post-title">@@PATRIARCH_TITLE@@</h1>'
);

html = html.replace(
	/<span data-hook="user-name">[^<]*<\/span>/,
	'<span data-hook="user-name">@@PATRIARCH_AUTHOR@@</span>'
);

html = html.replace(
	/<span title="[^"]*" class="time-ago" data-hook="time-ago">[^<]*<\/span>/,
	'<span title="@@PATRIARCH_DATE_DISPLAY@@" class="time-ago" data-hook="time-ago">@@PATRIARCH_DATE_DISPLAY@@</span>'
);

html = html.replace(
	/<meta property="article:published_time" content="[^"]*">/,
	'<meta property="article:published_time" content="@@PATRIARCH_DATE_ISO@@">'
);

html = html.replace(
	/<meta property="article:modified_time" content="[^"]*">/,
	'<meta property="article:modified_time" content="@@PATRIARCH_DATE_ISO@@">'
);

html = html.replace(
	/https:\/\/patriarchflag\.github\.io\/post\/august-is-patriarch-month/g,
	'https://patriarchflag.github.io/post/@@PATRIARCH_SLUG@@'
);

html = html.replace(
	/href="https:\/\/patriarchflag\.github\.io\/post\/[^"]*"/g,
	(match) => {
		if (match.includes('@@PATRIARCH_SLUG@@')) return match;
		return 'href="https://patriarchflag.github.io/post/@@PATRIARCH_SLUG@@"';
	}
);

const viewerMarker = 'data-id="content-viewer"';
const viewerIdx = html.indexOf(viewerMarker);
if (viewerIdx === -1) throw new Error('content-viewer not found');

const lysrhStart = html.indexOf('<div class="LYSrh">', viewerIdx);
const lastBlock = html.indexOf('<div type="last" data-hook="rcv-block-last">', lysrhStart);
if (lysrhStart === -1 || lastBlock === -1) throw new Error('post body region not found');

const indent = html.slice(lysrhStart - 20, lysrhStart).match(/[\t ]*$/)?.[0] ?? '\t';
const replacement =
	indent + '<div class="LYSrh patriarch-post-body">@@PATRIARCH_BODY@@</div>\n' + indent;

html = html.slice(0, lysrhStart) + replacement + html.slice(lastBlock);

fs.writeFileSync(layoutPath, html, 'utf8');
console.log('layout.html prepared with placeholders');

require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'patch-template.js')], {
	stdio: 'inherit',
});
