"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * Leaflet trong Modal thường tính sai kích thước (ô xám). Gọi invalidateSize sau khi modal đã hiển thị.
 */
export default function MapResizeHelper({ active }: { active: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!active) return;

    const fix = () => {
      try {
        map.invalidateSize({ animate: false });
      } catch {
        /* ignore */
      }
    };

    fix();
    const t1 = window.setTimeout(fix, 50);
    const t2 = window.setTimeout(fix, 150);
    const t3 = window.setTimeout(fix, 350);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [map, active]);

  return null;
}
