import React from 'react';

interface MessageDisplayProps {
  message?: string;
  error?: string;
  info?: string;
  success?: string;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, error, info, success }) => {
  return (
    <>
      {message && <div className="message">{message}</div>}
      {error && <div className="message error">{error}</div>}
      {info && <div className="message info">{info}</div>}
      {success && <div className="message success">{success}</div>}
    </>
  );
};

export default MessageDisplay;