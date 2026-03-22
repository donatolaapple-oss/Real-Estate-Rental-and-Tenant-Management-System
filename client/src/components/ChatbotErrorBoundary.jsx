import React from 'react';

class ChatbotErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Chatbot crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-warning" style={{
          position: 'fixed',
          bottom: '100px',
          right: '30px',
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          padding: '15px',
          borderRadius: '8px',
          maxWidth: '300px',
          zIndex: 9999
        }}>
          <h5>🤖 Chatbot Restart</h5>
          <p>AI temporarily unavailable. <button 
            onClick={() => this.setState({hasError: false})} 
            className="btn btn-primary btn-sm"
            style={{background: '#667eea', border: 'none', color: 'white'}}
          >Retry</button></p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ChatbotErrorBoundary;
