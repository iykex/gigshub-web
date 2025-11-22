# Toast System - react-toastify

This project uses `react-toastify` for displaying toast notifications with a custom design that matches the project's aesthetic.

## Features

- ✨ **Modern Design**: Glassmorphism effect with backdrop blur
- 🌓 **Dark Mode Support**: Automatically adapts to light/dark theme
- 🎨 **Color-Coded**: Different colors for success, error, and info messages
- 📱 **Responsive**: Works seamlessly on all screen sizes
- ⚡ **Smooth Animations**: Slide-in/out transitions with bounce effect

## Usage

Import the toast function from `@/lib/toast`:

\`\`\`tsx
import { toast } from "@/lib/toast"

// Success toast
toast({
  title: "Success!",
  description: "Your action was completed successfully.",
  variant: "success"
})

// Error toast
toast({
  title: "Error",
  description: "Something went wrong. Please try again.",
  variant: "destructive"
})

// Info toast (default)
toast({
  title: "Info",
  description: "Here's some information for you."
})

// Custom duration
toast({
  title: "Quick message",
  description: "This will disappear in 2 seconds",
  duration: 2000
})
\`\`\`

## Toast Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | string | - | Bold title text |
| `description` | string | - | Smaller description text |
| `variant` | 'default' \| 'destructive' \| 'success' | 'default' | Toast type/color |
| `duration` | number | 4000 | Auto-close duration in milliseconds |

## Customization

### Styling
Custom styles are defined in `/src/styles/toast.css`. The design includes:
- Glassmorphism background with blur effect
- Border-left accent color based on variant
- Gradient progress bar
- Smooth animations

### Theme Detection
The toast automatically detects the current theme (light/dark) by checking:
1. The `dark` class on the document element
2. The system preference via `prefers-color-scheme`

## Migration from Old Toast

All files have been migrated from the old `@/hooks/use-toast` to the new `@/lib/toast` system. The API is similar but simplified:

**Before:**
\`\`\`tsx
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()
toast({ title: "Hello" })
\`\`\`

**After:**
\`\`\`tsx
import { toast } from "@/lib/toast"

toast({ title: "Hello" })
\`\`\`

## Files

- `/src/lib/toast.tsx` - Toast wrapper and configuration
- `/src/styles/toast.css` - Custom styling
- `/src/App.tsx` - ToastContainer integration
