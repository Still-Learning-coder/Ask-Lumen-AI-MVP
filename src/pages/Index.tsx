import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Presentation, BookOpen, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            AskLumen AI
          </h1>
          <p className="text-xl text-muted-foreground sm:text-2xl">
            A verified multimodal research engine for students and researchers
          </p>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Automating summaries, citations, slides, and learning tasks. 
            We're building toward an AI-native OS that personalizes and executes academic workflows.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Link to="/ecosystem">
              <Button size="lg" variant="outline" className="gap-2">
                <Brain className="h-5 w-5" />
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <FileText className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Smart Summaries</CardTitle>
              <CardDescription>
                AI-powered summarization of research papers and documents
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Auto Citations</CardTitle>
              <CardDescription>
                Automatic citation generation in multiple formats
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Presentation className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Slide Generation</CardTitle>
              <CardDescription>
                Create presentation slides from your research instantly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>AI Code Assistant</CardTitle>
              <CardDescription>
                Intelligent coding help for your research projects
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Image Generation</CardTitle>
              <CardDescription>
                Create visuals and diagrams for your academic work
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Target className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Personalized Workflows</CardTitle>
              <CardDescription>
                AI-native OS that adapts to your research style
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
