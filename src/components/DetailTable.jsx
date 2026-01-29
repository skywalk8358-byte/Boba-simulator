import React, { useState, useMemo } from 'react';

export default function DetailTable({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState('all');
  const [showOnlyShortage, setShowOnlyShortage] = useState(false);
  const pageSize = 50;

  // 取得可用日期
  const availableDates = useMemo(() => {
    return [...new Set(data.map(d => d.date))].sort();
  }, [data]);

  // 過濾資料
  const filteredData = useMemo(() => {
    let result = data;
    
    if (filterDate !== 'all') {
      result = result.filter(d => d.date === filterDate);
    }
    
    if (showOnlyShortage) {
      result = result.filter(d => d.manualShortage > 0 || d.machineShortage > 0);
    }
    
    return result;
  }, [data, filterDate, showOnlyShortage]);

  // 分頁
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 當過濾條件改變時重置頁碼
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* 過濾器 */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">日期：</label>
          <select
            value={filterDate}
            onChange={(e) => handleFilterChange(setFilterDate)(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">全部日期</option>
            {availableDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyShortage}
            onChange={(e) => handleFilterChange(setShowOnlyShortage)(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/50"
          />
          <span className="text-sm text-slate-400">僅顯示斷貨時段</span>
        </label>

        <div className="ml-auto text-sm text-slate-500">
          共 {filteredData.length.toLocaleString()} 筆資料
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">日期</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">時間</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">需求量</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">人工庫存</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">機器庫存</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">人工斷貨</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">機器斷貨</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const hasManualShortage = row.manualShortage > 0;
              const hasMachineShortage = row.machineShortage > 0;
              
              return (
                <tr
                  key={`${row.date}-${row.minute}-${index}`}
                  className={`
                    border-b border-slate-800 transition-colors
                    ${hasManualShortage ? 'bg-red-500/5' : 'hover:bg-slate-800/50'}
                  `}
                >
                  <td className="py-2 px-4 text-slate-300 font-mono">{row.date}</td>
                  <td className="py-2 px-4 text-slate-300 font-mono">{row.time}</td>
                  <td className="py-2 px-4 text-right text-amber-400 font-mono">
                    {row.demand > 0 ? row.demand : '-'}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-400 font-mono">
                    {typeof row.manualStock === 'number' ? row.manualStock.toFixed(0) : row.manualStock}
                  </td>
                  <td className="py-2 px-4 text-right text-blue-400 font-mono">
                    {typeof row.machineStock === 'number' ? row.machineStock.toFixed(0) : row.machineStock}
                  </td>
                  <td className={`py-2 px-4 text-right font-mono ${hasManualShortage ? 'text-red-400 font-semibold' : 'text-slate-600'}`}>
                    {hasManualShortage ? row.manualShortage : '-'}
                  </td>
                  <td className={`py-2 px-4 text-right font-mono ${hasMachineShortage ? 'text-red-400 font-semibold' : 'text-slate-600'}`}>
                    {hasMachineShortage ? row.machineShortage : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            首頁
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            上一頁
          </button>
          
          <span className="px-4 text-sm text-slate-400">
            第 {currentPage} / {totalPages} 頁
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            下一頁
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            末頁
          </button>
        </div>
      )}
    </div>
  );
}
