<script lang="ts">
	interface Props {
		title: string;
		description: string;
	}

	const { title, description }: Props = $props();
</script>

<div class="space-y-1">
	<h2 class="text-2xl font-semibold tracking-tight">{title}</h2>
	<p class="text-sm text-muted-foreground">{description}</p>
</div>
