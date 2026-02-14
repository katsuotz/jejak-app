<script lang="ts">
  let { active = false }: { active?: boolean } = $props();
</script>

<div class="flex justify-center">
  <div
    class="h-4 w-4 rounded-full transition-all duration-75 {active
      ? 'bg-primary scale-150 shadow-[0_0_16px_var(--color-primary)]'
      : 'bg-secondary scale-100'}">
  </div>
</div>
