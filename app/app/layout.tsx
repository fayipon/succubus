import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Succubus — Character Archive',description:'探索 Succubus 3D 人物與房間展示。'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>}