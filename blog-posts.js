/**
 * Loads blog listing from posts.js, fetches post/*.html, renders gallery cards and pagination.
 */
(function () {
	'use strict';

	var PAGE_SIZE = 10;
	var ITEM_HEIGHT = 340.5;
	var ITEM_GAP = 24;
	var AUTHOR_AVATAR_SRC = './blog_files/cc3b14_eab557176fd34ca0bef88f6549e69b02~mv2.png';

	function slugBase(entry) {
		var slug = String(entry).trim();
		return slug.replace(/\.html$/i, '');
	}

	function postHref(entry) {
		var path = String(entry).trim();
		if (!/\.html$/i.test(path)) {
			path = path + '.html';
		}
		return './post/' + path;
	}

	function postFetchUrl(entry) {
		return postHref(entry);
	}

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function resolvePostImageSrc(src) {
		if (!src) return '';
		if (/^https?:\/\//i.test(src)) return src;
		if (src.startsWith('./')) return './post/' + src.slice(2);
		if (src.startsWith('/')) return '.' + src;
		return './post/' + src;
	}

	function getCurrentPage() {
		var params = new URLSearchParams(window.location.search);
		var page = parseInt(params.get('page') || '0', 10);
		return Number.isFinite(page) && page >= 0 ? page : 0;
	}

	function pageUrl(page) {
		if (page <= 0) {
			var path = window.location.pathname;
			return path.endsWith('blog.html') ? './blog.html' : path;
		}
		return './blog.html?page=' + page;
	}

	function parsePostHtml(html, slug, entry) {
		var doc = new DOMParser().parseFromString(html, 'text/html');
		var article = doc.querySelector('article#patriarch-post, article');
		if (!article) {
			throw new Error('No <article> in post: ' + slug);
		}

		var header = article.querySelector('header');
		var section = article.querySelector('section');
		if (!header || !section) {
			throw new Error('Post missing header or section: ' + slug);
		}

		var title = (header.querySelector('h1')?.textContent || doc.title || '').trim();
		var author = (
			header.querySelector('author, [data-patriarch-author]')?.textContent || 'PatriarchFlag.com'
		).trim();
		var timeEl = header.querySelector('time');
		var dateDisplay = (timeEl?.textContent || '').trim();

		var firstP = section.querySelector('p');
		var excerpt = (firstP?.textContent || '').trim();
		if (excerpt.length > 140) {
			excerpt = excerpt.slice(0, 137) + '...';
		}

		var imgEl = article.querySelector('img');
		var imgSrc = resolvePostImageSrc(imgEl?.getAttribute('src') || '');
		var imgAlt = (imgEl?.getAttribute('alt') || title).trim();

		return {
			slug: slug,
			title: title,
			author: author,
			dateDisplay: dateDisplay,
			excerpt: excerpt,
			imgSrc: imgSrc,
			imgAlt: imgAlt,
			href: postHref(entry),
		};
	}

	function loadPost(entry) {
		var slug = slugBase(entry);
		var url = postFetchUrl(entry);
		return fetch(url)
			.then(function (res) {
				if (!res.ok) {
					throw new Error('Failed to load ' + url + ' (' + res.status + ')');
				}
				return res.text();
			})
			.then(function (html) {
				return parsePostHtml(html, slug, entry);
			});
	}

	function buildCard(post, index) {
		var wrapper = document.createElement('div');
		wrapper.className = 'item-link-wrapper patriarch-dynamic-post';
		wrapper.setAttribute('data-idx', String(index));
		wrapper.setAttribute('data-hook', 'item-link-wrapper');

		var imageHtml = post.imgSrc
			? '<img alt="' +
				escapeHtml(post.imgAlt) +
				'" class="gallery-item-visible gallery-item" data-hook="gallery-item-image-img" src="' +
				escapeHtml(post.imgSrc) +
				'" loading="lazy" style="width:454px;height:340.5px;object-fit:cover">'
			: '';

		wrapper.innerHTML =
			'<div class="gallery-item-container item-container-regular visible" data-hook="item-container" style="position:relative;width:940px;height:' +
			ITEM_HEIGHT +
			'px;margin:0 0 ' +
			ITEM_GAP +
			'px 0;overflow:hidden;border-width:1px;border-color:rgba(232,230,230,0.75);border-style:solid;display:block">' +
			'<div style="float:left">' +
			'<div class="gallery-item-wrapper visible" style="height:' +
			ITEM_HEIGHT +
			'px;width:454px;margin:-1px">' +
			'<div class="gallery-item-content item-content-regular image-item gallery-item-visible gallery-item" data-hook="image-item" style="width:454px;height:' +
			ITEM_HEIGHT +
			'px">' +
			imageHtml +
			'</div></div></div>' +
			'<div class="gallery-item-common-info-outer" style="height:' +
			ITEM_HEIGHT +
			'px;float:right">' +
			'<div class="gallery-item-common-info gallery-item-right-info" style="overflow:hidden;box-sizing:border-box;height:100%;width:486px">' +
			'<div class="RiOfiW pu51Xe TBrkhx blog-post-description-font blog-text-color blog-card-background-color blog-card-border-color post-list-item blog-post-homepage-border-color blog-post-homepage-post-container blog-post-homepage-background-color _UH27m" style="border-width:0;--wix-blog-inline-padding:36px" data-hook="post-list-item">' +
			'<div style="padding-left:36px;padding-right:36px" class="iSTCpN TBrkhx post-list-item-wrapper blog-post-homepage-description-font blog-post-homepage-description-color blog-post-homepage-description-fill">' +
			'<div class="uYL9xS">' +
			'<div class="JMCi2v blog-post-homepage-link-hashtag-hover-color so9KdE TBrkhx">' +
			'<a class="O16KGI pu51Xe TBrkhx mqysW5" href="' +
			escapeHtml(post.href) +
			'">' +
			'<div style="font-size:28px" class="FbwBsX blog-post-title-font TBrkhx mqysW5 HhgCcE" data-hook="post-list-item__title">' +
			'<div class="T5UMT5 fcPJ4D blog-hover-container-element-color WD_8WI post-title blog-post-homepage-title-color blog-post-homepage-title-font" style="font-size:28px" data-hook="post-title">' +
			'<h2 class="bD0vt9 KNiaIk" style="-webkit-line-clamp:3">' +
			escapeHtml(post.title) +
			'</h2></div></div></a>' +
			'<div class="CHRJex JMCi2v pu51Xe TBrkhx mqysW5">' +
			'<div style="font-size:16px" class="nebVix TBrkhx blog-post-description-style-font blog-post-homepage-description-style-font mABNle HhgCcE" data-hook="post-description">' +
			'<div class="wR7PET"><div class="BOlnTh" style="-webkit-line-clamp:3">' +
			escapeHtml(post.excerpt) +
			'</div></div></div></div></div>' +
			'<div class="SbjQym YD6Z1G blog-post-metadata-font post-header blog-post-description-font blog-post-homepage-description-font Bt5sQV TjmPXo" style="font-size:12px">' +
			'<div class="V_aJB6 CH7asw dXvq5u">' +
			'<span data-hook="profile-link">' +
			'<div class="H_gEjP"><span class="lBv2XN blog-text-color blog-link-hover-color avatar blog-post-text-color">' +
			'<span class="ERF5R1 avatar-image">' +
			'<img alt="Writer: ' +
			escapeHtml(post.author) +
			'" role="img" src="' +
			escapeHtml(AUTHOR_AVATAR_SRC) +
			'" style="width:32px;height:32px;object-fit:cover">' +
			'</span></span></div></span>' +
			'<div class="dZs5e3 htMcyB">' +
			'<span class="taLqKM" data-hook="profile-link"><span title="' +
			escapeHtml(post.author) +
			'" class="tQ0Q1A user-name mJ89ha blog-post-homepage-description-color blog-post-homepage-description-font blog-post-homepage-" data-hook="user-name">' +
			escapeHtml(post.author) +
			'</span></span>' +
			'<div class="xUuoH9 blog-post-homepage-description-font blog-post-homepage-description-color MBUSKJ">' +
			'<span class="UZa2Xr"><span title="' +
			escapeHtml(post.dateDisplay) +
			'" class="post-metadata__date time-ago" data-hook="time-ago">' +
			escapeHtml(post.dateDisplay) +
			'</span></span></div></div></div></div></div></div></div></div></div>';

		return wrapper;
	}

	function renderPagination(nav, currentPage, totalPages) {
		if (!nav) return;
		nav.innerHTML = '';
		if (totalPages <= 1) return;

		var list = document.createElement('div');
		list.className = 'patriarch-blog-pagination';
		list.setAttribute('role', 'navigation');
		list.setAttribute('aria-label', 'Blog pages');

		for (var p = 0; p < totalPages; p++) {
			var link = document.createElement('a');
			link.href = pageUrl(p);
			link.textContent = String(p + 1);
			link.className = 'patriarch-blog-pagination__link blog-navigation-link-hover-color';
			if (p === currentPage) {
				link.setAttribute('aria-current', 'page');
				link.classList.add('patriarch-blog-pagination__link--active');
			}
			list.appendChild(link);
		}

		nav.appendChild(list);
	}

	function updateGalleryHeight(margin, container, count) {
		if (count === 0) {
			margin.style.height = '0px';
			if (container) container.style.height = '0px';
			return;
		}
		var totalHeight = count * (ITEM_HEIGHT + ITEM_GAP);
		margin.style.height = totalHeight + 'px';
		margin.style.position = 'relative';
		if (container) {
			container.style.height = totalHeight + 'px';
			container.style.overflow = 'visible';
		}
	}

	function renderBlog() {
		if (typeof posts === 'undefined' || !Array.isArray(posts)) {
			console.error('posts.js must define a global `posts` array.');
			return;
		}

		var margin = document.getElementById('pro-gallery-margin-container-pro-blog');
		var container = document.getElementById('pro-gallery-container-pro-blog');
		var nav = document.getElementById('patriarch-blog-pagination-nav');
		var staticDemo = document.querySelector('.patriarch-blog-static-demo');

		if (!margin) {
			console.error('Blog gallery container not found.');
			return;
		}

		if (staticDemo) {
			staticDemo.hidden = true;
		}

		var currentPage = getCurrentPage();
		var totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
		var safePage = Math.min(currentPage, totalPages - 1);
		var start = safePage * PAGE_SIZE;
		var slugs = posts.slice(start, start + PAGE_SIZE);

		margin.querySelectorAll('.patriarch-dynamic-post').forEach(function (el) {
			el.remove();
		});

		if (slugs.length === 0) {
			updateGalleryHeight(margin, container, 0);
			renderPagination(nav, safePage, totalPages);
			return;
		}

		return Promise.all(slugs.map(loadPost))
			.then(function (items) {
				var frag = document.createDocumentFragment();
				items.forEach(function (post, i) {
					frag.appendChild(buildCard(post, i));
				});
				margin.appendChild(frag);
				updateGalleryHeight(margin, container, items.length);
				renderPagination(nav, safePage, totalPages);
			})
			.catch(function (err) {
				console.error(err);
			});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', renderBlog);
	} else {
		renderBlog();
	}
})();
