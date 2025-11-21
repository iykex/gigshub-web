'use client'

import dynamic from 'next/dynamic'

const FloatingWhatsApp = dynamic(
    () => import('@dxkit-org/react-floating-whatsapp').then((mod) => mod.FloatingWhatsApp),
    { ssr: false }
)

export function FloatingWhatsAppWrapper() {
    return (
        <div className="whatsapp-mobile-wrapper">
            <FloatingWhatsApp
                phoneNumber="+233550061197"
                accountName="GiGSHUB Support"
                chatMessage="Hi! How can we help you?"
                placeholder="Type a message..."
                statusMessage="Typically replies within minutes"
                buttonStyle={{ backgroundColor: '#25D366' }}
                chatboxStyle={{ borderRadius: '20px' }}
                notification={true}
                notificationDelay={30}
            />
            <style dangerouslySetInnerHTML={{
                __html: `
                    /* Mobile-specific styles for WhatsApp button */
                    @media (max-width: 768px) {
                        .whatsapp-mobile-wrapper [class*="FloatingWhatsApp"] {
                            bottom: 130px !important;
                        }
                        
                        .whatsapp-mobile-wrapper button[class*="FloatingWhatsApp"] {
                            width: 40px !important;
                            height: 40px !important;
                        }
                        
                        .whatsapp-mobile-wrapper button[class*="FloatingWhatsApp"] svg {
                            width: 20px !important;
                            height: 20px !important;
                        }
                    }
                `
            }} />
        </div>
    )
}
