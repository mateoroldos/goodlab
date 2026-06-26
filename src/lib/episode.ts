import type { Component } from 'svelte';

export interface Phase<S> {
	state: S;
}

export interface Step<S> {
	text: string;
	phases: Array<Phase<S>>;
}

export interface ChapterConfig<S = any> {
	id: string;
	title?: string;
	component: Component<{ state: S }>;
	steps: Array<Step<S>>;
}

export interface Episode {
	slug: string;
	title: string;
	description: string;
	chapters: ChapterConfig[];
}

export const defineChapter = <S>(config: ChapterConfig<S>): ChapterConfig<S> => config;
