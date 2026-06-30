import raw from '$lib/content/narration-manifest.json';
import type { NarrationManifest } from './clips.js';

/**
 * The generated clip manifest, typed once at the JSON boundary. Keys are
 * content-addressed via `narrationKey`, so regenerated audio never matches
 * stale entries.
 */
export const manifest: NarrationManifest = raw;
