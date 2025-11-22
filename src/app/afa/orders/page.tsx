import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Eye, FileText, Calendar, User, Phone, MapPin, Briefcase, CreditCard, Hash } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"

interface AfaOrder {
    id: number
    full_name: string
    phone_number: string
    town: string
    occupation: string
    id_number: string
    id_type: string
    package_id: number
    amount: number
    payment_reference: string | null
    payment_status: string
    status: string
    created_at: string
}

interface AfaOrdersResponse {
    orders: AfaOrder[]
    total: number
}

const fetcher = (url: string): Promise<AfaOrdersResponse> => fetch(url).then((res) => res.json())

export default function AfaOrdersPage() {
    const [selectedOrder, setSelectedOrder] = useState<AfaOrder | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)

    const { data, error, isLoading } = useSWR<AfaOrdersResponse>(
        '/api/afa/my-orders',
        fetcher,
        { revalidateOnFocus: false }
    )

    const orders = data?.orders || []

    const handleViewDetails = (order: AfaOrder) => {
        setSelectedOrder(order)
        setViewDialogOpen(true)
    }

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
            completed: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300", label: "Completed" },
            pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300", label: "Pending" },
            failed: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300", label: "Failed" }
        }
        const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", label: status }
        return <Badge className={config.color}>{config.label}</Badge>
    }

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
            paid: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300", label: "Paid" },
            pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300", label: "Pending Payment" },
            failed: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300", label: "Payment Failed" }
        }
        const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", label: status }
        return <Badge className={config.color}>{config.label}</Badge>
    }

    const formatIdType = (idType: string) => {
        return idType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My AFA Registrations</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    View your AFA SIM card registration history
                </p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-yellow-600" />
                    <span className="ml-3 text-lg">Loading your registrations...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <Card className="border-red-200 dark:border-red-900">
                    <CardContent className="pt-6">
                        <div className="text-center text-red-600 dark:text-red-400">
                            <p className="font-semibold">Failed to load registrations</p>
                            <p className="text-sm mt-1">Please try again later</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Orders List */}
            {!isLoading && !error && (
                <>
                    {orders.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Registrations Yet</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        You haven't registered any AFA SIM cards yet.
                                    </p>
                                    <Button
                                        onClick={() => window.location.href = '/stores/afa-registration'}
                                        className="bg-yellow-600 hover:bg-yellow-700"
                                    >
                                        Register Now
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {orders.map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-200 dark:border-yellow-900/30">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{order.full_name}</CardTitle>
                                                    <CardDescription className="flex items-center gap-1 mt-1">
                                                        <Phone className="h-3 w-3" />
                                                        {order.phone_number}
                                                    </CardDescription>
                                                </div>
                                                {getStatusBadge(order.status)}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Amount</span>
                                                    <span className="font-semibold">GHS {order.amount.toFixed(2)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Payment</span>
                                                    {getPaymentStatusBadge(order.payment_status)}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full mt-2"
                                                    onClick={() => handleViewDetails(order)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Summary */}
                    {orders.length > 0 && (
                        <Card className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                            Total Registrations
                                        </p>
                                        <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                                            {orders.length}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                            Completed
                                        </p>
                                        <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                                            {orders.filter(o => o.status === 'completed').length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* View Details Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-yellow-600" />
                            Registration Details
                        </DialogTitle>
                        <DialogDescription>
                            Complete information for your AFA SIM card registration
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Status Section */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Registration Status</p>
                                    {getStatusBadge(selectedOrder.status)}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment Status</p>
                                    {getPaymentStatusBadge(selectedOrder.payment_status)}
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                                        <p className="text-sm font-semibold">{selectedOrder.full_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                                        <p className="text-sm font-semibold flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {selectedOrder.phone_number}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Town</p>
                                        <p className="text-sm font-semibold flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {selectedOrder.town}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Occupation</p>
                                        <p className="text-sm font-semibold flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" />
                                            {selectedOrder.occupation}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ID Information */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    Identification
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Type</p>
                                        <p className="text-sm font-semibold">{formatIdType(selectedOrder.id_type)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Number</p>
                                        <p className="text-sm font-semibold font-mono">{selectedOrder.id_number}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Payment Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</p>
                                        <p className="text-lg font-bold text-yellow-600">
                                            GHS {selectedOrder.amount.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Reference</p>
                                        <p className="text-sm font-mono">
                                            {selectedOrder.payment_reference || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</p>
                                        <p className="text-sm flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(selectedOrder.created_at), 'PPpp')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            {selectedOrder.status === 'pending' && selectedOrder.payment_status === 'pending' && (
                                <div className="pt-4 border-t">
                                    <Button
                                        className="w-full bg-yellow-600 hover:bg-yellow-700"
                                        onClick={() => {
                                            // Redirect to payment
                                            window.location.href = '/wallet/topup'
                                        }}
                                    >
                                        Complete Payment
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
