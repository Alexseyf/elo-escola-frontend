'use client';

import MealSelector from '../MealSelector';

interface LancheDaTardeProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LancheDaTarde({ value, onChange }: LancheDaTardeProps) {
  return (
    <MealSelector
      title="Lanche da Tarde"
      value={value}
      onChange={onChange}
    />
  );
}
