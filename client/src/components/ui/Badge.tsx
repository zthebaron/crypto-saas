import type { SignalType } from '@crypto-saas/shared';

const styles: Record<SignalType, string> = {
  buy: 'bg-green-500/20 text-green-400 border-green-500/30',
  sell: 'bg-red-500/20 text-red-400 border-red-500/30',
  hold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  watch: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export function SignalBadge({ type }: { type: SignalType }) {
  return (
    <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${styles[type]}`}>
      {type}
    </span>
  );
}
