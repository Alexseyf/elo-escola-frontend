'use client';

import MealSelector from '../MealSelector';

interface CafeDaManhaProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CafeDaManha({ value, onChange }: CafeDaManhaProps) {
  return (
    <MealSelector
      title="Café da Manhã"
      value={value}
      onChange={onChange}
    />
  );
}
