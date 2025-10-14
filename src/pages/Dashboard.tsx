import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [installmentPayments, setInstallmentPayments] = useState<any[]>([]);
  const [installmentPlans, setInstallmentPlans] = useState<any[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [bookingsData, guestsData, leadsData, paymentsData, plansData, transactionsData] =
        await Promise.all([
          supabase.from("bookings").select("*"),
          supabase.from("guests").select("*"),
          supabase.from("leads").select("*"),
          supabase.from("installment_payments").select("*"),
          supabase.from("installment_plans").select("*"),
          supabase.from("payment_transactions").select("*"),
        ]);

      if (bookingsData.data) setBookings(bookingsData.data);
      if (guestsData.data) setGuests(guestsData.data);
      if (leadsData.data) setLeads(leadsData.data);
      if (paymentsData.data) setInstallmentPayments(paymentsData.data);
      if (plansData.data) setInstallmentPlans(plansData.data);
      if (transactionsData.data) setPaymentTransactions(transactionsData.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "No data",
        description: `No data available for ${filename}`,
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            const stringValue =
              typeof value === "object" ? JSON.stringify(value) : String(value || "");
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `${filename} downloaded successfully`,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "MO1345") {
      setIsAuthenticated(true);
      toast({
        title: "Welcome Michael",
        description: "Access granted to the dashboard",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Dashboard Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <div className="flex gap-3">
            <Link to="/cancel">
              <Button variant="destructive">Cancel Booking</Button>
            </Link>
            <Link to="/add-more">
              <Button>Add More</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bookings ({bookings.length})</CardTitle>
            <Button onClick={() => downloadCSV(bookings, "bookings")} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Package</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Payment Plan</th>
                    <th className="text-left p-2">Guests</th>
                    <th className="text-left p-2">Flight</th>
                    <th className="text-left p-2">Add-ons</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 10).map((booking) => (
                    <tr key={booking.id} className="border-b">
                      <td className="p-2">{booking.id}</td>
                      <td className="p-2">{booking.user_email}</td>
                      <td className="p-2">{booking.package_name}</td>
                      <td className="p-2">€{booking.total_amount}</td>
                      <td className="p-2">{booking.payment_status}</td>
                      <td className="p-2">{booking.payment_plan}</td>
                      <td className="p-2">{booking.number_of_guests}</td>
                      <td className="p-2">{booking.flight_number || 'N/A'}</td>
                      <td className="p-2">
                        {booking.add_ons && Array.isArray(booking.add_ons) && booking.add_ons.length > 0
                          ? booking.add_ons.map((addon: any) => addon.name || addon).join(', ')
                          : 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing 10 of {bookings.length} records
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Guests ({guests.length})</CardTitle>
            <Button onClick={() => downloadCSV(guests, "guests")} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">With Lead Name</th>
                    <th className="text-left p-2">Booking ID</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.slice(0, 10).map((guest) => {
                    const matchingLead = leads.find(lead => 
                      lead.name?.toLowerCase() === guest.name?.toLowerCase()
                    );
                    return (
                      <tr key={guest.id} className="border-b">
                        <td className="p-2">{guest.name}</td>
                        <td className="p-2">{guest.email}</td>
                        <td className="p-2">{guest.phone}</td>
                        <td className="p-2">{matchingLead?.with_lead_name || 'N/A'}</td>
                        <td className="p-2">{guest.booking_id}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {guests.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing 10 of {guests.length} records
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Leads ({leads.length})</CardTitle>
            <Button onClick={() => downloadCSV(leads, "leads")} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">With Lead Name</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 10).map((lead) => (
                    <tr key={lead.id} className="border-b">
                      <td className="p-2">{lead.name}</td>
                      <td className="p-2">{lead.email}</td>
                      <td className="p-2">{lead.phone}</td>
                      <td className="p-2">{lead.status}</td>
                      <td className="p-2">{lead.role || 'N/A'}</td>
                      <td className="p-2">{lead.with_lead_name || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leads.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing 10 of {leads.length} records
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Installment Payments ({installmentPayments.length})</CardTitle>
            <Button onClick={() => downloadCSV(installmentPayments, "installment_payments")} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Plan ID</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {installmentPayments.slice(0, 10).map((payment) => (
                    <tr key={payment.id} className="border-b">
                      <td className="p-2">{payment.id}</td>
                      <td className="p-2">{payment.plan_id}</td>
                      <td className="p-2">€{(payment.amount / 100).toFixed(2)}</td>
                      <td className="p-2">{payment.status}</td>
                      <td className="p-2">{new Date(payment.due_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {installmentPayments.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing 10 of {installmentPayments.length} records
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Installment Plans ({installmentPlans.length})</CardTitle>
            <Button onClick={() => downloadCSV(installmentPlans, "installment_plans")} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Total Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Package</th>
                  </tr>
                </thead>
                <tbody>
                  {installmentPlans.slice(0, 10).map((plan) => (
                    <tr key={plan.id} className="border-b">
                      <td className="p-2">{plan.id}</td>
                      <td className="p-2">{plan.customer_name || 'N/A'}</td>
                      <td className="p-2">{plan.customer_email}</td>
                      <td className="p-2">{plan.customer_phone || 'N/A'}</td>
                      <td className="p-2">€{(plan.total_amount / 100).toFixed(2)}</td>
                      <td className="p-2">{plan.status}</td>
                      <td className="p-2">{plan.package_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {installmentPlans.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing 10 of {installmentPlans.length} records
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment Transactions ({paymentTransactions.length})</CardTitle>
            <Button onClick={() => downloadCSV(paymentTransactions, "payment_transactions")} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Booking ID</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Provider</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentTransactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id} className="border-b">
                      <td className="p-2">{transaction.id}</td>
                      <td className="p-2">{transaction.booking_id}</td>
                      <td className="p-2">€{transaction.amount}</td>
                      <td className="p-2">{transaction.status}</td>
                      <td className="p-2">{transaction.payment_provider}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paymentTransactions.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing 10 of {paymentTransactions.length} records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
