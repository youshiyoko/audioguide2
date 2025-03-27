const audioSource = document.getElementById('audio-source');
const playPauseButton = document.getElementById('play-pause-button');
const rewindButton = document.getElementById('rewind-button');
const forwardButton = document.getElementById('forward-button');
const stationTitle = document.getElementById('station-title');
const progressBarContainer = document.querySelector('.progress-bar-container');
const progressBar = document.querySelector('.progress-bar');
const speedButton = document.getElementById('speed-button');
const galleryImage = document.getElementById('gallery-image');
const prevButton = document.getElementById('prev-image');
const nextButton = document.getElementById('next-image');
const accordionContainer = document.getElementById('accordion');
const langToggle = document.getElementById('toggle-lang');
const langLabel = document.getElementById('lang-label');

const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M8 5v14l11-7z"/></svg>`;
const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

const audioBasePath = 'mp3/';
const englishAudioBasePath = 'eng_mp3/';
let fileNumber;
let stationImages = window.stationImages || [];

let selectedLanguage = localStorage.getItem('selectedLanguage');
if (!selectedLanguage) {
    const browserLang = navigator.language.substring(0, 2).toLowerCase();
    selectedLanguage = (browserLang === 'hu') ? 'hu' : 'en';
    localStorage.setItem('selectedLanguage', selectedLanguage);
}



function setAudioSourceBasedOnLanguage(lang) {
    const basePath = (lang === 'hu') ? audioBasePath : englishAudioBasePath;
    const fileExtension = (lang === 'hu') ? '.mp3' : '_eng.mp3';
    audioSource.src = `${basePath}${fileNumber}${fileExtension}`;
    audioSource.load();
    console.log('Betöltött hangfájl:', audioSource.src);
}

function updateAccordionContent(lang) {
    accordionContainer.innerHTML = '';
    const selectedDescriptions = stationDescriptions[lang][fileNumber] || [];
    const stationInfoSection = document.querySelector('.station-info');
    stationInfoSection.style.display = selectedDescriptions.length ? 'block' : 'none';

    selectedDescriptions.forEach((item) => {
        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion-item');

        const accordionHeader = document.createElement('div');
        accordionHeader.classList.add('accordion-header');
        accordionHeader.textContent = item.title;

        const accordionContent = document.createElement('div');
        accordionContent.classList.add('accordion-content');
        accordionContent.innerHTML = `<p>${item.content}</p>`;

        accordionHeader.addEventListener('click', () => {
            const isActive = accordionHeader.classList.contains('active');

            // Ez a rész lesz a kulcs, hogy minden fejlécről levegye az active-t
            document.querySelectorAll('.accordion-header').forEach(header => {
                header.classList.remove('active');
                header.nextElementSibling.style.maxHeight = null;
                header.nextElementSibling.style.padding = "0 14px";
                header.nextElementSibling.style.opacity = 0;
            });

            if (!isActive) {
                accordionHeader.classList.add('active');
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
                accordionContent.style.padding = "14px";
                accordionContent.style.opacity = 1;

                setTimeout(() => {
                    accordionHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        });

        accordionItem.appendChild(accordionHeader);
        accordionItem.appendChild(accordionContent);
        accordionContainer.appendChild(accordionItem);
    });
}

function updateContentBasedOnLanguage() {
    const wasPlaying = !audioSource.paused; // lejátszás alatt volt-e?
    setAudioSourceBasedOnLanguage(selectedLanguage);
    
    stationTitle.textContent = (selectedLanguage === 'hu') ? `Állomás ${fileNumber}` : `Station ${fileNumber}`;
    updateAccordionContent(selectedLanguage);

    if (wasPlaying) {
        audioSource.play().then(() => {
            playPauseButton.innerHTML = pauseIcon;
            playPauseButton.classList.add('playing');
        }).catch((error) => {
            // Automatikus lejátszás blokkolva lehet a böngésző által
            playPauseButton.innerHTML = playIcon;
            playPauseButton.classList.remove('playing');
            console.warn('Autoplay blokkolva:', error);
        });
    } else {
        audioSource.pause();
        playPauseButton.innerHTML = playIcon;
        playPauseButton.classList.remove('playing');
    }

    audioSource.playbackRate = 1;
    currentRateIndex = 0;
    speedButton.textContent = '1×';
}


const flagIcon = document.getElementById('flag-icon');


// Zászló frissítő függvény
function updateFlagIcon(lang) {
    flagIcon.src = lang === 'hu' ? 'flags/hu.svg' : 'flags/en.svg';
}

// Nyelvváltó toggle eseménykezelő (teljesen hibátlan verzió)
langToggle.addEventListener('change', (e) => {
    selectedLanguage = e.target.checked ? 'en' : 'hu';
    localStorage.setItem('selectedLanguage', selectedLanguage);
    updateContentBasedOnLanguage();

    updateFlagIcon(selectedLanguage);

    // Rezgés UX
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
});

// Kezdeti zászló-beállítás (oldalbetöltéskor)
updateFlagIcon(selectedLanguage);

// Inicializáláskor is frissítsd a zászlót
updateFlagIcon(selectedLanguage);

function initializeStationData() {
    const filename = window.location.pathname.split('/').pop();
    const match = filename.match(/station_(\d+)\.html/);
    fileNumber = match ? match[1] : '01';
    updateContentBasedOnLanguage();
}

let currentImageIndex = 0;
if (stationImages.length > 0) {
    function updateGalleryImage() {
        galleryImage.classList.add('fade-out');
        setTimeout(() => {
            galleryImage.src = `images/${stationImages[currentImageIndex]}`;
            galleryImage.classList.remove('fade-out');
        }, 300);
    }

    prevButton.onclick = () => {
        currentImageIndex = (currentImageIndex - 1 + stationImages.length) % stationImages.length;
        updateGalleryImage();
    };

    nextButton.onclick = () => {
        currentImageIndex = (currentImageIndex + 1) % stationImages.length;
        updateGalleryImage();
    };

    updateGalleryImage();
}

playPauseButton.onclick = () => {
    if (audioSource.paused) {
        audioSource.play();
        playPauseButton.innerHTML = pauseIcon;
        playPauseButton.classList.add('playing');
    } else {
        audioSource.pause();
        playPauseButton.innerHTML = playIcon;
        playPauseButton.classList.remove('playing');
    }
};

rewindButton.onclick = () => audioSource.currentTime -= 10;
forwardButton.onclick = () => audioSource.currentTime += 10;

audioSource.ontimeupdate = () => {
    progressBar.style.width = `${(audioSource.currentTime / audioSource.duration) * 100}%`;
};

progressBarContainer.onclick = (e) => {
    audioSource.currentTime = (e.offsetX / progressBarContainer.clientWidth) * audioSource.duration;
};

const playbackRates = [1, 1.2, 1.5, 0.8];
let currentRateIndex = 0;

function setPlaybackRate(rate) {
    audioSource.playbackRate = rate;
    speedButton.textContent = `${rate}×`;
}

setPlaybackRate(playbackRates[currentRateIndex]);

speedButton.onclick = () => {
    currentRateIndex = (currentRateIndex + 1) % playbackRates.length;
    setPlaybackRate(playbackRates[currentRateIndex]);
};

audioSource.onended = () => {
    playPauseButton.innerHTML = playIcon;
    playPauseButton.classList.remove('playing');
};

const stationDescriptions = {

"hu": {
        "01": [
            { title: "Történeti háttér", content: "Utah államban, a Bonneville sóstómedrében ezzel kezdetét vette a szárazföldi sebességrekordok sugárhajtású korszaka. Breedlove járművét az F–86 Sabre vadászgéphez fejlesztett sugárhajtóművel szerelték, az eredményét azonban eleinte nem ismerték el, mivel nem felelt meg az FIA előírásainak azzal, hogy csak három kereke volt, és a hajtómű nem közvetlenül a kerekeket hajtotta. Nem sokkal később az FIM a motorkerékpárok közt elismerte a rekordot." },
            { title: "Első állomás jellemzői", content: "Siculiana szállást, étkezést és idegenvezetést is biztosít, ehhez mindössze egy élményvideót kell készíteniük a szerencsés nyerteseknek. HIRDETÉS Siculiana egy apró, tengerparti olasz városka, amely lélegzetelállító környezetben fekszik. A turisták is kedvelik, de a csak a főszezonban látogatják meg. A város most egy sajátos akcióval próbálja elérni, hogy az érdeklődőket a csúcsszezonon kívül is bevonzzák – írja a Metro. Három napot magában foglaló hétvégi nyaralást kínálnak mindössze 1 euróért, ami március 19-ei állás szerint picivel több mint 400 forintot jelent. A csomag tulajdonképpen ingyenes, hisz ez az összeg csak az idegenforgalmi adót fedezi. A szerencsés nyerteseknek nem kell fizetniük a szállásért, reggelit, ebédet, valamint vacsorát is kapnak, illetve díjmentes idegenvezetést biztosítanak számukra a városban és környékén. HIRDETÉS Ahhoz, hogy valaki részt vehessen egy ilyen nyaraláson, 18 éven felülinek kell lennie, és el kell küldenie egy videót a városnak, amelyben kifejti, miért is szeretne részt venni a programban. De még ebben is segít a város turisztika tanácsa, amely ölteket is adott, a „megérdemeljük a nyaralást”, a „szeretjük Szicíliát” vagy a „szicíliai ételeket akarunk enni” is szerepel a tippek között. A pályázatokat a turisztikai tanács bírálja el. Azt nézik, hogy mennyire eredeti vagy kreatív a jelentkezés, mennyire lelkes a jelentkező vagy hogy mennyiben motiválja, hogy megismerje Siculianát. Összesen 10 pár vehet részt a nyaraláson, az első turnus április 4-től 6-ig tartózkodik a városban, a nyertesek névsorát március 20-án hirdetik ki. A szerencsés turistáknak csak élvezniük kell a nyaralást, mindössze egy feladatuk van, videót kell készíteniük, amelyben beszámolnak az élményeikről. Siculiana Szicília nyugati partján fekszik, nagyjából 18 kilométerre Agrigentótól. Sok olasz városhoz hasonlóan ősszel és télen elcsendesedik picit, ráadásul az elmúlt 20 évben ötödével csökkent a lakosság, mivel a fiatalok inkább a nagyobb városokba vagy külföldre költöznek. A város abban bízik, hogy az akcióval sikerül fellendíteniük a turizmust, és esetleg kedvet csinálniuk a fiataloknak, hogy Siculianában telepedjenek le." }
        ],
        "02": [
            { title: "Második állomás története", content: "Nem kellett sokat várni Craig Breedlove válaszára, és mire a 966 km/órás sebességet megfutotta, az FIA és FIM megegyezett abban, hogy a kerekek számától és hajtásától függetlenül is elismerik a járművek eredményét, így a Spirit of America Sonic I lett hivatalosan is az első sugárhajtású sebességrekorder. A járművel Breedlove felesége is történelmet írt, 496 km/órával a világ leggyorsabb nője címét szerezte meg." },
            { title: "Második állomás jellemzői", content: "a Spirit of America Sonic I rekordja pedig 1970-ig tartotta magát, amikor a Blue Flame átlépte az ezer km/órás sebességet. A hangsebességet pedig nem is a Richard Noble által vezetett, 1983-ban 1019 km/órát elérő Thrust 2 lépte túl, hanem 1997-ben a Thrust SSC, amit Andy Green vezetett, és második próbálkozásra 1227,986 km/órával száguldott, a mai napig tartva a szárazföldi sebességrekordot." }
        ]
        // "03" nincs megadva → nem fog megjelenni szöveg
    },
    "en": {
        "01": [
            { title: "Historical Background", content: "To protect crops from rising droughts, scientists are looking to the genes of a small group of plants that can survive months of drought then regreen within hours. It was as a child growing up in South Africa in the 1970s that Jill Farrant first noticed several plants around her apparently coming back from the dead. These plants, she later learned, can survive six months or more without water. Their leaves turn brown and brittle to the touch but, given water, they will regreen within hours. Within a day, they've returned to their former self and can continue to photosynthesise." },
            { title: "Architectural Features", content: "Resurrection plants have evolved this essential skill by replacing disappearing water with sugars such as sucrose, turning the inside of their cells into a viscous, glass-like substance that slows down any chemical reactions. Known as vitrification, the same tactic is used by desiccation-tolerant animals such as tardigrades (also known as water bears) and the eggs of Artemia shrimp (sea monkeys)." }
        ],
        "02": [
            { title: "History of Station 2", content: "Resurrection plants have evolved this essential skill by replacing disappearing water with sugars such as sucrose, turning the inside of their cells into a viscous, glass-like substance that slows down any chemical reactions. Known as vitrification, the same tactic is used by desiccation-tolerant animals such as tardigrades (also known as water bears) and the eggs of Artemia shrimp (sea monkeys)." },
            { title: "Unknown data", content: "Resurrection plants have evolved this essential skill by replacing disappearing water with sugars such as sucrose, turning the inside of their cells into a viscous, glass-like substance that slows down any chemical reactions. Known as vitrification, the same tactic is used by desiccation-tolerant animals such as tardigrades (also known as water bears) and the eggs of Artemia shrimp (sea monkeys)." }
        ]
    }

};

// Inicializálás
initializeStationData();
