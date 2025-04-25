import * as React from "react";
import { Input } from "./input";

interface TimePickerInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange: (value: string) => void;
  step?: number;
}

export function TimePickerInput({
  value = "00:00",
  onChange,
  step = 30,
  ...props
}: TimePickerInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Input
      type="time"
      value={value}
      onChange={handleChange}
      step={step * 60} // Convert to seconds
      {...props}
    />
  );
}