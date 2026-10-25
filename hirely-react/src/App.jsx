
import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const appRef = useRef(null);

  useEffect(() => {
    let scriptElement;

    async function loadHirely() {
      try {
        const response = await fetch("/hirely-original.html");

        if (!response.ok) {
          throw new Error("Original HTML file nahi mili");
        }

        const html = await response.text();
        const parsed = new DOMParser().parseFromString(html, "text/html");

        if (!appRef.current) return;

        appRef.current.innerHTML = parsed.body.innerHTML;

        // Original HTML ka script React render ke baad load hoga.
        scriptElement = document.createElement("script");
        scriptElement.src = "/script.js";
        document.body.appendChild(scriptElement);
      } catch (error) {
        if (appRef.current) {
          appRef.current.textContent =
            "Hirely load nahi hua. public folder mein hirely-original.html, style.css aur script.js check karo.";
        }
        console.error(error);
      }
    }

    loadHirely();

    return () => {
      scriptElement?.remove();
    };
  }, []);

  return <div ref={appRef} />;
}

export default App;
