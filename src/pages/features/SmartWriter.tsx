import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/layout/Sidebar";
import { ChevronLeft, PenTool, Copy, Download, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SmartWriter = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("blog");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const generateText = async () => {
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setGeneratedText("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-text", {
        body: { topic: topic.trim(), style },
      });

      if (error) throw error;

      if (data.text) {
        setGeneratedText(data.text);
        toast.success("Content generated successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(generatedText);
    toast.success("Text copied to clipboard");
  };

  const downloadText = () => {
    const blob = new Blob([generatedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Text downloaded!");
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar collapsed={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/ecosystem")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <PenTool className="h-6 w-6 text-primary" />
                Smart Writer
              </h1>
              <p className="text-sm text-muted-foreground">AI-powered content generation</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Content</CardTitle>
                <CardDescription>
                  Enter a topic and select a writing style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Benefits of meditation for mental health"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Writing Style</label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="social">Social Media Post</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="creative">Creative Writing</SelectItem>
                      <SelectItem value="technical">Technical Documentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateText} 
                  disabled={isLoading || !topic.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <PenTool className="mr-2 h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generatedText && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Generated Content</CardTitle>
                      <CardDescription>Your AI-generated text is ready</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={copyText}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={downloadText}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                    className="min-h-[400px] font-sans"
                  />
                </CardContent>
              </Card>
            )}

            {!generatedText && !isLoading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground space-y-2">
                    <PenTool className="h-12 w-12 mx-auto opacity-50" />
                    <p>Enter a topic above to generate content</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartWriter;
