import { Sparkles, Code, Lightbulb, Palette } from "lucide-react";

interface StarterSuggestionsProps {
  onSelect: (prompt: string) => void;
}

const StarterSuggestions = ({ onSelect }: StarterSuggestionsProps) => {
  const suggestions = [
    {
      title: "Generate an image",
      prompt: "Generate an image of ",
      icon: Palette,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Help me code",
      prompt: "Help me with ",
      icon: Code,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Explain concepts",
      prompt: "Explain ",
      icon: Lightbulb,
      gradient: "from-amber-500 to-orange-500"
    },
    {
      title: "Creative writing",
      prompt: "Write a story about ",
      icon: Sparkles,
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 p-8 animate-fade-in">
      <div className="text-center space-y-3 max-w-2xl">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
          How can I help you today?
        </h2>
        <p className="text-muted-foreground text-lg">
          Choose a suggestion below or type your own message
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={index}
              onClick={() => onSelect(suggestion.prompt)}
              className="p-6 border border-border rounded-2xl hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all text-left group bg-card/50 backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${suggestion.gradient} text-white shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {suggestion.prompt}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StarterSuggestions;
