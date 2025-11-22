import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Search, Eye } from "lucide-react"
import { format } from "date-fns"

interface AfaRegistration {
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

interface AfaResponse {
    registrations: AfaRegistration[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

const fetcher = (url: string): Promise<AfaResponse> => fetch(url).then((res) => res.json())

export default function AdminAfaRegistrationsPage() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedRegistration, setSelectedRegistration] = useState<AfaRegistration | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)

    const { data, error, isLoading } = useSWR<AfaResponse>(
        `/api/admin/afa-registrations?page=${page}&limit=20&search=${search}&status=${statusFilter}`,
        fetcher,
        { revalidateOnFocus: false }
    )

    const registrations = data?.registrations || []
    const totalPages = data?.pagination?.totalPages || 1

    const handleViewDetails = (registration: AfaRegistration) => {
        setSelectedRegistration(registration)
        setViewDialogOpen(true)
    }

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
            failed: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
        }
        return statusColors[status] || "bg-gray-100 text-gray-800"
    }

    const getPaymentStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            paid: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
            failed: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
        }
        return statusColors[status] || "bg-gray-100 text-gray-800"
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>AFA Registrations</CardTitle>
                    <CardDescription>
                        Manage and view all AFA SIM card registrations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by name, phone, town, or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Loading registrations...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-12 text-red-600">
                            Failed to load registrations. Please try again.
                        </div>
                    )}

                    {/* Table */}
                    {!isLoading && !error && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Full Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Phone
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Town
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                ID Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Amount
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Payment
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {registrations.map((registration) => (
                                            <tr key={registration.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="px-4 py-3 text-sm">{registration.full_name}</td>
                                                <td className="px-4 py-3 text-sm">{registration.phone_number}</td>
                                                <td className="px-4 py-3 text-sm">{registration.town}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    {registration.id_type.replace('_', ' ')}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    GHS {registration.amount.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <Badge className={getPaymentStatusBadge(registration.payment_status)}>
                                                        {registration.payment_status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <Badge className={getStatusBadge(registration.status)}>
                                                        {registration.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {format(new Date(registration.created_at), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(registration)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {registrations.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        No registrations found.
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Page {page} of {totalPages} ({data?.pagination.total} total)
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* View Details Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Registration Details</DialogTitle>
                        <DialogDescription>
                            Complete information for this AFA registration
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRegistration && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Full Name</p>
                                <p className="text-sm">{selectedRegistration.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                <p className="text-sm">{selectedRegistration.phone_number}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Town</p>
                                <p className="text-sm">{selectedRegistration.town}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Occupation</p>
                                <p className="text-sm">{selectedRegistration.occupation}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">ID Type</p>
                                <p className="text-sm">{selectedRegistration.id_type.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">ID Number</p>
                                <p className="text-sm">{selectedRegistration.id_number}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Amount</p>
                                <p className="text-sm">GHS {selectedRegistration.amount.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Payment Reference</p>
                                <p className="text-sm">{selectedRegistration.payment_reference || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Payment Status</p>
                                <Badge className={getPaymentStatusBadge(selectedRegistration.payment_status)}>
                                    {selectedRegistration.payment_status}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <Badge className={getStatusBadge(selectedRegistration.status)}>
                                    {selectedRegistration.status}
                                </Badge>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm font-medium text-gray-500">Registration Date</p>
                                <p className="text-sm">
                                    {format(new Date(selectedRegistration.created_at), 'PPpp')}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
