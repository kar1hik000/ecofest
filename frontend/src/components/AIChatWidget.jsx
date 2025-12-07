import { useState, useRef, useEffect } from 'react'

// API Base URL - uses env variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

function AIChatWidget({ festival, userRole }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Hi! I\'m EcoBot, your AI assistant for festival waste management. Ask me about eco-friendly alternatives, waste reduction tips, or municipal planning!'
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return

        const userMessage = inputValue.trim()
        setInputValue('')

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    context: { festival, role: userRole }
                })
            })
            const data = await response.json()

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response || 'Sorry, I couldn\'t process that request.'
            }])
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ Sorry, I\'m having trouble connecting. Please try again.'
            }])
        }
        setIsLoading(false)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const quickQuestions = [
        'Eco-friendly Diwali alternatives?',
        'How to reduce festival waste?',
        'Tips for municipalities'
    ]

    return (
        <>
            {/* Chat Button */}
            <button
                className={`ai-chat-button ${isOpen ? 'hidden' : ''}`}
                onClick={() => setIsOpen(true)}
                title="Chat with EcoBot AI"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.78.5 3.44 1.36 4.88L2 22l5.12-1.36C8.56 21.5 10.22 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-2h2v2h-2zm2-3.5h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z" />
                </svg>
                <span className="ai-chat-label">AI Help</span>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <div className="ai-chat-header-info">
                            <div className="ai-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13m9 0a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5M9 18v1h6v-1H9z" />
                                </svg>
                            </div>
                            <div>
                                <div className="ai-chat-title">EcoBot</div>
                                <div className="ai-chat-status">AI Assistant • {festival}</div>
                            </div>
                        </div>
                        <button className="ai-chat-close" onClick={() => setIsOpen(false)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`ai-message ${msg.role}`}>
                                <div className="ai-message-content">{msg.content}</div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="ai-message assistant">
                                <div className="ai-message-content typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length === 1 && (
                        <div className="ai-quick-questions">
                            {quickQuestions.map((q, idx) => (
                                <button
                                    key={idx}
                                    className="ai-quick-btn"
                                    onClick={() => {
                                        setInputValue(q)
                                        setTimeout(() => sendMessage(), 100)
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="ai-chat-input-area">
                        <input
                            type="text"
                            className="ai-chat-input"
                            placeholder="Ask about eco-friendly practices..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button
                            className="ai-send-btn"
                            onClick={sendMessage}
                            disabled={isLoading || !inputValue.trim()}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default AIChatWidget
