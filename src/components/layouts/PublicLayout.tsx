"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GBDLogo } from "@/components/GBDLogo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";


type NavLink = { path: string; label: string };

const navLinks: NavLink[] = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/programs", label: "Programs" },
  { path: "/parent-resources", label: "Parent Resources" },
  { path: "/faq", label: "FAQ" },
  { path: "/whats-new", label: "What's New" },
  { path: "/contact", label: "Contact" },
];

function PublicHeader({ pathname }: { pathname: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <GBDLogo />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors hover:text-[#2888B8] ${
                  isActive(link.path) ? "text-[#2888B8]" : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-[#E8A018] hover:bg-[#E08028] text-white">
              <Link href="/contact">Apply / Tour</Link>
            </Button>
          </div>

          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.path) ? "bg-[#2888B8]/10 text-[#2888B8]" : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 flex gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="flex-1 bg-[#E8A018] hover:bg-[#E08028] text-white">
                <Link href="/contact">Apply</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Remount header on route change so the mobile menu always closes */}
      <div key={pathname}>
        <PublicHeader pathname={pathname} />
      </div>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#002040] text-white py-12">
  <div className="container mx-auto px-4 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <GBDLogo showText={false} className="mb-4" />
        <h3 className="font-bold text-lg mb-2">GIFTED &amp; BEYOND</h3>
        <p className="text-sm text-gray-300">
          Gifted &amp; Beyond Daycare - Nurturing young minds with excellence and care.
        </p>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Quick Links</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>
            <Link href="/about" className="hover:text-white">
              About Us
            </Link>
          </li>
          <li>
            <Link href="/programs" className="hover:text-white">
              Programs
            </Link>
          </li>
          <li>
            <Link href="/faq" className="hover:text-white">
              FAQ
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Parents</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>
            <Link href="/parent-resources" className="hover:text-white">
              Resources
            </Link>
          </li>
          <li>
            <Link href="/login" className="hover:text-white">
              Parent Portal
            </Link>
          </li>
          <li>
            <Link href="/whats-new" className="hover:text-white">
              Updates
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Contact</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>123 Childcare Lane</li>
          <li>Queens, NY 11375</li>
          <li>Phone: (347) 444-3702</li>
          <li>info@gbddaycare.com</li>
        </ul>
      </div>
    </div>

    <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
      <p>&copy; {new Date().getFullYear()} GBD Daycare. All rights reserved.</p>
    </div>
  </div>
</footer>
</div>
  );
}