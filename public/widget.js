(function() {
  const script = document.currentScript;
  const chatbotId = script.getAttribute('data-chatbot-id');
  const appUrl = script.src.split('/widget.js')[0];

  if (!chatbotId) {
    console.error('JCaesar Widget: Missing data-chatbot-id');
    return;
  }

  // Create Styles
  const style = document.createElement('style');
  style.textContent = `
    .jcaesar-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .jcaesar-widget-bubble {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: #e25b31;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .jcaesar-widget-bubble:hover {
      transform: scale(1.1);
    }
    .jcaesar-widget-bubble svg {
      width: 30px;
      height: 30px;
      fill: white;
    }
    .jcaesar-widget-iframe-container {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 400px;
      height: 600px;
      max-height: calc(100vh - 120px);
      max-width: calc(100vw - 40px);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 50px rgba(0,0,0,0.1);
      display: none;
      background: white;
      border: 1px solid #eee;
    }
    .jcaesar-widget-iframe-container.open {
      display: block;
      animation: jcaesar-slide-in 0.3s ease-out;
    }
    @keyframes jcaesar-slide-in {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Create Container
  const container = document.createElement('div');
  container.className = 'jcaesar-widget-container';
  
  // Create Bubble
  const bubble = document.createElement('div');
  bubble.className = 'jcaesar-widget-bubble';
  bubble.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5-1.338C8.47 21.513 10.179 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.474 0-2.85-.4-4.021-1.1L5 19.7l.8-2.979C5.1 15.55 4.7 14.174 4.7 12.7c0-4.025 3.275-7.3 7.3-7.3s7.3 3.275 7.3 7.3-3.275 7.3-7.3 7.3z"/></svg>';
  
  // Create Iframe
  const iframeContainer = document.createElement('div');
  iframeContainer.className = 'jcaesar-widget-iframe-container';
  
  const iframe = document.createElement('iframe');
  iframe.src = `${appUrl}/widget/${chatbotId}`;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  
  iframeContainer.appendChild(iframe);
  container.appendChild(iframeContainer);
  container.appendChild(bubble);
  document.body.appendChild(container);

  // Toggle Logic
  bubble.onclick = () => {
    iframeContainer.classList.toggle('open');
  };
})();
