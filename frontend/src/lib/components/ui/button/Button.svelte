<script lang="ts">
  import { cn } from '$lib/utils';
  import { buttonVariants, type ButtonProps } from './index';

  let {
    class: className,
    variant = 'default',
    size = 'default',
    children,
    ...restProps
  }: ButtonProps & { children?: any } = $props();
</script>

<button class={cn(buttonVariants({ variant, size }), className)} {...restProps}>
  {@render children?.()}
</button>
