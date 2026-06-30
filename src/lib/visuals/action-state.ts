import type { Component } from 'svelte';
import { CheckCircleIcon, CircleDashedIcon, CircleNotchIcon, XCircleIcon } from 'phosphor-svelte';

export type ActionState = 'idle' | 'pending' | 'success' | 'error';

export interface StateIconEntry {
	icon: Component<any>;
	/** Tailwind class applied when focused. */
	accent: string;
	/** Whether the icon should spin when the state is active/focused. */
	spin: boolean;
}

export const STATE_ICONS = {
	idle: { icon: CircleDashedIcon, accent: 'text-muted-foreground', spin: false },
	pending: { icon: CircleNotchIcon, accent: 'text-primary', spin: true },
	success: { icon: CheckCircleIcon, accent: 'text-green-400', spin: false },
	error: { icon: XCircleIcon, accent: 'text-destructive', spin: false }
} as const satisfies Record<ActionState, StateIconEntry>;
