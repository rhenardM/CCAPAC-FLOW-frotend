import { Button } from "@/components/ui";
import Brand from "@/components/brand";
export default function NotFound() { return <main id="contenu" className="empty-state"><Brand /><p className="eyebrow">404</p><h1>Page introuvable</h1><p>Cette adresse ne correspond à aucun écran.</p><Button href="/demo">Retour au plan du prototype</Button></main>; }