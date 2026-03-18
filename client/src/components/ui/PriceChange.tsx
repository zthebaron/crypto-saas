import { TrendingUp, TrendingDown } from 'lucide-react';

export function PriceChange({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}
