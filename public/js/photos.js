function reloadCss() {
    var links = document.getElementsByTagName("link");
    for (var cl in links)
    {
        var link = links[cl];
        if (link.rel === "stylesheet")
            link.href += "";
    }
}

let hide_preview = () => {
    document.querySelectorAll('.gallery img').forEach(img => {
        img.id = '';
    });
    document.getElementById('overlay').classList.add('hidden');
    if (document.getElementById('coll_form') != null) {
        document.getElementById('coll_form').classList.add('hidden');
    }
    if (document.getElementById('preview') != null) {
        document.getElementById('preview').id = '';
    }
}

let save_image = () => {
    let img = document.getElementById('preview');
}

function downloadImage(blob, fileName) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function orientImages() {
    document.querySelectorAll('.gallery img').forEach(img => {
        img.addEventListener('load', function() {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            if (aspectRatio > 1.47) {
                img.classList.add('landscape');
            } else if (aspectRatio < 0.75) {
                img.classList.add('portrait');
            } else {
                img.classList.add('square');
            }
        });

        img.addEventListener('click', () => {
            img.id = 'preview';
            document.getElementById('overlay').classList.remove('hidden');
            document.getElementById('description_text').innerText = `"${img.alt}"`;
          console.log(`alt: ${img.alt}`);
        });
    
        // If the image is already loaded (cached), trigger the load event handler manually
        if (img.complete) {
            img.dispatchEvent(new Event('load'));
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    orientImages();
    reloadCss();
});
