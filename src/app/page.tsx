import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Student Information Access System
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            A secure, next-generation platform for managing academic records with advanced access control models.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/sign-in">
              <Button size="lg" variant="secondary">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Advanced Security Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="RBAC (Role-Based)"
              description="Strict role separation for Students, Instructors, Admins, Department Heads, and Registrars."
            />
            <FeatureCard
              title="MAC (Mandatory)"
              description="Label-based security (Public, Internal, Confidential) ensures data is only accessible to cleared users."
            />
            <FeatureCard
              title="DAC (Discretionary)"
              description="Resource owners can explicitly share grades and reports with specific colleagues."
            />
            <FeatureCard
              title="RuBAC (Rule-Based)"
              description="Access restricted by time of day (8 AM - 6 PM) and location constraints."
            />
            <FeatureCard
              title="ABAC (Attribute-Based)"
              description="Dynamic access decisions based on user attributes and resource context."
            />
            <FeatureCard
              title="Audit Logging"
              description="Comprehensive logging of all system actions for security and compliance."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 SIAS Project. Secure by Design.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}
