'use client';

import React from 'react';
import { TextInput, Button, useField } from '@payloadcms/ui';
import generateInvitationToken from '../utils/generateInvitationToken';

export const InvitationTokenField = (props: any) => {
  const path = props.path;
  const { value, setValue } = useField({ path });
  const field = props.field || {};
  const label = field.label;
  const description = (field.admin && field.admin.description) || field.description;

  const handleGenerate = () => {
    const token = generateInvitationToken();
    setValue(token);
  };

  // show the Generate button only when there's no token set
  const hasValue = !!`${value || ''}`.trim();

  return (
    <div className="field-type row">
      <div>
        <TextInput
          path={path}
          value={`${value || ''}`}
          readOnly
          label={label}
          description={description}
          placeholder="Click Generate to create token"
        />
      </div>
      <div>
        {!hasValue && (
          <Button buttonStyle="secondary" size="medium" onClick={handleGenerate} type="button">
            Generate
          </Button>
        )}
      </div>
    </div>
  );
};
