// Handle paste event (Ctrl+V)
document.addEventListener('paste', function(event) {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") === 0) {
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    document.getElementById('image-container').innerHTML = '';
                    document.getElementById('image-container').appendChild(img);
                    processImage(img);
                };
            };
            reader.readAsDataURL(file);
        }
    }
});

// drag and drop
const dropArea = document.getElementById('drop-area');
dropArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropArea.style.backgroundColor = '#f0f0f0';
});

dropArea.addEventListener('dragleave', function(e) {
    dropArea.style.backgroundColor = '';
});

dropArea.addEventListener('drop', function(e) {
    e.preventDefault();
    dropArea.style.backgroundColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.indexOf("image") === 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                document.getElementById('image-container').innerHTML = '';
                document.getElementById('image-container').appendChild(img);
                processImage(img);
            };
        };
        reader.readAsDataURL(file);
    }
});

// Preprocessing: grayscale + threshold
function preprocessImage(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const threshold = avg > 150 ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = threshold;
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL();
}

// Proses gambar menggunakan Tesseract.js
function processImage(img) {
  console.log("Processing image for OCR...");

  const processedSrc = preprocessImage(img);

  Tesseract.recognize(
    processedSrc,
    'eng+ind',
    {
      logger: (m) => {
        console.log(m);
        if (m.status === "recognizing text") {
          const progress = Math.round(m.progress * 100);
          document.getElementById('progress-bar').style.width = progress + '%';
        }
      },
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK // PSM 6: single block of text
    }
  ).then(({ data: { text } }) => {
    console.log("Hasil OCR:", text);
    document.getElementById('result').innerText = text;
    document.getElementById('progress-bar').style.width = '0%';
  });
}
// Copy btn
document.getElementById('copy-btn').addEventListener('click', () => {
  const text = document.getElementById('result').innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert('Text copied to clipboard!');
  });
});
