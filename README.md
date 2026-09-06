# Succubus

首頁保留原始主視覺與動畫；人物頁沿用 `design/list.png` 的黑紫與粉紅卡框風格，整合原本 Brown Dust II viewer 的立繪。

- 69 位女性角色、173 套皮膚；不顯示稀有度。
- 同名角色只保留一張卡片，服裝整合成皮膚。神聖悠絲緹亞也歸入悠絲緹亞。
- 人物區左側為由上到下排列的皮膚選單；切換人物會記住該人物先前選取的皮膚。
- 預設循環播放 idle；點擊人物或已選取的角色卡播放一次 motion，完成後回到 idle。也可用鍵盤操作。
- 介面、角色及皮膚名稱均使用繁體中文。部分名稱依原始英文翻譯，對照表可在 `app/data/female-names.txt` 與 `skin-names.txt` 維護。
- 原本的展示間已移除；舊 `#room/` 連結回到人物列表。

## 本地使用

```powershell
npm --prefix app ci
npm run build
npm --prefix app run preview
```

開啟 http://127.0.0.1:4173/#char 。不需要啟動舊的 4319 viewer。

首次建置會下載固定版本的角色資源，之後使用 `app/.asset-cache/`；清理 `dist` 不會清掉快取。完整建置會將資源及授權文件一起放進 `app/dist`，也可由一般靜態伺服器提供，不依賴本地 API。

開發時保留上述預覽服務，再於另一終端執行 `npm run dev`；開發伺服器會將角色資源請求轉交 4173。

## 驗證與維護

```powershell
npm run typecheck
cd app
node scripts/verify-characters.mjs
node scripts/verify-ui.mjs
```

動畫檢查會驗證所有皮膚、貼圖、骨架座標以及互動完成後回到待機。需使用 Node.js 24。

`node scripts/import-viewer.mjs <原始viewer資料夾>` 可依女性角色白名單和繁體中文對照表重新產生目錄，同時沿用舊快取。新增角色時要明確加入白名單，未知角色不會自動視為女性。

## 來源

角色素材來自 [Zormolo/Brown-Dust-2-Assets](https://github.com/Zormolo/Brown-Dust-2-Assets)，固定版本記錄於 `app/data/brown-dust-assets.json`。繁體名稱參考[官方角色活動介紹](https://www.browndust2.com/3rd-anniversary/zh-hant/)，其餘對照採本地翻譯。

遊戲角色與圖像權利歸原權利人所有；資源庫及 Spine Runtime 授權文件保留於 `app/licenses`，亦包含於靜態建置。

保留 GitHub Pages 建置流程與 `design/` 原始設計素材。
