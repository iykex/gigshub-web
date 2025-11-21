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
                        .whatsapp-mobile-wrapper > div:first-child,
                        .whatsapp-mobile-wrapper [class*="FloatingWhatsApp"],
                        .whatsapp-mobile-wrapper [class*="floating-whatsapp"] {
                            bottom: 86px !important;
                        }
                        
                        .whatsapp-mobile-wrapper button {
                            width: 24px !important;
                            height: 24px !important;
                        }
                        
                        .whatsapp-mobile-wrapper button svg {
                            width: 18px !important;
                            height: 18px !important;
                        }
                    }
                `
            }} />
        </div>
    )
}
