import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Settings, Key, AlertCircle } from 'lucide-react';

const Chatbot = () => {
  // API Key Management - Add your API key here
  const [openRouterApiKey, setOpenRouterApiKey] = useState('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');
  const [tempApiKey, setTempApiKey] = useState('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');
  
  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your AI assistant powered by OpenRouter. I can help you with questions, creative writing, analysis, coding, and much more. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get AI response from OpenRouter
  const getOpenRouterResponse = async (userInput) => {
    const apiKey = openRouterApiKey || tempApiKey;
    
    if (!apiKey || apiKey === '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') {
      return "Please replace 'YOUR_API_KEY_HERE' with your actual OpenRouter API key in the code.";
    }

    try {
      const response = await fetch('https://api.openrouter.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': 'Simple AI Chatbot'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful, knowledgeable, and friendly AI assistant. Provide accurate, helpful responses to any questions or requests. Be conversational and engaging.'
            },
            {
              role: 'user',
              content: userInput
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I apologize, but I couldn't generate a proper response. Please try again.";
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      return "I encountered an error while processing your request. Please check your API key and try again.";
    }
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const response = await getOpenRouterResponse(currentInput);
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
      
    } catch (error) {
      console.error('Message processing error:', error);
      
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: 'I apologize, but I encountered an issue processing your request. Please try again.',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Save API key directly
  const handleSaveApiKey = (newKey) => {
    setOpenRouterApiKey(newKey);
    setTempApiKey(newKey);
  };

  // Settings Panel Component
  const SettingsPanel = () => {
    const [localApiKey, setLocalApiKey] = useState(openRouterApiKey || tempApiKey);

    const handleSaveKey = () => {
      handleSaveApiKey(localApiKey);
      setShowSettings(false);
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* OpenRouter API Configuration */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <Key className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">OpenRouter AI Integration</h3>
              <p className="text-sm text-gray-600">Enter your OpenRouter API key to enable AI responses</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenRouter API Key
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleSaveKey}
              disabled={!localApiKey.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Save API Key
            </button>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">How to get your OpenRouter API Key:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Visit <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai</a></li>
                <li>2. Sign up or log in to your account</li>
                <li>3. Go to the API Keys section</li>
                <li>4. Generate a new API key</li>
                <li>5. Copy and paste it above</li>
              </ol>
              <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-300">
                <p className="text-xs text-blue-700">
                  <strong>🔒 Security Note:</strong> Your API key is only stored in memory and never sent to external servers except OpenRouter for authentication.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Integration Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">OpenRouter AI API</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                (openRouterApiKey && openRouterApiKey !== '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') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {(openRouterApiKey && openRouterApiKey !== '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') ? '✅ Configured' : '⚪ Not Configured'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasApiKey = Boolean(openRouterApiKey && openRouterApiKey !== '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');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-t-lg shadow-lg p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <MessageCircle className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AI Assistant</h1>
                <p className="text-gray-600 text-sm">
                  {hasApiKey ? 'Powered by OpenRouter AI' : 'Add API key in code to get started'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>

        {/* API Key Alert */}
        {!hasApiKey && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-center">
              <AlertCircle className="text-yellow-400 mr-3" size={20} />
              <div>
                <p className="text-sm text-yellow-700">
                  <strong>API key not configured.</strong> Please replace 'YOUR_API_KEY_HERE' with your actual OpenRouter API key in the code.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white rounded-b-lg shadow-lg h-[600px] flex flex-col">
          {showSettings ? (
            <SettingsPanel />
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="whitespace-pre-line">{message.text}</div>
                      <div className={`text-xs mt-2 opacity-70`}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    disabled={!hasApiKey}
                    className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || !hasApiKey}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500">
                    Powered by OpenRouter AI • Press Enter to send
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;