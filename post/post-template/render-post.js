/**
 * Loads post-template/layout.html and merges in content from the simple <article> on this page.
 * Include layout-bundle.js before this script to support opening posts via file:// (no local server).
 */
(function () {
	'use strict';

	const TOKENS = {
		TITLE: '@@PATRIARCH_TITLE@@',
		AUTHOR: '@@PATRIARCH_AUTHOR@@',
		DATE_DISPLAY: '@@PATRIARCH_DATE_DISPLAY@@',
		DATE_ISO: '@@PATRIARCH_DATE_ISO@@',
		SLUG: '@@PATRIARCH_SLUG@@',
		BODY: '@@PATRIARCH_BODY@@',
	};

	function getTemplateUrl() {
		const script =
			document.currentScript ||
			document.querySelector('script[data-patriarch-template]');
		return script?.getAttribute('data-patriarch-template') || './post-template/layout.html';
	}

	function deriveSlug() {
		const fromHtml = document.documentElement.getAttribute('data-patriarch-slug');
		if (fromHtml) return fromHtml.trim();
		const leaf = location.pathname.split('/').pop() || '';
		return leaf.replace(/\.html$/i, '') || 'post';
	}

	function escapeText(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function parsePost() {
		const article = document.querySelector('article#patriarch-post, article');
		if (!article) {
			throw new Error('No <article> found. Add <article> with <header> and <section>.');
		}

		const header = article.querySelector('header');
		const section = article.querySelector('section');
		if (!header || !section) {
			throw new Error('<article> must contain <header> and <section>.');
		}

		const authorEl = header.querySelector('author, [data-patriarch-author]');
		const timeEl = header.querySelector('time');
		const h1 = header.querySelector('h1');

		const title = (h1?.textContent || document.title || '').trim();
		const author = (authorEl?.textContent || 'PatriarchFlag.com').trim();
		const dateDisplay = (timeEl?.textContent || '').trim();
		let dateIso = (timeEl?.getAttribute('datetime') || '').trim();

		if (dateIso && !/T\d/.test(dateIso)) {
			dateIso = new Date(dateIso + 'T12:00:00Z').toISOString();
		}
		if (!dateIso) {
			dateIso = new Date().toISOString();
		}

		return {
			title,
			author,
			dateDisplay,
			dateIso,
			bodyHtml: section.innerHTML.trim(),
			slug: deriveSlug(),
		};
	}

	function wrapBodyForRicos(html) {
		if (!html) return '';
		if (html.includes('data-breakout')) return html;
		return '<div data-breakout="normal">' + html + '</div>';
	}

	function applyTokens(template, post) {
		const body = wrapBodyForRicos(post.bodyHtml);
		const replacements = [
			[TOKENS.TITLE, escapeText(post.title)],
			[TOKENS.AUTHOR, escapeText(post.author)],
			[TOKENS.DATE_DISPLAY, escapeText(post.dateDisplay)],
			[TOKENS.DATE_ISO, escapeText(post.dateIso)],
			[TOKENS.SLUG, escapeText(post.slug)],
			[TOKENS.BODY, body],
		];

		let out = template;
		for (const [token, value] of replacements) {
			out = out.split(token).join(value);
		}
		return out;
	}

	async function loadTemplate(templateUrl) {
		if (location.protocol !== 'file:') {
			try {
				const response = await fetch(templateUrl, { cache: 'no-cache' });
				if (response.ok) {
					return await response.text();
				}
			} catch (_) {
				/* fall through to bundle */
			}
		}

		if (typeof window.PATRIARCH_POST_LAYOUT === 'string') {
			return window.PATRIARCH_POST_LAYOUT;
		}

		throw new Error(
			'Could not load the post template. Browsers block fetch() on file:// pages.\n' +
				'Add <script src="./post-template/layout-bundle.js"></script> before render-post.js, ' +
				'or open the site through a local server (e.g. npx serve . from the post folder).'
		);
	}

	function showError(err) {
		document.documentElement.classList.remove('patriarch-post-pending');
		console.error(err);
		const message = document.createElement('pre');
		message.style.cssText = 'padding:1rem;background:#fee;color:#900;white-space:pre-wrap';
		message.textContent = 'Patriarch post render failed:\n' + (err?.message || err);
		(document.body || document.documentElement).appendChild(message);
	}

	async function render() {
		document.documentElement.classList.add('patriarch-post-pending');
		const post = parsePost();
		const templateUrl = getTemplateUrl();
		const template = await loadTemplate(templateUrl);
		const html = applyTokens(template, post);
		document.open();
		document.write(html);
		document.close();
		if (typeof window.initPatriarchShareButtons === 'function') {
			window.initPatriarchShareButtons();
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			render().catch(showError);
		});
	} else {
		render().catch(showError);
	}
})();
