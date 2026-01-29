import Papa from 'papaparse';

// 珍珠需求判定關鍵字
const INCLUSION_KEYWORDS = ['珍珠', '波霸', '粉圓', '國王'];
const EXCLUSION_KEYWORDS = ['纖玉菓子', '麻糬', '小芋圓', '椰果'];

/**
 * 判斷訂單是否為珍珠需求
 */
function isPearlDemand(productName, toppings) {
  const combined = `${productName || ''}${toppings || ''}`;
  
  // 反向排除優先（優先級最高）
  for (const keyword of EXCLUSION_KEYWORDS) {
    if (combined.includes(keyword)) {
      return false;
    }
  }
  
  // 正向匹配
  for (const keyword of INCLUSION_KEYWORDS) {
    if (combined.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 解析日期時間字串
 * @param {string} dateTimeStr - 格式如 "2025/12/1 09:56"
 */
function parseDateTime(dateTimeStr) {
  if (!dateTimeStr || typeof dateTimeStr !== 'string') return null;
  
  const parts = dateTimeStr.trim().split(' ');
  if (parts.length < 2) return null;
  
  const dateParts = parts[0].split('/');
  const timeParts = parts[1].split(':');
  
  if (dateParts.length < 3 || timeParts.length < 2) return null;
  
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;
  const day = parseInt(dateParts[2]);
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);
  
  const date = new Date(year, month, day, hour, minute);
  
  return {
    date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    hour,
    minute,
    timestamp: date.getTime(),
  };
}

/**
 * 解析生產紀錄的日期格式
 * @param {string} dateStr - 格式如 "12月1日"
 * @param {number} year - 年份
 */
function parseProductionDate(dateStr, year = 2025) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  // 匹配 "12月1日" 格式
  const match = dateStr.match(/(\d+)月(\d+)日/);
  if (!match) return null;
  
  const month = parseInt(match[1]);
  const day = parseInt(match[2]);
  
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * 解析時間字串
 * @param {string} timeStr - 格式如 "10:15"
 */
function parseTimeStr(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  
  const hour = parseInt(parts[0]);
  const minute = parseInt(parts[1]);
  
  return {
    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    hour,
    minute,
  };
}

/**
 * 解析 CSV 資料
 * @param {File} file - 上傳的檔案
 * @param {string} type - 'pos' 或 'production'
 */
export function parseCSVData(file, type) {
  return new Promise((resolve, reject) => {
    // 先嘗試讀取檔案內容來偵測編碼
    const reader = new FileReader();
    
    reader.onload = (e) => {
      let content = e.target.result;
      
      // 嘗試偵測並處理 BIG5 編碼
      // 如果包含亂碼特徵，嘗試用 BIG5 重新讀取
      if (content.includes('\xa4') || content.includes('\xb4') || content.includes('\xac')) {
        // 使用 TextDecoder 嘗試 BIG5
        const decoder = new TextDecoder('big5');
        const uint8Array = new Uint8Array(e.target.result.split('').map(c => c.charCodeAt(0)));
        content = decoder.decode(uint8Array);
      }
      
      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            if (type === 'pos') {
              const data = parsePosData(results.data);
              resolve(data);
            } else if (type === 'production') {
              const data = parseProductionData(results.data);
              resolve(data);
            } else {
              reject(new Error('未知的資料類型'));
            }
          } catch (err) {
            reject(err);
          }
        },
        error: (err) => {
          reject(err);
        },
      });
    };
    
    reader.onerror = () => reject(new Error('檔案讀取失敗'));
    reader.readAsBinaryString(file);
  });
}

/**
 * 解析 POS 交易明細
 */
function parsePosData(rawData) {
  const result = [];
  
  for (const row of rawData) {
    // 取得欄位值（處理可能的欄位名稱變體）
    const dateTimeStr = row['建立時間'] || row['建立時間 '] || '';
    const productName = row['商品名稱'] || row['商品名稱 '] || '';
    const quantity = parseInt(row['數量'] || row['數量 '] || '0');
    const salesAmount = parseInt(row['銷售金額'] || row['銷售金額 '] || '0');
    const toppings = row['加料(Toppings)'] || row['加料'] || '';
    
    // 過濾無效資料
    if (!dateTimeStr || dateTimeStr.trim() === '') continue;
    if (salesAmount <= 0) continue;
    
    const dateTime = parseDateTime(dateTimeStr);
    if (!dateTime) continue;
    
    // 判斷是否為珍珠需求
    const isPearl = isPearlDemand(productName, toppings);
    
    result.push({
      dateTime: dateTimeStr,
      date: dateTime.date,
      time: dateTime.time,
      hour: dateTime.hour,
      minute: dateTime.minute,
      timestamp: dateTime.timestamp,
      productName,
      quantity,
      salesAmount,
      toppings,
      isPearl,
      pearlCups: isPearl ? quantity : 0,
    });
  }
  
  // 按時間排序
  result.sort((a, b) => a.timestamp - b.timestamp);
  
  return result;
}

/**
 * 解析珍珠生產紀錄
 */
function parseProductionData(rawData) {
  const result = [];
  
  for (const row of rawData) {
    // 取得欄位值
    const dateStr = row['日期'] || row['日期 '] || '';
    const timeStr = row['出鍋時間'] || row['出鍋時間 '] || '';
    const batchCount = parseInt(row['煮製份數'] || row['煮製份數 '] || '0');
    
    // 過濾無效資料
    if (!dateStr || dateStr.trim() === '') continue;
    if (!timeStr || timeStr.trim() === '') continue;
    if (batchCount <= 0) continue;
    
    const date = parseProductionDate(dateStr, 2025);
    const time = parseTimeStr(timeStr);
    
    if (!date || !time) continue;
    
    result.push({
      date,
      time: time.time,
      hour: time.hour,
      minute: time.minute,
      batchCount,
    });
  }
  
  // 按日期和時間排序
  result.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.hour !== b.hour) return a.hour - b.hour;
    return a.minute - b.minute;
  });
  
  return result;
}
