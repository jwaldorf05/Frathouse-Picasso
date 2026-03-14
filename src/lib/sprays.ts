export const SPRAY_ASSETS = [
  '/stickers/Murder Spray.png',
  '/stickers/Pledge Leash Spray.png',
  '/stickers/Radioactive Spray.png',
  '/stickers/SEND Spraypaint.png',
  '/stickers/Three Way Spray.png',
  '/stickers/Wizard Spraypaint.png',
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const SPRAY_POSITIONS: React.CSSProperties[] = [
  { top: '4%',  left: '8%'   },
  { top: '12%', right: '10%' },
  { top: '28%', left: '3%'   },
  { top: '38%', right: '6%'  },
  { top: '52%', left: '16%'  },
  { top: '63%', right: '18%' },
  { top: '73%', left: '4%'   },
  { top: '81%', right: '7%'  },
  { top: '89%', left: '22%'  },
  { top: '20%', left: '45%'  },
];

export interface SprayPlacement {
  src: string;
  pos: React.CSSProperties;
  rotation: number;
  opacity: number;
  scale: number;
  size: number;
}

export function getSprayPlacements(count: number, baseSeed: number): SprayPlacement[] {
  return Array.from({ length: count }, (_, i) => {
    const s = baseSeed + i;
    const assetIndex = Math.floor(seededRandom(s * 3) * SPRAY_ASSETS.length);
    const rotation   = Math.round(seededRandom(s * 7)  * 40 - 20);          // –20 to +20 deg
    const opacity    = +(0.10 + seededRandom(s * 11) * 0.15).toFixed(2);    // 0.10 – 0.25
    const scale      = +(0.85 + seededRandom(s * 13) * 0.45).toFixed(2);    // 0.85 – 1.30
    const size       = Math.round(150 + seededRandom(s * 17) * 100);         // 150 – 250 px
    return {
      src: SPRAY_ASSETS[assetIndex],
      pos: SPRAY_POSITIONS[i % SPRAY_POSITIONS.length],
      rotation,
      opacity,
      scale,
      size,
    };
  });
}
