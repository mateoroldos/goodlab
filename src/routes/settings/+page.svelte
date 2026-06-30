<script lang="ts">
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<div class="flex min-h-full flex-col">
	<main class="mx-auto w-full max-w-2xl flex-1 px-8 py-16">
		<header class="mb-10 border-b border-border pb-10">
			<h1 class="mb-3 text-3xl font-semibold tracking-tight">Settings</h1>
			<p class="text-sm leading-6 text-muted-foreground">Your account details.</p>
		</header>

		<section>
			<div class="mb-6 flex items-center gap-4">
				<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- tracking-[0.3em] is intentional for the wide-spaced section label -->
				<span class="font-mono text-xs tracking-[0.3em] text-muted-foreground/40 uppercase"
					>profile</span
				>
				<div class="h-px flex-1 bg-border"></div>
			</div>

			<dl class="grid gap-4">
				<div class="rounded-lg border border-border bg-background p-4">
					<dt class="font-mono text-xs text-muted-foreground uppercase">Name</dt>
					<dd class="mt-1 text-sm">{data.user.name ?? '—'}</dd>
				</div>
				<div class="rounded-lg border border-border bg-background p-4">
					<dt class="font-mono text-xs text-muted-foreground uppercase">Email</dt>
					<dd class="mt-1 text-sm">{data.user.email ?? '—'}</dd>
				</div>
			</dl>
		</section>
	</main>
</div>
