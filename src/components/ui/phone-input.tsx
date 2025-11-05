"use client";

import 'react-phone-number-input/style.css';
import PhoneInput, { type PhoneInputProps } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';
import { Input } from './input';

const CustomPhoneInput = forwardRef<HTMLInputElement, Partial<PhoneInputProps>>((props, ref) => {
  return (
    <PhoneInput
      ref={ref}
      flags={flags}
      defaultCountry="CU"
      inputComponent={Input}
      className={cn('flex items-center', props.className)}
      {...props}
    />
  );
});
CustomPhoneInput.displayName = 'PhoneInput';

export { CustomPhoneInput as PhoneInput };