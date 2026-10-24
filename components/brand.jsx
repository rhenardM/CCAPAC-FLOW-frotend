import Image from "next/image";
export default function Brand() {
  return <div className="brand"><Image src="/logo.png" alt="CCAPAC, Centre Culturel Grand Tambour" width={1167} height={561} sizes="280px" preload /></div>;
}