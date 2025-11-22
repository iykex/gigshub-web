"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { MessageSquare, Send, Users, UserCheck, List } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "@/lib/toast"
import { Loader2 } from "lucide-react"

export default function AdminSMSPage() {
    const [recipientType, setRecipientType] = useState("custom")
    const [customNumbers, setCustomNumbers] = useState("")
    const [message, setMessage] = useState("")
    const [isSending, setIsSending] = useState(false)

    const handleSend = async () => {
        if (!message.trim()) {
            toast({
                title: "Error",
                description: "Please enter a message to send.",
                variant: "destructive"
            })
            return
        }

        let recipients: string[] = []

        if (recipientType === "custom") {
            if (!customNumbers.trim()) {
                toast({
                    title: "Error",
                    description: "Please enter at least one phone number.",
                    variant: "destructive"
                })
                return
            }
            // Split by comma, newline, or space and clean up
            recipients = customNumbers.split(/[\s,]+/).filter(n => n.length > 0)
        } else {
            // For 'all_users' or 'all_agents', we'll let the backend handle fetching the numbers
            // But for now, the API expects a list of recipients.
            // Ideally, we should have an API endpoint that accepts a 'group' parameter.
            // Let's assume the backend can handle 'group' or we fetch them here.
            // Since we implemented a simple /api/admin/sms that takes 'recipients' array,
            // we might need to fetch users first if we want to send to all.
            // OR we update the API to handle groups.
            // Let's update the API logic in the frontend to fetch users if needed, or just send a flag.

            // Actually, for simplicity, let's just send the group name as a special recipient or update the API.
            // But I already wrote the API to take 'recipients'.
            // Let's fetch the users/agents first.

            try {
                const res = await fetch(`/api/admin/users?limit=1000`) // Fetch all (limit high)
                const data = await res.json()
                if (data.users) {
                    if (recipientType === "all_agents") {
                        recipients = data.users.filter((u: any) => u.role === 'agent' && u.phone).map((u: any) => u.phone)
                    } else {
                        recipients = data.users.filter((u: any) => u.phone).map((u: any) => u.phone)
                    }
                }
            } catch (e) {
                toast({
                    title: "Error",
                    description: "Failed to fetch recipient list.",
                    variant: "destructive"
                })
                return
            }
        }

        if (recipients.length === 0) {
            toast({
                title: "Error",
                description: "No valid recipients found.",
                variant: "destructive"
            })
            return
        }

        setIsSending(true)
        try {
            const res = await fetch('/api/admin/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients,
                    message
                })
            })

            if (!res.ok) {
                throw new Error('Failed to send SMS')
            }

            const data = await res.json()

            toast({
                title: "Success",
                description: `Message sent to ${data.count || recipients.length} recipients.`,
            })

            setMessage("")
            setCustomNumbers("")

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send SMS. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Bulk SMS Campaign</h3>
                <p className="text-sm text-muted-foreground">
                    Send promotional SMS messages to user groups.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <GlassCard className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label>Recipient Group</Label>
                        <Select value={recipientType} onValueChange={setRecipientType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="custom">
                                    <div className="flex items-center gap-2">
                                        <List className="w-4 h-4" />
                                        <span>Custom List</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="all_users">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>All Users</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="all_agents">
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="w-4 h-4" />
                                        <span>All Agents</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {recipientType === "custom" && (
                        <div className="space-y-2">
                            <Label>Phone Numbers</Label>
                            <Textarea
                                placeholder="Enter phone numbers separated by commas or new lines..."
                                className="min-h-[100px] font-mono text-sm"
                                value={customNumbers}
                                onChange={(e) => setCustomNumbers(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                E.g., 0241234567, 0501234567
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            placeholder="Type your message here..."
                            className="min-h-[150px]"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={160}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1 SMS = 160 characters</span>
                            <span>{message.length}/160</span>
                        </div>
                    </div>

                    <Button className="w-full" onClick={handleSend} disabled={isSending}>
                        {isSending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Broadcast
                            </>
                        )}
                    </Button>
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard className="p-6 bg-muted/30">
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Preview
                        </h4>
                        <div className="bg-white dark:bg-gray-950 border rounded-2xl p-4 max-w-[300px] shadow-sm">
                            <p className="text-sm whitespace-pre-wrap break-words">
                                {message || "Your message preview will appear here..."}
                            </p>
                            <div className="mt-2 text-[10px] text-muted-foreground text-right">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h4 className="font-medium mb-2">Campaign Tips</h4>
                        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                            <li>Keep messages concise and clear.</li>
                            <li>Include a call to action (e.g., "Visit now").</li>
                            <li>Avoid using special characters that might break SMS encoding.</li>
                            <li>Messages are sent instantly and cannot be undone.</li>
                        </ul>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}
