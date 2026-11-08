type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    // Web-prepared artwork based on the supplied logo screenshot; preserve its aspect ratio.
    <img
      className={`brand-logo-image ${className}`.trim()}
      src="/images/wander-revel-logo.png"
      alt="Wander & Revel Event Services"
      width={1536}
      height={1024}
    />
  );
}
