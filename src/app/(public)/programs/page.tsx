"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Clock, DollarSign, User } from "lucide-react";
import Image from "next/image";

type Program = {
  program_id: number;
  program_name: string;
  program_type: string;
  description: string | null;
  age_min: number;
  age_max: number;
  is_active: boolean;
  days_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  capacity: number | null;
  price: number | null;
  price_unit: string | null;
  instructor_name: string | null;
  enrolled: number;
};

const PROGRAM_IMAGES: Record<string, string> = {
  childcare: "/programs/childcare.png",
  basketball: "/programs/basketball.png",
  tutoring: "/programs/tutoring.png",
  summer_camp: "/programs/summercamp.png",
};

const formatSchedule = (days: string | null, start: string | null, end: string | null) => {
  if (!days && !start) return "Schedule TBD";
  const time = start && end ? ` ${start.slice(0, 5)}–${end.slice(0, 5)}` : "";
  return `${days ?? ""}${time}`;
};

const formatCost = (price: number | null, unit: string | null) => {
  if (!price || !unit) return "Contact for pricing";
  return `$${Number(price).toLocaleString()}/${unit}`;
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    fetch("/api/programs")
      .then((r) => r.json())
      .then((data) => setPrograms(data.filter((p: Program) => p.is_active)));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-r from-[#2888B8] to-[#1078A8] py-16 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold lg:text-5xl">Our Programs</h1>
          <p className="max-w-2xl text-xl text-white/90">
            Discover enriching programs designed to support your child&apos;s development at every stage.
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {programs.map((program) => {
              const enrolled = Number(program.enrolled);
              const capacity = program.capacity ?? 0;
              const percent = capacity > 0 ? (enrolled / capacity) * 100 : 0;
              const percentClamped = Math.min(100, Math.max(0, Math.round(percent)));
              const image = PROGRAM_IMAGES[program.program_type] ?? "/programs/childcare.png";

              return (
                <Card key={program.program_id} className="overflow-hidden border-l-4 border-[#2888B8] transition-all hover:shadow-xl">
                  <div className="relative h-64 w-full">
                    <Image src={image} alt={program.program_name} fill loading="eager" className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-[#002040]">{program.program_name}</h3>
                      <span className="rounded-full bg-[#2888B8]/10 px-3 py-1 text-sm font-semibold text-[#2888B8]">
                        Ages {program.age_min}–{program.age_max}
                      </span>
                    </div>

                    <p className="mb-6 text-gray-600">{program.description}</p>

                    <div className="mb-6 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="text-[#2888B8]" size={20} />
                        <span className="text-gray-700">{formatSchedule(program.days_of_week, program.start_time, program.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="text-[#489858]" size={20} />
                        <span className="text-gray-700">{enrolled} / {capacity} enrolled</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <User className="text-[#E8A018]" size={20} />
                        <span className="text-gray-700">Instructor: {program.instructor_name ?? "TBD"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <DollarSign className="text-[#E05830]" size={20} />
                        <span className="font-semibold text-gray-700">{formatCost(program.price, program.price_unit)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-[#489858] transition-all" style={{ width: `${percentClamped}%` }} />
                      </div>
                      <span className="text-sm text-gray-600">{percentClamped}% full</span>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button asChild className="flex-1 bg-[#2888B8] hover:bg-[#1078A8]">
                        <Link href="/contact">Enroll Now</Link>
                      </Button>
                      <Button variant="outline" asChild className="flex-1">
                        <Link href="/contact">Request Info</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
