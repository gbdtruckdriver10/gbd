"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
};

const initialForm: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  inquiryType: "",
  message: "",
};

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitInquiry(data: ContactFormData) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to submit inquiry");
  }

  function validate(data: ContactFormData) {
    if (!data.inquiryType) {
      toast.error("Please select an inquiry type.");
      return false;
    }

    const digits = data.phone.replace(/\D/g, "");
    if (digits.length < 10) {
      toast.error("Please enter a valid phone number.");
      return false;
    }

    if (data.message.trim().length < 10) {
      toast.error("Please add a little more detail in your message.");
      return false;
    }

    return true;
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate(formData)) return;

    try {
      setIsSubmitting(true);
      await submitInquiry(formData);

      toast.success("Thank you! We'll be in touch within 24 hours.");
      setFormData(initialForm);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-[#2888B8] to-[#1078A8] text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Get in touch to schedule a tour, start enrollment, or ask questions.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-16">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.05]"
          style={{ backgroundImage: "url('/contact-bg.jpg')" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-[#2888B8]/5" aria-hidden="true" />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[#002040] mb-6">
                    Send Us a Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <Label htmlFor="inquiryType">Inquiry Type *</Label>
                        <Select
                          value={formData.inquiryType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, inquiryType: value })
                          }
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tour">Schedule a Tour</SelectItem>
                            <SelectItem value="enrollment">
                              Enrollment Application
                            </SelectItem>
                            <SelectItem value="programs">
                              Program Information
                            </SelectItem>
                            <SelectItem value="general">
                              General Question
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Tell us about your needs and how we can help..."
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#2888B8] hover:bg-[#1078A8]"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#002040] mb-4">
                    Contact Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin
                        className="text-[#2888B8] flex-shrink-0 mt-1"
                        size={20}
                      />
                      <div>
                        <p className="font-medium text-[#002040]">Address</p>
                        <p className="text-sm text-gray-600">
                          123 Childcare Lane
                          <br />
                          Queens, NY 11375
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone
                        className="text-[#489858] flex-shrink-0 mt-1"
                        size={20}
                      />
                      <div>
                        <p className="font-medium text-[#002040]">Phone</p>
                        <p className="text-sm text-gray-600">(646) 444-3702</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail
                        className="text-[#E8A018] flex-shrink-0 mt-1"
                        size={20}
                      />
                      <div>
                        <p className="font-medium text-[#002040]">Email</p>
                        <p className="text-sm text-gray-600">info@gbddaycare.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock
                        className="text-[#E05830] flex-shrink-0 mt-1"
                        size={20}
                      />
                      <div>
                        <p className="font-medium text-[#002040]">Hours</p>
                        <p className="text-sm text-gray-600">
                          Monday - Friday
                          <br />
                          7:00 AM - 6:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#2888B8] to-[#1078A8] text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Quick Response</h3>
                  <p className="text-sm text-white/90 mb-4">
                    We typically respond to all inquiries within 24 hours during
                    business days.
                  </p>
                  <p className="text-sm text-white/90">
                    For urgent matters, please call us directly at (646) 444-3702.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}