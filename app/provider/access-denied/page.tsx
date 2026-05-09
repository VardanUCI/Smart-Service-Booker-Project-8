import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Search } from 'lucide-react';

export default function ProviderAccessDeniedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-xl px-4">
          <Card>
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>This dashboard is only available for business accounts.</CardTitle>
              <CardDescription>
                Your current account can still search providers, join waitlists, and manage user settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/seeker/search">
                  <Search className="mr-2 h-4 w-4" />
                  Search Providers
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signout">Sign out to create a business account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
