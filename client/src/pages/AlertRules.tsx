import { useEffect, useState } from 'react';
import { ShieldAlert, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAlertRuleStore } from '../store/alertRuleStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import type { RuleConditionType, RuleActionType } from '@crypto-saas/shared';

const CONDITION_LABELS: Record<RuleConditionType, string> = {
  price_above: 'Price Above',
  price_below: 'Price Below',
  price_change_pct: 'Price Change %',
  volume_spike: 'Volume Spike',
  signal_confidence: 'Signal Confidence',
  new_signal_type: 'New Signal Type',
};

export default function AlertRules() {
  const { rules, loading, fetch, create, toggle, remove } = useAlertRuleStore();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    conditionType: 'signal_confidence' as RuleConditionType,
    coinSymbol: '',
    threshold: '80',
    actionType: 'in_app' as RuleActionType,
    message: '',
  });

  useEffect(() => {
    if (isAuthenticated) fetch();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div className="text-center text-gray-500 mt-20">Please sign in to manage alert rules.</div>;
  }

  const handleCreate = () => {
    if (!form.name) return;
    create({
      name: form.name,
      conditionType: form.conditionType,
      conditionConfig: {
        coinSymbol: form.coinSymbol || undefined,
        threshold: parseFloat(form.threshold) || undefined,
      },
      actionType: form.actionType,
      actionConfig: { message: form.message || undefined },
    });
    setForm({ name: '', conditionType: 'signal_confidence', coinSymbol: '', threshold: '80', actionType: 'in_app', message: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{rules.length} rule{rules.length !== 1 ? 's' : ''} configured</p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> New Rule
        </button>
      </div>

      {showForm && (
        <Card title="Create Alert Rule">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Rule name"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <select
              value={form.conditionType}
              onChange={e => setForm(f => ({ ...f, conditionType: e.target.value as RuleConditionType }))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300"
            >
              {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              value={form.coinSymbol}
              onChange={e => setForm(f => ({ ...f, coinSymbol: e.target.value.toUpperCase() }))}
              placeholder="Coin symbol (optional, e.g. BTC)"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <input
              value={form.threshold}
              onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
              placeholder="Threshold value"
              type="number"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <input
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Custom message (optional)"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 md:col-span-2"
            />
            <div className="md:col-span-2 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleCreate} className="btn-primary text-sm">Create Rule</button>
            </div>
          </div>
        </Card>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map(rule => (
          <Card key={rule.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className={rule.enabled ? 'text-indigo-400' : 'text-gray-600'} />
                  <h3 className={`text-sm font-semibold ${rule.enabled ? 'text-white' : 'text-gray-500'}`}>{rule.name}</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {CONDITION_LABELS[rule.conditionType]}
                  {rule.conditionConfig.coinSymbol && ` · ${rule.conditionConfig.coinSymbol}`}
                  {rule.conditionConfig.threshold && ` · Threshold: ${rule.conditionConfig.threshold}`}
                </p>
                {rule.lastTriggeredAt && (
                  <p className="text-[10px] text-gray-600 mt-0.5">Last triggered: {new Date(rule.lastTriggeredAt).toLocaleString()}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(rule.id)} className="text-gray-400 hover:text-white">
                  {rule.enabled ? <ToggleRight size={20} className="text-indigo-400" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => remove(rule.id)} className="text-gray-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {rules.length === 0 && !showForm && (
          <div className="text-center text-gray-500 py-12">
            <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-gray-600" />
            <p className="text-sm">No alert rules yet. Create one to get notified automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
