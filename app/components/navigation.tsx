"use client";
import Link from 'next/link';
import {usePathname} from 'next/navigation';
export default function Navigation(){const path=usePathname();return <nav aria-label="Main navigation">{[['/','Triage'],['/corpus','Corpus & workflow'],['/evaluation','Evaluation']].map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}</nav>}
