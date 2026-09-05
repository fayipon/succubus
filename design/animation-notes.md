# main 動畫素材

來源：`design/main.png`。

使用內建 imagegen 編輯產生 `app/public/images/main-blink.png`。保留原圖，額外生成閉眼 keyframe。執行時只混合兩眼的局部區域，不切換整張畫面。髮絲以低振幅 UV 位移呈現，不拉動整張人物圖。

生成提示詞：

> Edit target: provided main.png. Create a precise animation keyframe for the same game title screen. Change ONLY the illustrated adult purple-haired woman's two eyes to naturally fully closed in a relaxed blink, with fine curved dark eyelashes. Preserve exact framing, pose, face location, hair, facial features, clothes, all Chinese lettering, button, scenery, colors, and lighting. Same 16:9 canvas and identical alignment; no repositioning or cropping. This is a closed-eyes animation frame, not a redesign.

char 的肖像區以 CSS 顯示原始參考圖中的對應區域；名稱、說明、選取狀態與按鈕由 HTML 實作。未提供的 LILITH / EVE 能力值顯示破折號。
