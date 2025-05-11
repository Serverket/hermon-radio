
import React, { useEffect } from "react";

const ConvaiAssistant = () => {
  // Initialize the widget script on component mount
  useEffect(() => {
    // Check if script already exists to avoid duplicates
    if (!document.getElementById('elevenlabs-convai-script')) {
      const script = document.createElement('script');
      script.id = 'elevenlabs-convai-script';
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }
    
    // Clean up function to remove script when component unmounts
    return () => {
      // We typically don't remove scripts as they may be needed by other components
    };
  }, []);

  return (
    <elevenlabs-convai agent-id="g28sj2dTxmjN2bNoXPbs"></elevenlabs-convai>
  );
};

export default ConvaiAssistant;