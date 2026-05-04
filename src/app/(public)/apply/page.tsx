"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, ClipboardList, Calendar, User, Users, HeartPulse, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ApplicationForm = {
  parentFirstName: string;
  parentLastName: string;
  relationshipToChild: string;
  email: string;
  phone: string;

  childFirstName: string;
  childLastName: string;
  childDob: string;
  childGender: string;

  desiredProgram: string;
  desiredStartDate: string;
  careSchedule: string;
  daysNeeded: string;

  homeAddress: string;
  city: string;
  state: string;
  zip: string;

  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;

  allergiesMedical: string;
  medications: string;
  specialNotes: string;
  previousSchoolCare: string;

  tourCompleted: string;
  referredBy: string;

  agreementAccepted: boolean;
};

const initialForm: ApplicationForm = {
  parentFirstName: "",
  parentLastName: "",
  relationshipToChild: "",
  email: "",
  phone: "",

  childFirstName: "",
  childLastName: "",
  childDob: "",
  childGender: "",

  desiredProgram: "",
  desiredStartDate: "",
  careSchedule: "",
  daysNeeded: "",

  homeAddress: "",
  city: "",
  state: "",
  zip: "",

  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",

  allergiesMedical: "",
  medications: "",
  specialNotes: "",
  previousSchoolCare: "",

  tourCompleted: "no",
  referredBy: "",

  agreementAccepted: false,
};

function calculateAge(dob: string) {
  if (!dob) return "";
  const birth = new Date(`${dob}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age >= 0 ? String(age) : "";
}

export default function ApplyPage() {
  const [form, setForm] = useState<ApplicationForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const childAge = useMemo(() => calculateAge(form.childDob), [form.childDob]);

  const handleChange = <K extends keyof ApplicationForm>(
    key: K,
    value: ApplicationForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredFields: Array<keyof ApplicationForm> = [
      "parentFirstName",
      "parentLastName",
      "relationshipToChild",
      "email",
      "phone",
      "childFirstName",
      "childLastName",
      "childDob",
      "desiredProgram",
      "desiredStartDate",
      "careSchedule",
      "daysNeeded",
      "homeAddress",
      "city",
      "state",
      "zip",
      "emergencyContactName",
      "emergencyContactPhone",
      "emergencyContactRelationship",
    ];

    const missing = requiredFields.some((field) => !String(form[field]).trim());

    if (missing) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (!form.agreementAccepted) {
      toast.error("Please confirm the application agreement before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);

      const notes = [
        `Relationship: ${form.relationshipToChild}`,
        `Care Schedule: ${form.careSchedule}`,
        `Days Needed: ${form.daysNeeded}`,
        `Address: ${form.homeAddress}, ${form.city}, ${form.state} ${form.zip}`,
        `Emergency Contact: ${form.emergencyContactName} (${form.emergencyContactRelationship}) - ${form.emergencyContactPhone}`,
        form.allergiesMedical ? `Allergies/Medical: ${form.allergiesMedical}` : "",
        form.medications ? `Medications: ${form.medications}` : "",
        form.previousSchoolCare ? `Previous Care/School: ${form.previousSchoolCare}` : "",
        form.specialNotes ? `Special Notes: ${form.specialNotes}` : "",
        form.referredBy ? `Referred By: ${form.referredBy}` : "",
        `Tour Requested: ${form.tourCompleted === "yes" ? "Yes" : "No"}`,
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentFirstName: form.parentFirstName,
          parentLastName: form.parentLastName,
          email: form.email,
          phone: form.phone,
          childFirstName: form.childFirstName,
          childLastName: form.childLastName,
          childDob: form.childDob,
          desiredProgram: form.desiredProgram,
          desiredStartDate: form.desiredStartDate,
          tourCompleted: form.tourCompleted,
          notes,
        }),
      });

      if (!res.ok) {
        let message = "Submission failed";
        try {
          const data = await res.json();
          message = data.error || message;
        } catch {}
        throw new Error(message);
      }

      toast.success("Application submitted! Our admissions team will be in touch soon.");
      setForm(initialForm);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while submitting the application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-[#2888B8] to-[#1078A8] py-16 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <Badge className="mb-4 bg-white/15 text-white hover:bg-white/15">
            Admissions Application
          </Badge>
          <h1 className="mb-4 text-4xl font-bold lg:text-5xl">
            Apply to Gifted & Beyond Daycare
          </h1>
          <p className="max-w-3xl text-lg text-white/90">
            Submit this application and our admissions team will review your
            child&apos;s placement, schedule needs, and next steps.
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-gray-50 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-start gap-3 p-5">
                <ClipboardList className="mt-0.5 text-[#2888B8]" size={22} />
                <div>
                  <h3 className="font-semibold text-[#002040]">Complete Application</h3>
                  <p className="text-sm text-gray-600">
                    Submit parent, child, and care details.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-start gap-3 p-5">
                <Calendar className="mt-0.5 text-[#489858]" size={22} />
                <div>
                  <h3 className="font-semibold text-[#002040]">Admissions Review</h3>
                  <p className="text-sm text-gray-600">
                    Our team reviews placement and availability.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-start gap-3 p-5">
                <CheckCircle2 className="mt-0.5 text-[#E8A018]" size={22} />
                <div>
                  <h3 className="font-semibold text-[#002040]">Next Steps</h3>
                  <p className="text-sm text-gray-600">
                    You&apos;ll receive updates from the admissions team.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <User className="text-[#2888B8]" size={22} />
                  <h2 className="text-2xl font-bold text-[#002040]">
                    Parent / Guardian Information
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="parentFirstName">First Name *</Label>
                    <Input
                      id="parentFirstName"
                      value={form.parentFirstName}
                      onChange={(e) => handleChange("parentFirstName", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="parentLastName">Last Name *</Label>
                    <Input
                      id="parentLastName"
                      value={form.parentLastName}
                      onChange={(e) => handleChange("parentLastName", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="relationshipToChild">Relationship to Child *</Label>
                    <Input
                      id="relationshipToChild"
                      placeholder="Mother, Father, Guardian, etc."
                      value={form.relationshipToChild}
                      onChange={(e) =>
                        handleChange("relationshipToChild", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Users className="text-[#489858]" size={22} />
                  <h2 className="text-2xl font-bold text-[#002040]">
                    Child Information
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="childFirstName">Child First Name *</Label>
                    <Input
                      id="childFirstName"
                      value={form.childFirstName}
                      onChange={(e) => handleChange("childFirstName", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="childLastName">Child Last Name *</Label>
                    <Input
                      id="childLastName"
                      value={form.childLastName}
                      onChange={(e) => handleChange("childLastName", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="childDob">Date of Birth *</Label>
                    <Input
                      id="childDob"
                      type="date"
                      value={form.childDob}
                      onChange={(e) => handleChange("childDob", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Current Age</Label>
                    <Input value={childAge} readOnly placeholder="Auto-calculated" />
                  </div>

                  <div>
                    <Label htmlFor="childGender">Gender</Label>
                    <Select
                      value={form.childGender}
                      onValueChange={(value) => handleChange("childGender", value)}
                    >
                      <SelectTrigger id="childGender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="prefer-not-to-say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="previousSchoolCare">Previous School / Care</Label>
                    <Input
                      id="previousSchoolCare"
                      placeholder="Previous daycare, preschool, nanny, etc."
                      value={form.previousSchoolCare}
                      onChange={(e) =>
                        handleChange("previousSchoolCare", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Calendar className="text-[#E8A018]" size={22} />
                  <h2 className="text-2xl font-bold text-[#002040]">
                    Enrollment Details
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="desiredProgram">Desired Program *</Label>
                    <Select
                      value={form.desiredProgram}
                      onValueChange={(value) =>
                        handleChange("desiredProgram", value)
                      }
                    >
                      <SelectTrigger id="desiredProgram">
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infant-care">Infant Care</SelectItem>
                        <SelectItem value="toddler">Toddler Program</SelectItem>
                        <SelectItem value="preschool">Preschool</SelectItem>
                        <SelectItem value="pre-k">Pre-K</SelectItem>
                        <SelectItem value="before-after-school">
                          Before & After School
                        </SelectItem>
                        <SelectItem value="summer-camp">Summer Camp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="desiredStartDate">Desired Start Date *</Label>
                    <Input
                      id="desiredStartDate"
                      type="date"
                      value={form.desiredStartDate}
                      onChange={(e) =>
                        handleChange("desiredStartDate", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="careSchedule">Care Schedule *</Label>
                    <Select
                      value={form.careSchedule}
                      onValueChange={(value) => handleChange("careSchedule", value)}
                    >
                      <SelectTrigger id="careSchedule">
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full Time</SelectItem>
                        <SelectItem value="part-time">Part Time</SelectItem>
                        <SelectItem value="before-school">Before School</SelectItem>
                        <SelectItem value="after-school">After School</SelectItem>
                        <SelectItem value="flex-schedule">Flexible Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="daysNeeded">Days Needed *</Label>
                    <Input
                      id="daysNeeded"
                      placeholder="e.g. Monday–Friday"
                      value={form.daysNeeded}
                      onChange={(e) => handleChange("daysNeeded", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <ShieldCheck className="text-[#2888B8]" size={22} />
                  <h2 className="text-2xl font-bold text-[#002040]">
                    Address & Emergency Contact
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="homeAddress">Home Address *</Label>
                    <Input
                      id="homeAddress"
                      value={form.homeAddress}
                      onChange={(e) => handleChange("homeAddress", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={form.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP *</Label>
                      <Input
                        id="zip"
                        value={form.zip}
                        onChange={(e) => handleChange("zip", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emergencyContactName">
                      Emergency Contact Name *
                    </Label>
                    <Input
                      id="emergencyContactName"
                      value={form.emergencyContactName}
                      onChange={(e) =>
                        handleChange("emergencyContactName", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyContactPhone">
                      Emergency Contact Phone *
                    </Label>
                    <Input
                      id="emergencyContactPhone"
                      value={form.emergencyContactPhone}
                      onChange={(e) =>
                        handleChange("emergencyContactPhone", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyContactRelationship">
                      Emergency Contact Relationship *
                    </Label>
                    <Input
                      id="emergencyContactRelationship"
                      value={form.emergencyContactRelationship}
                      onChange={(e) =>
                        handleChange(
                          "emergencyContactRelationship",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <HeartPulse className="text-[#E05830]" size={22} />
                  <h2 className="text-2xl font-bold text-[#002040]">
                    Health & Additional Notes
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="allergiesMedical">
                      Allergies / Medical Conditions
                    </Label>
                    <Textarea
                      id="allergiesMedical"
                      rows={3}
                      value={form.allergiesMedical}
                      onChange={(e) =>
                        handleChange("allergiesMedical", e.target.value)
                      }
                      placeholder="List any allergies, diagnoses, or health concerns."
                    />
                  </div>

                  <div>
                    <Label htmlFor="medications">Current Medications</Label>
                    <Textarea
                      id="medications"
                      rows={3}
                      value={form.medications}
                      onChange={(e) => handleChange("medications", e.target.value)}
                      placeholder="Include medication details if applicable."
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialNotes">Additional Notes</Label>
                    <Textarea
                      id="specialNotes"
                      rows={4}
                      value={form.specialNotes}
                      onChange={(e) => handleChange("specialNotes", e.target.value)}
                      placeholder="Anything else our admissions team should know?"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="tourCompleted">Would you like to schedule a tour?</Label>
                      <Select
                        value={form.tourCompleted}
                        onValueChange={(value) =>
                          handleChange("tourCompleted", value)
                        }
                      >
                        <SelectTrigger id="tourCompleted">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="referredBy">Referred By</Label>
                      <Input
                        id="referredBy"
                        placeholder="Friend, online search, social media, etc."
                        value={form.referredBy}
                        onChange={(e) => handleChange("referredBy", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-bold text-[#002040]">
                  Application Agreement
                </h2>

                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                  By submitting this application, I confirm that the information
                  provided is accurate to the best of my knowledge. I understand
                  that submission does not guarantee enrollment and that the
                  admissions team may contact me for additional documents,
                  clarification, or scheduling updates.
                </div>

                <label className="mt-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.agreementAccepted}
                    onChange={(e) =>
                      handleChange("agreementAccepted", e.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    I understand and agree to the application terms. *
                  </span>
                </label>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#2888B8] hover:bg-[#1078A8]"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>

                  <Button type="button" variant="outline" asChild>
                    <Link href="/contact">Contact Admissions</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </section>
    </div>
  );
}