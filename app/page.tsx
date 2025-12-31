import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Excellence in Education
            </h1>
            <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
              Personalized tutoring that helps students achieve their academic goals
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/enroll">
                <Button size="lg" className="w-full sm:w-auto">
                  Enroll Now
                </Button>
              </Link>
              <Link href="/enroll/status">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Check Enrollment Status
                </Button>
              </Link>
              <a href="#contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Contact Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Our Services</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive academic support tailored to your needs
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl">📚</div>
                <h3 className="mb-2 text-xl font-semibold">Subject Tutoring</h3>
                <p className="text-muted-foreground">
                  Expert guidance in Math, Science, English, and more. One-on-one attention to help you excel.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl">📊</div>
                <h3 className="mb-2 text-xl font-semibold">Assessment & Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Regular assessments to track your progress and identify areas for improvement.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl">👥</div>
                <h3 className="mb-2 text-xl font-semibold">Small Batch Learning</h3>
                <p className="text-muted-foreground">
                  Learn in focused groups with personalized attention and collaborative learning.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl">🎯</div>
                <h3 className="mb-2 text-xl font-semibold">Exam Preparation</h3>
                <p className="text-muted-foreground">
                  Targeted preparation for school exams, standardized tests, and competitive exams.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl">💡</div>
                <h3 className="mb-2 text-xl font-semibold">Study Skills Development</h3>
                <p className="text-muted-foreground">
                  Build effective study habits, time management, and learning strategies.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl">📱</div>
                <h3 className="mb-2 text-xl font-semibold">Online Portal Access</h3>
                <p className="text-muted-foreground">
                  View your results, track progress, and access resources anytime, anywhere.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple steps to start your learning journey
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  1
                </div>
                <h3 className="mb-2 text-lg font-semibold">Enroll</h3>
                <p className="text-sm text-muted-foreground">
                  Submit your enrollment request with basic information
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  2
                </div>
                <h3 className="mb-2 text-lg font-semibold">Approval</h3>
                <p className="text-sm text-muted-foreground">
                  We review your application and contact you for confirmation
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  3
                </div>
                <h3 className="mb-2 text-lg font-semibold">Join Batch</h3>
                <p className="text-sm text-muted-foreground">
                  Get assigned to a batch that matches your grade and subjects
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  4
                </div>
                <h3 className="mb-2 text-lg font-semibold">Assessments</h3>
                <p className="text-sm text-muted-foreground">
                  Take regular assessments and track your progress online
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Get In Touch</h2>
            <p className="text-lg text-muted-foreground">
              Have questions? We're here to help
            </p>
          </div>
          <div className="mx-auto max-w-2xl">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 text-3xl">📞</div>
                  <h3 className="mb-2 font-semibold">Phone</h3>
                  <p className="text-sm text-muted-foreground">
                    <a href="tel:+1234567890" className="hover:text-foreground">
                      +1 (234) 567-890
                    </a>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 text-3xl">✉️</div>
                  <h3 className="mb-2 font-semibold">Email</h3>
                  <p className="text-sm text-muted-foreground">
                    <a href="mailto:info@tutoringcenter.com" className="hover:text-foreground">
                      info@tutoringcenter.com
                    </a>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 text-3xl">📍</div>
                  <h3 className="mb-2 font-semibold">Location</h3>
                  <p className="text-sm text-muted-foreground">
                    123 Education Street<br />
                    Learning City, LC 12345
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-8 text-center space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/enroll">
                  <Button size="lg">Start Your Enrollment</Button>
                </Link>
                <Link href="/enroll/status">
                  <Button size="lg" variant="outline">Check Enrollment Status</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Tutoring Center. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="/enroll" className="text-sm text-muted-foreground hover:text-foreground">
                Enroll
              </Link>
              <Link href="/enroll/status" className="text-sm text-muted-foreground hover:text-foreground">
                Check Status
              </Link>
              <a href="#services" className="text-sm text-muted-foreground hover:text-foreground">
                Services
              </a>
              <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
