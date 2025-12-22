import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Building2,
  DollarSign,
  Truck,
  Bell,
  Database,
  Users,
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div>
      <Header
        title="Settings"
        subtitle="Configure your waste diversion system"
      />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Company Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-emerald-600" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                defaultValue="Soil Seed & Water"
                disabled
              />
              <Input
                label="Program Name"
                defaultValue="Waste Diversion Program"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Email"
                type="email"
                defaultValue="operations@soilseedwater.com"
              />
              <Input
                label="Contact Phone"
                type="tel"
                defaultValue="(555) 123-4567"
              />
            </div>
            <Button variant="outline">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Billing Defaults */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
              Billing Defaults
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Default Tipping Fee ($/ton)"
                type="number"
                step="0.01"
                defaultValue="45.00"
              />
              <Input
                label="Contamination Surcharge (%)"
                type="number"
                defaultValue="25"
              />
              <Input
                label="Rush Pickup Surcharge (%)"
                type="number"
                defaultValue="15"
              />
            </div>
            <Button variant="outline">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Processing Sites */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Truck className="h-5 w-5 mr-2 text-emerald-600" />
              Processing Sites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Main Composting Facility</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-600">
                123 Compost Lane, Greenville, CA 94000
              </p>
            </div>
            <Button variant="outline" size="sm">
              Add Processing Site
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Bell className="h-5 w-5 mr-2 text-emerald-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                  defaultChecked
                />
                <span className="text-sm">
                  Email notification for new intake requests
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                  defaultChecked
                />
                <span className="text-sm">
                  Daily summary of upcoming pickups/deliveries
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                  defaultChecked
                />
                <span className="text-sm">
                  Alert on contamination issues
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                />
                <span className="text-sm">Weekly performance report</span>
              </label>
            </div>
            <Button variant="outline">Save Preferences</Button>
          </CardContent>
        </Card>

        {/* Waste Types Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2 text-emerald-600" />
              Waste Type Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Configure accepted waste types and their default rates.
            </p>
            <div className="space-y-2">
              {[
                { name: "Food Waste", rate: 45, status: "Accepted" },
                { name: "Green Waste", rate: 35, status: "Accepted" },
                { name: "Wood Chips", rate: 30, status: "Accepted" },
                { name: "Manure", rate: 25, status: "Accepted" },
                { name: "Brewery Grain", rate: 40, status: "Accepted" },
              ].map((type) => (
                <div
                  key={type.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{type.name}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      ${type.rate}/ton
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {type.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4">
              Manage Waste Types
            </Button>
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-emerald-600" />
              Users & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage team members and their access levels.
            </p>
            <div className="space-y-2">
              {[
                { name: "Rodolfo Alvarez", role: "Admin", email: "rodolfo@ssw.com" },
                { name: "Operations Team", role: "Operator", email: "ops@ssw.com" },
              ].map((user) => (
                <div
                  key={user.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{user.name}</span>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      user.role === "Admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4">
              Invite User
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2 text-emerald-600" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Export All Data</p>
                <p className="text-sm text-gray-500">
                  Download all intakes, clients, and reports as CSV
                </p>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Import Data</p>
                <p className="text-sm text-gray-500">
                  Bulk import clients or historical data
                </p>
              </div>
              <Button variant="outline" size="sm">
                Import
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
