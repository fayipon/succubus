import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'魅魔店 — 人物圖鑑',description:'探索人物圖鑑、皮膚與互動動畫。'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>}