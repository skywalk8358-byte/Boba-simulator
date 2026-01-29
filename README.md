# 🧋 珍珠產能損益模擬器 (Pearl Capacity P&L Simulator)

## CodeSandbox 使用說明

### 方法一：直接上傳整個專案

1. 前往 [CodeSandbox](https://codesandbox.io/)
2. 點擊 "Create Sandbox" → "Import from GitHub" 或 "Upload"
3. 上傳整個專案資料夾

### 方法二：手動建立 (React + Vite 模板)

1. 在 CodeSandbox 建立新專案，選擇 **React (Vite)** 模板
2. 安裝依賴套件：
   ```
   recharts papaparse date-fns
   ```
3. 依照下方檔案結構，複製對應的程式碼

---

## 檔案結構

```
pearl-simulator/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── FileUploader.jsx
    │   ├── DateRangePicker.jsx
    │   ├── ParameterPanel.jsx
    │   ├── KPIDashboard.jsx
    │   ├── DualLineChart.jsx
    │   └── DetailTable.jsx
    └── core/
        ├── dataParser.js
        ├── simulationEngine.js
        └── financialModel.js
```

---

## 功能說明

### 1. 資料上傳
- **POS 交易明細**：CSV 格式，包含建立時間、商品名稱、數量、銷售金額、加料欄位
- **珍珠生產紀錄**：CSV 格式，包含日期、出鍋時間、煮製份數

### 2. 參數設定
- 機器煮製週期 (預設 45 分鐘)
- 安全庫存水位 (預設 30 杯)
- 單次產能 (預設 72 杯)
- 平均客單價 (預設 60 元)
- 珍珠營收佔比 (預設 40%)
- 每份杯數 (預設 8 杯/份)

### 3. 日期選擇
- 支援單日或多日範圍選擇
- 多日模式會以平均值呈現

### 4. 模擬結果
- KPI 儀表板：顯示損失金額、淨利增長、預估月增營收
- 庫存曲線圖：雙軌對比（人工 vs 機器）
- 詳細數據表：每分鐘庫存變化明細

---

## 演算法說明

### 珍珠需求判定
1. **排除關鍵字** (優先)：纖玉菓子、麻糬、小芋圓、椰果
2. **包含關鍵字**：珍珠、波霸、粉圓、國王
3. 過濾銷售金額 ≤ 0 的無效單

### 雙軌模擬
- **情境 A (人工)**：依歷史生產紀錄補貨
- **情境 B (機器)**：庫存 < 閾值時自動觸發，45 分鐘後入庫

### 財務計算
```
隱形營收損失 = 斷貨杯數 × 平均客單價 ÷ 珍珠營收佔比
```

---

## 版本
v2.0 | 吃茶三千
