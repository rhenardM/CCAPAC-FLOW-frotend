import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Shell from "@/components/shell";
import { PageHeading } from "@/components/ui";
import { demoSections } from "@/lib/demo-pages";
export const metadata = { title: "Plan du prototype" };
export default function Page() { return <Shell role="demo"><PageHeading title="Plan du prototype" description="CCAPAC · Bons d’assistance médicale" /><div className="demo-index">{demoSections.map(section => <section key={section.title}><h2>{section.title}</h2><div className="demo-links">{section.screens.map(([code, label, href]) => <Link key={code} href={href} data-screen-code={code}><span className="count">{code}</span><span>{label}</span><ArrowUpRight size={17} /></Link>)}</div></section>)}</div></Shell>; }