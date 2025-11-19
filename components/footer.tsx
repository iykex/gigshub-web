'use client'

import { Heart, MessageCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="py-4 md:py-6 text-center text-gray-600 dark:text-gray-400 mt-5 md:mt-auto max-w-6xl mx-auto px-3 sm:px-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <p className="text-xs md:text-sm">
            © {new Date().getFullYear()} GiGSHUB. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs md:text-sm">
            <span>Designed with</span>
            <Heart className="w-3 h-3 md:w-4 md:h-4 text-blue-500 fill-current" />
            <span>by</span>
            <a
              href="https://www.aibsmart.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              AIB.Smart
            </a>
          </p>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl text-xs sm:text-sm border-gray-300 bg-white/70 text-gray-800 hover:bg-white hover:border-gray-400 dark:bg-transparent dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800/50 dark:hover:border-gray-600 transition-colors duration-300"
              >
                Tutorials <ChevronDown className="w-3 h-3 md:w-4 md:h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 backdrop-blur-md rounded-xl ml-2"
            >
              <DropdownMenuItem asChild className="rounded-xl text-xs md:text-sm">
                <Link href="/tutorials/how-to-buy-data" className="text-blue-600">How to Buy Data</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl text-xs md:text-sm">
                <Link href="/tutorials/how-to-make-payments" className="text-blue-600">How to Make Payments</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl text-xs md:text-sm">
                <Link href="/tutorials/how-to-topup-wallet" className="text-blue-600">How to Top Up Wallet</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            onClick={() =>
              window.open(
                "https://wa.me/+233550061197?text=Hi%20NetGH™%2C%0AI%20want%20to%20purchase%20data.",
                "_blank"
              )
            }
            className="bg-blue-400 hover:bg-blue-500 text-white rounded-full px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp Support
          </Button>
        </div>
      </div>
    </footer>
  )
}
