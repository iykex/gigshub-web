import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { Link } from "react-router-dom"

export function FloatingOrdersIcon() {
    const { totalItems } = useCart()

    return (
        <AnimatePresence>
            {totalItems > 0 && (
                <Link to="/checkout">
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 cursor-pointer"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                                <ShoppingBag className="w-8 h-8 text-white" />
                            </div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                            >
                                <span className="text-white font-bold text-sm">
                                    {totalItems}
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                </Link>
            )}
        </AnimatePresence>
    )
}
