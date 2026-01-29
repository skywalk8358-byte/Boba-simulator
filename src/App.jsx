import React, { useState, useMemo } from 'react';
import FileUploader from './components/FileUploader';
import DateRangePicker from './components/DateRangePicker';
import ParameterPanel from './components/ParameterPanel';
import KPIDashboard from './components/KPIDashboard';
import DualLineChart from './components/DualLineChart';
import DetailTable from './components/DetailTable';
import { parseCSVData } from './core/dataParser';
import { runSimulation } from './core/simulationEngine';
import { calculateFinancials } from './core/financialModel';

const DEFAULT_PARAMS = {
  autoLeadTime: 45,
  triggerThreshold: 30,
  cycleCapacity: 72,
  avgPrice: 60,
  pearlRevenueRatio: 0.4,
  cupsPerBatch: 8,
};

export default function App() {
  const [posData, setPosData] = useState(null);
  const [productionData, setProductionData] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [activeTab, setActiveTab] = useState('chart');
  const [isLoading, setIsLoading] = useState(false);

  // 取得可選日期範圍
  const availableDates = useMemo(() => {
    if (!posData) return [];
    const dates = [...new Set(posData.map(d => d.date))].sort();
    return dates;
  }, [posData]);

  // 執行模擬計算
  const simulationResult = useMemo(() => {
    if (!posData || !productionData || !dateRange.start || !dateRange.end) {
      return null;
    }

    const filteredPosData = posData.filter(
      d => d.date >= dateRange.start && d.date <= dateRange.end
    );
    const filteredProductionData = productionData.filter(
      d => d.date >= dateRange.start && d.date <= dateRange.end
    );

    if (filteredPosData.length === 0) return null;

    const simulation = runSimulation(
      filteredPosData,
      filteredProductionData,
      params,
      dateRange.start,
      dateRange.end
    );

    const financials = calculateFinancials(simulation, params);

    return { simulation, financials };
  }, [posData, productionData, dateRange, params]);

  const handlePosUpload = async (file) => {
    setIsLoading(true);
    try {
      const data = await parseCSVData(file, 'pos');
      setPosData(data);
      if (data.length > 0) {
        const dates = [...new Set(data.map(d => d.date))].sort();
        setDateRange({ start: dates[0], end: dates[dates.length - 1] });
      }
    } catch (error) {
      alert('POS 資料解析錯誤: ' + error.message);
    }
    setIsLoading(false);
  };

  const handleProductionUpload = async (file) => {
    setIsLoading(true);
    try {
      const data = await parseCSVData(file, 'production');
      setProductionData(data);
    } catch (error) {
      alert('生產紀錄解析錯誤: ' + error.message);
    }
    setIsLoading(false);
  };

  const isDataReady = posData && productionData;
  const hasResults = simulationResult !== null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-xl">🧋</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                珍珠產能損益模擬器
              </h1>
              <p className="text-xs text-slate-400">Pearl Capacity P&L Simulator</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 上傳區塊 */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Step 1. 上傳資料
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FileUploader
              label="POS 交易明細"
              description="CSV 格式，包含建立時間、商品名稱、數量、銷售金額、加料欄位"
              accept=".csv"
              onUpload={handlePosUpload}
              isLoaded={!!posData}
              recordCount={posData?.length}
            />
            <FileUploader
              label="珍珠生產紀錄"
              description="CSV 格式，包含日期、出鍋時間、煮製份數"
              accept=".csv"
              onUpload={handleProductionUpload}
              isLoaded={!!productionData}
              recordCount={productionData?.length}
            />
          </div>
        </section>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
            <span className="ml-3 text-slate-400">處理中...</span>
          </div>
        )}

        {isDataReady && !isLoading && (
          <>
            {/* 參數與日期選擇 */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Step 2. 設定參數
              </h2>
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <ParameterPanel params={params} onChange={setParams} />
                </div>
                <div>
                  <DateRangePicker
                    availableDates={availableDates}
                    value={dateRange}
                    onChange={setDateRange}
                  />
                </div>
              </div>
            </section>

            {/* 結果顯示 */}
            {hasResults && (
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Step 3. 模擬結果
                </h2>

                {/* KPI Dashboard */}
                <KPIDashboard financials={simulationResult.financials} />

                {/* Tab 切換 */}
                <div className="flex gap-2 mt-8 mb-4">
                  <button
                    onClick={() => setActiveTab('chart')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'chart'
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    📈 庫存曲線圖
                  </button>
                  <button
                    onClick={() => setActiveTab('table')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'table'
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    📋 詳細數據表
                  </button>
                </div>

                {/* 圖表或表格 */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                  {activeTab === 'chart' ? (
                    <DualLineChart
                      data={simulationResult.simulation.chartData}
                      isMultiDay={dateRange.start !== dateRange.end}
                    />
                  ) : (
                    <DetailTable data={simulationResult.simulation.detailData} />
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {!isDataReady && !isLoading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-slate-400">請先上傳 POS 交易明細與珍珠生產紀錄</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
          Pearl Capacity P&L Simulator v2.0 | 吃茶三千
        </div>
      </footer>
    </div>
  );
}
