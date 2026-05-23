/**
 * Wires post footer share buttons to standard share URLs (replaces Wix share handlers).
 */
(function () {
	'use strict';

	function getShareUrl() {
		var canonical = document.querySelector('link[rel="canonical"]');
		if (canonical && canonical.href) {
			return canonical.href;
		}
		return window.location.href.split('#')[0];
	}

	function getShareTitle() {
		var h1 = document.querySelector('[data-hook="post-title"] h1, article h1, h1');
		return (h1 && h1.textContent ? h1.textContent : document.title || '').trim();
	}

	function openPopup(url) {
		window.open(url, 'patriarch-share', 'noopener,noreferrer,width=600,height=500');
	}

	function convertToShareLink(button, href) {
		if (!button || button.tagName === 'A') return button;
		var link = document.createElement('a');
		link.className = button.className;
		link.setAttribute('aria-label', button.getAttribute('aria-label') || '');
		link.href = href;
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
		link.innerHTML = button.innerHTML;
		button.replaceWith(link);
		return link;
	}

	function showCopyFeedback(button, message) {
		var previous = button.getAttribute('aria-label') || '';
		button.setAttribute('aria-label', message);
		button.classList.add('patriarch-share-copied');
		window.setTimeout(function () {
			button.setAttribute('aria-label', previous);
			button.classList.remove('patriarch-share-copied');
		}, 2000);
	}

	function copyShareLink(button) {
		var url = getShareUrl();
		function onSuccess() {
			showCopyFeedback(button, 'Link copied to clipboard');
		}
		function onFailure() {
			window.prompt('Copy this link:', url);
		}
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(url).then(onSuccess).catch(onFailure);
		} else {
			onFailure();
		}
	}

	function initPatriarchShareButtons() {
		if (document.documentElement.hasAttribute('data-patriarch-share-ready')) {
			return;
		}
		document.documentElement.setAttribute('data-patriarch-share-ready', '');

		var url = encodeURIComponent(getShareUrl());
		var title = encodeURIComponent(getShareTitle());

		var facebook = document.querySelector('[data-hook="share-button__facebook"]');
		if (facebook) {
			convertToShareLink(
				facebook,
				'https://www.facebook.com/sharer/sharer.php?u=' + url
			);
		}

		var twitter = document.querySelector('[data-hook="share-button__twitter"]');
		if (twitter) {
			convertToShareLink(
				twitter,
				'https://twitter.com/intent/tweet?url=' + url + '&text=' + title
			);
		}

		var linkedIn = document.querySelector('[data-hook="share-button__linked-in"]');
		if (linkedIn) {
			convertToShareLink(
				linkedIn,
				'https://www.linkedin.com/sharing/share-offsite/?url=' + url
			);
		}

		var linkBtn = document.querySelector('[data-hook="share-button__link"]');
		if (linkBtn) {
			linkBtn.addEventListener('click', function (event) {
				event.preventDefault();
				copyShareLink(linkBtn);
			});
		}

		var printBtn = document.querySelector('[data-hook="share-button__print"]');
		if (printBtn) {
			printBtn.addEventListener('click', function (event) {
				event.preventDefault();
				window.print();
			});
		}
	}

	window.initPatriarchShareButtons = initPatriarchShareButtons;

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initPatriarchShareButtons);
	} else {
		initPatriarchShareButtons();
	}
})();
