import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Avatar,
  Fab,
} from "@mui/material";
import {
  MessageCircle,
  X,
  Send,
  Bot,
} from "lucide-react";

const AIChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: "Thank you for your message! I'm here to help with any questions about our products, orders, or general inquiries. What would you like to know?",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Fab
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: "fixed",
          bottom: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 1300,
          bgcolor: isOpen ? "#ef4444" : "#39FC1D",
          color: "white",
          "&:hover": {
            bgcolor: isOpen ? "#dc2626" : "#2dd817",
            transform: "scale(1.1)",
          },
          transition: "all 0.3s",
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Fab>

      {/* Chat Window */}
      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: { xs: 80, md: 100 },
            right: { xs: 8, md: 24 },
            zIndex: 1300,
            width: { xs: "calc(100% - 16px)", sm: 350, md: 400 },
            maxWidth: 400,
            height: { xs: 400, md: 500 },
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: "#39FC1D",
              color: "white",
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: "white",
                  width: 40,
                  height: 40,
                }}
              >
                <Bot size={24} color="#39FC1D" />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  AI Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Online
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setIsOpen(false)}
              size="small"
              sx={{
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <X size={20} />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              bgcolor: "#f9fafb",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    message.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    maxWidth: "80%",
                    p: 1.5,
                    bgcolor: message.sender === "user" ? "#39FC1D" : "white",
                    color: message.sender === "user" ? "white" : "#1f2937",
                    borderRadius: 2,
                    borderBottomRightRadius:
                      message.sender === "user" ? 0 : undefined,
                    borderBottomLeftRadius:
                      message.sender === "ai" ? 0 : undefined,
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {message.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: message.sender === "user" ? 0.8 : 0.6,
                      display: "block",
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Paper>
              </Box>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    bgcolor: "white",
                    borderRadius: 2,
                    borderBottomLeftRadius: 0,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "#9ca3af",
                          animation: "bounce 1.4s infinite ease-in-out",
                          animationDelay: `${i * 0.16}s`,
                          "@keyframes bounce": {
                            "0%, 80%, 100%": {
                              transform: "scale(0)",
                            },
                            "40%": {
                              transform: "scale(1)",
                            },
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #e5e7eb",
              bgcolor: "white",
              display: "flex",
              gap: 1,
            }}
          >
            <TextField
              inputRef={inputRef}
              fullWidth
              size="small"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": {
                    borderColor: "#39FC1D",
                  },
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              sx={{
                bgcolor: "#39FC1D",
                color: "white",
                "&:hover": {
                  bgcolor: "#2dd817",
                },
                "&.Mui-disabled": {
                  bgcolor: "#e5e7eb",
                },
              }}
            >
              <Send size={20} />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default AIChatBox;
