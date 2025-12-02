import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI research assistant. I can help you discover papers, explain concepts, and recommend studies. What would you like to explore today?",
    },
  ]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    // Simulate AI reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "This is a placeholder AI response. In production, this connects to your LLM backend.",
        },
      ]);
    }, 800);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-10 max-w-2xl">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-accent/10 p-4">
              <Sparkles className="h-10 w-10 text-accent" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            AI Research Assistant
          </h1>
          <p className="text-muted-foreground text-lg">
            Ask questions, get recommendations, or understand research papers instantly.
          </p>
        </div>

        {/* Chat Box */}
        <Card className="w-full max-w-4xl shadow-lg">
          <CardContent className="p-0 flex flex-col">
            <div
              ref={chatContainerRef}
              className="overflow-y-auto p-6 space-y-6 transition-all duration-300"
              style={{
                maxHeight: "450px",
                minHeight: "250px",
              }}
            >
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t p-4 flex items-center gap-2">
              <Input
                placeholder="Type your question here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                className="bg-gradient-primary text-primary-foreground gap-2 hover:opacity-90"
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-3 md:grid-cols-3 w-full max-w-4xl">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() =>
              setInput("Recommend recent papers for me.")
            }
          >
            Recommend Papers
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() =>
              setInput("Explain transformer architecture in simple terms.")
            }
          >
            Explain Concepts
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() =>
              setInput("Find related research on quantum computing.")
            }
          >
            Find Related Research
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          AI responses are for educational purposes and may require verification.
        </p>
      </div>
    </MainLayout>
  );
};

export default AIAssistant;
