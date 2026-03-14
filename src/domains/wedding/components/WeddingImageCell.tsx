'use client';

import React from 'react';

type Props = {
  cellData?: string | null;
};

/**
 * Custom Cell component for the `cloudflareLink` field in the WeddingImages
 * collection.  Renders a small thumbnail when the URL is present; falls back
 * to an em-dash when it is empty.
 */
export const WeddingImageCell: React.FC<Props> = ({ cellData }) => {
  if (!cellData) return <span>—</span>;

  return (
    <img
      src={cellData}
      alt="preview"
      style={{
        height: '40px',
        width: '60px',
        objectFit: 'cover',
        borderRadius: '4px',
        display: 'block',
      }}
    />
  );
};

