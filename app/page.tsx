"use client"
import { useRouter } from "next/navigation"
import WelcomePage from "@/components/welcome-page"

export default function Home() {
  const router = useRouter()

  const handleStart = () => {
    router.push("/attendance")
  }

  return <WelcomePage onStart={handleStart} />
}
