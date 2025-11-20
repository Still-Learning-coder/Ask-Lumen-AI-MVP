import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, MessageCircle, Share2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const mockPosts = [
  {
    id: 1,
    author: "Alex Chen",
    avatar: "https://i.pravatar.cc/150?img=1",
    title: "Amazing 3D generations with new update!",
    content: "Just tried the new 3D model feature and I'm blown away! The quality is incredible and it only took minutes to generate. Here's what I created...",
    likes: 234,
    comments: 45,
    timestamp: "2 hours ago",
    tags: ["3D", "Tutorial"]
  },
  {
    id: 2,
    author: "Sarah Martinez",
    avatar: "https://i.pravatar.cc/150?img=2",
    title: "My workflow for creating AI art",
    content: "I've been experimenting with different prompts and techniques. Here's my process for creating stunning visuals consistently...",
    likes: 189,
    comments: 32,
    timestamp: "5 hours ago",
    tags: ["Art", "Workflow"]
  },
  {
    id: 3,
    author: "Mike Roberts",
    avatar: "https://i.pravatar.cc/150?img=3",
    title: "Best practices for prompt engineering",
    content: "After months of testing, I've compiled a list of the most effective prompt strategies. These tips have dramatically improved my results...",
    likes: 456,
    comments: 78,
    timestamp: "1 day ago",
    tags: ["Tips", "Featured"]
  },
  {
    id: 4,
    author: "Emma Wilson",
    avatar: "https://i.pravatar.cc/150?img=4",
    title: "Community challenge: Futuristic cities",
    content: "Let's create something amazing together! This week's challenge is to design futuristic cityscapes. Share your creations!",
    likes: 312,
    comments: 56,
    timestamp: "1 day ago",
    tags: ["Challenge", "Community"]
  },
  {
    id: 5,
    author: "David Kim",
    avatar: "https://i.pravatar.cc/150?img=5",
    title: "Integrating AI tools into my design process",
    content: "As a professional designer, here's how I've seamlessly integrated AI into my workflow without losing the human touch...",
    likes: 278,
    comments: 41,
    timestamp: "2 days ago",
    tags: ["Design", "Professional"]
  },
];

const trendingTopics = [
  { name: "3D Generation", posts: 234 },
  { name: "Prompt Engineering", posts: 189 },
  { name: "AI Art", posts: 156 },
  { name: "Tutorials", posts: 134 },
  { name: "Video Creation", posts: 98 },
];

const Community = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [postLikes, setPostLikes] = useState<Record<number, number>>(
    mockPosts.reduce((acc, post) => ({ ...acc, [post.id]: post.likes }), {})
  );
  const [newPost, setNewPost] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLike = (postId: number) => {
    setPostLikes((prev) => ({
      ...prev,
      [postId]: prev[postId] + 1,
    }));
    toast.success("Post liked!");
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      toast.success("Post created successfully!");
      setNewPost("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Community
              </h1>
              <p className="text-muted-foreground">
                Connect, share, and learn from fellow AI enthusiasts
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground">
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Post</DialogTitle>
                  <DialogDescription>
                    Share your insights, creations, or questions with the community
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[150px]"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePost} className="gradient-primary text-primary-foreground">
                    Post
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Posts Feed */}
            <div className="lg:col-span-2 space-y-6">
              {mockPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.avatar} />
                        <AvatarFallback>{post.author.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{post.author}</p>
                            <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <p className="text-muted-foreground">{post.content}</p>
                    <div className="flex gap-2 flex-wrap">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className="gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      {postLikes[post.id]}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => toast.info("Mock: Comments would open here")}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => toast.info("Mock: Share dialog would open")}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingTopics.map((topic) => (
                    <button
                      key={topic.name}
                      className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors text-left"
                      onClick={() => toast.info(`Mock: Filter by ${topic.name}`)}
                    >
                      <span className="font-medium">#{topic.name}</span>
                      <span className="text-sm text-muted-foreground">{topic.posts} posts</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Community Stats */}
              <Card className="gradient-primary text-primary-foreground">
                <CardContent className="pt-6 space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold">12.5K</p>
                    <p className="text-sm opacity-90">Community Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold">3.2K</p>
                    <p className="text-sm opacity-90">Posts This Week</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
