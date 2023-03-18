const http = require('http');
const WebSocket = require('ws');
const pdfjsLib = require('pdfjs-dist');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('send_message', (message) => {
    const data = JSON.parse(message);

    // Check if a file was sent
    if (data.file) {
      console.log('Received file from client:', data.file);

      // Convert the file buffer back to PDF
      const pdf = new Uint8Array(data.file);
      pdfjsLib.getDocument(pdf).promise.then((pdfDoc) => {
        const numPages = pdfDoc.numPages;
        console.log(`PDF document loaded with ${numPages} pages`);

        // Extract text from each page of the PDF
        let extractedText = '';
        for (let i = 1; i <= numPages; i++) {
          pdfDoc.getPage(i).then((page) => {
            return page.getTextContent();
          }).then((textContent) => {
            extractedText += textContent.items.map((item) => {
              return item.str;
            }).join(' ');
          });
        }

        // Send the extracted text back to the client
        if (data.sendBack) {
          socket.send(JSON.stringify({
            message: `Extracted text: ${extractedText}`
          }));
        }
      }).catch((error) => {
        console.error('Error while loading PDF:', error);
      });
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, () => {
  console.log('Server started on port 8080');
});
