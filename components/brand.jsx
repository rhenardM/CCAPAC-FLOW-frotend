import Image from "next/image";
export default function Brand() {
  return <div className="brand"><Image src="/logo.png" alt="CCAPAC, Centre Culturel Grand Tambour" width={180} height={88} priority /><div><strong>Bons médicaux</strong><span>GRAND TAMBOUR</span></div></div>;
}