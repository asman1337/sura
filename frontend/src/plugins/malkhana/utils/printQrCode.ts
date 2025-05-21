/**
 * Utility function to print QR codes
 */

import { QRCodeSVG } from 'qrcode.react';

/**
 * Prints a QR code with a title and subtitle in a new window
 * @param title The title to display above the QR code
 * @param subtitle The subtitle to display below the QR code
 * @param value The value to encode in the QR code
 */
export const printQrCode = (title: string, subtitle: string, value: string) => {
  try {
    // Ensure the value is properly escaped to prevent issues in the HTML
    const safeValue = value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"');
    
    // Convert to Base64 to avoid JSON parsing issues when printing
    const base64Value = btoa(unescape(encodeURIComponent(value)));
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      alert('Please allow pop-ups to print QR codes');
      return;
    }
    
    // QR Code dimension
    const qrSize = 280;
    
    // Write the HTML content to the new window
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
            .title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
              text-align: center;
            }
            .subtitle {
              font-size: 16px;
              margin-bottom: 20px;
              text-align: center;
            }
            .qr-container {
              background-color: white;
              padding: 20px;
              border-radius: 4px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.12);
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 20px;
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
            <div class="title">${title}</div>
            <div class="subtitle">${subtitle}</div>
            <div class="qr-container">
              <div id="qrcode" class="qr-code"></div>
            </div>
            <div class="button-container">
              <button onclick="window.print()">Print QR Code</button>
              <button class="secondary" onclick="window.close()">Close</button>
            </div>
          </div>
          
          <script>
            // Function to generate QR code with direct approach
            function generateQRCode() {
              const container = document.getElementById('qrcode');
              if (!container) return;
              
              // Decode the Base64 data
              let qrData;
              try {
                qrData = decodeURIComponent(escape(window.atob('${base64Value}')));
              } catch(e) {
                console.error('Failed to decode QR data:', e);
                container.innerHTML = '<div style="color: red; text-align: center;">Error: Failed to decode QR data</div>';
                return;
              }
              
              // Dynamically load QR code library
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
              script.onload = function() {
                try {
                  // Try various error correction levels from lowest to highest
                  const errorCorrectionLevels = ['L', 'M', 'Q', 'H'];
                  let success = false;
                  
                  for (const level of errorCorrectionLevels) {
                    try {
                      // typeNumber 0 means auto-detect the best type
                      const qr = window.qrcode(0, level);
                      qr.addData(qrData);
                      qr.make();
                      
                      // If we reach here, the QR code was successfully created
                      const imgTag = document.createElement('img');
                      imgTag.src = qr.createDataURL(10, 0); // 10px per module, 0px margin
                      imgTag.style.width = '100%';
                      imgTag.style.height = '100%';
                      
                      container.innerHTML = '';
                      container.appendChild(imgTag);
                      
                      success = true;
                      break;
                    } catch (e) {
                      console.warn('Failed with error correction level ' + level + ':', e);
                      // Continue with next level
                    }
                  }
                  
                  // If all levels failed, show error
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
            
            // Generate QR code on window load
            window.onload = generateQRCode;
          </script>
        </body>
      </html>
    `);
    
    // Close the document to finish writing
    printWindow.document.close();
    
  } catch (error) {
    console.error('Error printing QR code:', error);
    alert('Failed to print QR code. Please try again.');
  }
}; 