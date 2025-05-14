
import { cn } from '@/lib/utils';

// Animation class combinations for common patterns
export const animations = {
  fadeIn: "opacity-100 animate-fade-in",
  scaleIn: "scale-100 animate-scale-in",
  slideUp: "translate-y-0 animate-fade-in-up",
  pulse: "animate-pulse",
  hover: "transition-all duration-200 hover:scale-105",
  pressable: "active:scale-95 transition-transform",
  buttonHover: "transition-colors hover:bg-opacity-90",
  cardHover: "transition-all hover:shadow-md hover:translate-y-[-2px]",
};

// Helper function to combine animations with other classes
export function withAnimation(className: string, animation: keyof typeof animations) {
  return cn(className, animations[animation]);
}