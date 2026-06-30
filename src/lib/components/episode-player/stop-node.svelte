<script lang="ts">
	import type { StopState } from './progress-rail.svelte';
	import { scrollToCenter } from './scroll-to-center.js';

	interface Props {
		state: StopState;
		connectedToNext: boolean;
	}

	const { state, connectedToNext }: Props = $props();

	const CIRCLE_BASE = 'rounded-full transition-all duration-200 ease-in-out';
	const CONNECTOR_BASE = 'w-0.5 h-4 transition-colors duration-200 ease';

	function circleClass(s: StopState): string {
		if (s === 'current') return `${CIRCLE_BASE} size-2.5 bg-primary/25 border border-primary`;
		if (s === 'done' || s === 'done-sibling') return `${CIRCLE_BASE} size-1.5 bg-primary/25`;
		return `${CIRCLE_BASE} size-1.5 bg-muted-foreground/20`;
	}

	function connectorClass(s: StopState, connected: boolean): string {
		if (!connected) return `${CONNECTOR_BASE} bg-transparent`;
		if (s === 'done' || s === 'done-sibling') return `${CONNECTOR_BASE} bg-primary/25`;
		return `${CONNECTOR_BASE} bg-muted-foreground/20`;
	}
</script>

<div class="flex flex-col items-center">
	<div {@attach scrollToCenter(state === 'current')} class={circleClass(state)}></div>
	<div class={connectorClass(state, connectedToNext)}></div>
</div>
