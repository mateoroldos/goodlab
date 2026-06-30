import type { Attachment } from 'svelte/attachments';

/**
 * Scrolls the element to the vertical center of its scroll container when it
 * becomes the current one. Attach with the element's "is current" flag — the
 * attachment re-runs on every flip, so the newly current element scrolls into
 * view and everything else stays put.
 */
export const scrollToCenter =
	(active: boolean): Attachment =>
	(el) => {
		if (active) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
	};
