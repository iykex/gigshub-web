import { PricingPackage } from "@/types"

// Mock data for development - matches the seed SQL from PRD
export const mockPricingData: PricingPackage[] = [
  // MTN Packages
  { id: 1, provider: 'MTN', name: 'MTN Regular 1GB', size: '1GB', price: 5.5, agent_price: 4.9, product_code: 'mtn_reg_1gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 2, provider: 'MTN', name: 'MTN Regular 2GB', size: '2GB', price: 12, agent_price: 9.8, product_code: 'mtn_reg_2gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 3, provider: 'MTN', name: 'MTN Regular 3GB', size: '3GB', price: 18, agent_price: 14.7, product_code: 'mtn_reg_3gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 4, provider: 'MTN', name: 'MTN Regular 4GB', size: '4GB', price: 23, agent_price: 19.2, product_code: 'mtn_reg_4gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 5, provider: 'MTN', name: 'MTN Regular 5GB', size: '5GB', price: 27, agent_price: 25, product_code: 'mtn_reg_5gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 6, provider: 'MTN', name: 'MTN Regular 6GB', size: '6GB', price: 34, agent_price: 29, product_code: 'mtn_reg_6gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 7, provider: 'MTN', name: 'MTN Regular 8GB', size: '8GB', price: 42, agent_price: 38.6, product_code: 'mtn_reg_8gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 8, provider: 'MTN', name: 'MTN Regular 10GB', size: '10GB', price: 47, agent_price: 45, product_code: 'mtn_reg_10gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 9, provider: 'MTN', name: 'MTN Regular 15GB', size: '15GB', price: 74, agent_price: 70, product_code: 'mtn_reg_15gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 10, provider: 'MTN', name: 'MTN Regular 20GB', size: '20GB', price: 90, agent_price: 86, product_code: 'mtn_reg_20gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 11, provider: 'MTN', name: 'MTN Agent 30GB', size: '30GB', price: 125, agent_price: 125, product_code: 'mtn_agent_30gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 12, provider: 'MTN', name: 'MTN Agent 50GB', size: '50GB', price: 200, agent_price: 200, product_code: 'mtn_agent_50gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 13, provider: 'MTN', name: 'MTN Agent 100GB', size: '100GB', price: 399, agent_price: 399, product_code: 'mtn_agent_100gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  
  // Telecel Packages
  { id: 14, provider: 'Telecel', name: 'Telecel 5GB', size: '5GB', price: 28, agent_price: 23, product_code: 'telecel_5gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 15, provider: 'Telecel', name: 'Telecel 10GB', size: '10GB', price: 47, agent_price: 42, product_code: 'telecel_10gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 16, provider: 'Telecel', name: 'Telecel 15GB', size: '15GB', price: 65, agent_price: 60, product_code: 'telecel_15gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 17, provider: 'Telecel', name: 'Telecel 20GB', size: '20GB', price: 85, agent_price: 80, product_code: 'telecel_20gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 18, provider: 'Telecel', name: 'Telecel 25GB', size: '25GB', price: 104, agent_price: 98, product_code: 'telecel_25gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 19, provider: 'Telecel', name: 'Telecel 30GB', size: '30GB', price: 130, agent_price: 117, product_code: 'telecel_30gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 20, provider: 'Telecel', name: 'Telecel 40GB', size: '40GB', price: 165, agent_price: 157, product_code: 'telecel_40gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 21, provider: 'Telecel', name: 'Telecel 50GB', size: '50GB', price: 193, agent_price: 187, product_code: 'telecel_50gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 22, provider: 'Telecel', name: 'Telecel 100GB', size: '100GB', price: 390, agent_price: 385, product_code: 'telecel_100gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  
  // AirtelTigo iShare Packages
  { id: 23, provider: 'AirtelTigo', name: 'AT Ishare 1GB', size: '1GB', price: 5, agent_price: 4.3, product_code: 'at_ishare_1gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 24, provider: 'AirtelTigo', name: 'AT Ishare 2GB', size: '2GB', price: 10, agent_price: 8.6, product_code: 'at_ishare_2gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 25, provider: 'AirtelTigo', name: 'AT Ishare 3GB', size: '3GB', price: 15, agent_price: null, product_code: 'at_ishare_3gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 26, provider: 'AirtelTigo', name: 'AT Ishare 4GB', size: '4GB', price: 20, agent_price: 18, product_code: 'at_ishare_4gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 27, provider: 'AirtelTigo', name: 'AT Ishare 5GB', size: '5GB', price: 25, agent_price: 20.6, product_code: 'at_ishare_5gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 28, provider: 'AirtelTigo', name: 'AT Ishare 6GB', size: '6GB', price: 30, agent_price: 24.8, product_code: 'at_ishare_6gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 29, provider: 'AirtelTigo', name: 'AT Ishare 7GB', size: '7GB', price: 35, agent_price: 28.6, product_code: 'at_ishare_7gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 30, provider: 'AirtelTigo', name: 'AT Ishare 8GB', size: '8GB', price: 40, agent_price: 33, product_code: 'at_ishare_8gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 31, provider: 'AirtelTigo', name: 'AT Ishare 10GB', size: '10GB', price: 50, agent_price: 40.2, product_code: 'at_ishare_10gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 32, provider: 'AirtelTigo', name: 'AT Ishare 15GB', size: '15GB', price: 70, agent_price: 60.2, product_code: 'at_ishare_15gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  
  // AirtelTigo Bigtime Packages
  { id: 33, provider: 'AirtelTigo', name: 'AT Bigtime 20GB', size: '20GB', price: 70, agent_price: 68, product_code: 'at_bigtime_20gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 34, provider: 'AirtelTigo', name: 'AT Bigtime 30GB', size: '30GB', price: 80, agent_price: 78, product_code: 'at_bigtime_30gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 35, provider: 'AirtelTigo', name: 'AT Bigtime 40GB', size: '40GB', price: 90, agent_price: 88, product_code: 'at_bigtime_40gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 36, provider: 'AirtelTigo', name: 'AT Bigtime 50GB', size: '50GB', price: 110, agent_price: 103, product_code: 'at_bigtime_50gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 37, provider: 'AirtelTigo', name: 'AT Bigtime 100GB', size: '100GB', price: 120, agent_price: 190, product_code: 'at_bigtime_100gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
  { id: 38, provider: 'AirtelTigo', name: 'AT Bigtime 200GB', size: '200GB', price: 350, agent_price: 350, product_code: 'at_bigtime_200gb', is_active: 1, updated_by: null, updated_at: new Date().toISOString(), version: 1 },
]

export function getPackagesByProvider(provider: string): PricingPackage[] {
  return mockPricingData.filter(pkg => pkg.provider === provider && pkg.is_active === 1)
}

export function getAllProviders(): string[] {
  return Array.from(new Set(mockPricingData.map(pkg => pkg.provider)))
}

export function getPackageById(id: number): PricingPackage | undefined {
  return mockPricingData.find(pkg => pkg.id === id)
}
