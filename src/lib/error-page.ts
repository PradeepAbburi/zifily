export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Zifily — Server Unavailable</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        background-color: #000000;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 1.5rem;
      }
      .container {
        max-width: 24rem;
        width: 100%;
        background: #09090b;
        border: 1px solid #27272a;
        border-radius: 1.25rem;
        padding: 2.5rem 2rem;
        text-align: center;
      }
      .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 9999px;
        background: #18181b;
        border: 1px solid #3f3f46;
        margin-bottom: 1.5rem;
      }
      .icon svg {
        width: 1.75rem;
        height: 1.75rem;
        stroke: #ffffff;
      }
      h1 {
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-bottom: 0.5rem;
        color: #ffffff;
      }
      p {
        color: #a1a1aa;
        font-size: 0.875rem;
        line-height: 1.5;
        margin-bottom: 2rem;
      }
      .actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .btn {
        display: block;
        width: 100%;
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        font-size: 0.8125rem;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        transition: opacity 0.15s ease, transform 0.1s ease;
      }
      .btn-primary {
        background: #ffffff;
        color: #000000;
        border: 1px solid #ffffff;
      }
      .btn-primary:hover {
        opacity: 0.9;
      }
      .btn-secondary {
        background: transparent;
        color: #e4e4e7;
        border: 1px solid #27272a;
      }
      .btn-secondary:hover {
        background: #18181b;
      }
      .btn:active {
        transform: scale(0.98);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h1>System Temporarily Unavailable</h1>
      <p>The server encountered an error processing your request. Please reload or return to the main dashboard.</p>
      <div class="actions">
        <button class="btn btn-primary" onclick="location.reload()">Reload Page</button>
        <a class="btn btn-secondary" href="/">Return to Home</a>
      </div>
    </div>
  </body>
</html>`;
}
