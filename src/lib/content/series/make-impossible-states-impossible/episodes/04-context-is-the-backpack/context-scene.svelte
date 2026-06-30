<script module lang="ts">
	export type NodeId = 'idle' | 'saving' | 'failed' | 'saved';

	export interface ContextSceneState {
		mode: 'explosion' | 'backpack';
		/** backpack mode: which state the machine is currently in */
		currentNode?: NodeId;
		/** backpack mode: context values carried by the machine */
		retries?: number;
		message?: string | null;
		/**
		 * backpack mode: the single focus point. `status` is the position line,
		 * `retries`/`message` a single context value, `context` the whole backpack.
		 */
		focus?: 'status' | 'retries' | 'message' | 'context';
		/**
		 * explosion mode: `revealed` exploded states are visible; the ones from
		 * `focusFrom` on are the fresh focus, older ones dim.
		 */
		explosion?: { revealed: number; focusFrom: number };
		/**
		 * backpack mode: construction stage — 0 status only, 1 empty context,
		 * 2 +retries, 3 +message. Omit for the full backpack.
		 */
		contextRevealed?: 0 | 1 | 2 | 3;
	}
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
	import CodeBlock from '$lib/visuals/code-block/code-block.svelte';
	import ExplainerGraph from '$lib/visuals/explainer-graph/explainer-graph.svelte';
	import FileCard from '$lib/visuals/file-card/file-card.svelte';
	import { soundContext } from '$lib/sounds/sound-effects.svelte.js';
	import { saveWorkflowGraph, saveWorkflowValidEdges } from '../../shared/save-workflow-graph.js';

	interface Props {
		state: ContextSceneState;
	}

	const { state }: Props = $props();

	const sounds = soundContext.get();

	// Escalating ticks as the state list multiplies — the one place the room's
	// calm intentionally breaks, a whole tone higher per exploded state.
	let prevRevealed: number | undefined;
	$effect(() => {
		const revealed = state.explosion?.revealed ?? 0;
		if (prevRevealed !== undefined && revealed > prevRevealed) {
			sounds.play('ui.tick', { pitch: 2 ** ((revealed - 1) / 6) });
		}
		prevRevealed = revealed;
	});

	// Transition sound as the machine moves through the map (skip initial mount)
	let prevNode: NodeId | undefined;
	$effect(() => {
		const next = state.currentNode;
		if (state.mode === 'backpack' && next && prevNode && next !== prevNode) {
			if (next === 'saved') sounds.play('ui.success');
			else sounds.play('ui.transition');
		}
		prevNode = next;
	});

	const extraExplosionIds = ['ex-f1', 'ex-f2', 'ex-f3', 'ex-ft', 'ex-fa'];

	// Structural lines only — no highlighted/dimmed in objects so in:fly only fires for
	// genuinely new lines (the progressively revealed explosion variants).
	const explosionLines = $derived.by(() => {
		const revealed = state.explosion?.revealed ?? 0;
		const allLines = [
			{ id: 'ex-type', content: 'type Status =' },
			{ id: 'ex-idle', content: "  | 'idle'" },
			{ id: 'ex-saving', content: "  | 'saving'" },
			{ id: 'ex-failed', content: "  | 'failed'" },
			{ id: 'ex-f1', content: "  | 'failed-1st-attempt'" },
			{ id: 'ex-f2', content: "  | 'failed-2nd-attempt'" },
			{ id: 'ex-f3', content: "  | 'failed-3rd-attempt'" },
			{ id: 'ex-ft', content: "  | 'failed-timeout'" },
			{ id: 'ex-fa', content: "  | 'failed-auth-error'" },
			{ id: 'ex-saved', content: "  | 'saved'" }
		];
		return allLines.filter((line) => {
			if (line.id === 'ex-failed') return revealed === 0;
			if (!extraExplosionIds.includes(line.id)) return true;
			return extraExplosionIds.indexOf(line.id) < revealed;
		});
	});

	// Fresh exploded states are the focus; the ones already discussed dim.
	const explosionHighlightedIds = $derived.by((): ReadonlySet<string> => {
		if (!state.explosion) return new Set();
		const { revealed, focusFrom } = state.explosion;
		return new Set(extraExplosionIds.slice(focusFrom, revealed));
	});

	const explosionDimmedIds = $derived.by((): ReadonlySet<string> => {
		if (!state.explosion) return new Set();
		return new Set(extraExplosionIds.slice(0, state.explosion.focusFrom));
	});

	// Backpack mode: lines whose content changes with machine state — content changes
	// are structural so the {#each} correctly patches them in place by stable IDs.
	const backpackLines = $derived.by(() => {
		const node = state.currentNode ?? 'idle';
		const retries = state.retries ?? 0;
		const msg = state.message ?? null;
		const stage = state.contextRevealed ?? 3;
		return [
			{ id: 'bp-status', content: `const status = '${node}'` },
			...(stage >= 1
				? [
						{ id: 'bp-blank', content: '' },
						{ id: 'bp-ctx-open', content: 'const context = {' },
						...(stage >= 2 ? [{ id: 'bp-retries', content: `  retries: ${retries},` }] : []),
						...(stage >= 3
							? [{ id: 'bp-message', content: `  message: ${msg === null ? 'null' : `'${msg}'`}` }]
							: []),
						{ id: 'bp-ctx-close', content: '}' }
					]
				: [])
		];
	});

	// Backpack mode: the focus names one concept; the scene maps it to lines.
	const backpackFocusIds = $derived.by((): ReadonlySet<string> => {
		if (state.focus === 'status') return new Set(['bp-status']);
		if (state.focus === 'retries') return new Set(['bp-retries']);
		if (state.focus === 'message') return new Set(['bp-message']);
		if (state.focus === 'context') return new Set(['bp-ctx-open', 'bp-retries', 'bp-message']);
		return new Set();
	});

	const retriesFocused = $derived(state.focus === 'retries' || state.focus === 'context');
	const messageFocused = $derived(state.focus === 'message' || state.focus === 'context');

	// The file card header switches with mode
	const filename = $derived(state.mode === 'explosion' ? 'status.ts' : 'machine.ts');
	const codeState = $derived(
		state.mode === 'explosion'
			? ({ language: 'typescript', lines: explosionLines } as const)
			: ({ language: 'typescript', lines: backpackLines } as const)
	);
	const highlightedIds = $derived(state.mode === 'explosion' ? explosionHighlightedIds : undefined);
	const dimmedIds = $derived(state.mode === 'explosion' ? explosionDimmedIds : undefined);
	const focusIds = $derived(state.mode === 'backpack' ? backpackFocusIds : undefined);

	const graphSnapshot = $derived({
		visibleEdges: saveWorkflowValidEdges,
		currentNode: state.currentNode,
		spotlight: state.currentNode !== undefined
	});
</script>

<div class="mx-auto flex w-full max-w-md flex-col gap-6">
	<!-- File card -->
	<FileCard title={filename}>
		<CodeBlock state={codeState} {highlightedIds} {dimmedIds} {focusIds} stagger={false} />
	</FileCard>

	<!-- Backpack mode: the map returns — context travels with the machine as a footer -->
	{#if state.mode === 'backpack' && state.currentNode}
		<div
			class="overflow-hidden rounded-xl border border-border/15"
			in:fade={{ duration: 220 }}
			out:fade={{ duration: 150 }}
		>
			<ExplainerGraph graph={saveWorkflowGraph} snapshot={graphSnapshot} arrowId="cx-arrow" />

			<!-- Context footer: the backpack carried through the map -->
			<div class="border-t border-border/15 bg-muted/10 px-4 py-2.5 font-mono text-xs">
				<span class="text-muted-foreground/40">context · </span>
				<span class="text-muted-foreground/60">retries: </span>
				<span
					class="transition-colors duration-200"
					class:text-primary={retriesFocused}
					class:text-foreground={!retriesFocused}>{state.retries ?? 0}</span
				>
				<span class="text-muted-foreground/60"> · message: </span>
				<span
					class="transition-colors duration-200"
					class:text-primary={messageFocused}
					class:text-foreground={!messageFocused}
				>
					{#if state.message}'{state.message}'{:else}null{/if}
				</span>
			</div>
		</div>
	{/if}
</div>
