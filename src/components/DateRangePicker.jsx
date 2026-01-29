import React from 'react';

export default function DateRangePicker({ availableDates, value, onChange }) {
  const handleStartChange = (e) => {
    const newStart = e.target.value;
    onChange({
      start: newStart,
      end: value.end && newStart > value.end ? newStart : value.end,
    });
  };

  const handleEndChange = (e) => {
    const newEnd = e.target.value;
    onChange({
      start: value.start && newEnd < value.start ? newEnd : value.start,
      end: newEnd,
    });
  };

  const handleQuickSelect = (days) => {
    if (availableDates.length === 0) return;
    
    const lastDate = availableDates[availableDates.length - 1];
    
    if (days === 'all') {
      onChange({
        start: availableDates[0],
        end: lastDate,
      });
    } else if (days === 1) {
      onChange({
        start: lastDate,
        end: lastDate,
      });
    } else {
      const startIndex = Math.max(0, availableDates.length - days);
      onChange({
        start: availableDates[startIndex],
        end: lastDate,
      });
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}`;
  };

  const selectedDays = value.start && value.end
    ? availableDates.filter(d => d >= value.start && d <= value.end).length
    : 0;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 h-full">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">日期範圍</h3>
      
      {/* 快速選擇按鈕 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: '單日', value: 1 },
          { label: '7日', value: 7 },
          { label: '14日', value: 14 },
          { label: '全部', value: 'all' },
        ].map(({ label, value: days }) => (
          <button
            key={days}
            onClick={() => handleQuickSelect(days)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* 日期選擇器 */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">開始日期</label>
          <select
            value={value.start || ''}
            onChange={handleStartChange}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="">選擇日期</option>
            {availableDates.map(date => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">結束日期</label>
          <select
            value={value.end || ''}
            onChange={handleEndChange}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="">選擇日期</option>
            {availableDates.map(date => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 選擇狀態顯示 */}
      {selectedDays > 0 && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">已選擇</span>
            <span className="text-amber-400 font-semibold">{selectedDays} 天</span>
          </div>
          {selectedDays > 1 && (
            <p className="text-xs text-slate-500 mt-1">
              將以平均值呈現模擬結果
            </p>
          )}
        </div>
      )}
    </div>
  );
}
