import './style.css';
import Link from 'next/link';
import Navigation from './components/navigation';
export const metadata={title:'VaultLens | Risk triage',description:'Educational synthetic DeFi incident triage'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><header><Link className="wordmark" href="/"><svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M10 8h12l-4 16H6z" fill="currentColor"/></svg>VaultLens<span className="brand-dot">®</span></Link><Navigation/><span className="header-note">Clarity through evidence.</span></header><main>{children}</main><footer><Link className="wordmark" href="/">VaultLens</Link><p>Educational synthetic material · No customer data</p><span>Built for a closer look.</span></footer></body></html>}
