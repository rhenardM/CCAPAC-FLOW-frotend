"use client";
import ErrorPage from "@/app/error";
import { useRouter } from "next/navigation";
export default function Page() { const router = useRouter(); return <ErrorPage reset={() => router.push("/demo")} />; }