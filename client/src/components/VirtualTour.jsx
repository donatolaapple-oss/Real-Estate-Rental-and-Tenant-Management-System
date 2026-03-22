import { useEffect, useRef, useState } from "react";
import "pannellum/build/pannellum.css";
import "pannellum/build/pannellum.js";

/**
 * Zoom + pan "explore" viewer for normal photos (no external URLs required).
 */
function ImmersivePhotoExplore({ images }) {
  const [idx, setIdx] = useState(0);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef(null);

  const src = images[idx];
  if (!src) return null;

  const onWheel = (e) => {
    e.preventDefault();
    const next = Math.min(3, Math.max(1, scale + (e.deltaY > 0 ? -0.15 : 0.15)));
    setScale(next);
  };

  const onMouseDown = (e) => {
    drag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };
  const onMouseMove = (e) => {
    if (!drag.current) return;
    setPos({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  };
  const onMouseUp = () => {
    drag.current = null;
  };

  useEffect(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, [idx]);

  return (
    <div className="space-y-3">
      <div
        className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900 select-none cursor-grab active:cursor-grabbing"
        style={{ height: 380 }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: drag.current ? "none" : "transform 0.08s ease-out",
          }}
        >
          <img src={src} alt="" className="max-w-none w-full h-full object-cover pointer-events-none" draggable={false} />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="text-[11px] text-white/90 bg-black/50 px-2 py-1 rounded-md">
            Drag to look around · scroll to zoom · angle {idx + 1}/{images.length}
          </span>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {images.map((url, i) => (
          <button
            key={url + i}
            type="button"
            onClick={() => setIdx(i)}
            className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
              i === idx ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-200 opacity-80 hover:opacity-100"
            }`}
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      <p className="text-xs text-center text-slate-500">
        Immersive photo tour from your uploads — no external panorama link required.
      </p>
    </div>
  );
}

/**
 * 360°: Pannellum when a true equirectangular URL is provided; otherwise immersive explore from listing photos.
 */
export default function VirtualTour({ panorama, fallbackImages = [] }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const imgs = fallbackImages.filter(Boolean);

  useEffect(() => {
    if (!panorama || !containerRef.current) return;
    const pn = typeof window !== "undefined" ? window.pannellum : null;
    if (!pn?.viewer) return;

    viewerRef.current = pn.viewer(containerRef.current, {
      type: "equirectangular",
      panorama,
      autoLoad: true,
      showControls: true,
      compass: true,
      hfov: 100,
      minHfov: 50,
      maxHfov: 120,
    });

    return () => {
      try {
        viewerRef.current?.destroy?.();
      } catch {
        /* noop */
      }
      viewerRef.current = null;
    };
  }, [panorama]);

  if (panorama) {
    return (
      <div className="w-full rounded-lg overflow-hidden border border-slate-200 bg-black" style={{ height: 360 }}>
        <div ref={containerRef} className="w-full h-full" />
      </div>
    );
  }

  if (imgs.length) {
    return <ImmersivePhotoExplore images={imgs} />;
  }

  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
      <p className="font-medium text-slate-700 mb-1">No photos yet</p>
      <p className="text-sm">Upload images when posting a listing — they appear here automatically.</p>
    </div>
  );
}
