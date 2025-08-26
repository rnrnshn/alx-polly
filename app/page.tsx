import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-6xl font-bold">
          Create and Vote on{' '}
          <span className="text-primary">Polls</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Pollly is a modern polling platform that makes it easy to create engaging polls 
          and gather opinions from your audience.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/polls/create">Create a Poll</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/polls">Browse Polls</Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle>Easy to Create</CardTitle>
            <CardDescription>
              Create polls in seconds with our intuitive interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Simply enter your question, add options, and share with your audience. 
              No complicated setup required.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-time Results</CardTitle>
            <CardDescription>
              See votes come in live with beautiful visualizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Watch your poll results update in real-time with interactive charts 
              and percentage displays.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flexible Options</CardTitle>
            <CardDescription>
              Customize your polls with various settings and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set expiration dates, allow multiple votes, make polls private, 
              and more to suit your needs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Ready to get started?</h2>
        <p className="text-muted-foreground">
          Join thousands of users creating and participating in polls
        </p>
        <Button size="lg" asChild>
          <Link href="/register">Sign up for free</Link>
        </Button>
      </div>
    </div>
  );
}
