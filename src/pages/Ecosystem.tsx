import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import { toast } from "sonner";

const mockTools = [
  { id: 1, name: "DALL-E 3", category: "Image", status: "Connected", icon: "🎨", description: "Generate stunning images from text" },
  { id: 2, name: "GPT-4", category: "Text", status: "Active", icon: "✍️", description: "Advanced language model" },
  { id: 3, name: "Midjourney", category: "Image", status: "Available", icon: "🖼️", description: "Create artistic visuals" },
  { id: 4, name: "ElevenLabs", category: "Audio", status: "Available", icon: "🎵", description: "Text-to-speech synthesis" },
  { id: 5, name: "Stable Diffusion", category: "Image", status: "Connected", icon: "🌟", description: "Open-source image generation" },
  { id: 6, name: "Runway ML", category: "Video", status: "Available", icon: "🎬", description: "AI video editing tools" },
  { id: 7, name: "Claude", category: "Text", status: "Connected", icon: "🤖", description: "Constitutional AI assistant" },
  { id: 8, name: "Whisper", category: "Audio", status: "Active", icon: "🎙️", description: "Speech recognition system" },
  { id: 9, name: "DreamFusion", category: "3D", status: "Available", icon: "🎮", description: "Text-to-3D generation" },
  { id: 10, name: "Synthesia", category: "Video", status: "Available", icon: "📹", description: "AI video avatars" },
  { id: 11, name: "Anthropic", category: "Text", status: "Connected", icon: "💭", description: "Advanced reasoning AI" },
  { id: 12, name: "Play.ht", category: "Audio", status: "Available", icon: "🔊", description: "Voice cloning technology" },
];

const Ecosystem = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["All", "Text", "Image", "Video", "Audio", "3D"];

  const filteredTools = mockTools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Connected": return "bg-primary text-primary-foreground";
      case "Active": return "bg-secondary text-secondary-foreground";
      case "Available": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
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
                    variant={tool.status === "Connected" || tool.status === "Active" ? "outline" : "default"}
                    onClick={() => toast.info(`Mock: ${tool.status === "Connected" || tool.status === "Active" ? "Configure" : "Connect"} ${tool.name}`)}
                  >
                    {tool.status === "Connected" || tool.status === "Active" ? "Configure" : "Connect"}
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
