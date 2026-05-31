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
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/10',
          markClassName,
        )}
      >
        <img
          src="/logo_Bizskip_2.png"
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
