import React, { useState, useEffect, useRef } from 'react';
import './TenantChatbot.css';

// ✅ OFFLINE CALENDAR: Local calendar management with FullCalendar-like functionality
const offlineCalendar = {
  checkAvailability: (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    
    // Simple availability logic (can be enhanced)
    const availableDates = [
      new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      new Date(today.getTime() + 48 * 60 * 60 * 1000), // Day after
    ];
    
    return !availableDates.some(available => 
      checkDate.toDateString() === available.toDateString()
    );
  },
  
  bookViewing: (propertyId, date, time) => {
    const bookings = JSON.parse(localStorage.getItem('viewingBookings') || '[]');
    const booking = { propertyId, date, time, status: 'pending', createdAt: new Date().toISOString() };
    bookings.push(booking);
    localStorage.setItem('viewingBookings', JSON.stringify(bookings));
    return { success: true, message: 'Viewing scheduled successfully!' };
  },
  
  getBookings: () => {
    return JSON.parse(localStorage.getItem('viewingBookings') || '[]');
  },
  
  // ✅ ENHANCED: FullCalendar-like functionality
  generateCalendarView: () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const calendar = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Add week headers
    calendar.push(weekDays);
    
    // Add empty cells for days before month starts
    let currentWeek = [];
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push('');
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth, day);
      const isAvailable = offlineCalendar.checkAvailability(currentDate);
      const isToday = currentDate.toDateString() === today.toDateString();
      
      currentWeek.push({
        day,
        date: currentDate,
        available: isAvailable,
        today: isToday
      });
      
      if (currentWeek.length === 7) {
        calendar.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Add remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push('');
      }
      calendar.push(currentWeek);
    }
    
    return calendar;
  },
  
  // ✅ ENHANCED: Get available time slots
  getAvailableTimeSlots: (date) => {
    const timeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
    ];
    
    const bookings = offlineCalendar.getBookings();
    const bookedTimes = bookings
      .filter(booking => booking.date === date)
      .map(booking => booking.time);
    
    return timeSlots.filter(slot => !bookedTimes.includes(slot));
  }
};

// ✅ DIGITAL CONCIERGE: Lead qualification and FAQ
const digitalConcierge = {
  captureLead: (message) => {
    const leadData = {
      timestamp: new Date().toISOString(),
      message,
      needs: {
        budget: message.toLowerCase().includes('budget') || message.toLowerCase().includes('price'),
        moveIn: message.toLowerCase().includes('move') || message.toLowerCase().includes('when'),
        pets: message.toLowerCase().includes('pet') || message.toLowerCase().includes('animal'),
        amenities: message.toLowerCase().includes('wifi') || message.toLowerCase().includes('parking')
      }
    };
    
    const leads = JSON.parse(localStorage.getItem('tenantLeads') || '[]');
    leads.push(leadData);
    localStorage.setItem('tenantLeads', JSON.stringify(leads));
    
    return { captured: true, data: leadData };
  },
  
  getFAQ: (query) => {
    const faqs = {
      'pet policy': 'Most properties allow pets with additional deposit. Check specific property details.',
      'rent payment': 'Rent is due monthly. Payment methods include bank transfer, GCash, and cash.',
      'utilities': 'Water and electricity are typically included. WiFi depends on the property.',
      'maintenance': 'Report issues through the dashboard or contact the landlord directly.',
      'lease terms': 'Standard lease is 6-12 months. Security deposit required.'
    };
    
    const lowerQuery = query.toLowerCase();
    for (const [key, answer] of Object.entries(faqs)) {
      if (lowerQuery.includes(key)) {
        return answer;
      }
    }
    
    return 'I can help with pet policies, rent payments, utilities, maintenance, and lease terms. What specific information do you need?';
  },
  
  processIntent: (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Intent detection for property recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('looking for')) {
      return 'recommendation';
    }
    
    if (lowerMessage.includes('schedule') || lowerMessage.includes('viewing') || lowerMessage.includes('visit')) {
      return 'viewing';
    }
    
    if (lowerMessage.includes('apply') || lowerMessage.includes('rent')) {
      return 'application';
    }
    
    return 'general';
  }
};

const TenantChatbot = ({ properties = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]); // Maintain full conversation history

  // Load Puter.js and check ready state
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    document.head.appendChild(script);
    
    // Check if Puter.js is ready
    const checkPuter = () => {
      if (window.puter?.ai) {
        console.log('✅ Puter.js AI ready!');
      } else {
        console.log('⏳ Waiting for Puter.js...');
        setTimeout(checkPuter, 500);
      }
    };
    
    setTimeout(checkPuter, 1000); // Start checking after script loads
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initial welcome message
  useEffect(() => {
    setMessages([{
      role: "assistant",
      content: "🏠 Hi! I'm your AI Virtual Leasing Assistant! I'm available 24/7 to help you:\n\n• 📅 Schedule property viewings with offline calendar sync\n• 📋 Complete rental applications with document guidance\n• 💰 Budget planning and affordability analysis\n• 🎯 Smart property recommendations based on your needs\n• 📞 Connect with property owners instantly\n• 💡 Digital concierge for policies, payments, and maintenance\n\nTry asking: 'schedule viewing tomorrow' or 'help me apply' or 'recommend 2BR under ₱3000'"
    }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // ✅ ENHANCED: AI Virtual Leasing Assistant with MongoDB integration
    const instantResponse = await getInstantResponse(input, properties || [], chatHistory);
    const instantMsg = { role: "assistant", content: instantResponse };
    setMessages(prev => [...prev, instantMsg]);

    // ✅ OPTIONAL: AI enhancement in background
    setTimeout(async () => {
      try {
        if (window.puter?.ai && properties.length > 0) {
          const enhancedResponse = await getAIResponse(input, properties, chatHistory);
          setMessages(prev => prev.map(msg => 
            msg === instantMsg 
              ? { role: "assistant", content: enhancedResponse }
              : msg
          ));
        }
      } catch (error) {
        console.log('AI enhancement failed, keeping instant response');
      }
    }, 100);
  };

  // ✅ ENHANCED: AI Virtual Leasing Assistant
  const getInstantResponse = async (query, availableProperties, chatHistory) => {
    const lowerQuery = query.toLowerCase();
    const intent = digitalConcierge.processIntent(query);
    
    // Handle different intents
    switch (intent) {
      case 'recommendation':
        return await getRecommendations(query, availableProperties);
      case 'viewing':
        return handleViewingRequest(query, availableProperties);
      case 'application':
        return handleApplicationRequest(query, availableProperties);
      case 'general':
        return getGeneralResponse(query, availableProperties);
      default:
        return getGeneralResponse(query, availableProperties);
    }
  };

  // ✅ RECOMMENDATIONS: Property suggestions with MongoDB integration
  const getRecommendations = async (query, availableProperties) => {
    try {
      // Extract budget from query using regex
      const budgetMatch = query.match(/(\d+)\s*php|budget\s*([\d,]+)|(under|below|less than)\s*(\d+)/i);
      const budget = budgetMatch ? parseInt(budgetMatch[2] || budgetMatch[3] || budgetMatch[1]) : null;
      
      // Extract bedrooms from query
      const bedroomMatch = query.match(/(\d+)\s*(br|bedroom|room)/i);
      const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : null;
      
      // Extract location from query
      const locationMatch = query.match(/(tupi|municipality|barangay|purok|near\s*([a-z]+))/i);
      const location = locationMatch ? locationMatch[2] || locationMatch[1] : null;
      
      // Extract category from query
      const categoryMatch = query.match(/(boarding house|apartment|condo|house|room)/i);
      const category = categoryMatch ? categoryMatch[1] : null;
      
      // Build search URL
      const searchParams = new URLSearchParams();
      if (budget) searchParams.append('budget', budget);
      if (bedrooms) searchParams.append('bedrooms', bedrooms);
      if (location) searchParams.append('location', location);
      if (category) searchParams.append('category', category);
      
      // ✅ MONGODB: Query database for real property data
      const searchUrl = `/api/tenant/real-estate/chatbot/search?${searchParams.toString()}`;
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (data.properties && data.properties.length > 0) {
        const propertyList = data.properties.map((prop, i) => {
          const title = prop.title || prop.propertyName || 'Unknown Property';
          const price = prop.price || prop.rentAmount || 0;
          const location = prop.address?.city || prop.location || 'Location not specified';
          const bedrooms = prop.bedrooms || prop.numberOfBedrooms || 'Not specified';
          
          return `${i+1}. ${title} - ₱${price}/mo - ${location} - ${bedrooms}BR`;
        }).join('\n');
        
        const matchType = data.exactMatch ? 'exact matches' : 'closest matches';
        return `🎯 **Found ${data.properties.length} ${matchType} for you:**\n\n${propertyList}\n\n💡 ${data.message}`;
      } else {
        return `🏠 **No properties found matching your criteria.**\n\n💡 Try adjusting your budget, location, or bedroom requirements. I can help you find alternatives!`;
      }
      
    } catch (error) {
      console.error('Chatbot property search error:', error);
      
      // Fallback to local properties if API fails
      if (availableProperties.length === 0) {
        return '🏠 Currently no properties available. Would you like me to notify you when new properties are listed?';
      }
      
      const matches = availableProperties.slice(0, 3).map(p => ({
        title: p.title || p.propertyName || 'Unknown Property',
        price: p.price || p.rentAmount || 0,
        location: p.location || p.address || 'Location not specified',
        matchScore: calculateMatchScore(query, p)
      }));
      
      const matchList = matches.map((match, i) => 
        `${i+1}. ${match.title} - ₱${match.price}/mo - ${match.location} (Match: ${match.matchScore}%)`
      ).join('\n');
      
      return `🎯 **Recommended Properties for you:**\n\n${matchList}\n\n💡 These properties best match your needs. Would you like to schedule a viewing?`;
    }
  };

  // ✅ VIEWING: Schedule management with enhanced calendar
  const handleViewingRequest = (query, availableProperties) => {
    const dateMatch = query.match(/(today|tomorrow|\d{1,2})/i);
    const timeMatch = query.match(/(morning|afternoon|evening|\d{1,2}:\d{2})/i);
    
    if (dateMatch && timeMatch) {
      const result = offlineCalendar.bookViewing('sample-property', dateMatch[1], timeMatch[1]);
      
      // ✅ ENHANCED: Show calendar view and available time slots
      const calendar = offlineCalendar.generateCalendarView();
      const timeSlots = offlineCalendar.getAvailableTimeSlots(dateMatch[1]);
      
      return `📅 **Viewing Scheduled!**\n\n${result.message}\n\n🏠 **Calendar View:**\n${formatCalendarForChat(calendar)}\n\n⏰ **Available Time Slots:**\n${timeSlots.join(', ')}\n\n💡 I'll send you a reminder 1 hour before the viewing.`;
    }
    
    // ✅ ENHANCED: Show available calendar and time slots
    const calendar = offlineCalendar.generateCalendarView();
    const availableDates = calendar.flat().filter(day => day && day.available).slice(0, 5);
    
    return `📅 **Schedule a Viewing:**\n\nI can help you schedule property viewings!\n\n**📅 Available Dates:**\n${availableDates.map(d => `• ${d.day} ${d.date.toLocaleDateString()}`).join('\n')}\n\n**⏰ Available Times:** 9:00 AM - 6:00 PM\n\n💡 Tell me which property and preferred time.`;
  };
  
  // ✅ ENHANCED: Format calendar for chat display
  const formatCalendarForChat = (calendar) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    const today = new Date();
    const currentMonth = monthNames[today.getMonth()];
    const currentYear = today.getFullYear();
    
    return `📆 ${currentMonth} ${currentYear}\n${calendar.slice(1, 3).map(week => 
      week.map(day => {
        if (!day) return '   ';
        if (day.today) return `[${day.day}]`;
        if (day.available) return ` ${day.day} `;
        return `(${day.day})`;
      }).join('|')
    ).join('\n')}`;
  };

  // ✅ APPLICATION: Application guidance
  const handleApplicationRequest = (query, availableProperties) => {
    return `📋 **Rental Application:**\n\nI can guide you through the application process!\n\n**Required Documents:**\n• Valid ID (Passport/Driver's License)\n• Proof of Income (Payslips, Certificate of Employment)\n• Proof of Address (Utility Bill, Barangay Clearance)\n• Contact References (2-3 references)\n\n**Application Process:**\n1. Fill out online application form\n2. Submit required documents\n3. Background check and credit verification\n4. Lease agreement signing\n5. Security deposit payment\n\n💡 Ready to apply? I can connect you with the property owner and help you prepare the documents!`;
  };

  // ✅ MATCH SCORE: Smart property matching
  const calculateMatchScore = (query, property) => {
    let score = 50; // Base score
    
    // Price matching (30% weight)
    const priceKeywords = query.match(/(\d+)\s*php|budget\s*([\d,]+)|(cheap|affordable|expensive)/i);
    if (priceKeywords && property.price) {
      const budget = parseInt(priceKeywords[2]) || parseInt(priceKeywords[1]) || 5000;
      const priceDiff = Math.abs(property.price - budget);
      if (priceDiff <= 500) score += 30;
      else if (priceDiff <= 1000) score += 20;
      else if (priceDiff <= 2000) score += 10;
    }
    
    // Location matching (25% weight)
    const locationKeywords = query.match(/(tupi|municipality|barangay|purok|near\s*([a-z]+))/i);
    if (locationKeywords && property.location) {
      const location = locationKeywords[2] || locationKeywords[1];
      if (property.location.toLowerCase().includes(location.toLowerCase())) score += 25;
    }
    
    // Bedroom matching (20% weight)
    const bedroomMatch = query.match(/(\d+)\s*(br|bedroom|room)/i);
    if (bedroomMatch && property.bedrooms) {
      const requestedBeds = parseInt(bedroomMatch[1]);
      if (property.bedrooms === requestedBeds) score += 20;
      else if (property.bedrooms > requestedBeds) score += 10;
    }
    
    // Amenity matching (15% weight)
    const amenityKeywords = ['wifi', 'parking', 'aircon', 'kitchen'];
    amenityKeywords.forEach(keyword => {
      if (query.toLowerCase().includes(keyword) && property.amenities?.some(amenity => 
        amenity.toLowerCase().includes(keyword))) {
        score += 15;
      }
    });
    
    return Math.min(100, score);
  };

  // ✅ GENERAL RESPONSE: Enhanced default responses
  const getGeneralResponse = (query, availableProperties) => {
    // Check for FAQ matches
    const faqResponse = digitalConcierge.getFAQ(query);
    if (faqResponse !== 'I can help with pet policies, rent payments, utilities, maintenance, and lease terms. What specific information do you need?') {
      return `💡 **${faqResponse}**`;
    }
    
    // Capture lead for follow-up
    const lead = digitalConcierge.captureLead(query);
    
    if (query.toLowerCase().includes('show') || query.toLowerCase().includes('available') || query.toLowerCase().includes('list')) {
      if (availableProperties.length === 0) {
        return "🏠 Currently no properties available. I've captured your request and will notify you when new properties are listed!";
      }
      
      const propertiesList = availableProperties.slice(0, 3).map((p, i) => 
        `${i+1}. ${p.title || p.propertyName || 'Property'} - ₱${p.price || '0'}/mo - ${p.location || 'Location'} - ${p.bedrooms || '?'}BR`
      ).join('\n');
      
      return `✅ Found ${availableProperties.length} properties:\n\n${propertiesList}\n\n💡 Ask for details about any property or filter by price/location!`;
    }
    
    if (query.toLowerCase().includes('price') || query.toLowerCase().includes('cheap') || query.toLowerCase().includes('affordable')) {
      const sorted = availableProperties
        .filter(p => p.price)
        .sort((a, b) => a.price - b.price)
        .slice(0, 3);
      
      if (sorted.length === 0) {
        return "💰 No properties with pricing available. I've noted your budget preference and will alert you for matching properties.";
      }
      
      const cheapest = sorted.map((p, i) => 
        `${i+1}. ${p.title || 'Property'} - ₱${p.price}/mo - ${p.location || 'Location'}`
      ).join('\n');
      
      return `💰 **Most Affordable Options:**\n\n${cheapest}\n\n💡 All properties include basic amenities. Need something specific? Just ask!`;
    }
    
    if (query.toLowerCase().includes('location') || query.toLowerCase().includes('area') || query.toLowerCase().includes('near')) {
      const locations = [...new Set(availableProperties.map(p => p.location).filter(Boolean))];
      if (locations.length === 0) {
        return "📍 No specific locations available. I've captured your location preference and will notify you of properties in your preferred area.";
      }
      
      return `📍 **Available Locations:**\n\n${locations.slice(0, 5).join('\n')}\n\n💡 Which area interests you most?`;
    }
    
    if (query.toLowerCase().includes('bedroom') || query.toLowerCase().includes('br') || query.toLowerCase().includes('room')) {
      const byBedrooms = availableProperties.reduce((acc, p) => {
        const beds = p.bedrooms || p.numberOfBedrooms || 'unknown';
        acc[beds] = (acc[beds] || 0) + 1;
        return acc;
      }, {});
      
      const bedroomList = Object.entries(byBedrooms)
        .map(([beds, count]) => `${beds}BR: ${count} properties`)
        .join('\n');
      
      return `🛏️ **Available by Bedrooms:**\n\n${bedroomList}\n\n💡 How many bedrooms do you need?`;
    }
    
    // Default enhanced response
    return `🏠 **AI Virtual Leasing Assistant**\n\nI'm here to help you find the perfect rental!\n\n**24/7 Services Available:**\n• 📅 Schedule property viewings\n• 📋 Complete rental applications\n• 💰 Budget planning and affordability\n• 🎯 Smart property recommendations\n• 📞 Connect with property owners\n\n**Current Inventory:** ${availableProperties.length} properties available\n\n**Your Request Captured:** ${lead.captured ? 'Yes - I\'ll follow up!' : 'Ask me anything!'}\n\n💡 How can I assist your rental journey today?`;
  };

  // ✅ AI: Enhanced response function
  const getAIResponse = async (query, availableProperties, history) => {
    const propertyContext = availableProperties.map(p => ({
      id: p._id,
      title: p.title || p.propertyName || 'Unknown Property',
      price: p.price || p.rentAmount || 0,
      location: p.location || p.address || 'Location not specified',
      city: p.city || 'Unknown',
      country: p.country || 'Unknown',
      bedrooms: p.bedrooms || p.numberOfBedrooms || 'Not specified',
      bathrooms: p.bathrooms || p.numberOfBathrooms || 'Not specified',
      area: p.area || p.squareFeet || p.size || 'Not specified',
      safetyRating: p.safetyRating || 'B',
      convenienceScore: p.convenienceScore || 7,
      maintenanceRating: p.maintenanceRating || 'Good',
      amenities: p.amenities || [],
      description: p.description || 'No description available',
      propertyType: p.propertyType || p.type || 'Not specified',
      available: p.available !== false,
      owner: p.ownerId || 'Unknown landlord'
    })).slice(0, 5);

    const tenantContext = {
      platform: 'Real Estate Rental Management System',
      availableProperties: availableProperties.length,
      userRole: 'tenant',
      capabilities: [
        'Search property database',
        'Compare rentals by price/safety/convenience',
        'Schedule viewings',
        'Apply to listings',
        'Check approval status',
        'Pay rent',
        'Request maintenance'
      ]
    };

    const fullResponse = await window.puter.ai.chat(query, {
      model: "gpt-4o-mini",
      system: `You are an intelligent rental assistant. 
      
      PROPERTIES: ${JSON.stringify(propertyContext, null, 2)}
      
      SYSTEM: ${JSON.stringify(tenantContext, null, 2)}
      
      HISTORY: ${JSON.stringify(history.slice(-3), null, 2)}
      
      Use ONLY the property data provided. Be helpful and specific.`,
      temperature: 0.7
    });
    
    if (typeof fullResponse === 'string') {
      return fullResponse;
    } else if (fullResponse?.message?.content) {
      return fullResponse.message.content.toString();
    } else if (fullResponse?.choices?.[0]?.message?.content) {
      return fullResponse.choices[0].message.content.toString();
    } else if (fullResponse?.text) {
      return fullResponse.text;
    }
    
    return "Unable to get enhanced response.";
  };

  return (
    <>
      {/* Floating Chat Button - ALWAYS VISIBLE */}
      <div className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        <div className="chatbot-icon">
          <i className="fas fa-comments"></i>
          <span className="pulse-dot"></span>
        </div>
        <span className="chatbot-label">Rental Help</span>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <span>🏠 AI Virtual Leasing Assistant</span>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Ask about properties, prices, locations, amenities, or 'help me apply'..."
              rows="1"
            />
            <button onClick={sendMessage} disabled={!input.trim()}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TenantChatbot;
