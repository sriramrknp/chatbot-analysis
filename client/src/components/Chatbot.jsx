import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [userData, setUserData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const initialized = useRef(false);

  const steps = [
    { field: 'name', prompt: 'Please enter your full name:' },
    { field: 'email', prompt: 'Please enter your email address:' },
    { field: 'txn_id', prompt: 'Provide the transaction ID:' },
    { field: 'problem', prompt: 'Describe the issue you\'re experiencing:' },
  ];

  useEffect(() => {
    if (!initialized.current) {
      addMessage(steps[0].prompt, 'bot');
      initialized.current = true;
    }
  }, []);

  const addMessage = (text, type) => {
    setMessages(prev => [...prev, { text, type }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Capture current step data before state updates
    const currentField = steps[currentStep].field;
    const currentValue = inputValue.trim();

    // Add user message
    addMessage(currentValue, 'user');

    // Update user data state
    setUserData(prev => ({
      ...prev,
      [currentField]: currentValue
    }));

    // Clear input
    setInputValue('');

    if (currentStep < steps.length - 1) {
      // Add next bot message
      addMessage(steps[currentStep + 1].prompt, 'bot');
      // Move to next step
      setCurrentStep(prev => prev + 1);
    } else {
      // Create complete data object including current input
      const completeData = {
        ...userData,
        [currentField]: currentValue // Include the last input
      };

      try {
        setIsLoading(true);
        const response = await axios.post('http://localhost:5001/api/generate-draft', completeData);
        addMessage(response.data.draft, 'bot');
      } catch (error) {
        addMessage('Error generating draft. Please try again.', 'bot');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.text.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ))}
        {isLoading && <div className="message bot">Generating draft...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chatbot-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your response..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {currentStep < steps.length - 1 ? 'Send' : 'Generate Draft'}
        </button>
      </form>
    </div>
  );
};

export default Chatbot;