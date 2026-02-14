const API_KEY = "6c3c46c98c1582857926e468dd93e2a9";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

const app = document.getElementById("app");

window.addEventListener("hashchange", router);
window.addEventListener("load", router);

async function router() {
    const hash = location.hash;

    if (hash.startsWith("#movie/")) {
        const id = hash.split("/")[1];
        renderMovie(id);
    }
    else if (hash.startsWith("#series/")) {
        const id = hash.split("/")[1];
        renderSeries(id);
    }
    else if (hash === "#movies") {
        renderMoviesPage();
    }
    else if (hash === "#series") {
        renderSeriesPage();
    }
    else if (hash === "#favorites") {
        renderFavorites();
    }
    else {
        renderHome();
    }
}

/* HOME */
async function renderHome() {
    app.innerHTML = "";

    const trending = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`).then(r=>r.json());
    const popular = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`).then(r=>r.json());

    const heroMovie = trending.results[0];

    app.innerHTML += `
        <div class="hero" style="background-image:url(${IMG}${heroMovie.backdrop_path})">
            <div class="hero-content">
                <h1>${heroMovie.title}</h1>
                <p>${heroMovie.overview.substring(0,120)}...</p>
                <button onclick="location.hash='#movie/${heroMovie.id}'">Assistir</button>
            </div>
        </div>
    `;

    createCatalog("🔥 Em Alta", trending.results, "movie");
    createCatalog("🎬 Filmes Populares", popular.results, "movie");
}

function createCatalog(title, items, type){

    const section = document.createElement("section");
    section.classList.add("catalog");

    const h2 = document.createElement("h2");
    h2.textContent = title;

    const row = document.createElement("div");
    row.classList.add("row");

    items.forEach(item=>{
        if(!item.poster_path) return;

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${IMG}${item.poster_path}">
        `;

        card.onclick = () => {
            location.hash = `#${type}/${item.id}`;
        };

        row.appendChild(card);
    });

    section.appendChild(h2);
    section.appendChild(row);

    app.appendChild(section);
}

/* FILME */
async function renderMovie(id){

    const data = await fetch(
        `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=external_ids`
    ).then(r=>r.json());

    app.innerHTML = `
        <div class="player-container">

            <div class="player-actions">
                <button onclick="history.back()">⬅ Voltar</button>
                <button onclick="addFavorite(${id}, 'movie')">❤️ Favoritar</button>
            </div>

            <h2>${data.title}</h2>

            <iframe 
                src="https://playerflixapi.com/filme/${data.imdb_id}" 
                allowfullscreen>
            </iframe>

            <p style="margin-top:15px">${data.overview}</p>

            <h3 style="margin-top:40px">🎬 Recomendados</h3>
            <div class="row" id="recommendations"></div>

        </div>
    `;

    loadRecommendations(id, "movie");
}


/* SÉRIE */
async function renderSeries(id){async function renderSeries(id){

    const data = await fetch(
        `${BASE_URL}/tv/${id}?api_key=${API_KEY}`
    ).then(r=>r.json());

    app.innerHTML = `
        <div class="player-container">

            <div class="player-actions">
                <button onclick="history.back()">⬅ Voltar</button>
                <button onclick="addFavorite(${id}, 'series')">❤️ Favoritar</button>
            </div>

            <h2>${data.name}</h2>

            <div class="select-group">
                <select id="seasonSelect"></select>
                <select id="episodeSelect"></select>
                <button onclick="loadEpisode(${id})">Assistir</button>
            </div>

            <iframe id="seriesPlayer" allowfullscreen></iframe>

            <p style="margin-top:15px">${data.overview}</p>

            <h3 style="margin-top:40px">📺 Recomendados</h3>
            <div class="row" id="recommendations"></div>

        </div>
    `;

    // temporadas
    const seasonSelect = document.getElementById("seasonSelect");

    data.seasons.forEach(season=>{
        if(season.season_number === 0) return;
        seasonSelect.innerHTML += `
            <option value="${season.season_number}">
                Temporada ${season.season_number}
            </option>
        `;
    });

    seasonSelect.addEventListener("change", ()=> loadEpisodes(id));
    loadEpisodes(id);

    loadRecommendations(id, "tv");
}

    const data = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`).then(r=>r.json());

    app.innerHTML = `
        <div class="player-container">
            <h2>${data.name}</h2>

            <div class="select-group">
                <select id="seasonSelect"></select>
                <select id="episodeSelect"></select>
                <button onclick="loadEpisode(${id})">Assistir</button>
            </div>

            <iframe id="seriesPlayer" allowfullscreen></iframe>
            <p style="margin-top:15px">${data.overview}</p>
        </div>
    `;

    const seasonSelect = document.getElementById("seasonSelect");
    const episodeSelect = document.getElementById("episodeSelect");

    data.seasons.forEach(season=>{
        if(season.season_number===0) return;
        seasonSelect.innerHTML += `<option value="${season.season_number}">Temporada ${season.season_number}</option>`;
    });

    seasonSelect.addEventListener("change",()=>loadEpisodes(id));
    loadEpisodes(id);
}

async function loadEpisodes(id){
    const season = document.getElementById("seasonSelect").value;
    const data = await fetch(`${BASE_URL}/tv/${id}/season/${season}?api_key=${API_KEY}`).then(r=>r.json());

    const episodeSelect = document.getElementById("episodeSelect");
    episodeSelect.innerHTML="";

    data.episodes.forEach(ep=>{
        episodeSelect.innerHTML+=`<option value="${ep.episode_number}">Ep ${ep.episode_number}</option>`;
    });
}

function loadEpisode(id){
    const season = document.getElementById("seasonSelect").value;
    const episode = document.getElementById("episodeSelect").value;

    document.getElementById("seriesPlayer").src =
        `https://playerflixapi.com/serie/${id}/${season}/${episode}`;
}

/* FAVORITOS */
function renderFavorites(){
    const fav = JSON.parse(localStorage.getItem("fav")) || [];
    if(fav.length===0){
        app.innerHTML="<h2>Sem favoritos</h2>";
        return;
    }

    createCatalog("Minha Lista", fav, "movie");
}
document.getElementById("searchInput")
.addEventListener("keypress", async function(e){

    if(e.key === "Enter"){

        const query = this.value.trim();
        if(!query) return;

        const response = await fetch(
            `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`
        );

        const data = await response.json();

        app.innerHTML = `
            <h2 style="padding:40px 40px 0 40px">
                Resultados para "${query}"
            </h2>
            <div class="search-results" id="results"></div>
        `;

        const resultsContainer = document.getElementById("results");

        data.results.forEach(item => {

            if(!item.poster_path) return;

            const type = item.media_type === "tv" ? "series" : "movie";

            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <img src="${IMG}${item.poster_path}">
            `;

            card.onclick = ()=>{
                location.hash = `#${type}/${item.id}`;
            };

            resultsContainer.appendChild(card);
        });
    }

});

async function renderMoviesPage(){
    app.innerHTML = "";

    // Mais Assistidos
    const popular = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`).then(r=>r.json());
    createCatalog("🔥 Mais Assistidos", popular.results, "movie");

    // Terror
    const terror = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27`).then(r=>r.json());
    createCatalog("👻 Terror", terror.results, "movie");

    // Comédia
    const comedy = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`).then(r=>r.json());
    createCatalog("😂 Comédia", comedy.results, "movie");

    // Ação
    const action = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`).then(r=>r.json());
    createCatalog("💥 Ação", action.results, "movie");
}
async function renderSeriesPage(){
    app.innerHTML = "";

    // Mais Assistidas
    const popular = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`).then(r=>r.json());
    createCatalog("🔥 Mais Assistidas", popular.results, "series");

    // Drama
    const drama = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=18`).then(r=>r.json());
    createCatalog("🎭 Drama", drama.results, "series");

    // Comédia
    const comedy = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=35`).then(r=>r.json());
    createCatalog("😂 Comédia", comedy.results, "series");

    // Ficção Científica
    const scifi = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10765`).then(r=>r.json());
    createCatalog("🚀 Ficção Científica", scifi.results, "series");
}
async function loadRecommendations(id, type){

    const res = await fetch(
        `${BASE_URL}/${type}/${id}/recommendations?api_key=${API_KEY}`
    );

    const data = await res.json();

    const container = document.getElementById("recommendations");

    data.results.slice(0,10).forEach(item=>{
        if(!item.poster_path) return;

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${IMG}${item.poster_path}">
        `;

        const routeType = type === "tv" ? "series" : "movie";

        card.onclick = ()=>{
            location.hash = `#${routeType}/${item.id}`;
        };

        container.appendChild(card);
    });
}
function addFavorite(id, type){

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    const exists = favorites.find(item => item.id === id);

    if(exists){
        alert("Já está nos favoritos!");
        return;
    }

    favorites.push({ id, type });

    localStorage.setItem("favorites", JSON.stringify(favorites));

    alert("Adicionado aos favoritos!");
}

