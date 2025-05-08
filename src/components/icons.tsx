import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="Archive Sleuth Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 0.8 }} />
        </linearGradient>
      </defs>
      <rect width="200" height="50" fill="transparent" />
      <path d="M10 40 C15 10, 35 10, 40 40 M30 25 L50 25 M45 15 Q55 25, 45 35" stroke="url(#logoGradient)" strokeWidth="3" fill="none" />
      <text
        x="55"
        y="35"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="28"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
      >
        Archive<tspan fill="hsl(var(--primary))">Sleuth</tspan>
      </text>
    </svg>
  );
}
