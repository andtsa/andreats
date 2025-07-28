// Map to store the association between image sources/IDs and their corresponding Blob objects
const imageBlobMap = new Map();
const add_load = 4;

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

async function displayImages(collectionName, passphrase, start, end) {
    console.log(`calling displayImages(${collectionName}, ${passphrase}, ${start}, ${end});`);
    const encryptedFiles = await getEncryptedFiles(collectionName);
    if (start > encryptedFiles.length) {
        return;
    }
    console.log(encryptedFiles);
    for (let idx = start; idx < Math.min(end, encryptedFiles.length); idx++) {
        const filePath = encryptedFiles[idx];
        console.log(`file: ${filePath} pass: ${passphrase}`);
        var decryptedBlob = null;
        try {
            decryptedBlob = await decryptFile(filePath, passphrase)
        } catch (err) {
            document.getElementById('status_text').innerText += `\n\nOpenPGP error: \n"${err}"`;
            console.error(err);
            document.getElementById('status_text').innerText += `\n\ndouble-check that the passkey you provided is correct,\notherwise refresh the page...`;
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

    if (document.getElementById('gallery').children.length > 1) {
        console.log('gallery with ' + document.getElementById('gallery').children.length + ' children');
        document.getElementById('status_text').classList.add('hidden');
    } else {
        console.log('gallery with ' + document.getElementById('gallery').children.length + ' child');
        document.getElementById('status_text').innerText = "seems quite empty around here";
    }
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

function getDocHeight() {
    return Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    )
}

function amountscrolled(){
    var winheight= window.innerHeight || (document.documentElement || document.body).clientHeight
    var docheight = getDocHeight()
    var scrollTop = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
    var trackLength = docheight - winheight
    var pctScrolled = Math.floor(scrollTop/trackLength * 100) // gets percentage scrolled (ie: 80 or NaN if tracklength == 0)
    return pctScrolled;
}


document.addEventListener('DOMContentLoaded', function() {
    var already_loaded = 10;
    if (valid) {
        displayImages(collection_details[0], collection_details[1], 0, already_loaded);
    }

    reloadCss();

 
    window.addEventListener("scroll", function(){
        if (amountscrolled() > 85) {
            displayImages(collection_details[0], collection_details[1], already_loaded, already_loaded + add_load);
            already_loaded += add_load;

            reloadCss();
        }
    }, false)
});
