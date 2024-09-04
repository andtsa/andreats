// Map to store the association between image sources/IDs and their corresponding Blob objects
const imageBlobMap = new Map();


async function fetchIndexFile(collectionName) {
    const col_url = `../collection/${collectionName}.col`;
    if (!UrlExists(col_url)) {
        document.getElementById('status_text').innerText = `error: unknown collection "${collectionName}".`;
        console.error(`collection file 404: ${col_url}`);
        return "error: collection not found.";
    }
    const response = await fetch(col_url);
    const text = await response.text();
    return text.split('\n').filter(line => line.trim() !== '');
}

async function getEncryptedFiles(collectionName) {
    const fileNames = await fetchIndexFile(collectionName);
    return fileNames.map(fileName => `../encrypted/${fileName.trim()}`);
}

async function decryptFile(filePath, passphrase) {
    const response = await fetch(filePath);
    const encryptedData = await response.arrayBuffer();
    
    const data_array = new Uint8Array(encryptedData);

    const msg = await openpgp.readMessage({
        binaryMessage: data_array
    });

    console.log(`response: ${response}, openpgp: ${msg}`);

    const { data: decryptedData } = await openpgp.decrypt({
        message: msg,
        passwords: [passphrase],
        format: 'binary' // Since we're dealing with images, binary format is essential
    });

    return new Blob([decryptedData]);
}

function UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}

async function displayImages(collectionName, passphrase) {
    console.log(`calling displayImages(${collectionName}, ${passphrase});`);
    const encryptedFiles = await getEncryptedFiles(collectionName);
    console.log(encryptedFiles);
    for (const filePath of encryptedFiles) {
        console.log(`file: ${filePath} pass: ${passphrase}`);
        var decryptedBlob = null;
        try {
            decryptedBlob = await decryptFile(filePath, passphrase)
        } catch (err) {
            document.getElementById('status_text').innerText += `\n\nOpenPGP error: \n"${err}"`;
            console.error(err);
            document.getElementById('status_text').innerText += `\n\ndouble-check that the passkey you provided is correct.`;
            return;
        }

        var imageUrl = null;
        try {
            imageUrl = URL.createObjectURL(decryptedBlob)
        } catch (err) {
            document.getElementById('status_text').innerText += '\n' + err;
            console.error(err);
            return;
        };

        const img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('picture');

        // Store the Blob in the map with the image URL as the key
        imageBlobMap.set(imageUrl, decryptedBlob);

        document.getElementById('gallery').appendChild(img);
    }

    document.getElementById('status_text').classList.add('hidden');
    reloadCss();
    orientImages();
}


// Function to download the currently previewed image
function download_preview_image() {
    const previewImg = document.getElementById('preview');
    if (previewImg) {
        const blob = imageBlobMap.get(previewImg.src);
        if (blob) {
            const fileName = `downloaded_${previewImg.src.toLowerCase()}.jpg`; // You can customize the file name
            downloadImage(blob, fileName);
        } else {
            console.error('No blob found for the previewed image');
        }
    } else {
        console.error('No image with ID "preview" found');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (valid) {
        displayImages(collection_details[0], collection_details[1]);
    }

    reloadCss();
});
