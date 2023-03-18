const http = require('http');
const WebSocket = require('ws');
const pdfjsLib = require('pdfjs-dist');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', async function (message) {
    const data = JSON.parse(message);

    // Check if a file was sent
    if (data) {
      console.log('Received file from client!');

      // Convert the file buffer back to PDF
      const file = Uint8Array.from(Buffer.from(data.resume, 'base64'));
      const pdf = await pdfjsLib.getDocument(file).promise;

      // Extract the text from each page of the PDF
      const numPages = pdf.numPages;
      let extractedText = '';
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join('\n');
        extractedText += pageText;
      }

      if (data.sendBack) {
        // Send the extracted text back to the client
        socket.send(JSON.stringify(extractedText));
      }
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, () => {
  console.log('Server started on port 8080');
});
