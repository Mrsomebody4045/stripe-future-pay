import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddMore() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"add-guest" | "edit-addons">("add-guest");

  // Add Guest form state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestDOB, setGuestDOB] = useState("");
  const [packageName, setPackageName] = useState("");
  const [bookingId, setBookingId] = useState("");

  // Edit Add-ons form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [guestFound, setGuestFound] = useState<any>(null);
  const [addons, setAddons] = useState({
    quad: false,
    ski: false,
    snowboard: false,
    lessons: false,
  });

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const guestData: any = {
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
        date_of_birth: guestDOB,
      };

      // Only add booking_id if it's provided
      if (bookingId.trim()) {
        guestData.booking_id = bookingId;
      }

      const { data, error } = await supabase.from("guests").insert(guestData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Guest added successfully",
      });

      // Reset form
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setGuestDOB("");
      setPackageName("");
      setBookingId("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFindGuest = async () => {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("name", editName)
        .eq("email", editEmail)
        .single();

      if (error) throw error;

      if (data) {
        setGuestFound(data);
        const currentAddons = (data.add_ons as string[]) || [];
        setAddons({
          quad: currentAddons.includes("quad"),
          ski: currentAddons.includes("ski"),
          snowboard: currentAddons.includes("snowboard"),
          lessons: currentAddons.includes("lessons"),
        });
        toast({
          title: "Guest found",
          description: `Found guest: ${data.name}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Guest not found or error occurred",
        variant: "destructive",
      });
      setGuestFound(null);
    }
  };

  const handleUpdateAddons = async () => {
    if (!guestFound) return;

    const selectedAddons = Object.entries(addons)
      .filter(([_, selected]) => selected)
      .map(([name, _]) => name);

    try {
      const { error } = await supabase
        .from("guests")
        .update({ add_ons: selectedAddons })
        .eq("id", guestFound.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Add-ons updated successfully",
      });

      // Reset form
      setEditName("");
      setEditEmail("");
      setGuestFound(null);
      setAddons({ quad: false, ski: false, snowboard: false, lessons: false });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold mb-8">Add More</h1>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "add-guest" ? "default" : "outline"}
            onClick={() => setActiveTab("add-guest")}
          >
            Add Guest
          </Button>
          <Button
            variant={activeTab === "edit-addons" ? "default" : "outline"}
            onClick={() => setActiveTab("edit-addons")}
          >
            Edit Add-ons
          </Button>
        </div>

        {activeTab === "add-guest" && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Guest</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGuest} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={guestDOB}
                    onChange={(e) => setGuestDOB(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="package">Package Name</Label>
                  <Select value={packageName} onValueChange={setPackageName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="package-185">Package €185</SelectItem>
                      <SelectItem value="package-245">Package €245</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="booking-id">Booking ID (Optional)</Label>
                  <Input
                    id="booking-id"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="Enter booking ID (optional)"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add Guest
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "edit-addons" && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Guest Add-ons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>

                <Button onClick={handleFindGuest} className="w-full">
                  Find Guest
                </Button>
              </div>

              {guestFound && (
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-semibold">
                    Select Add-ons for {guestFound.name}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="quad"
                        checked={addons.quad}
                        onCheckedChange={(checked) =>
                          setAddons({ ...addons, quad: checked as boolean })
                        }
                      />
                      <Label htmlFor="quad">Quad</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ski"
                        checked={addons.ski}
                        onCheckedChange={(checked) =>
                          setAddons({ ...addons, ski: checked as boolean })
                        }
                      />
                      <Label htmlFor="ski">Ski</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="snowboard"
                        checked={addons.snowboard}
                        onCheckedChange={(checked) =>
                          setAddons({ ...addons, snowboard: checked as boolean })
                        }
                      />
                      <Label htmlFor="snowboard">Snowboard</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lessons"
                        checked={addons.lessons}
                        onCheckedChange={(checked) =>
                          setAddons({ ...addons, lessons: checked as boolean })
                        }
                      />
                      <Label htmlFor="lessons">Lessons</Label>
                    </div>
                  </div>

                  <Button onClick={handleUpdateAddons} className="w-full">
                    Update Add-ons
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
