<script module lang="ts">
	export type SaveSceneMode = 'single-flag' | 'error-flag' | 'ghost' | 'patched' | 'named';
	export type SaveMode = 'idle' | 'saving' | 'failed' | 'saved';

	export interface SaveStateSceneState {
		mode: SaveSceneMode;
		isSaving: boolean;
		hasError: boolean;
		activeState?: SaveMode;
		/** The single thing the viewer should look at right now. */
		focus?: 'isSaving' | 'hasError' | 'contradiction' | 'named-state';
		/** Patched-handler construction stage: 1 skeleton, 2 set flags on entry,
		 *  3 reset in try path, 4 reset in catch path. Omit for the full handler. */
		patchStep?: 1 | 2 | 3 | 4;
		/** Spotlight a path of the finished handler without removing lines. */
		patchFocus?: 'entry' | 'try' | 'catch';
		/** Union members revealed so far in named mode (0 = bare type line). Omit for all four. */
		namedRevealed?: 0 | 1 | 2 | 3 | 4;
	}
</script>

<script lang="ts">
	import { CheckIcon, SpinnerGapIcon, WarningIcon } from 'phosphor-svelte';
	import CodeBlock from '$lib/visuals/code-block/code-block.svelte';
	import FileCard from '$lib/visuals/file-card/file-card.svelte';
	import StateButton from '$lib/visuals/state-button/state-button.svelte';
	import type { ActionState } from '$lib/visuals/action-state.js';

	interface Props {
		state: SaveStateSceneState;
	}

	const { state }: Props = $props();

	const isContradiction = $derived(state.focus === 'contradiction');

	// Contradiction shows both signals simultaneously: spinning loader (isSaving=true)
	// + error colors (hasError=true). The mismatch is the lesson.
	const buttonState = $derived.by((): ActionState => {
		if (isContradiction) return 'pending';
		if (state.isSaving) return 'pending';
		if (state.hasError) return 'error';
		if (state.activeState === 'saving') return 'pending';
		if (state.activeState === 'failed') return 'error';
		if (state.activeState === 'saved') return 'success';
		return 'idle';
	});

	const buttonClass = $derived(
		isContradiction || buttonState === 'error'
			? 'w-full border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/15'
			: buttonState === 'success'
				? 'w-full border-green-400/20 bg-green-500/10 text-green-300 hover:bg-green-500/15'
				: buttonState === 'pending'
					? 'w-full border-transparent bg-primary/20 text-primary hover:bg-primary/25'
					: 'w-full'
	);

	// Lines separated from highlights/dims so the {#each} only re-runs on structural
	// changes (lines added/removed), not on highlight-only updates.
	const codeLines = $derived.by(() => {
		if (state.mode === 'single-flag') {
			return [
				{ id: 'decl', content: 'const [isSaving, setIsSaving] = useState(false)' },
				...(state.isSaving ? [{ id: 'setter', content: 'setIsSaving(true)' }] : [])
			];
		}

		if (state.mode === 'error-flag' || state.mode === 'ghost') {
			// Each setter line follows its own flag, so a lone hasError flip
			// (episode 1's error walk) shows its line just like the ghost case.
			return [
				{ id: 'decl-saving', content: 'const [isSaving, setIsSaving] = useState(false)' },
				{ id: 'decl-error', content: 'const [hasError, setHasError] = useState(false)' },
				...(state.isSaving || state.hasError ? [{ id: 'blank', content: '' }] : []),
				...(state.isSaving ? [{ id: 'setter-saving', content: 'setIsSaving(true)' }] : []),
				...(state.hasError ? [{ id: 'setter-error', content: 'setHasError(true)' }] : [])
			];
		}

		if (state.mode === 'patched') {
			// Ben builds the patch in stages: 1 skeleton, 2 set flags on entry,
			// 3 reset in try path, 4 reset in catch path.
			const step = state.patchStep ?? 4;
			return [
				{ id: 'p0', content: 'async function save() {' },
				...(step >= 2
					? [
							{ id: 'p1', content: '  setIsSaving(true)' },
							{ id: 'p2', content: '  setHasError(false)' }
						]
					: []),
				{ id: 'p3', content: '  try {' },
				{ id: 'p4', content: '    await upload()' },
				...(step >= 3 ? [{ id: 'p5', content: '    setIsSaving(false)' }] : []),
				{ id: 'p6', content: '  } catch {' },
				...(step >= 4
					? [
							{ id: 'p7', content: '    setHasError(true)' },
							{ id: 'p8', content: '    setIsSaving(false)' }
						]
					: []),
				{ id: 'p9', content: '  }' },
				{ id: 'p10', content: '}' }
			];
		}

		// named mode — union members appear one by one as they are narrated;
		// the setStatus line only exists once the machine starts moving.
		const revealed = state.namedRevealed ?? 4;
		const members = [
			{ id: 'u1', content: "  | 'idle'" },
			{ id: 'u2', content: "  | 'saving'" },
			{ id: 'u3', content: "  | 'failed'" },
			{ id: 'u4', content: "  | 'saved'" }
		];
		return [
			{ id: 'type', content: 'type Status =' },
			...members.slice(0, revealed),
			...(state.activeState
				? [
						{ id: 'blank', content: '' },
						{ id: 'value', content: `setStatus('${state.activeState}')` }
					]
				: [])
		];
	});

	// Spotlight: the focused lines light up, everything else auto-dims. One
	// focus point per moment — the focus field decides, the scene maps it.
	const codeFocusIds = $derived.by((): ReadonlySet<string> => {
		const { mode, isSaving, hasError, focus } = state;
		if (mode === 'single-flag') {
			if (isSaving) return new Set(['setter']);
			if (focus === 'isSaving') return new Set(['decl']);
			return new Set();
		}
		if (mode === 'error-flag' || mode === 'ghost') {
			if (isSaving)
				return new Set(hasError ? ['setter-saving', 'setter-error'] : ['setter-saving']);
			if (hasError) return new Set(['setter-error']);
			if (focus === 'isSaving') return new Set(['decl-saving']);
			if (focus === 'hasError') return new Set(['decl-error']);
			if (focus === 'contradiction') return new Set(['decl-saving', 'decl-error']);
			return new Set();
		}
		if (mode === 'patched') {
			if (state.patchFocus === 'entry') return new Set(['p1', 'p2']);
			if (state.patchFocus === 'try') return new Set(['p4', 'p5']);
			if (state.patchFocus === 'catch') return new Set(['p6', 'p7', 'p8']);
			if (state.patchStep === undefined) return new Set();
			if (state.patchStep === 1) return new Set(['p0', 'p3', 'p6', 'p9', 'p10']);
			if (state.patchStep === 2) return new Set(['p1', 'p2']);
			if (state.patchStep === 3) return new Set(['p5']);
			return new Set(['p7', 'p8']);
		}
		if (mode === 'named') {
			// While the union is being declared, the narrated member keeps the
			// spotlight even as the button moves; afterwards, the setter line takes it.
			if (state.namedRevealed !== undefined) {
				return new Set([state.namedRevealed === 0 ? 'type' : `u${state.namedRevealed}`]);
			}
			if (state.activeState) return new Set(['value']);
			return new Set();
		}
		return new Set();
	});

	const codeState = $derived({ language: 'typescript' as const, lines: codeLines });
</script>

<div class="mx-auto flex w-full max-w-xl flex-col gap-8">
	<!-- File card: filename tab stays mounted, code fades inside on group change -->
	<FileCard title="Button.tsx">
		<CodeBlock state={codeState} focusIds={codeFocusIds} stagger={false} />
	</FileCard>

	<!-- UI always below: the rendered output of the state above -->
	<div class="mx-auto w-full max-w-xs">
		<StateButton state={buttonState} class={buttonClass}>
			Save

			{#snippet pending()}
				<span class="inline-flex shrink-0 motion-safe:animate-spin">
					<SpinnerGapIcon class="size-4" weight="bold" />
				</span>
				{#if isContradiction}
					<WarningIcon class="size-4 shrink-0" />
				{/if}
				Saving...
			{/snippet}

			{#snippet success()}
				<CheckIcon class="size-4 shrink-0" weight="bold" />
				Saved
			{/snippet}

			{#snippet error()}
				<WarningIcon class="size-4 shrink-0" />
				Could not save
			{/snippet}
		</StateButton>
	</div>
</div>
