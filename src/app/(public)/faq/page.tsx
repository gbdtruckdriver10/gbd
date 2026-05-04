"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import Link from "next/link";

const faqs = [
  {
    question: 'What ages do you accept?',
    answer: 'We accept children from 6 months to 12 years old across our various programs. Our infant room cares for babies 6-12 months, toddler rooms for 1-3 years, preschool for 3-5 years, and our enrichment programs (basketball, tutoring, summer camp) serve school-age children up to 12 years.'
  },
  {
    question: 'What are your hours of operation?',
    answer: 'Our childcare center is open Monday through Friday from 7:00 AM to 6:00 PM. We are closed on major holidays and have a brief closure during the winter holidays. Our basketball and tutoring programs have flexible scheduling.'
  },
  {
    question: 'How do I enroll my child?',
    answer: 'The enrollment process begins with scheduling a tour of our facility. After the tour, you can submit an application along with required documents. Our admissions team will review your application and contact you about next steps, which may include placement or waitlist information.'
  },
  {
    question: 'What is your teacher-to-child ratio?',
    answer: 'We maintain or exceed state-mandated ratios: 1:4 for infants, 1:6 for toddlers, 1:10 for preschoolers, and 1:12 for school-age children. Our low ratios ensure every child receives individual attention.'
  },
  {
    question: 'Do you provide meals?',
    answer: 'Yes! We provide nutritious breakfast, lunch, and snacks daily. Our menu is designed by a nutritionist and accommodates common allergies and dietary restrictions. Menus are posted weekly for parents to review.'
  },
  {
    question: 'What is your sick policy?',
    answer: 'To protect all children, we ask that sick children stay home. Children must be fever-free for 24 hours without medication before returning. We have detailed illness policies outlined in our parent handbook.'
  },
  {
    question: 'How do you communicate with parents?',
    answer: 'We use multiple communication methods including our parent portal (with daily reports, photos, and attendance), email announcements, and our mobile app. Teachers are also available for in-person conversations during drop-off and pick-up.'
  },
  {
    question: 'What is your curriculum approach?',
    answer: 'We use a play-based, developmentally appropriate curriculum that incorporates elements of multiple educational philosophies. Our focus is on fostering curiosity, creativity, social-emotional development, and early literacy and math skills.'
  },
  {
    question: 'Are there cameras in the classrooms?',
    answer: 'Yes, we have security cameras throughout the facility for safety. However, we do not offer live streaming to parents. Our secure check-in/out system ensures only authorized individuals can pick up children.'
  },
  {
    question: 'What happens if my child has an incident or injury?',
    answer: 'All incidents are documented immediately and parents are notified. Minor injuries are treated with first aid on-site. For anything requiring medical attention, parents are contacted immediately and we follow your emergency protocols.'
  }
];

// Alex and Alexis: This is Mock function to simulate API call - replace with real implementation when ready...
// sends data to /api/faq-question endpoint which you will create to handle storing questions in DB or sending email notifications.
/*async function submitFAQQuestion(payload: { name: string; email: string; question: string }) {
  const res = await fetch("/api/faq-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to submit question");
}*/ 

export default function FAQPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
  e.preventDefault();
  if (isSubmitting) return;

  try {
    setIsSubmitting(true);

    // Alex and Alexis this is a Mock delay (remove/fix later when you connect to DB/API)
    await new Promise((r) => setTimeout(r, 700));

    toast.success("Question submitted! We'll respond within 24 hours.");
    setName("");
    setEmail("");
    setQuestion("");
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
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Find answers to common questions about GBD programs and enrollment
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-[#002040] hover:text-[#2888B8]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#002040] mb-2 text-center">
                Still Have Questions?
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Submit your question and we'll get back to you within 24 hours.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="question">Your Question</Label>
                  <Textarea
                    id="question"
                    rows={4}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="submit" className="w-full bg-[#2888B8] hover:bg-[#1078A8]" disabled={isSubmitting}>
                   {isSubmitting ? "Submitting..." : "Submit Question"}
                </Button>
                <p className="text-sm text-gray-500 text-center">
                    For tours or enrollment, please use our{" "}
                   <Link href="/contact" className="text-[#2888B8] hover:underline">Contact form</Link>.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Location Map */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="text-[#2888B8]" size={32} />
              <h2 className="text-3xl font-bold text-[#002040]">Visit Us</h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We'd love to show you around! Our facility is conveniently located in Jamaica, NY.
              Schedule a tour to see our classrooms and meet our amazing team.
            </p>
          </div>
          
          <Card className="overflow-hidden shadow-lg max-w-6xl mx-auto">
            <CardContent className="p-0">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6051.709911490161!2d-73.76382819999999!3d40.67716469999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c266b1268fd3b5%3A0xc8dad8cffb97a9a4!2s170-40%20133rd%20Ave%2C%20Jamaica%2C%20NY%2011434!5e0!3m2!1sen!2sus!4v1747125361661!5m2!1sen!2sus"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="GBD Daycare Location"
                className="w-full"
              />
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center bg-[#F8F0E0] p-6 rounded-lg">
              <div className="text-left">
                <p className="font-semibold text-[#002040]">Gifted & Beyond Daycare</p>
                <p className="text-gray-600">Jamaica, NY 11434</p>
              </div>
              <Button className="bg-[#2888B8] hover:bg-[#1078A8]" asChild>
                <a href="https://www.google.com/maps/dir//Jamaica,+NY+11434" target="_blank" rel="noopener noreferrer">
                  Get Directions
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}