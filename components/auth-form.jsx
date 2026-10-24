"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck, UserPlus } from "lucide-react";
import Brand from "@/components/brand";
import { Button, Input } from "@/components/ui";
import { authenticate, requestPasswordReset, requestAccountAccess } from "@/lib/api";
export default function AuthForm({ forgot = false, register = false }) {
  const router = useRouter(); const [visible, setVisible] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState(false); const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(""); const values = new FormData(event.currentTarget);
    try {
      if (register) { await requestAccountAccess(Object.fromEntries(values)); setSuccess(true); }
      else if (forgot) { await requestPasswordReset(values.get("email")); router.push("/email-envoye"); }
      else { const result = await authenticate({ identifier: values.get("identifier"), password: values.get("password") }); router.push(`/${result.role}`); }
    } catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  return <main id="contenu" className="auth-page">
    <header className="auth-top"><Link href="/connexion" aria-label="Grand Tambour, connexion"><Brand /></Link><span>PORTAIL DES AGENTS</span></header>
    <div className="auth-content">
      <div className="auth-heading">
        <span className="auth-icon">{register ? <UserPlus size={22} /> : <LockKeyhole size={22} />}</span>
        <h1>{register ? "Créer un compte" : forgot ? "Mot de passe oublié" : "Connexion"}</h1>
        <p>{register ? "Demande d’accès réservée aux agents du CCAPAC, soumise à validation administrative." : forgot ? "Saisissez l’adresse e-mail associée à votre compte." : "Bons d’assistance médicale"}</p>
      </div>
      {success ? <div className="notice notice-success stack" role="status">
        <strong>{register ? "Demande d’accès enregistrée" : "Demande de réinitialisation enregistrée"}</strong>
        <p>{register ? "Démonstration : votre demande est conservée uniquement dans ce navigateur. Aucun compte n’est activé et aucun e-mail n’est envoyé." : "Mode démonstration : aucun e-mail n’est envoyé. Le mot de passe de démonstration reste inchangé."}</p>
        <Button href="/connexion" variant="secondary">Retour à la connexion</Button>
      </div> : <form onSubmit={submit} className="stack" aria-busy={busy}>
        {register && <>
          <Input label="Nom complet" name="name" autoComplete="name" required maxLength={120} placeholder="Votre nom et prénom" />
          <Input label="Matricule" name="identifier" required pattern="AG-[0-9]{4,}" title="AG- suivi d’au moins quatre chiffres" placeholder="AG-0123" hint="Format : AG-0123" />
        </>}
        {forgot || register ? <Input label="Adresse e-mail" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="prenom.nom@centreculturel.cd" /> : <>
          <Input label="Matricule ou e-mail" name="identifier" autoComplete="username" required placeholder="AG-0123" />
          <div className="password-field">
            <Input label="Mot de passe" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required placeholder="Votre mot de passe" />
            <button type="button" className="icon-button" aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <Link className="forgot-link" href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
        </>}
        {register && <Input label="Département" name="department" required maxLength={120} placeholder="Votre département" />}
        {error && <p className="field-error" role="alert">{error}</p>}
        <Button type="submit" loading={busy}>{register ? "Demander la création du compte" : forgot ? "Demander la réinitialisation" : "Se connecter"}</Button>
        {forgot || register ? <Button href="/connexion" variant="ghost"><ArrowLeft size={16} />Retour à la connexion</Button> : <Button href="/creation-compte" variant="secondary"><UserPlus size={18} />Créer un compte</Button>}
      </form>}
      {process.env.NODE_ENV === "development" && !forgot && !register && <p className="demo-credentials">Démo : AG-0123 · GrandTambour2026!</p>}
    </div>
    <footer className="auth-footer"><ShieldCheck size={16} /><span>CCAPAC · Centre Culturel Grand Tambour</span></footer>
  </main>;
}