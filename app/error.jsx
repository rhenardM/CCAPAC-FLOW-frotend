"use client";
import { Button } from "@/components/ui";
export default function ErrorPage({ reset }) { return <main id="contenu" className="error-state"><h1>Une erreur est survenue</h1><p>Vos données locales sont conservées.</p><Button onClick={reset}>Réessayer</Button><Button href="/demo" variant="secondary">Retour au prototype</Button></main>; }