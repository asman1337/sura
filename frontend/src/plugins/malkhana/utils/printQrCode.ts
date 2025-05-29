/**
 * Utility function to print QR codes
 */


/**
 * Prints a QR code with a title (PR NO), QR, logo, unit and org name
 * @param title The title to display at the top
 * @param value The value to encode in the QR code
 * @param logoUrl The URL of the department logo (relative to public/)
 * @param unitName The name of the unit (e.g., police station)
 * @param orgName The name of the organization (e.g., district police)
 */
export const printQrCode = (
  title: string,
  value: string,
  logoUrl: string,
  unitName: string,
  orgName: string
) => {
  try {
    const base64Value = btoa(unescape(encodeURIComponent(value)));
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      alert('Please allow pop-ups to print QR codes');
      return;
    }
    const qrSize = 280;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .print-container {
              padding: 20px;
              max-width: 100%;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .prno {
              font-size: 22px;
              font-weight: bold;
              margin-bottom: 18px;
              text-align: center;
              letter-spacing: 2px;
              color: #1a237e; /* Deep blue (WBP) */
              text-shadow: 0 1px 0 #fff, 0 2px 4px #b71c1c33;
            }
            .qr-container {
              background-color: white;
              padding: 20px;
              border-radius: 4px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.12);
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 18px;
            }
            .logo-unit-row {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 18px;
              margin-bottom: 8px;
            }
            .logo {
              width: 60px;
              height: 60px;
              object-fit: contain;
              display: block;
            }
            .unit-org-col {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: center;
            }
            .unit-name {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 2px;
              text-align: left;
              width: 100%;
              color: #b71c1c; /* WBP red */
              letter-spacing: 1px;
            }
            .org-name {
              font-size: 14px;
              color: #1a237e; /* WBP blue */
              text-align: left;
              width: 100%;
              font-weight: 500;
            }
            .button-container {
              display: flex;
              justify-content: center;
              gap: 10px;
              margin-top: 15px;
            }
            button {
              padding: 8px 16px;
              background-color: #1976d2;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            button.secondary {
              background-color: #757575;
            }
            button:hover {
              background-color: #135ba1;
            }
            button.secondary:hover {
              background-color: #616161;
            }
            .qr-code {
              width: ${qrSize}px;
              height: ${qrSize}px;
            }
            @media print {
              .button-container {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="prno">${title}</div>
            <div class="qr-container">
              <div id="qrcode" class="qr-code"></div>
            </div>
            <div class="logo-unit-row">
              <img src="${logoUrl}" class="logo" alt="Department Logo" />
              <div class="unit-org-col">
                <div class="unit-name">${unitName}</div>
                <div class="org-name">${orgName}</div>
              </div>
            </div>
            <div class="button-container">
              <button onclick="window.print()">Print QR Code</button>
              <button class="secondary" onclick="window.close()">Close</button>
            </div>
          </div>
          <script>
            function generateQRCode() {
              const container = document.getElementById('qrcode');
              if (!container) return;
              let qrData;
              try {
                qrData = decodeURIComponent(escape(window.atob('${base64Value}')));
              } catch(e) {
                console.error('Failed to decode QR data:', e);
                container.innerHTML = '<div style="color: red; text-align: center;">Error: Failed to decode QR data</div>';
                return;
              }
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
              script.onload = function() {
                try {
                  const errorCorrectionLevels = ['L', 'M', 'Q', 'H'];
                  let success = false;
                  for (const level of errorCorrectionLevels) {
                    try {
                      const qr = window.qrcode(0, level);
                      qr.addData(qrData);
                      qr.make();
                      const imgTag = document.createElement('img');
                      imgTag.src = qr.createDataURL(10, 0);
                      imgTag.style.width = '100%';
                      imgTag.style.height = '100%';
                      container.innerHTML = '';
                      container.appendChild(imgTag);
                      success = true;
                      break;
                    } catch (e) {
                      console.warn('Failed with error correction level ' + level + ':', e);
                    }
                  }
                  if (!success) {
                    container.innerHTML = '<div style="color: red; text-align: center;">Error: Data too large for QR code</div>';
                  }
                } catch (error) {
                  console.error('Failed to create QR code:', error);
                  container.innerHTML = '<div style="color: red; text-align: center;">Failed to generate QR code</div>';
                }
              };
              script.onerror = function() {
                container.innerHTML = '<div style="color: red; text-align: center;">Failed to load QR code library</div>';
              };
              document.head.appendChild(script);
            }
            window.onload = generateQRCode;
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    console.error('Error printing QR code:', error);
    alert('Failed to print QR code. Please try again.');
  }
}; 

/**
 * Prints multiple QR codes in a 3xn grid layout in a single page
 * @param items Array of items to print QR codes for, each containing prNo, value, logoUrl, unitName, orgName
 */
export const printMultipleQrCodes = (items: Array<{title: string, value: string, logoUrl: string, unitName: string, orgName: string}>) => {
  try {
    if (!items || items.length === 0) {
      console.error('No items provided for printing');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      alert('Please allow pop-ups to print QR codes');
      return;
    }
    const qrSize = 180;
    const itemsPerRow = 3;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Multiple QR Codes</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .print-container {
              padding: 10px;
              max-width: 100%;
              margin: 0 auto;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
            }
            .print-title {
              font-size: 24px;
              font-weight: bold;
              color: #1a237e;
              text-shadow: 0 1px 0 #fff, 0 2px 4px #b71c1c33;
            }
            .print-subtitle {
              font-size: 16px;
              color: #666;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(${itemsPerRow}, 1fr);
              gap: 20px;
              page-break-inside: auto;
            }
            .qr-item {
              background-color: white;
              border: 1px solid #ddd;
              border-radius: 4px;
              padding: 10px 8px 8px 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              page-break-inside: avoid;
              break-inside: avoid;
              min-width: 220px;
            }
            .prno {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 8px;
              text-align: center;
              color: #1a237e;
              letter-spacing: 1px;
              text-shadow: 0 1px 0 #fff, 0 2px 4px #b71c1c33;
            }
            .qr-container {
              width: ${qrSize}px;
              height: ${qrSize}px;
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 8px;
            }
            .logo-unit-row {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              margin-bottom: 2px;
            }
            .logo {
              width: 38px;
              height: 38px;
              object-fit: contain;
              display: block;
            }
            .unit-org-col {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: center;
            }
            .unit-name {
              font-size: 13px;
              font-weight: 600;
              margin-bottom: 1px;
              text-align: left;
              color: #b71c1c;
              letter-spacing: 0.5px;
            }
            .org-name {
              font-size: 12px;
              color: #1a237e;
              text-align: left;
              font-weight: 500;
            }
            .button-container {
              display: flex;
              justify-content: center;
              gap: 10px;
              margin-top: 20px;
              margin-bottom: 20px;
            }
            button {
              padding: 8px 16px;
              background-color: #1976d2;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            button.secondary {
              background-color: #757575;
            }
            button:hover {
              background-color: #135ba1;
            }
            button.secondary:hover {
              background-color: #616161;
            }
            @media print {
              .button-container, .print-header {
                display: none;
              }
              body {
                padding: 0;
              }
              .qr-grid {
                gap: 10px;
              }
              .qr-item {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <div class="print-title">Multiple QR Codes</div>
              <div class="print-subtitle">Total: ${items.length} QR codes</div>
            </div>
            <div class="button-container">
              <button onclick="window.print()">Print QR Codes</button>
              <button class="secondary" onclick="window.close()">Close</button>
            </div>
            <div class="qr-grid">
              ${items.map((item, index) => `
                <div class="qr-item">
                  <div class="prno">${item.title}</div>
                  <div class="qr-container" id="qrcode-${index}"></div>
                  <div class="logo-unit-row">
                    <img src="${item.logoUrl}" class="logo" alt="Logo" />
                    <div class="unit-org-col">
                      <div class="unit-name">${item.unitName}</div>
                      <div class="org-name">${item.orgName}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="button-container">
              <button onclick="window.print()">Print QR Codes</button>
              <button class="secondary" onclick="window.close()">Close</button>
            </div>
          </div>
          <script>
            function generateQRCodes() {
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
              script.onload = function() {
                const items = ${JSON.stringify(items)};
                items.forEach((item, index) => {
                  const container = document.getElementById('qrcode-' + index);
                  if (!container) return;
                  try {
                    const qrData = decodeURIComponent(escape(window.atob(item.value)));
                    const errorCorrectionLevels = ['L', 'M', 'Q', 'H'];
                    let success = false;
                    for (const level of errorCorrectionLevels) {
                      try {
                        const qr = window.qrcode(0, level);
                        qr.addData(qrData);
                        qr.make();
                        const imgTag = document.createElement('img');
                        imgTag.src = qr.createDataURL(8, 0);
                        imgTag.style.width = '100%';
                        imgTag.style.height = '100%';
                        container.innerHTML = '';
                        container.appendChild(imgTag);
                        success = true;
                        break;
                      } catch (e) {
                        console.warn('Failed with error correction level ' + level + ':', e);
                      }
                    }
                    if (!success) {
                      container.innerHTML = '<div style="color: red; text-align: center; font-size: 10px;">Error: Data too large</div>';
                    }
                  } catch (error) {
                    console.error('Failed to create QR code:', error);
                    container.innerHTML = '<div style="color: red; text-align: center; font-size: 10px;">Failed to generate</div>';
                  }
                });
              };
              script.onerror = function() {
                console.error('Failed to load QR code library');
                alert('Failed to load QR code library. Please try again.');
              };
              document.head.appendChild(script);
            }
            window.onload = generateQRCodes;
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    console.error('Error printing multiple QR codes:', error);
    alert('Failed to print QR codes. Please try again.');
  }
};