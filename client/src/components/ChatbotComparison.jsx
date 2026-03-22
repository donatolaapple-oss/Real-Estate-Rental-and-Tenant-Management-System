import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, TextField, Box, Typography } from '@mui/material';

// ✅ CHATBOT COMPARISON: Natural language property comparison
const ChatbotComparison = () => {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState({
    budget: null,
    location: null,
    safety: null
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [finalMessage, setFinalMessage] = useState('');

  // ✅ NATURAL LANGUAGE PROCESSING: Parse user input
  const parseInput = (text) => {
    const budgetMatch = text.match(/budget[:\s]*([0-9]+)/i);
    const locationMatch = text.match(/location[:\s]*([a-zA-Z\s]+)/i);
    const safetyMatch = text.match(/safety[:\s]*(true|false|yes|no)/i);
    
    return {
      budget: budgetMatch ? parseInt(budgetMatch[1]) : null,
      location: locationMatch ? locationMatch[1].trim() : null,
      safety: safetyMatch ? safetyMatch[1].toLowerCase() === 'true' || safetyMatch[1].toLowerCase() === 'yes' : null
    };
  };

  // ✅ API ENDPOINTS: Use existing MongoDB endpoints
  const searchProperties = async (criteria) => {
    try {
      setLoading(true);
      
      // ✅ GET /api/properties: Filter by budget
      const searchParams = new URLSearchParams();
      if (criteria.budget) searchParams.append('priceFilter', `0-${criteria.budget}`);
      if (criteria.location) searchParams.append('search', criteria.location);
      
      const response = await fetch(`/api/tenant/real-estate?${searchParams.toString()}`);
      const data = await response.json();
      
      // ✅ POST /api/chatbot/compare: Rank by rating + sentimentScore
      const compareResponse = await fetch('/api/chatbot/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          properties: data.allRealEstate || [],
          criteria
        })
      });
      
      const compareData = await compareResponse.json();
      setRecommendations(compareData.rankedProperties || []);
      
      // ✅ FINAL RECOMMENDATION: Generate message
      if (compareData.rankedProperties && compareData.rankedProperties.length > 0) {
        const best = compareData.rankedProperties[0];
        setFinalMessage(`${best.name} is the best value based on your budget and location.`);
      }
      
    } catch (error) {
      console.error('Comparison error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const parsed = parseInput(input);
    setParsedData(parsed);
    
    if (parsed.budget || parsed.location || parsed.safety) {
      searchProperties(parsed);
    }
  };

  return (
    <div className="p-6 bg-purple-50 rounded-lg shadow">
      <Typography variant="h5" className="mb-4 text-purple-800">
        🤖 Property Comparison Tool
      </Typography>
      
      {/* ✅ NATURAL LANGUAGE INPUT */}
      <Box className="mb-4">
        <TextField
          fullWidth
          label="Describe your ideal property (e.g., 'budget: 5000, location: Cebuano, safety: true')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Budget, Location, Safety..."
          multiline
          rows={3}
          variant="outlined"
        />
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          color="secondary"
          className="mt-2"
          fullWidth
        >
          {loading ? '🔄 Analyzing...' : '🔍 Compare Properties'}
        </Button>
      </Box>

      {/* ✅ PROCESSING LOGIC OUTPUT: Parsed data */}
      {parsedData.budget && (
        <Card className="mb-3">
          <CardContent>
            <Typography variant="h6">🧠 Parsed Criteria</Typography>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(parsedData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* ✅ RESPONSE OUTPUT: Top 3 ranked properties */}
      {recommendations.length > 0 && (
        <Card className="mb-3">
          <CardContent>
            <Typography variant="h6" className="mb-3">📊 Response Output</Typography>
            {recommendations.map((prop, index) => (
              <div key={prop.id} className="flex justify-between items-center p-2 border-b">
                <div>
                  <Typography variant="subtitle1">{prop.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    ₱{prop.price.toLocaleString()} – ⭐{prop.rating}
                  </Typography>
                </div>
                <Typography variant="h6" color="primary">
                  #{index + 1}
                </Typography>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ✅ FINAL RECOMMENDATION: Best value message */}
      {finalMessage && (
        <Card>
          <CardContent>
            <Typography variant="h6" className="text-purple-700">
              💬 Final Recommendation Message
            </Typography>
            <Typography variant="body1" className="mt-2">
              {finalMessage}
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatbotComparison;
