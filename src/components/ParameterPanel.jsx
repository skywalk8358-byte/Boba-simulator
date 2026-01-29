import React from 'react';

const PARAM_CONFIG = [
  {
    key: 'autoLeadTime',
    label: '機器煮製週期',
    unit: '分鐘',
    min: 10,
    max: 120,
    step: 5,
    description: '從觸發到珍珠完成的時間',
  },
  {
    key: 'triggerThreshold',
    label: '安全庫存水位',
    unit: '杯',
    min: 10,
    max: 100,
    step: 5,
    description: '低於此數量時觸發煮製',
  },
  {
    key: 'cycleCapacity',
    label: '單次產能',
    unit: '杯',
    min: 24,
    max: 144,
    step: 24,
    description: '機器單次煮製產量',
  },
  {
    key: 'avgPrice',
    label: '平均客單價',
    unit: '元',
    min: 30,
    max: 150,
    step: 5,
    description: '用於計算營收損失',
  },
  {
    key: 'pearlRevenueRatio',
    label: '珍珠營收佔比',
    unit: '%',
    min: 0.1,
    max: 1,
    step: 0.05,
    description: '珍珠飲品佔總營收比例',
    isPercent: true,
  },
  {
    key: 'cupsPerBatch',
    label: '每份杯數',
    unit: '杯/份',
    min: 4,
    max: 16,
    step: 1,
    description: '人工煮製：1份 = N杯',
  },
];

export default function ParameterPanel({ params, onChange }) {
  const handleChange = (key, value) => {
    onChange({
      ...params,
      [key]: value,
    });
  };

  const handleReset = () => {
    onChange({
      autoLeadTime: 45,
      triggerThreshold: 30,
      cycleCapacity: 72,
      avgPrice: 60,
      pearlRevenueRatio: 0.4,
      cupsPerBatch: 8,
    });
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300">模擬參數</h3>
        <button
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          重設預設值
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {PARAM_CONFIG.map(({ key, label, unit, min, max, step, description, isPercent }) => {
          const value = params[key];
          const displayValue = isPercent ? (value * 100).toFixed(0) : value;

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">{label}</label>
                <span className="text-sm font-mono text-amber-400">
                  {displayValue} {unit}
                </span>
              </div>
              <input
                type="range"
                min={isPercent ? min * 100 : min}
                max={isPercent ? max * 100 : max}
                step={isPercent ? step * 100 : step}
                value={isPercent ? value * 100 : value}
                onChange={(e) => {
                  const newValue = isPercent
                    ? parseFloat(e.target.value) / 100
                    : parseFloat(e.target.value);
                  handleChange(key, newValue);
                }}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:bg-amber-500
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110
                "
              />
              <p className="text-xs text-slate-600">{description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
