/**
 * Removes likes/comments/stats from layout.html; updates copyright line.
 * Run: node post/post-template/patch-template.js
 */
const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'layout.html');
let html = fs.readFileSync(layoutPath, 'utf8');

function removeDivBlock(html, startPattern) {
	const start = html.indexOf(startPattern);
	if (start === -1) {
		console.warn('Pattern not found:', startPattern.slice(0, 60));
		return html;
	}
	let depth = 0;
	let i = html.indexOf('<div', start);
	if (i === -1) return html;
	for (; i < html.length; i++) {
		if (html.startsWith('<div', i) && /[\s>]/.test(html[i + 4] || '')) {
			depth++;
		} else if (html.startsWith('</div>', i)) {
			depth--;
			if (depth === 0) {
				return html.slice(0, start) + html.slice(i + 6);
			}
		}
	}
	throw new Error('Unbalanced div for: ' + startPattern.slice(0, 60));
}

function removeSectionBlock(html, startPattern) {
	const start = html.indexOf(startPattern);
	if (start === -1) {
		console.warn('Pattern not found:', startPattern.slice(0, 60));
		return html;
	}
	let depth = 0;
	let i = html.indexOf('<section', start);
	if (i === -1) return html;
	for (; i < html.length; i++) {
		if (html.startsWith('<section', i) && /[\s>]/.test(html[i + 8] || '')) {
			depth++;
		} else if (html.startsWith('</section>', i)) {
			depth--;
			if (depth === 0) {
				return html.slice(0, start) + html.slice(i + 10);
			}
		}
	}
	throw new Error('Unbalanced section for: ' + startPattern.slice(0, 60));
}

// Post header: reading time and more-actions menu
html = html.replace(
	/\s*<li class="F56Ope"><span title="[^"]*" data-hook="time-to-read">[^<]*<\/span><\/li>/,
	''
);
html = html.replace(
	/\s*<div class="hSZsuG"><button class="MHuRVq"[\s\S]*?<\/svg><\/button><\/div>/,
	''
);

// Post footer: views, comment count, like post button
html = removeDivBlock(html, '<div class="FyFkaC" data-hook="post-main-actions__stats">');

// Entire Wix comments block below the article
const commentsWrapper = html.indexOf('<section class="prZ8Wc">');
if (commentsWrapper !== -1) {
	const wrapperStart = html.lastIndexOf('<div>', Math.max(0, commentsWrapper - 200));
	const searchFrom = wrapperStart >= 0 ? wrapperStart : commentsWrapper;
	html = removeSectionBlock(html, '<section class="prZ8Wc">');
}

// Empty wrapper left after comments removal
html = html.replace(/\s*<div>\s*<\/div>\s*(?=\s*<\/div>\s*<\/div>\s*<\/div>\s*<div data-hook="tooltip-portal")/, '\n');

// Slim top "All Posts" header (drop 80px Wix classes)
html = html.replace(
	/<div class="vAU8Qm aSX36E XDcQnF OdeuKJ kCb5Uz blog-header-background-color" style="--padding:\d+px;--content-size:940px" data-hook="blog-desktop-header-container">\s*<div class="kiyM2X NEquMY">\s*<nav class="AsxoCK kU2es5 blog-header__navigation blog-navigation-container-font sXtzQt" aria-label="Blog">\s*<ul class="LnLd_R">\s*<li data-hook="header-navigation__\/"><a href="https:\/\/patriarchflag\.github\.io\/blog" class="blog-navigation-container-color blog-navigation-container-font\s+blog-navigation-link-hover-color" data-hook="link">All Posts<\/a><\/li>\s*<\/ul>\s*<\/nav>\s*<div style="flex-grow:1"><\/div>\s*<\/div>\s*<\/div>/,
	'<div class="vAU8Qm blog-header-background-color" style="--padding:0;--content-size:940px" data-hook="blog-desktop-header-container">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="kiyM2X">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<nav class="AsxoCK kU2es5 blog-header__navigation blog-navigation-container-font sXtzQt" aria-label="Blog">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<ul class="LnLd_R">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<li data-hook="header-navigation__/"><a href="https://patriarchflag.github.io/blog" class="blog-navigation-container-color blog-navigation-container-font  blog-navigation-link-hover-color" data-hook="link">All Posts</a></li>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</nav>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>'
);

html = html.replace(
	/\s*<nav class="patriarch-post-all-posts[^>]*>[\s\S]*?<\/nav>\s*(?=<footer id="SITE_FOOTER")/,
	'\n'
);

const bottomAllPostsBlock =
	'\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="vAU8Qm blog-header-background-color" style="--padding:0;--content-size:940px" data-hook="blog-all-posts-bottom">\n' +
	'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="kiyM2X">\n' +
	'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<nav class="AsxoCK kU2es5 blog-header__navigation blog-navigation-container-font sXtzQt" aria-label="Blog">\n' +
	'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<ul class="LnLd_R">\n' +
	'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<li data-hook="header-navigation-bottom"><a href="https://patriarchflag.github.io/blog" class="blog-navigation-container-color blog-navigation-container-font  blog-navigation-link-hover-color" data-hook="link">All Posts</a></li>\n' +
	'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</ul>\n' +
	'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</nav>\n' +
	'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
	'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n';

if (!html.includes('data-hook="blog-all-posts-bottom"')) {
	html = html.replace(/<\/article>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '</article>' + bottomAllPostsBlock + '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>');
}

const blogNavCss = `
		/* Compact "All Posts" blog nav (top and bottom) */
		.urT2WH [data-hook="blog-desktop-header-container"],
		.urT2WH [data-hook="blog-all-posts-bottom"] {
			--padding: 0 !important;
			block-size: auto !important;
			height: auto !important;
			min-block-size: 0 !important;
			padding-block: 0.35em !important;
		}

		.urT2WH [data-hook="blog-desktop-header-container"] .LnLd_R > li,
		.urT2WH [data-hook="blog-all-posts-bottom"] .LnLd_R > li {
			height: auto !important;
			min-height: 0 !important;
			line-height: 1.35 !important;
			padding-block: 0 !important;
		}

		.urT2WH [data-hook="blog-all-posts-bottom"] {
			max-width: var(--content-size, 940px);
			margin: 1.25em auto 0;
			padding-inline: 20px;
		}

		.urT2WH [data-hook="slot-placeholder-TPAMultiSection_lj5usnf1.above-header"],
		.urT2WH [data-hook="slot-placeholder-TPAMultiSection_lj5usnf1.above-content-1"],
		.urT2WH [data-hook="slot-placeholder-TPAMultiSection_lj5usnf1.above-content-2"] {
			display: none !important;
		}
`;

html = html.replace(
	/\/\* Compact "All Posts" blog[\s\S]*?font: inherit;\s*\}\s*/,
	''
);
html = html.replace(/\.patriarch-post-all-posts[\s\S]*?\}\s*/g, '');

if (!html.includes('Compact "All Posts" blog nav')) {
	html = html.replace(
		'/* Patriarch archive: show header nav without Wix hydration */',
		blogNavCss + '\n\t\t/* Patriarch archive: show header nav without Wix hydration */'
	);
}

// Dynamic copyright (en-dash between 2023 and current year)
html = html.replace(
	/<span class="color_14 wixui-rich-text__text">© 2023 by Patriarch Flags\.<\/span>/,
	'<span class="color_14 wixui-rich-text__text">© 2023–<script>document.write(new Date().getFullYear())</script> by Patriarch Flags.</span>'
);

// CSS safety net (in case any comment fragments remain)
const hideRule = `
		/* Patriarch archive: hide Wix blog engagement UI */
		.prZ8Wc,
		.wc-comments-root,
		[data-hook="post-main-actions__stats"],
		[data-hook="top-level-comment-list"],
		[data-hook="wc-root"] {
			display: none !important;
		}
`;

const headerMetaRule = `
		/* Post header: hide reading time and more-actions menu */
		article[data-hook="post"] .F56Ope,
		article[data-hook="post"] .hSZsuG,
		article[data-hook="post"] [data-hook="time-to-read"],
		article[data-hook="post"] [data-hook="more-button"] {
			display: none !important;
		}
`;

// Restore author · date separator if an older patch hid it
html = html.replace(
	/\s*\/\* Post header: no mid-dot separators[\s\S]*?display: none !important;\s*\}\s*/,
	'\n'
);

if (!html.includes('Post header: hide reading time')) {
	html = html.replace(
		'/* Patriarch archive: show header nav without Wix hydration */',
		headerMetaRule + '\n\t\t/* Patriarch archive: show header nav without Wix hydration */'
	);
}

if (!html.includes('Patriarch archive: hide Wix blog engagement')) {
	html = html.replace(
		'/* Patriarch archive: show header nav without Wix hydration */',
		hideRule + '\n\t\t/* Patriarch archive: show header nav without Wix hydration */'
	);
}

fs.writeFileSync(layoutPath, html, 'utf8');
console.log('layout.html patched');

require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'bundle-layout.js')], {
	stdio: 'inherit',
});
// patch-template.js ends by calling bundle-layout.js
