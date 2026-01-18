'use client';

import MealSelector from '../MealSelector';

interface AlmocoProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Almoco({ value, onChange }: AlmocoProps) {
  return (
    <MealSelector
      title="Almoço"
      value={value}
      onChange={onChange}
    />
  );
}
