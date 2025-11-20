import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// AI-Powered Features using OpenAI (connected)
const getConnectedFeatures = (status: string) => [
  { 
    id: 1, 
    name: "AI Image Generator", 
    category: "Image Tools", 
    status, 
    icon: "🎨", 
    description: "Create stunning images from text descriptions using DALL-E",
    aiProvider: "OpenAI DALL-E",
    features: ["Text-to-image", "Multiple styles", "High resolution"],
    isConnected: true,
    actionText: "Generate Image"
  },
  { 
    id: 2, 
    name: "Code Assistant", 
    category: "Code Tools", 
    status, 
    icon: "💻", 
    description: "Get AI-powered coding help, debugging, and code generation",
    aiProvider: "OpenAI GPT-5",
    features: ["Code generation", "Bug fixing", "Code review"],
    isConnected: true,
    actionText: "Start Coding"
  },
  { 
    id: 3, 
    name: "Speech-to-Text", 
    category: "Audio Tools", 
    status, 
    icon: "🎙️", 
    description: "Transcribe audio to text with high accuracy",
    aiProvider: "OpenAI Whisper",
    features: ["Multi-language", "Real-time", "High accuracy"],
    isConnected: true,
    actionText: "Transcribe Audio"
  },
  { 
    id: 4, 
    name: "Smart Writer", 
    category: "Text Tools", 
    status, 
    icon: "✍️", 
    description: "Generate, edit, and enhance content with advanced AI",
    aiProvider: "OpenAI GPT-5",
    features: ["Content creation", "Editing", "Rewriting"],
    isConnected: true,
    actionText: "Start Writing"
  },
];

// Available AI-Powered Features
const availableFeatures = [
  { 
    id: 11, 
    name: "Text Summarizer", 
    category: "Text Tools", 
    status: "Available", 
    icon: "📝", 
    description: "Condense long texts into concise summaries",
    aiProvider: "Multiple AI Models",
    features: ["Quick summaries", "Key points extraction", "Multiple formats"],
    isConnected: false,
    actionText: "Summarize Text"
  },
  { 
    id: 12, 
    name: "Universal Translator", 
    category: "Text Tools", 
    status: "Available", 
    icon: "🌍", 
    description: "Translate text between 100+ languages instantly",
    aiProvider: "Neural Translation",
    features: ["100+ languages", "Context-aware", "Instant translation"],
    isConnected: false,
    actionText: "Translate"
  },
  { 
    id: 13, 
    name: "Voice Generator", 
    category: "Audio Tools", 
    status: "Available", 
    icon: "🎵", 
    description: "Convert text to natural-sounding speech in any voice",
    aiProvider: "ElevenLabs",
    features: ["Natural voices", "Voice cloning", "Multi-language"],
    isConnected: false,
    actionText: "Generate Voice"
  },
  { 
    id: 14, 
    name: "Content Analyzer", 
    category: "Data Tools", 
    status: "Available", 
    icon: "🔍", 
    description: "Extract insights and patterns from your data",
    aiProvider: "Advanced Analytics",
    features: ["Sentiment analysis", "Pattern detection", "Insights extraction"],
    isConnected: false,
    actionText: "Analyze Data"
  },
  { 
    id: 15, 
    name: "Image Enhancer", 
    category: "Image Tools", 
    status: "Available", 
    icon: "🖼️", 
    description: "Upscale and improve image quality with AI",
    aiProvider: "Stable Diffusion",
    features: ["4x upscaling", "Detail enhancement", "Noise removal"],
    isConnected: false,
    actionText: "Enhance Image"
  },
  { 
    id: 16, 
    name: "Video Subtitle Generator", 
    category: "Video Tools", 
    status: "Available", 
    icon: "📹", 
    description: "Automatically generate accurate subtitles for videos",
    aiProvider: "Speech Recognition",
    features: ["Auto-generation", "Multi-language", "Time-synced"],
    isConnected: false,
    actionText: "Generate Subtitles"
  },
  { 
    id: 17, 
    name: "Background Remover", 
    category: "Image Tools", 
    status: "Available", 
    icon: "✂️", 
    description: "Remove backgrounds from images automatically",
    aiProvider: "Computer Vision",
    features: ["One-click removal", "High precision", "Batch processing"],
    isConnected: false,
    actionText: "Remove Background"
  },
  { 
    id: 18, 
    name: "Content Rewriter", 
    category: "Text Tools", 
    status: "Available", 
    icon: "🔄", 
    description: "Rewrite content while maintaining meaning",
    aiProvider: "Language Models",
    features: ["Style adjustment", "Tone control", "Plagiarism-free"],
    isConnected: false,
    actionText: "Rewrite Content"
  },
];

// Coming Soon Features
const comingSoonFeatures = [
  { 
    id: 21, 
    name: "AI Video Generator", 
    category: "Video Tools", 
    status: "Coming Soon", 
    icon: "🎥", 
    description: "Create videos from text descriptions",
    aiProvider: "Runway ML",
    features: ["Text-to-video", "Style transfer", "Animation"],
    isConnected: false,
    actionText: "Learn More"
  },
  { 
    id: 22, 
    name: "3D Model Creator", 
    category: "3D Tools", 
    status: "Coming Soon", 
    icon: "🎮", 
    description: "Generate 3D models from text or images",
    aiProvider: "DreamFusion",
    features: ["Text-to-3D", "Image-to-3D", "Export formats"],
    isConnected: false,
    actionText: "Learn More"
  },
  { 
    id: 23, 
    name: "Music Composer", 
    category: "Audio Tools", 
    status: "Coming Soon", 
    icon: "🎼", 
    description: "Compose original music with AI",
    aiProvider: "Music AI",
    features: ["Genre selection", "Custom length", "Royalty-free"],
    isConnected: false,
    actionText: "Learn More"
  },
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

  const categories = ["All", "Text Tools", "Image Tools", "Code Tools", "Audio Tools", "Video Tools", "Data Tools", "3D Tools"];

  const getStatusForOpenAITools = () => {
    if (openAIStatus === "checking") return "Checking...";
    if (openAIStatus === "connected") return "Connected";
    if (openAIStatus === "disconnected") return "Disconnected";
    return "Error";
  };

  const allTools = [
    ...getConnectedFeatures(getStatusForOpenAITools()),
    ...availableFeatures,
    ...comingSoonFeatures
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
      case "Available": return "bg-blue-500/20 text-blue-500 border-blue-500/50";
      case "Coming Soon": return "bg-purple-500/20 text-purple-500 border-purple-500/50";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleToolAction = async (tool: any) => {
    if (tool.isConnected) {
      if (tool.status === "Connected") {
        toast.success(`${tool.name} is ready to use!`);
      } else if (tool.status === "Disconnected" || tool.status === "Error") {
        toast.error("Please update your OpenAI API key in Supabase secrets");
      } else {
        setIsTestingAPI(true);
        await testOpenAIConnection();
      }
    } else if (tool.status === "Coming Soon") {
      toast.info(`${tool.name} is coming soon! Stay tuned.`);
    } else {
      toast.info(`${tool.name} integration available. Click to learn more.`);
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
              Use different AI features to perform any task
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search AI features..."
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
                  <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                  <div className="text-xs text-muted-foreground mb-2">
                    <span className="font-semibold">Powered by:</span> {tool.aiProvider}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tool.features?.map((feature: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tool.status === "Connected" ? "default" : tool.status === "Coming Soon" ? "outline" : "secondary"}
                    onClick={() => handleToolAction(tool)}
                    disabled={(isTestingAPI && tool.isConnected) || tool.status === "Checking..."}
                  >
                    {isTestingAPI && tool.isConnected ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : tool.status === "Checking..." ? (
                      "Checking..."
                    ) : (
                      tool.actionText
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No AI features found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ecosystem;
