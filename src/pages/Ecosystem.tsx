import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const getOpenAITools = (status: string) => [
  { id: 1, name: "DALL-E 3", category: "Image", status, icon: "🎨", description: "Generate stunning images from text", isOpenAI: true },
  { id: 2, name: "GPT-5", category: "Text", status, icon: "✍️", description: "Advanced language model", isOpenAI: true },
  { id: 3, name: "GPT-4.1", category: "Text", status, icon: "🤖", description: "Powerful reasoning model", isOpenAI: true },
  { id: 4, name: "Whisper", category: "Audio", status, icon: "🎙️", description: "Speech recognition system", isOpenAI: true },
];

const mockTools = [
  { id: 11, name: "Midjourney", category: "Image", status: "Available", icon: "🖼️", description: "Create artistic visuals", isOpenAI: false },
  { id: 12, name: "ElevenLabs", category: "Audio", status: "Available", icon: "🎵", description: "Text-to-speech synthesis", isOpenAI: false },
  { id: 13, name: "Stable Diffusion", category: "Image", status: "Available", icon: "🌟", description: "Open-source image generation", isOpenAI: false },
  { id: 14, name: "Runway ML", category: "Video", status: "Available", icon: "🎬", description: "AI video editing tools", isOpenAI: false },
  { id: 15, name: "Claude", category: "Text", status: "Available", icon: "🧠", description: "Constitutional AI assistant", isOpenAI: false },
  { id: 16, name: "DreamFusion", category: "3D", status: "Available", icon: "🎮", description: "Text-to-3D generation", isOpenAI: false },
  { id: 17, name: "Synthesia", category: "Video", status: "Available", icon: "📹", description: "AI video avatars", isOpenAI: false },
  { id: 18, name: "Anthropic", category: "Text", status: "Available", icon: "💭", description: "Advanced reasoning AI", isOpenAI: false },
  { id: 19, name: "Play.ht", category: "Audio", status: "Available", icon: "🔊", description: "Voice cloning technology", isOpenAI: false },
];

const Ecosystem = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openAIStatus, setOpenAIStatus] = useState<"checking" | "connected" | "disconnected" | "error">("checking");
  const [isTestingAPI, setIsTestingAPI] = useState(false);

  useEffect(() => {
    testOpenAIConnection();
  }, []);

  const testOpenAIConnection = async () => {
    setIsTestingAPI(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-openai');
      
      if (error) {
        console.error('Error testing OpenAI:', error);
        setOpenAIStatus("error");
        return;
      }

      if (data?.success) {
        setOpenAIStatus("connected");
        toast.success("OpenAI API connected successfully");
      } else {
        setOpenAIStatus("disconnected");
        toast.error(data?.error || "Failed to connect to OpenAI API");
      }
    } catch (error) {
      console.error('Error testing OpenAI:', error);
      setOpenAIStatus("error");
      toast.error("Failed to test OpenAI connection");
    } finally {
      setIsTestingAPI(false);
    }
  };

  const categories = ["All", "Text", "Image", "Video", "Audio", "3D"];

  const getStatusForOpenAITools = () => {
    if (openAIStatus === "checking") return "Checking...";
    if (openAIStatus === "connected") return "Connected";
    if (openAIStatus === "disconnected") return "Disconnected";
    return "Error";
  };

  const allTools = [
    ...getOpenAITools(getStatusForOpenAITools()),
    ...mockTools
  ];

  const filteredTools = allTools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Connected": return "bg-green-500/20 text-green-500 border-green-500/50";
      case "Checking...": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "Disconnected": return "bg-red-500/20 text-red-500 border-red-500/50";
      case "Error": return "bg-red-500/20 text-red-500 border-red-500/50";
      case "Available": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleToolAction = async (tool: any) => {
    if (tool.isOpenAI) {
      if (tool.status === "Connected") {
        toast.success(`${tool.name} is connected and ready to use`);
      } else if (tool.status === "Disconnected" || tool.status === "Error") {
        toast.error("Please update your OpenAI API key in Supabase secrets");
      } else {
        setIsTestingAPI(true);
        await testOpenAIConnection();
      }
    } else {
      toast.info(`${tool.name} integration coming soon`);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ecosystem Hub
            </h1>
            <p className="text-muted-foreground">
              Connect and manage your AI tools in one place
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category || (!selectedCategory && category === "All") ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category === "All" ? null : category)}
                  className={selectedCategory === category || (!selectedCategory && category === "All") ? "gradient-primary text-primary-foreground" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{tool.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">{tool.category}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(tool.status)} variant="secondary">
                      {tool.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tool.status === "Connected" ? "outline" : "default"}
                    onClick={() => handleToolAction(tool)}
                    disabled={isTestingAPI && tool.isOpenAI}
                  >
                    {isTestingAPI && tool.isOpenAI ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      tool.status === "Connected" ? "Configure" : tool.status === "Checking..." ? "Checking..." : "Connect"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No tools found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ecosystem;
