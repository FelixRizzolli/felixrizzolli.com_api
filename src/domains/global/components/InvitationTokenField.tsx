'use client';

import React, { useRef } from 'react';
import { TextInput, Button, useField, useFormFields } from '@payloadcms/ui';
import { QRCodeCanvas } from 'qrcode.react';
import generateInvitationToken from '../utils/generateInvitationToken';

export const InvitationTokenField = (props: any) => {
  const path = props.path;
  const { value, setValue } = useField({ path });
  const field = props.field || {};
  const label = field.label;
  const description = (field.admin && field.admin.description) || field.description;

  const username = useFormFields(([fields]) => fields['username']?.value as string | undefined);

  const qrContainerRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    const token = generateInvitationToken();
    setValue(token);
  };

  const hasValue = !!`${value || ''}`.trim();

  const weddingUrl = process.env.NEXT_PUBLIC_WEDDING_URL ?? '';
  const token = `${value || ''}`;
  const qrValue =
    hasValue && username
      ? `${weddingUrl}/login?username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}`
      : null;

  const handleDownload = () => {
    const canvas = qrContainerRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `invitation-${username ?? 'qr'}.png`;
    link.click();
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <TextInput
          path={path}
          value={token}
          readOnly
          label={label}
          description={description}
          placeholder="Click Generate to create token"
        />
        {!hasValue && (
          <Button buttonStyle="secondary" size="medium" onClick={handleGenerate} type="button">
            Generate
          </Button>
        )}
        <Button buttonStyle="secondary" size="medium" onClick={handleDownload} type="button">
          Download QR Code (PNG)
        </Button>
      </div>
      {qrValue && (
        <div ref={qrContainerRef} className="w-max h-max">
          <QRCodeCanvas value={qrValue} size={200} marginSize={2} />
        </div>
      )}
    </div>
  );
};
