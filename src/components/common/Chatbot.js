import React, { useState, useRef, useEffect } from 'react';

const chatData = {
  greeting: {
    text: "Hi there! I'm your SafeHer Safety Assistant. How can I help you today?",
    options: [
      { label: 'Safety Tips', key: 'safety_tips' },
      { label: 'Emergency Numbers', key: 'emergency_numbers' },
      { label: 'How to Use SafeHer', key: 'how_to_use' },
      { label: 'What to Do in Emergency', key: 'emergency_action' },
      { label: 'Self-Defense Basics', key: 'self_defense' }
    ]
  },
  safety_tips: {
    text: "Here are some important safety topics. Pick one to learn more:",
    options: [
      { label: 'Traveling Alone', key: 'tip_traveling' },
      { label: 'Night Safety', key: 'tip_night' },
      { label: 'Public Transport', key: 'tip_transport' },
      { label: 'Online Safety', key: 'tip_online' },
      { label: 'Back to Main Menu', key: 'greeting' }
    ]
  },
  tip_traveling: {
    text: "Tips for Traveling Alone:\n\n• Share your live location with a trusted contact before leaving.\n• Stick to well-lit, populated routes — avoid shortcuts through isolated areas.\n• Keep your phone charged and carry a power bank.\n• Stay alert and avoid using headphones at full volume.\n• Trust your instincts — if something feels wrong, move to a crowded area.\n• Keep emergency numbers on speed dial.",
    options: [
      { label: 'More Safety Tips', key: 'safety_tips' },
      { label: 'Back to Main Menu', key: 'greeting' }
    ]
  },
  tip_night: {
    text: "Night Safety Tips:\n\n• Avoid walking alone at night — use a trusted cab service or ask someone to accompany you.\n• Stay in well-lit areas and walk confidently.\n• Keep your keys ready before reaching your door.\n• Avoid displaying expensive jewelry or gadgets.\n• If a vehicle slows down near you, walk in the opposite direction of traffic.\n• Use SafeHer's SOS feature if you feel threatened.",
    options: [
      { label: 'More Safety Tips', key: 'safety_tips' },
      { label: 'Back to Main Menu', key: 'greeting' }
    ]
  },
  tip_transport: {
    text: "Public Transport Safety:\n\n• Prefer sitting near the driver or in well-occupied compartments.\n• Note the vehicle number and share it with someone you trust.\n• Avoid empty buses or train coaches, especially at night.\n• Stay near other women passengers when possible.\n• Keep bags zipped and close to your body.\n• Get off immediately if someone makes you uncomfortable.",
    options: [
      { label: 'More Safety Tips', key: 'safety_tips' },
      { label: 'Back to Main Menu', key: 'greeting' }
    ]
  },
  tip_online: {
    text: "Online Safety Tips:\n\n• Never share personal details (address, routine, travel plans) publicly on social media.\n• Use strong, unique passwords and enable two-factor authentication.\n• Be cautious meeting someone you only know online — meet in public places.\n• Don't click on suspicious links or download unknown attachments.\n• Review privacy settings on all social media accounts regularly.\n• Report and block anyone who harasses you online.",
    options: [
      { label: 'More Safety Tips', key: 'safety_tips' },
      { label: 'Back to Main Menu', key: 'greeting' }
    ]
  },
  emergency_numbers: {
    text: "Important Emergency Numbers (India):\n\n• 112 — National Emergency Number (Police, Fire, Ambulance)\n• 1091 — Women Helpline\n• 100 — Police\n• 102 — Ambulance\n• 181 — Women Helpline (Domestic Abuse)\n• 1098 — Child Helpline\n• 7827-170-170 — Women Helpline (WhatsApp)\n\nSave these numbers in your phone for quick access!",
    options: [
      { label: 'Back to Main Menu', key: 'greeting' }
    ]
  },
  how_to_use: {
    text: "How to use SafeHer — choose a topic:",
    options: [
      { label: 'Using SOS', key: 'use_sos' },
      { label: 'Volunteer System', key: 'use_volunteers' },
      { label: 'Emergency Contacts', key: 'use_contacts' },
      { label: 'Back to Main Menu', key: 'greeting' }
    ]
  },
  use_sos: {
    text: "How to Use the SOS Feature:\n\n1. Log in to your SafeHer account.\n2. On your dashboard, you'll see a big red SOS button.\n3. Tap it once to trigger an emergency alert.\n4. Your live location is automatically shared with nearby volunteers and your emergency contacts.\n5. A volunteer will be dispatched to help you.\n6. You can cancel the alert if you're safe.\n\nTip: Make sure location services are enabled on your device!",
    options: [
      { label: 'More About SafeHer', key: 'how_to_use' },
      { label: 'Back to Main Menu', key: 'greeting' }
    ]
  },
  use_volunteers: {
    text: "About the Volunteer System:\n\n• SafeHer has a network of verified volunteers in your area.\n• When you trigger an SOS, nearby on-duty volunteers receive your alert.\n• A volunteer can accept the alert and head to your location in real-time.\n• You can track the volunteer's movement on the map.\n• Volunteers are background-verified for your safety.\n\nWant to help others? Register as a volunteer from the home page!",
    options: [
      { label: 'More About SafeHer', key: 'how_to_use' },
      { label: 'Back to Main Menu', key: 'greeting' }
    ]
  },
  use_contacts: {
    text: "Managing Emergency Contacts:\n\n1. Go to your Dashboard and find the 'Emergency Contacts' section.\n2. Click 'Add Contact' to add a trusted person.\n3. Enter their name, phone number, and relationship.\n4. You can add up to 5 emergency contacts.\n5. When you trigger SOS, all your contacts receive an SMS/notification with your location.\n\nKeep your contacts updated!",
    options: [
      { label: 'More About SafeHer', key: 'how_to_use' },
      { label: 'Back to Main Menu', key: 'greeting' }
    ]
  },
  emergency_action: {
    text: "What to Do in an Emergency:\n\n1. Stay Calm — take a deep breath and assess the situation.\n2. Move to Safety — get to a crowded or well-lit area if possible.\n3. Use SafeHer SOS — tap the SOS button to alert volunteers and contacts.\n4. Call 112 — India's unified emergency number reaches police, fire & ambulance.\n5. Make Noise — shout, use a whistle, or draw attention to yourself.\n6. Don't Resist a Robbery — your safety matters more than possessions.\n7. Remember Details — note the appearance, direction, and vehicle of any attacker.\n8. Seek Help — approach a shop, security guard, or any trusted person nearby.",
    options: [
      { label: 'Emergency Numbers', key: 'emergency_numbers' },
      { label: 'Back to Main Menu', key: 'greeting' }
    ]
  },
  self_defense: {
    text: "Self-Defense Basics:\n\n• Be Aware — always be conscious of your surroundings.\n• Maintain Distance — keep an arm's length from strangers.\n• Use Your Voice — a loud, firm 'NO' or 'BACK OFF' can deter attackers.\n• Target Weak Points — eyes, nose, throat, groin, and knees are vulnerable areas.\n• Use Everyday Items — keys, pens, umbrellas, or bags can be used for defense.\n• Practice Basic Moves — palm strikes, knee kicks, and elbow strikes are effective.\n• Take a Class — consider joining a self-defense workshop in your area.\n\nRemember: The goal is to create an opportunity to escape, not to fight.",
    options: [
      { label: 'Back to Main Menu', key: 'greeting' }
    ]
  }
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      addBotMessage('greeting');
    }
  };

  const addBotMessage = (key) => {
    const data = chatData[key];
    if (!data) return;
    setMessages(prev => [...prev, { sender: 'bot', text: data.text, options: data.options }]);
  };

  const handleOptionClick = (option) => {
    setMessages(prev => [...prev, { sender: 'user', text: option.label }]);
    setTimeout(() => addBotMessage(option.key), 300);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    const text = inputText.trim().toLowerCase();
    if (!text) return;

    setMessages(prev => [...prev, { sender: 'user', text: inputText.trim() }]);
    setInputText('');

    let matchedKey = null;
    if (text.includes('sos') || text.includes('emergency button') || text.includes('alert')) {
      matchedKey = 'use_sos';
    } else if (text.includes('emergency number') || text.includes('helpline') || text.includes('call')) {
      matchedKey = 'emergency_numbers';
    } else if (text.includes('volunteer')) {
      matchedKey = 'use_volunteers';
    } else if (text.includes('contact')) {
      matchedKey = 'use_contacts';
    } else if (text.includes('travel')) {
      matchedKey = 'tip_traveling';
    } else if (text.includes('night') || text.includes('dark')) {
      matchedKey = 'tip_night';
    } else if (text.includes('transport') || text.includes('bus') || text.includes('train') || text.includes('cab')) {
      matchedKey = 'tip_transport';
    } else if (text.includes('online') || text.includes('social media') || text.includes('internet')) {
      matchedKey = 'tip_online';
    } else if (text.includes('self defense') || text.includes('self-defense') || text.includes('defend') || text.includes('fight')) {
      matchedKey = 'self_defense';
    } else if (text.includes('safety tip') || text.includes('safe')) {
      matchedKey = 'safety_tips';
    } else if (text.includes('how') || text.includes('use') || text.includes('app')) {
      matchedKey = 'how_to_use';
    } else if (text.includes('emergency') || text.includes('danger') || text.includes('help')) {
      matchedKey = 'emergency_action';
    }

    setTimeout(() => {
      if (matchedKey) {
        addBotMessage(matchedKey);
      } else {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: "I'm not sure about that. Here are some topics I can help you with:",
          options: chatData.greeting.options
        }]);
      }
    }, 300);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
        title={isOpen ? 'Close chat' : 'Safety Assistant'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div>
              <strong>SafeHer Assistant</strong>
              <span style={{ fontSize: '0.75rem', display: 'block', opacity: 0.9 }}>
                Your safety companion
              </span>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index}>
                <div className={`chatbot-message ${msg.sender}`}>
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                {msg.sender === 'bot' && msg.options && index === messages.length - 1 && (
                  <div className="chatbot-quick-replies">
                    {msg.options.map((opt, i) => (
                      <button key={i} onClick={() => handleOptionClick(opt)}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleInputSubmit}>
            <input
              type="text"
              placeholder="Type a question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit">➤</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
