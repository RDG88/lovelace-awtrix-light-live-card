class AwtrixLightLiveCard extends HTMLElement {
    constructor() {
        super();
        this.retries = 0;
        this.maxRetries = 5;
        this.initialDelay = 1000;  // Starting from 500ms
        this.captureRate = 1000;  // Default capture rate
    }

    setConfig(config) {
        this.config = {
            resolution: '256x64',
            matrix_padding: 1,
            border_radius: 10,
            border_width: 3,
            border_color: 'white',
            ...config,
        };
        this.captureRate = config.captureRate || 1000;
    }

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

        const ipAddress = this.config.ipAddress;
        const resolution = this.config.resolution;

        if (ipAddress && resolution) {
            this.endpointUrl = "https://" + ipAddress + "/api/screen";
            this.resolution = resolution;
            this.fetchWithBackoff();
        } else {
            console.error("Missing IP address or resolution parameters.");
        }
    }
fetchWithBackoff() {
    fetch(this.endpointUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            this.retries = 0;
            return response.json();
        })
        .then(pixelData => {
            this.createSvgElement(pixelData);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            if (this.retries < this.maxRetries) {
                this.retries++;
            } else {
                this.showError();
            }
        })
        .finally(() => {
            setTimeout(() => this.fetchWithBackoff(), this.captureRate); // Always schedule the next fetch using the capture rate
        });
}


    showError() {
    const pictureData = [
      // Your previous picture data goes here
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      16711680, 0, 0, 16711680, 0, 0, 16711680, 0, 0, 0, 0, 16711680, 16711680, 0, 0, 16711680, 16711680, 0,
      0, 16711680, 16711680, 16711680, 0, 16711680, 16711680, 0, 0, 0, 0, 0, 0, 0, 16711680, 16711680, 0,
      16711680, 0, 16711680, 0, 16711680, 0, 0, 0, 16711680, 0, 16711680, 0, 16711680, 0, 16711680, 0, 0,
      16711680, 0, 0, 16711680, 0, 16711680, 0, 0, 0, 0, 0, 0, 16711680, 0, 16711680, 16711680, 0, 16711680,
      0, 16711680, 0, 0, 0, 16711680, 0, 16711680, 0, 16711680, 16711680, 16711680, 0, 0, 16711680, 0, 0,
      16711680, 16711680, 16711680, 0, 0, 0, 0, 0, 0, 16711680, 0, 0, 16711680, 0, 16711680, 0, 16711680,
      0, 0, 0, 16711680, 0, 16711680, 0, 16711680, 0, 16711680, 0, 0, 16711680, 0, 0, 16711680, 0,
      16711680, 0, 0, 0, 0, 0, 0, 16711680, 0, 0, 16711680, 0, 0, 16711680, 0, 0, 0, 0, 16711680,
      16711680, 0, 0, 16711680, 0, 16711680, 0, 0, 16711680, 0, 0, 16711680, 0, 16711680, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
        this.createSvgElement(this.resolution, pictureData, this.borderWidth);
    }
  createSvgElement(pixelData) {
        const resolutionParts = this.config.resolution.split("x");
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

        const cornerRadius = parseInt(this.config.border_radius);
        const matrixPadding = parseInt(this.config.matrix_padding);
        const borderWidth = parseInt(this.config.border_width);
        const borderColor = this.config.border_color;

        if (cornerRadius > 0) {
            svgElement.style.borderRadius = `${cornerRadius}px`;
        }

        if (borderWidth > 0) {
            svgElement.style.border = `${borderWidth}px solid ${borderColor}`;
        }

        svgElement.style.boxSizing = "border-box";

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

                if (matrixPadding > 0) {
                    svgPixel.setAttribute("stroke", "black");
                    svgPixel.setAttribute("stroke-width", matrixPadding);
                }

                svgElement.appendChild(svgPixel);
            }
        }

        this.content.innerHTML = "";
        this.content.appendChild(svgElement);
    }

    getCardSize() {
        return 1;
    }
}

customElements.define("awtrix-light-live-card", AwtrixLightLiveCard);
