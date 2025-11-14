(function() {
    var CONFIG = { wordpressTag: 'logo-slider' };
    
    function shuffleArray(array) {
        var shuffled = array.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled;
    }
    
    function createLogoElement(logo) {
        var logoItem = document.createElement('div');
        logoItem.className = 'logo-item';
        var img = document.createElement('img');
        img.src = logo.url;
        img.alt = logo.name;
        img.loading = 'lazy';
        logoItem.appendChild(img);
        return logoItem;
    }
    
    function loadLogos() {
        var targetValue = CONFIG.wordpressTag;
        console.log('Lade ALLE Medien (mit Pagination)...');
        
        var allMedia = [];
        var page = 1;
        var maxPages = 5; // Max 500 Bilder (5 Seiten x 100)
        
        function loadPage(pageNum) {
            return fetch('/wp-json/wp/v2/media?per_page=100&page=' + pageNum)
                .then(function(response) {
                    if (!response.ok) {
                        if (response.status === 400) {
                            console.log('Alle Seiten geladen');
                            return [];
                        }
                        throw new Error('API Fehler');
                    }
                    return response.json();
                })
                .then(function(mediaItems) {
                    if (mediaItems.length === 0) {
                        console.log('Keine weiteren Bilder auf Seite ' + pageNum);
                        return [];
                    }
                    console.log('Seite ' + pageNum + ': ' + mediaItems.length + ' Bilder geladen');
                    return mediaItems;
                });
        }
        
        function loadAllPages() {
            return loadPage(page).then(function(mediaItems) {
                if (mediaItems.length === 0 || page >= maxPages) {
                    return allMedia;
                }
                allMedia = allMedia.concat(mediaItems);
                page++;
                return loadAllPages();
            });
        }
        
        return loadAllPages().then(function() {
            console.log('GESAMT: ' + allMedia.length + ' Medien geladen');
            
            var filteredMedia = [];
            var marker = '[' + targetValue + ']';
            
            for (var i = 0; i < allMedia.length; i++) {
                var media = allMedia[i];
                var found = false;
                
                if (media.alt_text && media.alt_text.indexOf(marker) !== -1) {
                    found = true;
                } else if (media.description && media.description.rendered && 
                         media.description.rendered.indexOf(marker) !== -1) {
                    found = true;
                }
                
                if (found) {
                    filteredMedia.push({
                        name: media.alt_text || media.title.rendered || 'Logo',
                        url: media.source_url
                    });
                    
                    if (filteredMedia.length <= 5) {
                        console.log('Logo ' + filteredMedia.length + ': ' + (media.title.rendered || 'Ohne Titel'));
                    }
                }
            }
            
            console.log('Gefunden: ' + filteredMedia.length + ' Logos mit [' + targetValue + '] im ALT-Text');
            return filteredMedia;
        }).catch(function(error) {
            console.error('Fehler beim Laden:', error);
            return [];
        });
    }
    
    function initSlider() {
        var track = document.getElementById('logoTrack');
        if (!track) {
            console.error('logoTrack Element nicht gefunden');
            return;
        }
        
        console.log('Slider wird initialisiert...');
        
        loadLogos().then(function(logos) {
            if (!logos || logos.length === 0) {
                track.innerHTML = '<p style="text-align:center;padding:2rem;color:gray;">Keine Logos mit [logo-slider] im ALT-Text gefunden</p>';
                console.log('TIPP: Fuege bei jedem Logo im ALT-Text [logo-slider] hinzu');
                return;
            }
            
            console.log('Initialisiere Slider mit ' + logos.length + ' Logos');
            
            var shuffled = shuffleArray(logos);
            
            for (var i = 0; i < shuffled.length; i++) {
                track.appendChild(createLogoElement(shuffled[i]));
            }
            for (var i = 0; i < shuffled.length; i++) {
                track.appendChild(createLogoElement(shuffled[i]));
            }
            
            var duration = Math.max(30, logos.length * 0.6);
            track.style.animationDuration = duration + 's';
            
            console.log('Fertig! Animation: ' + duration + ' Sekunden');
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlider);
    } else {
        initSlider();
    }
})();
