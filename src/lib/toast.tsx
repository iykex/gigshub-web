import { toast as reactToast, ToastOptions, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Detect current theme
const getTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'

    const isDark = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches

    return isDark ? 'dark' : 'light'
}

// Custom toast configuration matching the project design
const getDefaultOptions = (): ToastOptions => ({
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: getTheme(),
    transition: Bounce,
})

interface ToastProps {
    title?: string
    description?: string
    variant?: 'default' | 'destructive' | 'success'
    duration?: number
}

export const toast = ({ title, description, variant = 'default', duration }: ToastProps) => {
    const message = (
        <div className="flex flex-col gap-1">
            {title && <div className="font-semibold text-sm">{title}</div>}
            {description && <div className="text-xs opacity-90">{description}</div>}
        </div>
    )

    const options: ToastOptions = {
        ...getDefaultOptions(),
        autoClose: duration || 4000,
    }

    switch (variant) {
        case 'destructive':
            return reactToast.error(message, options)
        case 'success':
            return reactToast.success(message, options)
        default:
            return reactToast.info(message, options)
    }
}

// Export ToastContainer for use in App
export { ToastContainer } from 'react-toastify'
