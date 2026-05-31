import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
};

export function BrandLogo({
  className,
  markClassName,
  imageClassName,
  textClassName,
  showText = true,
}: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span
        className={cn(
          'inline-flex h-17 w-17 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-transparent shadow-none ring-0',
          markClassName,
        )}
      >
        <img
          src="/logo_Bizskip_22.png"
          alt=""
          className={cn('h-full w-full object-contain p-1', imageClassName)}
        />
      </span>
      {showText ? (
        <span className={cn('font-semibold tracking-tight text-foreground', textClassName)}>
          Bizskip
        </span>
      ) : null}
    </span>
  );
}
