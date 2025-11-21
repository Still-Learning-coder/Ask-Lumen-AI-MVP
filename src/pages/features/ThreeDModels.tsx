import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SketchfabModel {
  uid: string;
  name: string;
  thumbnails: {
    images: Array<{ url: string; size: number }>;
  };
  viewerUrl: string;
  embedUrl: string;
  user: {
    displayName: string;
    username: string;
  };
  description?: string;
}

const ThreeDModels = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [models, setModels] = useState<SketchfabModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<SketchfabModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchModels = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter a search query",
        description: "Please enter something to search for 3D models",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(searchQuery)}&count=12`
      );
      
      if (!response.ok) throw new Error("Failed to fetch models");
      
      const data = await response.json();
      setModels(data.results || []);
      
      if (data.results?.length === 0) {
        toast({
          title: "No results",
          description: "No 3D models found for your search",
        });
      }
    } catch (error) {
      console.error("Error searching models:", error);
      toast({
        title: "Search failed",
        description: "Failed to search for 3D models. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchModels();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-foreground">3D Model Viewer</h1>
            <p className="text-muted-foreground">
              Browse and explore 3D models from Sketchfab
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-8">
            <Input
              placeholder="Search for 3D models (e.g., 'brain anatomy', 'molecular structure')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={searchModels} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="ml-2">Search</span>
            </Button>
          </div>

          {/* Selected Model Viewer */}
          {selectedModel && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{selectedModel.name}</CardTitle>
                <CardDescription>
                  By {selectedModel.user.displayName} (@{selectedModel.user.username})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={selectedModel.embedUrl}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allowFullScreen
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    title={selectedModel.name}
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedModel.viewerUrl, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Sketchfab
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedModel(null)}
                  >
                    Close Viewer
                  </Button>
                </div>
                {selectedModel.description && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {selectedModel.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Models Grid */}
          {models.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((model) => (
                <Card
                  key={model.uid}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedModel(model)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={model.thumbnails.images[0]?.url}
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                        {model.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        By {model.user.displayName}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {models.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Search for 3D Models</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter keywords to search for educational 3D models like anatomy, molecules, historical artifacts, and more
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ThreeDModels;
