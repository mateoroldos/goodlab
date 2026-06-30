<script module lang="ts">
	export type ActorNodeId = 'idle' | 'saving' | 'saved' | 'failed';
	export type ActorEdgeId =
		| 'idle-saving'
		| 'saving-saved'
		| 'saving-failed'
		| 'failed-saving'
		| 'saved-idle';

	export interface ActorSceneState {
		codeMode: 'machine' | 'usage';
		/** Progressive reveal of the machine declaration (0 = nothing shown). */
		machineStep?: 0 | 1 | 2 | 3 | 4 | 5;
		/** The actor card is present (createActor was called). */
		running?: boolean;
		/** The actor's current state once started. */
		actorValue?: ActorNodeId;
		/** Rule the actor consulted on the machine — flashes on the blueprint. */
		activeEdge?: ActorEdgeId;
		/** Event waiting in the actor's mailbox. */
		mailbox?: string;
		/** Snapshot stream emitted to subscribers. */
		snapshots?: ActorNodeId[];
		/** Progressive reveal of usage code, in XState's canonical order
		 *  (1 = createActor, 2 = +subscribe, 3 = +start, 4 = +send SAVE, 5 = +send SUCCESS). */
		usageStep?: 1 | 2 | 3 | 4 | 5;
		/** One machine, many independent instances — fan-out under the blueprint. */
		multiActors?: ActorNodeId[];
	}
</script>

<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import CodeBlock, { type CodeBlockState } from '$lib/visuals/code-block/code-block.svelte';
	import ExplainerGraph from '$lib/visuals/explainer-graph/explainer-graph.svelte';
	import FileCard from '$lib/visuals/file-card/file-card.svelte';
	import StateBadge from '$lib/visuals/state-badge/state-badge.svelte';
	import { soundContext } from '$lib/sounds/sound-effects.svelte.js';
	import {
		saveWorkflowGraph,
		saveWorkflowLabel,
		saveWorkflowValidEdges
	} from '../../shared/save-workflow-graph.js';

	interface Props {
		state: ActorSceneState;
	}

	const { state }: Props = $props();
	const sounds = soundContext.get();

	let prevActorValue: ActorSceneState['actorValue'];
	$effect(() => {
		const next = state.actorValue;
		if (next !== prevActorValue && next !== undefined) {
			// First value = .start() — the actor comes alive with a rising hum,
			// not a transition: nothing moved yet, something woke up.
			if (prevActorValue === undefined) sounds.play('actor.start');
			else if (next === 'saved') sounds.play('ui.success');
			else sounds.play('ui.transition');
		}
		prevActorValue = next;
	});

	let prevMailbox: string | undefined;
	$effect(() => {
		const next = state.mailbox;
		if (next !== undefined && next !== prevMailbox) sounds.play('ui.dispatch');
		prevMailbox = next;
	});

	// The blueprint at rest: when the finished machine code gives way to the
	// standalone graph ("nothing is lit"), the room settles down.
	let prevMachineStep: ActorSceneState['machineStep'];
	$effect(() => {
		const next = state.machineStep;
		if (prevMachineStep !== undefined && next === undefined) sounds.play('actor.settle');
		prevMachineStep = next;
	});

	// One soft pop per actor joining the fan-out, each a touch higher
	let prevActorCount: number | undefined;
	$effect(() => {
		const count = state.multiActors?.length ?? 0;
		if (prevActorCount !== undefined && count > prevActorCount) {
			sounds.play('ui.pop', { pitch: 2 ** ((count - 1) / 6) });
		}
		prevActorCount = count;
	});

	// The machine exhales: a glassy ping for every snapshot that goes out
	let prevSnapshotCount: number | undefined;
	$effect(() => {
		const count = state.snapshots?.length ?? 0;
		if (prevSnapshotCount !== undefined && count > prevSnapshotCount) {
			sounds.play('ui.snapshot');
		}
		prevSnapshotCount = count;
	});

	// Machine code built progressively as the narration names each piece.
	// machineStep undefined = show full machine; 0 = nothing; 1–5 = growing.
	const machineCode = $derived.by((): CodeBlockState => {
		const step = state.machineStep ?? 5;
		return {
			language: 'typescript',
			lines: [
				...(step >= 1 ? [{ id: 'm0', content: 'const machine = createMachine({' }] : []),
				...(step >= 2 ? [{ id: 'm1', content: "  initial: 'idle'," }] : []),
				...(step >= 3 ? [{ id: 'm2', content: '  states: {' }] : []),
				...(step >= 4
					? [
							{ id: 'm3', content: "    idle:   { on: { SAVE:    'saving'  } }," },
							{ id: 'm4', content: "    saving: { on: { SUCCESS: 'saved'," },
							{ id: 'm5', content: "                    FAIL:    'failed'  } }," },
							{ id: 'm6', content: "    failed: { on: { RETRY:   'saving'  } }," },
							{ id: 'm7', content: "    saved:  { on: { DONE:    'idle'    } }" }
						]
					: []),
				...(step >= 3 ? [{ id: 'm8', content: '  }' }] : []),
				...(step >= 1 ? [{ id: 'm9', content: '});' }] : [])
			]
		};
	});

	const machineFocusIds = $derived.by((): ReadonlySet<string> | undefined => {
		const step = state.machineStep;
		if (step === 1) return new Set(['m0', 'm9']);
		if (step === 2) return new Set(['m1']);
		if (step === 3) return new Set(['m2', 'm8']);
		if (step === 4) return new Set(['m3', 'm4', 'm5', 'm6', 'm7']);
		return undefined;
	});

	// Usage code builds step by step as the narration teaches each line —
	// subscribe before start, so the subscriber catches the very first snapshot.
	const usageCode = $derived.by((): CodeBlockState => {
		const step = state.usageStep ?? 5;
		return {
			language: 'typescript',
			lines: [
				{ id: 'u0', content: 'const actor = createActor(machine);' },
				...(step >= 2
					? [
							{ id: 'u2', content: '' },
							{ id: 'u6', content: 'actor.subscribe(snapshot => {' },
							{ id: 'u7', content: '  console.log(snapshot.value);' },
							{ id: 'u8', content: '});' }
						]
					: []),
				...(step >= 3
					? [
							{ id: 'u9', content: '' },
							{ id: 'u1', content: 'actor.start();' }
						]
					: []),
				...(step >= 4
					? [
							{ id: 'u3', content: '' },
							{ id: 'u4', content: "actor.send({ type: 'SAVE' });" }
						]
					: []),
				...(step >= 5 ? [{ id: 'u5', content: "actor.send({ type: 'SUCCESS' });" }] : [])
			]
		};
	});

	const usageFocusIds = $derived.by((): ReadonlySet<string> | undefined => {
		const step = state.usageStep;
		if (step === 1) return new Set(['u0']);
		if (step === 2) return new Set(['u6', 'u7', 'u8']);
		if (step === 3) return new Set(['u1']);
		if (step === 4) return new Set(['u4']);
		if (step === 5) return new Set(['u5']);
		return undefined;
	});

	const codeState = $derived(state.codeMode === 'machine' ? machineCode : usageCode);
	const codeFocusIds = $derived(state.codeMode === 'machine' ? machineFocusIds : usageFocusIds);
	const filename = $derived(state.codeMode === 'machine' ? 'machine.ts' : 'app.ts');

	// The blueprint never lights a node — it is pure data. Only the consulted
	// rule flashes when the actor looks it up.
	const graphSnapshot = $derived({
		visibleEdges: saveWorkflowValidEdges,
		activeEdgeIds: state.activeEdge ? [state.activeEdge] : [],
		visibleLabels: state.activeEdge ? saveWorkflowLabel(state.activeEdge, 'event') : []
	});

	// Multiactor fan-out: always 3 columns. Fill in left-to-right; empty slots
	// are placeholder dashes so the grid never collapses.
	const actorSlots: Array<ActorNodeId | null> = $derived.by(() => {
		const actors = state.multiActors ?? [];
		return [actors[0] ?? null, actors[1] ?? null, actors[2] ?? null];
	});
</script>

<div class="mx-auto flex w-full max-w-md flex-col gap-4">
	<!-- Code file card (machine or usage) -->
	{#if state.machineStep !== 0}
		<FileCard title={filename}>
			<CodeBlock state={codeState} focusIds={codeFocusIds} stagger={false} />
		</FileCard>
	{/if}

	<!-- Multi-actor fan-out: always render 3 columns, fill in left to right. -->
	{#if state.multiActors !== undefined}
		<div class="grid grid-cols-3 gap-2">
			{#each actorSlots as value, i (i)}
				<div
					class={[
						'flex flex-col items-center gap-2 rounded-xl border px-3 py-3',
						value ? 'border-border/15 bg-muted/10' : 'border-dashed border-border/20 bg-transparent'
					]}
				>
					<span class="font-mono text-xs uppercase tracking-widest text-muted-foreground/40"
						>actor {i + 1}</span
					>
					{#if value}
						<div in:fly={{ y: 6, duration: 220, easing: quintOut }}>
							<StateBadge {value} />
						</div>
					{:else}
						<span class="font-mono text-xs text-muted-foreground/20">—</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Actor card: wraps the machine graph to show "actor = machine + runtime".
	     The machine graph lives inside the actor's frame — the border makes the
	     containment relationship visual. -->
	{#if state.running}
		<div
			class="overflow-hidden rounded-xl border border-border/20"
			in:fly={{ y: 8, duration: 260, easing: quintOut }}
		>
			<!-- Actor header: identity + mailbox -->
			<div
				class="flex min-h-9 items-center justify-between border-b border-border/15 bg-muted/10 px-4 py-2"
			>
				<span class="font-mono text-xs uppercase tracking-widest text-muted-foreground/40"
					>actor</span
				>
				<div class="flex items-center gap-2">
					<span class="font-mono text-xs text-muted-foreground/40">mailbox:</span>
					{#if state.mailbox}
						<!-- eslint-disable better-tailwindcss/no-restricted-classes -- The mailbox pill uses a theme-aware glow color that Tailwind's stock shadows cannot express. -->
						<span
							class="rounded-full border border-border/40 bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground shadow-[0_0_12px_color-mix(in_oklab,var(--secondary-foreground)_18%,transparent)]"
							in:fly={{ y: -8, duration: 220, easing: quintOut }}
						>
							{state.mailbox}
						</span>
						<!-- eslint-enable better-tailwindcss/no-restricted-classes -->
					{:else}
						<span class="font-mono text-xs text-muted-foreground/25" in:fade={{ duration: 150 }}
							>empty</span
						>
					{/if}
				</div>
			</div>

			<!-- Machine blueprint inside the actor — the nesting shows containment. -->
			<div class="border-b border-dashed border-border/25">
				<div
					class="flex min-h-7 items-center border-b border-dashed border-border/20 bg-muted/5 px-4 py-1"
				>
					<span class="font-mono text-2xs uppercase tracking-widest text-muted-foreground/30"
						>machine · blueprint</span
					>
				</div>
				<ExplainerGraph graph={saveWorkflowGraph} snapshot={graphSnapshot} arrowId="ac-arrow" />
			</div>

			<!-- Actor footer: live state + snapshot stream -->
			<div class="flex items-center justify-between gap-4 px-4 py-2.5">
				<div class="flex items-center gap-2">
					<span class="font-mono text-xs text-muted-foreground/40">state:</span>
					{#if state.actorValue}
						<div in:fly={{ x: -6, duration: 200, easing: quintOut }}>
							<StateBadge value={state.actorValue} />
						</div>
					{:else}
						<span class="font-mono text-xs text-muted-foreground/25">not started</span>
					{/if}
				</div>

				<div class="flex items-center gap-1.5 overflow-hidden">
					<span class="shrink-0 font-mono text-xs text-muted-foreground/40">→</span>
					{#if state.snapshots?.length}
						<div class="flex items-center gap-1">
							{#each state.snapshots as snap, i (i)}
								{#if i > 0}
									<span class="text-2xs text-muted-foreground/25">›</span>
								{/if}
								<div in:fly={{ x: -8, duration: 200, easing: quintOut }}>
									<StateBadge value={snap} showIcon={false} />
								</div>
							{/each}
						</div>
					{:else}
						<span class="font-mono text-xs text-muted-foreground/25">none yet</span>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Standalone machine blueprint (when not inside actor card). -->
	{#if !state.running && state.multiActors === undefined && state.machineStep === undefined}
		<div class="overflow-hidden rounded-xl border border-dashed border-border/40">
			<div
				class="flex min-h-9 items-center justify-between border-b border-border/15 bg-muted/10 px-4 py-2"
			>
				<span class="font-mono text-xs uppercase tracking-widest text-muted-foreground/40"
					>machine</span
				>
				<span class="font-mono text-xs text-muted-foreground/25">pure data · immutable</span>
			</div>
			<ExplainerGraph graph={saveWorkflowGraph} snapshot={graphSnapshot} arrowId="ac-arrow" />
		</div>
	{/if}
</div>
