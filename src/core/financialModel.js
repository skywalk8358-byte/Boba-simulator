/**
 * 財務計算模型
 * 採用還原推導法計算隱形損失
 */

/**
 * 計算財務指標
 * @param {Object} simulation - 模擬結果
 * @param {Object} params - 參數設定
 */
export function calculateFinancials(simulation, params) {
  const { avgPrice, pearlRevenueRatio } = params;
  const { summary, isMultiDay, dailyResults } = simulation;
  
  // 隱形營收損失公式：斷貨杯數 × 平均客單價 ÷ 珍珠營收佔比
  const manualLoss = (summary.totalManualShortage * avgPrice) / pearlRevenueRatio;
  const machineLoss = (summary.totalMachineShortage * avgPrice) / pearlRevenueRatio;
  const netGain = manualLoss - machineLoss;
  
  // 計算日均值
  const days = summary.totalDays || 1;
  const avgDailyManualLoss = manualLoss / days;
  const avgDailyMachineLoss = machineLoss / days;
  const avgDailyNetGain = netGain / days;
  
  // 預估月增營收（假設每月 30 天）
  const monthlyNetGain = avgDailyNetGain * 30;
  
  // 斷貨率
  const manualShortageRate = summary.totalDemand > 0
    ? (summary.totalManualShortage / summary.totalDemand) * 100
    : 0;
  const machineShortageRate = summary.totalDemand > 0
    ? (summary.totalMachineShortage / summary.totalDemand) * 100
    : 0;
  
  // 每日斷貨明細
  const dailyBreakdown = dailyResults.map(day => ({
    date: day.date,
    demand: day.totalDemand,
    manualShortage: day.totalManualShortage,
    machineShortage: day.totalMachineShortage,
    manualLoss: (day.totalManualShortage * avgPrice) / pearlRevenueRatio,
    machineLoss: (day.totalMachineShortage * avgPrice) / pearlRevenueRatio,
    netGain: ((day.totalManualShortage - day.totalMachineShortage) * avgPrice) / pearlRevenueRatio,
  }));
  
  return {
    // 總計
    totalDemand: summary.totalDemand,
    totalManualShortage: summary.totalManualShortage,
    totalMachineShortage: summary.totalMachineShortage,
    
    // 損失金額
    manualLoss,
    machineLoss,
    netGain,
    
    // 日均
    avgDailyManualLoss,
    avgDailyMachineLoss,
    avgDailyNetGain,
    
    // 月估
    monthlyNetGain,
    
    // 比率
    manualShortageRate,
    machineShortageRate,
    
    // 明細
    days,
    isMultiDay,
    dailyBreakdown,
  };
}

/**
 * 格式化金額
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 格式化百分比
 */
export function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}
