import React from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export default function DualLineChart({ data, isMultiDay }) {
  // 每 30 分鐘顯示一個刻度
  const tickFormatter = (value) => {
    const index = data.findIndex(d => d.time === value);
    if (index === -1) return '';
    const minute = data[index].minute;
    if (minute % 60 === 0) return value;
    return '';
  };

  // 自定義 Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const dataPoint = payload[0]?.payload;
    if (!dataPoint) return null;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <div className="text-sm font-semibold text-white mb-2">
          {dataPoint.time}
          {isMultiDay && <span className="text-slate-400 ml-2">(平均值)</span>}
        </div>
        
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">需求量</span>
            <span className="text-amber-400 font-mono">{dataPoint.demand} 杯</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span className="text-slate-400">人工庫存</span>
            </span>
            <span className="text-slate-300 font-mono">
              {typeof dataPoint.manualStock === 'number' 
                ? dataPoint.manualStock.toFixed(1) 
                : dataPoint.manualStock} 杯
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-slate-400">機器庫存</span>
            </span>
            <span className="text-blue-400 font-mono">
              {typeof dataPoint.machineStock === 'number'
                ? dataPoint.machineStock.toFixed(1)
                : dataPoint.machineStock} 杯
            </span>
          </div>
          {dataPoint.manualShortage > 0 && (
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-700">
              <span className="text-red-400">人工斷貨</span>
              <span className="text-red-400 font-mono">
                {typeof dataPoint.manualShortage === 'number'
                  ? dataPoint.manualShortage.toFixed(1)
                  : dataPoint.manualShortage} 杯
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 計算圖表需要顯示的斷貨區域
  const chartDataWithShortage = data.map(d => ({
    ...d,
    // 當人工斷貨時，在底部顯示紅色區域
    shortageArea: d.manualShortage > 0 ? d.manualShortage : null,
  }));

  // 找出最大庫存值來設定 Y 軸範圍
  const maxStock = Math.max(
    ...data.map(d => Math.max(d.manualStock || 0, d.machineStock || 0))
  );
  const yAxisMax = Math.ceil(maxStock / 50) * 50 + 50;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          庫存變化曲線
          {isMultiDay && <span className="text-sm text-slate-400 ml-2">(多日平均)</span>}
        </h3>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartDataWithShortage}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="machineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="shortageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={tickFormatter}
              interval={29}
            />

            <YAxis
              domain={[0, yAxisMax]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
              label={{
                value: '庫存 (杯)',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 12,
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 安全庫存線 */}
            <ReferenceLine
              y={30}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{
                value: '安全水位 30杯',
                position: 'right',
                fill: '#f59e0b',
                fontSize: 10,
              }}
            />

            {/* 斷貨區域（紅色） */}
            <Area
              type="stepAfter"
              dataKey="shortageArea"
              fill="url(#shortageGradient)"
              stroke="#ef4444"
              strokeWidth={0}
              name="斷貨"
            />

            {/* 機器庫存線（藍色） */}
            <Area
              type="monotone"
              dataKey="machineStock"
              fill="url(#machineGradient)"
              stroke="#3b82f6"
              strokeWidth={2}
              name="機器庫存"
              dot={false}
            />

            {/* 人工庫存線（灰色） */}
            <Line
              type="monotone"
              dataKey="manualStock"
              stroke="#64748b"
              strokeWidth={2}
              name="人工庫存"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 圖例 */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-slate-500"></div>
          <span className="text-slate-400">人工庫存</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span className="text-slate-400">機器庫存</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-red-500/50 rounded"></div>
          <span className="text-slate-400">人工斷貨區間</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-amber-500"></div>
          <span className="text-slate-400">安全水位</span>
        </div>
      </div>
    </div>
  );
}
