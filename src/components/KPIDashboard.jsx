import React from 'react';
import { formatCurrency, formatPercent } from '../core/financialModel';

export default function KPIDashboard({ financials }) {
  const {
    totalDemand,
    totalManualShortage,
    totalMachineShortage,
    manualLoss,
    machineLoss,
    netGain,
    manualShortageRate,
    machineShortageRate,
    monthlyNetGain,
    days,
    isMultiDay,
    avgDailyNetGain,
  } = financials;

  const kpiCards = [
    {
      title: '人工模式損失',
      subtitle: isMultiDay ? `${days} 天總計` : '單日',
      value: formatCurrency(manualLoss),
      subValue: `斷貨 ${totalManualShortage} 杯 (${formatPercent(manualShortageRate)})`,
      color: 'red',
      icon: '🔴',
    },
    {
      title: '機器模式損失',
      subtitle: isMultiDay ? `${days} 天總計` : '單日',
      value: formatCurrency(machineLoss),
      subValue: `斷貨 ${totalMachineShortage} 杯 (${formatPercent(machineShortageRate)})`,
      color: 'blue',
      icon: '🔵',
    },
    {
      title: '淨利增長',
      subtitle: isMultiDay ? `${days} 天總計` : '單日',
      value: formatCurrency(netGain),
      subValue: netGain > 0 ? '導入機器可減少損失' : '機器效益有限',
      color: 'green',
      icon: '📈',
      highlight: true,
    },
    {
      title: '預估月增營收',
      subtitle: '以日均值推算',
      value: formatCurrency(monthlyNetGain),
      subValue: `日均 ${formatCurrency(avgDailyNetGain)}`,
      color: 'amber',
      icon: '💰',
      highlight: true,
    },
  ];

  const colorClasses = {
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
    },
    green: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
    },
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((card, index) => {
        const colors = colorClasses[card.color];
        
        return (
          <div
            key={index}
            className={`
              relative p-5 rounded-xl border overflow-hidden
              ${colors.bg} ${colors.border}
              ${card.highlight ? 'ring-1 ring-amber-500/20' : ''}
            `}
          >
            {/* 背景裝飾 */}
            <div className="absolute -right-4 -top-4 text-6xl opacity-10">
              {card.icon}
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{card.icon}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
              </div>
              
              <div className={`text-2xl font-bold ${colors.text} mb-1`}>
                {card.value}
              </div>
              
              <div className="text-xs text-slate-500">
                {card.subValue}
              </div>
              
              <div className="text-xs text-slate-600 mt-2">
                {card.subtitle}
              </div>
            </div>
          </div>
        );
      })}

      {/* 總需求統計 */}
      <div className="col-span-2 lg:col-span-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-slate-500">總珍珠需求</span>
              <div className="text-lg font-semibold text-white">
                {totalDemand.toLocaleString()} 杯
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div>
              <span className="text-xs text-slate-500">分析天數</span>
              <div className="text-lg font-semibold text-white">
                {days} 天
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div>
              <span className="text-xs text-slate-500">日均需求</span>
              <div className="text-lg font-semibold text-white">
                {Math.round(totalDemand / days).toLocaleString()} 杯
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              <span className="text-xs text-slate-400">人工庫存</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-slate-400">機器庫存</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-slate-400">斷貨損失</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
