/**
 * Utility function to print QR codes
 */


/**
 * Prints a QR code with a title and subtitle in a new window
 * @param title The title to display above the QR code
 * @param subtitle The subtitle to display below the QR code
 * @param value The value to encode in the QR code
 */
export const printQrCode = (title: string, subtitle: string, value: string) => {
  try {
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

/**
 * Prints multiple QR codes in a 3xn grid layout in a single page
 * @param items Array of items to print QR codes for, each containing title, subtitle and value
 */
export const printMultipleQrCodes = (items: Array<{title: string, subtitle: string, value: string}>) => {
  try {
    if (!items || items.length === 0) {
      console.error('No items provided for printing');
      return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      alert('Please allow pop-ups to print QR codes');
      return;
    }
    
    // QR Code dimension - slightly smaller for grid layout
    const qrSize = 200;
    const itemsPerRow = 3;
    
    // Convert all values to Base64 to avoid JSON parsing issues
    const base64Items = items.map(item => ({
      ...item,
      base64Value: btoa(unescape(encodeURIComponent(item.value)))
    }));
    
    // Write the HTML content to the new window
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
              padding: 15px;
              display: flex;
              flex-direction: column;
              align-items: center;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .qr-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 5px;
              text-align: center;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
            }
            .qr-subtitle {
              font-size: 12px;
              margin-bottom: 10px;
              text-align: center;
              color: #666;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
            }
            .qr-container {
              width: ${qrSize}px;
              height: ${qrSize}px;
              display: flex;
              justify-content: center;
              align-items: center;
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
              ${base64Items.map((item, index) => `
                <div class="qr-item">
                  <div class="qr-title">${item.title}</div>
                  <div class="qr-subtitle">${item.subtitle}</div>
                  <div class="qr-container" id="qrcode-${index}"></div>
                </div>
              `).join('')}
            </div>
            
            <div class="button-container">
              <button onclick="window.print()">Print QR Codes</button>
              <button class="secondary" onclick="window.close()">Close</button>
            </div>
          </div>
          
          <script>
            // Function to generate all QR codes
            function generateQRCodes() {
              // Load QR code library first
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
              
              script.onload = function() {
                // Process each QR code
                const items = ${JSON.stringify(base64Items)};
                
                items.forEach((item, index) => {
                  const container = document.getElementById('qrcode-' + index);
                  if (!container) return;
                  
                  try {
                    // Decode the Base64 data
                    const qrData = decodeURIComponent(escape(window.atob(item.base64Value)));
                    
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
                        imgTag.src = qr.createDataURL(8, 0); // 8px per module, 0px margin
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
            
            // Generate QR codes on window load
            window.onload = generateQRCodes;
          </script>
        </body>
      </html>
    `);
    
    // Close the document to finish writing
    printWindow.document.close();
    
  } catch (error) {
    console.error('Error printing multiple QR codes:', error);
    alert('Failed to print QR codes. Please try again.');
  }
}; 