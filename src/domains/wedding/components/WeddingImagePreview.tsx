'use client';

import React from 'react';
import { useFormFields } from '@payloadcms/ui';

/**
 * Admin UI preview component for the WeddingImages collection.
 * Shown in the edit view; renders the image using `cdnLink`,
 * falling back to `onedriveLink` when the CDN URL is absent.
 */
export const WeddingImagePreview: React.FC = () => {
  const cdnLink = useFormFields(([fields]) => fields['cdnLink']?.value as string | undefined);
  const onedriveLink = useFormFields(
    ([fields]) => fields['onedriveLink']?.value as string | undefined,
  );

  const src = cdnLink || onedriveLink;

  if (!src) {
    return (
      <div
        style={{
          padding: '12px',
          color: '#888',
          fontSize: '14px',
          fontStyle: 'italic',
        }}
      >
        No image URL provided yet.
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 0' }}>
      <img
        src={src}
        alt="Wedding image preview"
        style={{
          maxWidth: '100%',
          maxHeight: '400px',
          objectFit: 'contain',
          borderRadius: '8px',
          display: 'block',
        }}
      />
    </div>
  );
};
