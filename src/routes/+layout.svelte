<script lang="ts">
	import './layout.css';
	import { onNavigate } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { GithubLogoIcon } from 'phosphor-svelte';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import UserMenu from '$lib/components/user-menu.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import SiteFooter from '$lib/components/site-footer.svelte';
	import ThemeProvider from '$lib/themes/theme-provider.svelte';
	import SoundEffects from '$lib/sounds/sound-effects.svelte';
	import Shortcuts from '$lib/shortcuts/shortcuts.svelte';
	import YouTubeMusicMount from '$lib/components/youtube-music/youtube-music-mount.svelte';

	const { children, data } = $props();
	const gaId = env.PUBLIC_GA_MEASUREMENT_ID;
	const gaSnippet = gaId
		? `<script>
			window.dataLayer = window.dataLayer || [];
			function gtag() {
				dataLayer.push(arguments);
			}
			gtag('js', new Date());
			gtag('config', ${JSON.stringify(gaId)});
		</scr${'ipt'}>`
		: '';

	async function signInWithGitHub() {
		await authClient.signIn.social({
			provider: 'github'
		});
	}

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if gaId}
		<script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- GA snippet is built from a JSON-encoded public env var, not user content. -->
		{@html gaSnippet}
	{/if}
</svelte:head>
<YouTubeMusicMount />
<ThemeProvider>
	<SoundEffects>
		<Shortcuts>
			<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- The footer is exactly 2rem tall; Tailwind has no named grid-row template for this. -->
			<div class="grid h-dvh grid-rows-[1fr_2rem]">
				<div class="min-h-0 overflow-y-auto">
					<nav class="fixed top-4 right-4 z-50 flex items-center gap-3 font-mono text-xs">
						{#if data.user}
							<UserMenu user={data.user} />
						{:else}
							<Button variant="outline" size="sm" onclick={signInWithGitHub}>
								<GithubLogoIcon aria-hidden="true" />
								Sign in
							</Button>
						{/if}
					</nav>
					{@render children()}
				</div>
				<SiteFooter />
			</div>
		</Shortcuts>
	</SoundEffects>
</ThemeProvider>
