class AwtrixLightLiveCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `
        <style>
          ha-card {
            /* Add any custom card styling here */
          }

          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f3f3f3;
          }

          #svgContainer {
            max-width: 100%;
            max-height: 100%;
          }
        </style>
        <ha-card>
          <div id="svgContainer"></div>
        </ha-card>
      `;
      this.content = this.querySelector("#svgContainer");
    }

    // Get the card configuration options
    const ipAddress = this.config.ipAddress;
    const resolution = this.config.resolution;
    const captureRate = this.config.captureRate || 100;
    const borderWidth = this.config.borderWidth || 1;

    if (ipAddress && resolution) {
      const endpointUrl = "https://" + ipAddress + "/api/screen";

      this.fetchAndDisplay(endpointUrl, resolution, borderWidth);
      setInterval(() => {
        this.fetchAndDisplay(endpointUrl, resolution, borderWidth);
      }, captureRate);
    } else {
      console.error("Missing IP address or resolution parameters.");
    }
  }

  fetchAndDisplay(endpointUrl, resolution, borderWidth) {
    fetch(endpointUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((pixelData) => {
        this.createSvgElement(resolution, pixelData, borderWidth);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        this.showError("NO DATA");
      });
  }

  showError(errorMessage) {
    const errorSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    
    textElement.setAttribute("x", "50%");
    textElement.setAttribute("y", "50%");
    textElement.setAttribute("text-anchor", "middle");
    textElement.setAttribute("dominant-baseline", "middle");
    textElement.textContent = errorMessage;

    errorSvg.appendChild(textElement);
    this.content.innerHTML = "";
    this.content.appendChild(errorSvg);
  }

  createSvgElement(resolution, pixelData, borderWidth) {
    if (!pixelData || !Array.isArray(pixelData)) {
      this.showError("NO DATA");
      return;
    }
    const resolutionParts = resolution.split("x");
    const width = parseInt(resolutionParts[0]);
    const height = parseInt(resolutionParts[1]);

    const scaleX = width / 32;
    const scaleY = height / 8;

    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("width", width);
    svgElement.setAttribute("height", height);
    svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svgElement.style.display = 'block';
    svgElement.style.width = '100%';
    svgElement.style.height = '100%';

    const cornerRadius = parseInt(this.config.borderradius) || 10;
    svgElement.style.borderRadius = `${cornerRadius}px`;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 32; x++) {
        const rgb565 = pixelData[y * 32 + x];
        const red = (rgb565 & 0xff0000) >> 16;
        const green = (rgb565 & 0x00ff00) >> 8;
        const blue = rgb565 & 0x0000ff;

        const svgPixel = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        svgPixel.setAttribute("x", x * scaleX);
        svgPixel.setAttribute("y", y * scaleY);
        svgPixel.setAttribute("width", scaleX);
        svgPixel.setAttribute("height", scaleY);
        svgPixel.setAttribute("fill", `rgb(${red}, ${green}, ${blue})`);
        svgPixel.setAttribute("stroke", "black");
        svgPixel.setAttribute("stroke-width", borderWidth);

        svgElement.appendChild(svgPixel);
      }
    }

    this.content.innerHTML = "";
    this.content.appendChild(svgElement);
  }

  setConfig(config) {
    this.config = config;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define("awtrix-light-live-card", AwtrixLightLiveCard);
