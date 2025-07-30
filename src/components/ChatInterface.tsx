import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface Source {
  content: string;
  metadata?: Record<string, any>;
}

interface ChatInterfaceProps {
  onSourcesUpdate: (sources: Source[]) => void;
}

export function ChatInterface({ onSourcesUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentQuestion,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion('');
    setIsLoading(true);

    try {
      // Before the API call - show loading cursor
      document.body.style.cursor = 'wait';

      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.answer || `This is a response to: "${userMessage.content}". The AI analyzed medical documents and provided comprehensive answers based on the loaded knowledge base.`,
        timestamp: new Date(),
      };

      const sources: Source[] = data.sources || [
        {
          content: "Sample medical text from a research paper discussing the topic. This would contain the actual extracted content from the medical knowledge base that supports the AI's answer.",
          metadata: { source: "Medical Journal 2023" }
        },
        {
          content: "Another relevant excerpt from a different medical document that provides additional context and supporting information for the generated response.",
          metadata: { source: "Clinical Guidelines" }
        }
      ];

      setMessages(prev => [...prev, aiMessage]);
      onSourcesUpdate(sources);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // After the request completes - restore default cursor
      document.body.style.cursor = 'default';
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <Bot className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-2">Welcome to MED AI</h3>
            <p>Ask any question about the medical knowledge base to get started.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`message-bubble ${message.type === 'user' ? 'user-message' : 'ai-message'}`}>
              <div className="flex items-start space-x-2">
                {message.type === 'ai' && (
                  <Bot className="w-5 h-5 mt-0.5 text-primary" />
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.type === 'user' && (
                  <User className="w-5 h-5 mt-0.5" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="ai-message message-bubble">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-primary" />
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span className="text-sm text-muted-foreground">Analyzing medical documents...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Question Input */}
      <Card className="m-4 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="Ask a medical question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!currentQuestion.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}