<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { GearIcon, SignOutIcon } from 'phosphor-svelte';
	import { authClient } from '$lib/auth-client';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	const { user }: { user: { name?: string | null; email?: string | null; image?: string | null } } =
		$props();

	async function signOut() {
		await authClient.signOut();
		await invalidateAll();
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button variant="ghost" size="icon-sm" class="rounded-full" {...props}>
				<Avatar.Root class="size-8">
					<Avatar.Image src={user.image ?? undefined} alt={user.name ?? user.email ?? 'User'} />
					<Avatar.Fallback class="bg-muted text-foreground text-xs uppercase">
						{user.name?.slice(0, 2) ?? user.email?.slice(0, 2) ?? 'U'}
					</Avatar.Fallback>
				</Avatar.Root>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content class="w-48" align="end">
		<DropdownMenu.Label class="truncate font-normal">
			<div class="truncate font-medium">{user.name ?? user.email ?? 'User'}</div>
			{#if user.name && user.email}
				<div class="truncate text-muted-foreground">{user.email}</div>
			{/if}
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item>
				{#snippet child({ props })}
					<a href={resolve('/settings')} {...props}>
						<GearIcon aria-hidden="true" />
						Settings
					</a>
				{/snippet}
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item onclick={signOut}>
				<SignOutIcon aria-hidden="true" />
				Sign out
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
