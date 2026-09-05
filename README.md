# Succubus

偏遊戲風格的 3D 人物展示圖鑑。從首頁選取人物，再進入對應的房間，旋轉、縮放與平移查看模型。

## 演示

[GitHub Pages 預定網址（等待首次發布）](https://fayipon.github.io/succubus/)

由 GitHub Actions 建置並發布。推送 main 後會自動更新；部署狀態見 repository 的 Actions 頁面。

## 初始版本

### v0.2：main → char

- 預設入口 `/#main` 使用 `design/main.png`，點擊「進入遊戲」前往 `/#char`；可返回首頁，瀏覽器上一頁／下一頁同步切換。
- char 依 `design/char.png` 實作三張可選角色卡與介紹面板。這些是設計概念角色，目前仍沒有可進入的 3D example；房間數量以實際資料計算，3D 按鈕未開放。
- main 以局部 WebGL UV 位移製作微幅髮絲飄動，約每 5.3 秒眨眼一次。閉眼 keyframe 只在眼睛區域混合，背景與標題固定。
- 提供動畫暫停，遵循系統 `prefers-reduced-motion`，離開 main 時釋放 GPU 資源，頁面隱藏時停止動畫。WebGL 不支援或素材載入失敗時保留靜態入口。
- 此效果是 2D 圖像動畫，不是 Live2D 骨架或 3D 人物動畫。
- 正式圖片在 `app/public/images/`；`design` 的原始參考不會被改寫。眨眼素材的生成說明見 `design/animation-notes.md`。

- 深色遊戲式人物列表，支援手機尺寸。
- 每個 example 一個 room，至少一位 character，支援多位人物。
- 選取人物後載入房間及其中所有人物，視角聚焦選取的人物。
- Three.js GLB/glTF 載入、OrbitControls、載入與錯誤狀態、重設視角及可鍵盤操作的旋轉／縮放按鈕。
- **目前 examples 為空；尚未加入第一個 3D example。** 實際模型、材質與房間鏡頭效果待第一批素材到齊後驗證。

## 開發

需要 Node.js 22.13+ 與 npm。

```sh
cd app
npm ci
npm run dev
```

以開發伺服器輸出的 Local URL 為準。

```sh
cd app
npx tsc --noEmit
npm run build
npm run preview
```

## 結構

```text
design/                       原始設計資料，不直接發布
app/
  app/page.tsx                人物列表與選取流程
  app/globals.css             遊戲選單風格、響應式版面
  components/room-viewer.tsx   3D 載入、視角、資源清理
  lib/examples.ts             Example / Character / ModelAsset 型別與登錄
  public/examples/            正式展示用模型與縮圖
  .openai/hosting.json        Sites 部署識別
```

## 新增 example

1. 把參考資料放進 `design/<example-id>/`。
2. 將可發布的 room.glb、人物模型與縮圖放進 `app/public/examples/<example-id>/`。
3. 在 `app/lib/examples.ts` 的 `examples` 陣列登錄資料：

```ts
{
  id: 'example-001',
  name: '第一個展示間',
  room: { model: '/examples/example-001/room.glb' },
  characters: [{
    id: 'character-001',
    name: '角色名稱',
    model: '/examples/example-001/character.glb',
    portrait: '/examples/example-001/portrait.webp',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1
  }]
}
```

上述內容僅是資料格式說明，沒有預先建立第一個 example。ID 在各自範圍內必須唯一；characters 不可為空。
座標使用公尺、Y 軸向上，rotation 使用弧度。建議使用包含貼圖的未壓縮 GLB；glTF 的外部貼圖與 bin 檔需保留相對路徑。目前未配置 Draco/KTX2 解碼器、骨骼動畫播放或鏡頭碰撞。

## 部署

演示平台為 GitHub Pages，部署工作流程位於 `.github/workflows/pages.yml`。
GitHub repository 的 Settings → Pages → Source 必須選擇 GitHub Actions。
每次推送 main，工作流程會執行 npm ci、TypeScript 檢查與靜態建置，再將 `app/dist` 部署到 https://fayipon.github.io/succubus/。

圖片、CSS、JavaScript 與模型使用相對於網站入口的路徑，支援 `/succubus/` 子目錄。`design` 不會放進網站的建置產物。
原有 `app/.openai/hosting.json` 保留先前註冊的 Sites 識別，GitHub Pages 不使用該設定。

3D API 參考：[GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html)、[OrbitControls](https://threejs.org/docs/pages/OrbitControls.html)。

