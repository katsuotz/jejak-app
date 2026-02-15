<script lang="ts">
  import { page } from '$app/stores';

  let status = $derived($page.status);
</script>

<div class="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
  <div class="text-6xl mb-4">🔍</div>
  <h1 class="text-4xl font-bold text-foreground mb-2">{status}</h1>
  <p class="text-lg text-muted-foreground mb-6">
    {status === 404 ? "Page not found" : "Something went wrong"}
  </p>
  <p class="text-sm text-muted-foreground mb-8 max-w-xs">
    {status === 404 
      ? "The page you're looking for doesn't exist or has been moved."
      : $page.error?.message ?? "An unexpected error occurred."}
  </p>
  <a
    href="/"
    class="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
    Go Home
  </a>
</div>
