import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { CheckCircle2, Home, ShoppingBag } from 'lucide-react'

interface SuccessPageProps {
  searchParams: Promise<{
    reference: string
  }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { reference } = await searchParams

  return (
    <div className="max-w-md mx-auto py-12">
      <GlassCard className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your order has been placed successfully. The data bundle will be delivered shortly.
          </p>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4 text-sm">
          <p className="text-muted-foreground">Order Reference</p>
          <p className="font-mono font-medium text-lg">{reference}</p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button className="w-full rounded-full" asChild>
            <Link href="/store">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Buy More Data
            </Link>
          </Button>
          <Button variant="outline" className="w-full rounded-full" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
