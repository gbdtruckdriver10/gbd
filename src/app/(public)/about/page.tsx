
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, Award, Shield, Lock, Video, Building } from 'lucide-react';
import { FaFacebook, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { mockTeamMembers } from "@/data/mockData";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  const activeTeamMembers = mockTeamMembers
    .filter(member => member.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div>
      <section className="bg-gradient-to-r from-[#2888B8] to-[#1078A8] text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">About GBD</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Building a foundation for lifelong learning since 2026
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-[#002040] mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Gifted & Beyond Daycare was founded in 2026 with a simple mission: to provide
                exceptional early childhood education in a nurturing, safe, and joyful environment.
              </p>
              <p className="text-gray-600 mb-4">
                Over the past year, we've grown from a small neighborhood daycare to a
                comprehensive early learning center serving over 250 families. Our commitment
                to excellence, safety, and personalized care has remained unchanged.
              </p>
              <p className="text-gray-600">
                Today, GBD offers a range of programs from infant care to school-age enrichment,
                including basketball, tutoring, and summer camps. Every child who walks through
                our doors is treated as gifted and beyond their years.
              </p>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/about.png"
                alt="Children learning"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#002040] mb-4">Why Choose GBD?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We're committed to providing the best early childhood education with values that set us apart
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: 'Safe Environment', desc: 'State-certified secure facility', color: '#2888B8' },
                { icon: Users, title: 'Qualified Staff', desc: '5+ experienced educators', color: '#489858' },
                { icon: Heart, title: 'Nurturing Care', desc: 'Individual attention for every child', color: '#E8A018' },
                { icon: Award, title: 'Excellence', desc: 'Award-winning curriculum', color: '#E05830' }
              ].map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${item.color}15` }}>
                      <item.icon style={{ color: item.color }} size={28} />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mission & Values */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#002040] mb-4">Our Mission & Values</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-[#2888B8] hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#002040] mb-3">Affordability</h3>
                  <p className="text-gray-600">
                    Quality early education should be accessible to all families. We offer competitive pricing and flexible payment plans to ensure every child can access our programs.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-[#489858] hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#002040] mb-3">Security & Trust</h3>
                  <p className="text-gray-600">
                    Your child's safety is paramount. Our secure facilities, trained staff, and comprehensive safety protocols give parents complete peace of mind.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-[#E8A018] hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#002040] mb-3">Communication</h3>
                  <p className="text-gray-600">
                    We believe in strong family partnerships. Daily updates, open-door policies, and digital portals keep you connected to your child's day.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Meet the Team */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#002040] mb-4">Meet Our Team</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our experienced leadership team is dedicated to providing exceptional care and education
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {activeTeamMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-xl transition-all">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-32 h-32 mb-4">
                        <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="rounded-full object-cover border-4 border-[#2888B8]/20"
                        sizes="128px"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-[#002040] mb-1">{member.name}</h3>
                      <p className="text-[#2888B8] font-semibold mb-4">{member.title}</p>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">{member.bio}</p>
                      
                      {/* Social Icons */}
                      <div className="flex gap-3">
                        {member.facebookUrl && (
                          <a
                            href={member.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-[#2888B8]/10 hover:bg-[#2888B8] hover:text-white text-[#2888B8] flex items-center justify-center transition-all"
                          >
                            <FaFacebook size={18} />
                          </a>
                        )}
                        {member.linkedinUrl && (
                          <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-[#2888B8]/10 hover:bg-[#2888B8] hover:text-white text-[#2888B8] flex items-center justify-center transition-all"
                          >
                            <FaLinkedin size={18} />
                          </a>
                        )}
                        {member.twitterUrl && (
                          <a
                            href={member.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-[#2888B8]/10 hover:bg-[#2888B8] hover:text-white text-[#2888B8] flex items-center justify-center transition-all"
                          >
                            <FaXTwitter size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Facility & Safety */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002040] mb-4">Our Facility & Safety</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your child's safety and comfort are our top priorities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-l-4 border-[#2888B8] hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-[#2888B8]/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="text-[#2888B8]" size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#002040] mb-3">Secure Access</h3>
                <p className="text-gray-600 mb-4">
                  Electronic check-in/out system ensures only authorized individuals can pick up children. All entries are logged and monitored.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#2888B8] rounded-full"></div>
                    Keycard access system
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#2888B8] rounded-full"></div>
                    Security cameras throughout
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#2888B8] rounded-full"></div>
                    Authorized pickup verification
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-[#489858] hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-[#489858]/10 rounded-full flex items-center justify-center mb-4">
                  <Video className="text-[#489858]" size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#002040] mb-3">Safe Spaces</h3>
                <p className="text-gray-600 mb-4">
                  Age-appropriate classrooms and outdoor play areas designed with safety and development in mind.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#489858] rounded-full"></div>
                    Childproofed environments
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#489858] rounded-full"></div>
                    Monitored play areas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#489858] rounded-full"></div>
                    Safe outdoor playground
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-[#E8A018] hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-[#E8A018]/10 rounded-full flex items-center justify-center mb-4">
                  <Building className="text-[#E8A018]" size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#002040] mb-3">Certified Facility</h3>
                <p className="text-gray-600 mb-4">
                  State-licensed and regularly inspected to meet and exceed all safety and health standards.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#E8A018] rounded-full"></div>
                    State licensed & insured
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#E8A018] rounded-full"></div>
                    Regular safety inspections
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#E8A018] rounded-full"></div>
                    CPR/First Aid certified staff
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-br from-[#2888B8] to-[#1078A8] border-none shadow-xl max-w-3xl mx-auto">
              <CardContent className="p-8 text-white">
                <h3 className="text-2xl font-bold mb-3">Ready to Visit Our Facility?</h3>
                <p className="text-white/90 mb-6">
                  Schedule a tour to see our classrooms, meet our staff, and experience the GBD difference firsthand.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/contact">Schedule a Tour</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="bg-white/10 hover:bg-white/20 border-white text-white">
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}