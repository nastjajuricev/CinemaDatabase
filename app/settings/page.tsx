import type { Metadata } from "next"
import DropboxIntegration from "@/components/dropbox-integration"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Settings | Film Database",
  description: "Configure your film database settings",
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your film database preferences</p>
      </div>

      <div className="grid gap-6">
        <DropboxIntegration />

        <Card>
          <CardHeader>
            <CardTitle>Display Preferences</CardTitle>
            <CardDescription>Customize how your film collection is displayed</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Display preferences would go here */}
            <p className="text-sm text-muted-foreground">Display preferences settings coming soon.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your film database</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Data management options would go here */}
            <p className="text-sm text-muted-foreground">Data management options coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

