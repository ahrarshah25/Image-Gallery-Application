console.log("JS Connected!");


const backend = "https://as-image-gallery.vercel.app/api/config";

const response = await fetch(backend);
const config = await response.json()

const accessKey = config.apiKey;
if(!accessKey){
    console.log("Access key nai arhi .env me se!");
}
const galleryGrid = document.getElementById("galleryGrid");
const searchInput = document.querySelector(".search-box");

async function fetchImages(query = "") {
    galleryGrid.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>Loading...</p>";
    
    let url = query 
        ? `https://api.unsplash.com/search/photos?client_id=${accessKey}&query=${query}&per_page=12`
        : `https://api.unsplash.com/photos/random?client_id=${accessKey}&count=12`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const images = query ? data.results : data;
        displayImages(images);
    } catch(err) {
        console.error(err);
        galleryGrid.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>Failed to load images.</p>";
    }
}

function displayImages(images) {
    galleryGrid.innerHTML = "";
    
    if(images.length === 0){
        galleryGrid.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>No images found.</p>";
        return;
    }

    images.forEach(img => {
        const item = document.createElement("div");
        item.classList.add("gallery-item");

        item.innerHTML = `
            <img src="${img.urls.regular}" alt="${img.alt_description || 'Unsplash Image'}" class="gallery-image"/>
            <div class="gallery-caption">
                <div class="caption-title">${img.description || img.alt_description || 'Untitled'}</div>
                <div class="caption-description">by ${img.user.name}</div>
                <button class="btn btn-download" style="margin-top:0.5rem;">Download</button>
            </div>
            <div class="gallery-overlay"></div>
        `;
        item.querySelector(".gallery-image").addEventListener("click", () => openLightbox(img.urls.full, img.description || img.alt_description || 'Untitled', img.user.name));
        const downloadBtn = item.querySelector(".btn-download");
        downloadBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const link = document.createElement("a");
            link.href = img.links.download + `?force=true`;
            link.target = "_blank"; 
            link.click();
        });

        galleryGrid.appendChild(item);
    });
}

const lightbox = document.createElement("div");
lightbox.style.cssText = `
    position:fixed; top:0; left:0; width:100%; height:100%;
    background: rgba(0,0,0,0.9); display:none; justify-content:center; align-items:center; z-index:999;
    flex-direction:column;
`;
lightbox.innerHTML = `
    <img id="lightboxImg" style="max-width:90%; max-height:80%; border-radius:12px; margin-bottom:1rem;">
    <p id="lightboxCaption" style="color:#fff; text-align:center; font-size:1.1rem;"></p>
`;
lightbox.addEventListener("click", () => lightbox.style.display="none");
document.body.appendChild(lightbox);

function openLightbox(src, title, author) {
    document.getElementById("lightboxImg").src = src;
    document.getElementById("lightboxCaption").textContent = `${title} — by ${author}`;
    lightbox.style.display = "flex";
}

searchInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter") {
        const query = searchInput.value.trim();
        fetchImages(query);
    }
});

const filterBtn = document.querySelector(".btn-filter");
filterBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    fetchImages(query);
});

fetchImages();