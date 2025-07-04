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

// Proses gambar menggunakan Tesseract.js
function processImage(img) {
    console.log("Processing image for OCR...");

    Tesseract.recognize(
        img.src,  // Gambar yang akan diproses
        'eng+ind',     // Bahasa OCR (misalnya 'eng' untuk bahasa Inggris)
        {
            logger: (m) => {
                console.log(m);
                if (m.status === "recognizing text") {
                     const progress = Math.round(m.progress * 100);
                     document.getElementById('progress-bar').style.width = progress + '%';
                }
            }
 // Logging progress (opsional)
        }
    ).then(({ data: { text } }) => {
        console.log("Hasil OCR:", text);
        document.getElementById('result').innerText = text; // Menampilkan hasil OCR
    });
}
// Copy btn
document.getElementById('copy-btn').addEventListener('click', () => {
  const text = document.getElementById('result').innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert('Text copied to clipboard!');
  });
});
