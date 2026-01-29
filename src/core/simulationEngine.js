/**
 * 模擬引擎核心
 * 執行雙軌模擬：人工煮製 vs 自動化機器
 */

/**
 * 將時間轉換為當日分鐘數
 */
function timeToMinutes(hour, minute) {
  return hour * 60 + minute;
}

/**
 * 將分鐘數轉換為時間字串
 */
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * 取得單日的珍珠需求按分鐘彙總
 */
function getDailyDemandByMinute(posData, date) {
  const demandMap = new Map();
  
  for (const order of posData) {
    if (order.date !== date || !order.isPearl) continue;
    
    const minuteKey = timeToMinutes(order.hour, order.minute);
    const current = demandMap.get(minuteKey) || 0;
    demandMap.set(minuteKey, current + order.pearlCups);
  }
  
  return demandMap;
}

/**
 * 取得單日的生產紀錄
 */
function getDailyProduction(productionData, date, cupsPerBatch) {
  const productionMap = new Map();
  
  for (const record of productionData) {
    if (record.date !== date) continue;
    
    const minuteKey = timeToMinutes(record.hour, record.minute);
    const cups = record.batchCount * cupsPerBatch;
    const current = productionMap.get(minuteKey) || 0;
    productionMap.set(minuteKey, current + cups);
  }
  
  return productionMap;
}

/**
 * 執行單日模擬
 */
function simulateSingleDay(posData, productionData, params, date) {
  const {
    autoLeadTime,
    triggerThreshold,
    cycleCapacity,
    cupsPerBatch,
  } = params;
  
  // 取得當日需求和生產資料
  const demandByMinute = getDailyDemandByMinute(posData, date);
  const productionByMinute = getDailyProduction(productionData, date, cupsPerBatch);
  
  // 模擬時間範圍：08:00 ~ 22:00
  const startMinute = timeToMinutes(8, 0);  // 08:00 開始（人員上班時間）
  const endMinute = timeToMinutes(22, 0);   // 22:00 結束
  
  // 初始化狀態
  let manualStock = 0;
  let machineStock = 0;
  let machineProductionQueue = []; // { readyAt: minute }
  let isProducing = false;
  
  // 結果記錄
  const minuteData = [];
  let manualShortage = 0;
  let machineShortage = 0;
  
  // 逐分鐘模擬
  for (let minute = startMinute; minute <= endMinute; minute++) {
    const time = minutesToTime(minute);
    
    // === 供給邏輯 ===
    
    // 人工模式：根據生產紀錄補貨
    const manualSupply = productionByMinute.get(minute) || 0;
    manualStock += manualSupply;
    
    // 機器模式：檢查生產完成
    const completedProduction = machineProductionQueue.filter(p => p.readyAt === minute);
    const machineSupply = completedProduction.length * cycleCapacity;
    machineStock += machineSupply;
    machineProductionQueue = machineProductionQueue.filter(p => p.readyAt > minute);
    
    // 更新生產狀態
    isProducing = machineProductionQueue.length > 0;
    
    // 機器模式：觸發新生產（庫存低於閾值且沒有正在生產）
    if (machineStock < triggerThreshold && !isProducing) {
      machineProductionQueue.push({ readyAt: minute + autoLeadTime });
      isProducing = true;
    }
    
    // === 需求邏輯 ===
    const demand = demandByMinute.get(minute) || 0;
    
    // 人工模式扣庫存
    let manualShortageThisMinute = 0;
    if (demand > 0) {
      if (manualStock >= demand) {
        manualStock -= demand;
      } else {
        manualShortageThisMinute = demand - manualStock;
        manualShortage += manualShortageThisMinute;
        manualStock = 0;
      }
    }
    
    // 機器模式扣庫存
    let machineShortageThisMinute = 0;
    if (demand > 0) {
      if (machineStock >= demand) {
        machineStock -= demand;
      } else {
        machineShortageThisMinute = demand - machineStock;
        machineShortage += machineShortageThisMinute;
        machineStock = 0;
      }
    }
    
    // 記錄數據
    minuteData.push({
      minute,
      time,
      demand,
      manualSupply,
      machineSupply,
      manualStock,
      machineStock,
      manualShortage: manualShortageThisMinute,
      machineShortage: machineShortageThisMinute,
      isProducing,
    });
  }
  
  return {
    date,
    minuteData,
    totalManualShortage: manualShortage,
    totalMachineShortage: machineShortage,
    totalDemand: Array.from(demandByMinute.values()).reduce((a, b) => a + b, 0),
  };
}

/**
 * 合併多日資料為平均曲線
 */
function aggregateMultiDayData(dailyResults) {
  if (dailyResults.length === 0) return [];
  if (dailyResults.length === 1) return dailyResults[0].minuteData;
  
  // 以第一天的時間軸為基準
  const baseMinuteData = dailyResults[0].minuteData;
  const aggregated = [];
  
  for (let i = 0; i < baseMinuteData.length; i++) {
    const minute = baseMinuteData[i].minute;
    const time = baseMinuteData[i].time;
    
    // 計算各指標的平均值
    let sumDemand = 0;
    let sumManualStock = 0;
    let sumMachineStock = 0;
    let sumManualShortage = 0;
    let sumMachineShortage = 0;
    let count = 0;
    
    for (const dayResult of dailyResults) {
      const dayMinuteData = dayResult.minuteData.find(d => d.minute === minute);
      if (dayMinuteData) {
        sumDemand += dayMinuteData.demand;
        sumManualStock += dayMinuteData.manualStock;
        sumMachineStock += dayMinuteData.machineStock;
        sumManualShortage += dayMinuteData.manualShortage;
        sumMachineShortage += dayMinuteData.machineShortage;
        count++;
      }
    }
    
    if (count > 0) {
      aggregated.push({
        minute,
        time,
        demand: Math.round(sumDemand / count * 10) / 10,
        manualStock: Math.round(sumManualStock / count * 10) / 10,
        machineStock: Math.round(sumMachineStock / count * 10) / 10,
        manualShortage: Math.round(sumManualShortage / count * 10) / 10,
        machineShortage: Math.round(sumMachineShortage / count * 10) / 10,
      });
    }
  }
  
  return aggregated;
}

/**
 * 主要模擬函數
 */
export function runSimulation(posData, productionData, params, startDate, endDate) {
  // 取得日期範圍內的所有日期
  const dates = [...new Set(posData.map(d => d.date))]
    .filter(d => d >= startDate && d <= endDate)
    .sort();
  
  if (dates.length === 0) {
    return {
      dailyResults: [],
      chartData: [],
      detailData: [],
      summary: {
        totalDays: 0,
        totalDemand: 0,
        totalManualShortage: 0,
        totalMachineShortage: 0,
      },
    };
  }
  
  // 執行每日模擬
  const dailyResults = dates.map(date =>
    simulateSingleDay(posData, productionData, params, date)
  );
  
  // 計算總計
  const summary = {
    totalDays: dailyResults.length,
    totalDemand: dailyResults.reduce((sum, d) => sum + d.totalDemand, 0),
    totalManualShortage: dailyResults.reduce((sum, d) => sum + d.totalManualShortage, 0),
    totalMachineShortage: dailyResults.reduce((sum, d) => sum + d.totalMachineShortage, 0),
  };
  
  // 準備圖表資料
  const isMultiDay = dates.length > 1;
  const chartData = isMultiDay
    ? aggregateMultiDayData(dailyResults)
    : dailyResults[0].minuteData;
  
  // 準備詳細數據表
  const detailData = dailyResults.flatMap(day =>
    day.minuteData.map(m => ({
      date: day.date,
      ...m,
    }))
  );
  
  return {
    dailyResults,
    chartData,
    detailData,
    summary,
    isMultiDay,
  };
}
