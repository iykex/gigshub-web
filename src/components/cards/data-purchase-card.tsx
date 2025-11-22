"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wifi, Smartphone, CreditCard } from 'lucide-react'

export function DataPurchaseCard() {
  const [provider, setProvider] = useState("mtn")

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-primary/10 bg-white/90 dark:bg-gray-900/95 backdrop-blur-sm dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Buy Data Bundle</CardTitle>
        <CardDescription className="text-center">Instant delivery to any network</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mtn" onValueChange={setProvider} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="mtn" className="rounded-xl data-[state=active]:bg-yellow-400 data-[state=active]:text-black">MTN</TabsTrigger>
            <TabsTrigger value="telecel" className="rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white">Telecel</TabsTrigger>
            <TabsTrigger value="at" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">AT</TabsTrigger>
          </TabsList>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="phone" placeholder="024 XXX XXXX" className="pl-9" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="package">Data Package</Label>
              <Select>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="1gb">1GB - GHS 5.00</SelectItem>
                  <SelectItem value="2gb">2GB - GHS 10.00</SelectItem>
                  <SelectItem value="5gb">5GB - GHS 20.00</SelectItem>
                  <SelectItem value="10gb">10GB - GHS 35.00</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
              <CreditCard className="mr-2 h-4 w-4" /> Buy Now
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
