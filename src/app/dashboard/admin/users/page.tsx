import { GlassCard } from "@/components/ui/glass-card"
import { Users, Search, MoreHorizontal, Shield, Ban, Eye, Edit, Loader2, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useSWR, { mutate } from "swr"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/lib/toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface User {
    id: string
    name: string
    email: string
    phone: string
    role: string
    wallet_balance: number
    is_active: number
    created_at: string
}

interface UsersResponse {
    users: User[]
    pagination: {
        totalPages: number
    }
}

interface ErrorResponse {
    error: string
}

const fetcher = (url: string): Promise<UsersResponse> => fetch(url).then((res) => res.json())

export default function AdminUsersPage() {
    const [page, setPage] = useState(1)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
    const [newRole, setNewRole] = useState<string>("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [isCreditWalletOpen, setIsCreditWalletOpen] = useState(false)
    const [creditAmount, setCreditAmount] = useState("")

    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    const { data, error, isLoading } = useSWR<UsersResponse>(`/api/admin/users?page=${page}&limit=10&search=${debouncedSearch}`, fetcher, {
        revalidateOnFocus: false
    })

    const users: User[] = data?.users || []
    const totalPages = data?.pagination?.totalPages || 1

    const handleAction = (action: string, user: User) => {
        if (action === "Edit Role") {
            setSelectedUser(user)
            setNewRole(user.role)
            setIsEditRoleOpen(true)
        } else if (action === "Credit Wallet") {
            setSelectedUser(user)
            setCreditAmount("")
            setIsCreditWalletOpen(true)
        } else if (action === "Ban User") {
            toast({
                title: "Not Implemented",
                description: "Ban functionality is not yet available.",
                variant: "destructive"
            })
        } else {
            toast({
                title: "Action Triggered",
                description: `${action} for ${user.name}`,
            })
        }
    }

    const updateRole = async () => {
        if (!selectedUser) return
        setIsUpdating(true)
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: newRole
                })
            })

            if (!res.ok) {
                const err = await res.json() as ErrorResponse
                throw new Error(err.error || 'Failed to update role')
            }

            toast({
                title: "Success",
                description: "User role updated successfully.",
            })
            setIsEditRoleOpen(false)
            mutate(`/api/admin/users?page=${page}&limit=10&search=${debouncedSearch}`)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleBanUser = async (user: User) => {
        if (!confirm(`Are you sure you want to ${user.is_active ? 'ban' : 'unban'} ${user.name}?`)) return

        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_active: user.is_active ? 0 : 1
                })
            })

            if (!res.ok) {
                const err = await res.json() as ErrorResponse
                throw new Error(err.error || 'Failed to update user status')
            }

            toast({
                title: "Success",
                description: `User ${user.is_active ? 'banned' : 'unbanned'} successfully.`,
            })
            mutate(`/api/admin/users?page=${page}&limit=10&search=${debouncedSearch}`)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        }
    }

    const handleCreditWallet = async () => {
        if (!selectedUser || !creditAmount || isNaN(Number(creditAmount)) || Number(creditAmount) <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid positive amount.",
                variant: "destructive"
            })
            return
        }

        setIsUpdating(true)
        try {
            const res = await fetch('/api/admin/wallet/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    amount: Number(creditAmount),
                    type: 'credit',
                    description: 'Admin Manual Credit'
                })
            })

            if (!res.ok) {
                const err = await res.json() as ErrorResponse
                throw new Error(err.error || 'Failed to credit wallet')
            }

            toast({
                title: "Success",
                description: `Successfully credited GHS ${creditAmount} to ${selectedUser.name}.`,
            })
            setIsCreditWalletOpen(false)
            mutate(`/api/admin/users?page=${page}&limit=10&search=${debouncedSearch}`)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const UserActions = ({ user }: { user: User }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleAction("View Details", user)}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction("Edit Role", user)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Role
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction("Credit Wallet", user)}>
                    <CreditCard className="mr-2 h-4 w-4" /> Credit Wallet
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className={user.is_active ? "text-red-600" : "text-green-600"} onClick={() => handleBanUser(user)}>
                    <Ban className="mr-2 h-4 w-4" /> {user.is_active ? "Ban User" : "Unban User"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-medium">Manage Users & Agents</h3>
                    <p className="text-sm text-muted-foreground">
                        View and manage all registered users and agents.
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-[250px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search users..."
                            className="pl-9 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button>Add User</Button>
                </div>
            </div>

            {/* Desktop Table */}
            <GlassCard className="hidden md:block p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">Wallet</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-40" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                                                    <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.name || 'Unknown'}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                    user.role === 'agent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{user.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 font-medium">GHS {user.wallet_balance?.toFixed(2) || '0.00'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <UserActions user={user} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <GlassCard key={i} className="p-4">
                            <div className="flex items-center gap-4 mb-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </GlassCard>
                    ))
                ) : users.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No users found.</div>
                ) : (
                    users.map((user) => (
                        <GlassCard key={user.id} className="p-4">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                                        <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.name || 'Unknown'}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </div>
                                </div>
                                <UserActions user={user} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground text-xs">Role</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize mt-1
                                        ${user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                            user.role === 'agent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Wallet</p>
                                    <p className="font-medium mt-1">GHS {user.wallet_balance?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Phone</p>
                                    <p className="mt-1">{user.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Joined</p>
                                    <p className="mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
                <div className="text-xs text-muted-foreground">
                    Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Edit Role Dialog */}
            <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Role</DialogTitle>
                        <DialogDescription>
                            Change the role for {selectedUser?.name}. This will affect their permissions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                                Role
                            </Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="guest">Guest</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="agent">Agent</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditRoleOpen(false)} disabled={isUpdating}>
                            Cancel
                        </Button>
                        <Button onClick={updateRole} disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Credit Wallet Dialog */}
            <Dialog open={isCreditWalletOpen} onOpenChange={setIsCreditWalletOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Credit User Wallet</DialogTitle>
                        <DialogDescription>
                            Add funds to {selectedUser?.name}'s wallet manually.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="creditAmount">Amount (GHS)</Label>
                            <Input
                                id="creditAmount"
                                type="number"
                                placeholder="0.00"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreditWalletOpen(false)} disabled={isUpdating}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreditWallet} disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Credit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
