import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, Heart, Star, Users, GraduationCap, Calendar } from 'lucide-react';
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2888B8] via-[#1078A8] to-[#002040] text-white py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Where Every Child is Gifted & Beyond
              </h1>
              <p className="text-lg lg:text-xl mb-8 text-white/90">
                Nurturing young minds with excellence, care, and joyful learning experiences
                in a safe and secure environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-[#2888B8] hover:bg-gray-100 text-lg"
                >
                  <Link href="/contact">
                    Apply for Enrollment <ArrowRight className="ml-2" size={20} />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg"
                >
                  <Link href="/contact">Schedule a Tour</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg"
                >
                  <Link href="/login">Parent Login</Link>
                </Button>
              </div>
            </div>
            <div className="relative lg:pl-6">
              <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl aspect-[4/3]">
                <Image
                  src="/homephoto.png"
                  alt="Gifted & Beyond Daycare hero image"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                   />
              </div>

              <div className="absolute -bottom-6 -left-6 lg:left-3 bg-[#E8A018] text-white p-6 rounded-xl shadow-lg">
                <p className="text-3xl font-bold">1+</p>
                <p className="text-sm">Years of Excellence</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#002040] mb-4">
              Why Choose GBD?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide a nurturing environment where children thrive academically,
              socially, and emotionally.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-[#2888B8] transition-all bg-gradient-to-br from-[#2888B8]/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#2888B8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-[#2888B8]" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#002040]">Safe & Secure</h3>
                <p className="text-gray-600">
                  State-certified facility with secure check-in/out systems and trained staff.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#489858] transition-all bg-gradient-to-br from-[#489858]/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#489858]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-[#489858]" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#002040]">Nurturing Care</h3>
                <p className="text-gray-600">
                  Compassionate educators who treat every child with love and respect.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#E8A018] transition-all bg-gradient-to-br from-[#E8A018]/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#E8A018]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="text-[#E8A018]" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#002040]">Excellence</h3>
                <p className="text-gray-600">
                  Curriculum designed to inspire creativity and critical thinking.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#98B050] transition-all bg-gradient-to-br from-[#98B050]/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#98B050]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-[#98B050]" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#002040]">Community</h3>
                <p className="text-gray-600">
                  A welcoming family atmosphere where everyone belongs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Programs Preview */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#002040] mb-4">
              Our Programs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From infants to school-age, we offer comprehensive programs designed to
              support your child's growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Childcare',
                age: '6 months - 5 years',
                description: 'Full-time care with structured learning',
                image: "/programs/childcare.png",
                color: '#2888B8'
              },
              {
                name: 'Basketball',
                age: '4-8 years',
                description: 'Fun skills and teamwork development',
                image: "/programs/basketball.png",
                color: '#E05830'
              },
              {
                name: 'Tutoring',
                age: '5-10 years',
                description: 'Personalized academic support',
                image: "/programs/tutoring.png",
                color: '#E8A018'
              },
              {
                name: 'Summer Camp',
                age: '5-12 years',
                description: 'Adventures and activities all summer',
                image: "/programs/summercamp.png",
                color: '#489858'
              }
            ].map((program) => (
              <Card key={program.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full">
                  <Image
                    src={program.image}
                    alt={program.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    />
                </div>
                <CardContent className="p-6">
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{ backgroundColor: `${program.color}20`, color: program.color }}
                  >
                    {program.age}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#002040]">
                    {program.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  <Link
                    href="/programs"
                    className="text-[#2888B8] font-medium hover:underline flex items-center gap-1"
                  >
                    Learn More <ArrowRight size={16} />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild className="bg-[#2888B8] hover:bg-[#1078A8]">
              <Link href="/programs">View All Programs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-[#F8F0E0]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-[#2888B8] mb-2">250+</p>
              <p className="text-gray-700 font-medium">Happy Families</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-[#489858] mb-2">1+</p>
              <p className="text-gray-700 font-medium">Years Experience</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-[#E8A018] mb-2">25</p>
              <p className="text-gray-700 font-medium">Qualified Staff</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-[#E05830] mb-2">4+</p>
              <p className="text-gray-700 font-medium">Programs Offered</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-[#2888B8] to-[#1078A8] text-white">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <GraduationCap size={64} className="mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Join the GBD Family?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Take the first step towards giving your child an exceptional early education experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-white text-[#2888B8] hover:bg-gray-100"
            >
              <Link href="/contact">
                <Calendar className="mr-2" size={20} />
                Schedule a Tour
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
            >
              <Link href="/contact">Apply for Enrollment</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}