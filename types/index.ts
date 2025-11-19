export interface PricingPackage {
  id: number
  provider: string
  name: string
  size: string
  price: number
  agent_price: number | null
  product_code: string
  is_active: number
  updated_by: string | null
  updated_at: string
  version: number
}

export interface User {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  role: 'guest' | 'user' | 'agent' | 'admin'
  wallet_balance: number
  created_at: string
}

export interface Order {
  id: string
  user_id: string | null
  phone: string
  provider: string
  package_id: number
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded'
  reference: string
  created_at: string
  updated_at: string
}

export interface WalletLedger {
  id: number
  user_id: string
  change: number
  balance_after: number
  type: string
  reference: string
  created_at: string
}
