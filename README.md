<div id="header" align="center">  
<img src="./src/assets/hermon-radio.webp" alt="Cover" title="Cover">  

# Hermon Radio &middot; ![Release Status](https://img.shields.io/badge/release-v1.0.0-brightgreen) [![npm version](https://img.shields.io/npm/v/react.svg?style=flat)](https://www.npmjs.com/package/react) [![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)  
Church Radio PWA, crafted with Vite and Tailwind CSS.  
</div>  

## :gear: Install & Run  
You'll need Node.js 18+.  
```
npm install
npm run dev
```

## :star2: Main Features  

### **Frontend / UI:**  
- ⚛️ **React**: Utilizes React to create dynamic user interfaces.  
- 🎨 **Tailwind CSS**: Employs Tailwind CSS for a responsive and modern design.  
- 🔍 **Fontello**: Integrates Fontello for efficient icon management.  
- ⚡ **Vite**: Utilizes Vite as a fast development and build tool for modern web applications.  

### **Custom Audio Player Features:**  
- 📡 **Dynamic Stream Monitoring**: Continuously tracks and updates the audio stream status (active, connecting, error) in real-time.  
- 🎶 **Playback Detection**: Validates actual audio playback to ensure the correct status representation, even when network issues occur.  
- 💬 **Interactive Feedback**: Provides tooltips that display the current stream status when the user hovers over the status indicator.  
- 🎥 **Media Source Detection**: Automatically identifies whether the provided URL is an audio or video stream.  
- 🚫 **Enterprise-Level Error Handling**: Implements a robust error handling mechanism that addresses network issues, ensuring users are informed of any playback interruptions effectively.  
- 🔁 **Persistent Playback State**: Saves user playback preferences, enabling seamless restoration of audio playback after component reloads.  

### **Stream Overlay (Admin) Features:**  
- 🛠️ **Top Utility Bar**: Fixed, responsive admin bar with minimize/restore and accessible tooltips.
- 🖼️ **Types**: Image, YouTube, Text.
- 🧭 **Layouts**: Inline or Fullscreen with smooth entrance animations.
- 📐 **Fit**: Contain or Cover (images only).
- 🎨 **Text Styling**: Background color and Text color pickers with HEX inputs; applied to inline and fullscreen.
- 🔒 **Auth**: Basic Auth to backend; credentials set on the backend.
- 🔴 **Live Updates**: Server‑Sent Events (SSE) broadcast to all clients.
- ♿ **Accessibility**: Keyboard focus styles, large close/minimize buttons, and backdrop click-to-close across modals.

See `docs/DEPLOYMENT.md` for deployment and usage details.

## :shipit: Special Thanks  
* To this church's flock.  
* To my mom and my sister for their artistic wit.  

## :brain: Acknowledgments  

*"Whoever loves discipline loves knowledge, but whoever hates correction is stupid."*  