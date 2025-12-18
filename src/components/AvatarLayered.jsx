import React, { useMemo } from 'react';

// slots order fallback if zIndex missing
const DEFAULT_SLOT_Z = {
  hair_hat: 60,
  eyebrows: 40,
  eyes: 35,
  nose: 30,
  mouth: 25,
  facial_hair: 50,
};

function getTransformForTemplate(part, templateId) {
  const byTemplate = part?.transformsByTemplate || {};
  return byTemplate?.[templateId] || byTemplate?.round || null;
}

export default function AvatarLayered({
  size = 40,
  template,
  partsCatalog = [],
  selections = {},
  fallback = null,
}) {
  const templateId = template?.id;
  const bg = template?.previewAsset?.url;

  const layers = useMemo(() => {
    if (!templateId) return [];

    const selectedEntries = Object.entries(selections || {});

    const selected = selectedEntries
      .map(([slot, sel]) => {
        const part = partsCatalog.find(p => p.id === sel?.partId);
        if (!part) return null;
        const asset = (part.assets || []).find(a => a.assetId === sel?.assetId) || part.assets?.[0] || null;
        const t = getTransformForTemplate(part, templateId);
        return {
          slot,
          part,
          asset,
          transform: t,
          zIndex: Number.isFinite(Number(part.zIndex)) ? Number(part.zIndex) : (DEFAULT_SLOT_Z[slot] ?? 10),
        };
      })
      .filter(Boolean)
      .filter(x => x.asset?.url);

    selected.sort((a, b) => a.zIndex - b.zIndex);
    return selected;
  }, [templateId, partsCatalog, selections]);

  if (!templateId) return fallback;

  return (
    <div
      className="relative rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      {/* Optional template background */}
      {bg ? (
        <img
          src={bg}
          alt="template"
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-wood-dark" />
      )}

      {/* Layers */}
      {layers.map((l) => {
        const tr = l.transform || { x: 50, y: 50, scale: 1, rotation: 0, sizePct: 40 };
        const sizePct = Number.isFinite(Number(tr.sizePct)) ? Number(tr.sizePct) : 40;
        return (
          <img
            key={`${l.part.id}-${l.asset.assetId}`}
            src={l.asset.url}
            alt={l.part.name}
            draggable={false}
            className="absolute"
            style={{
              left: `${tr.x}%`,
              top: `${tr.y}%`,
              width: `${sizePct}%`,
              height: `${sizePct}%`,
              transform: `translate(-50%, -50%) rotate(${tr.rotation}deg) scale(${tr.scale})`,
              transformOrigin: 'center',
              objectFit: 'contain',
            }}
          />
        );
      })}
    </div>
  );
}
