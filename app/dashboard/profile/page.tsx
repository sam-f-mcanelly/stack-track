"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UpgradeModal } from "@/components/upgrade-modal"

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  email: z
    .string()
    .min(1, {
      message: "This field cannot be empty.",
    })
    .email("This is not a valid email."),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  username: "johndoe",
  email: "johndoe@example.com",
}

export default function ProfilePage() {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })

  function onSubmit(data: ProfileFormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight gradient-bg text-transparent bg-clip-text">Profile</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your account settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormDescription>This is your public display name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe@example.com" {...field} />
                    </FormControl>
                    <FormDescription>This is the email associated with your account.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Update profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Current Plan: Free</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Plan</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Free</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      <li>Basic portfolio tracking</li>
                      <li>Limited transaction history</li>
                      <li>Basic tax reporting</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-right">$0/month</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Pro</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      <li>Advanced portfolio analytics</li>
                      <li>Unlimited transaction history</li>
                      <li>Advanced tax reporting</li>
                      <li>API access</li>
                      <li>Priority support</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-right">$19.99/month</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Button onClick={() => setIsUpgradeModalOpen(true)}>Upgrade to Pro</Button>
          </div>
        </CardContent>
      </Card>
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </div>
  )
}

