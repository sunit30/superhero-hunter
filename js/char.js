const urlParams = new URLSearchParams(window.location.search);
const heroId = urlParams.get("id");
const heroImage = document.querySelector(".image-section img");
const heroName = document.querySelector(".details-section h1");
const bio = document.querySelector(".details-section p");
const comicsContainer = document.querySelector(".comics-container");
const seriesContainer = document.querySelector(".series-container");
const eventsContainer = document.querySelector(".events-container");
const favBtn = document.querySelector(".fav-btn-section i");
const [ts, apiKey, hash] = [
  credentials.timeStamp,
  credentials.publicKey,
  credentials.Md5hash,
];

async function fetchHeroData(url) {
  try {
    let response = await fetch(url);
    let data = await response.json();
    let result = data.data.results[0];
    return result;
  } catch (error) {
    console.log(error);
    throw Error("Failed to fetch data");
  }
}

function updateHeroHeader(hero) {
  if (!hero.thumbnail || hero.thumbnail.path.includes("image_not_available")) {
    return;
  }

  let path = hero.thumbnail.path.replace("http://", "https://");
  heroImage.src = `${path}.${hero.thumbnail.extension}`;
  heroName.textContent = hero.name;
  bio.textContent = hero.description || "No description available";
  document.title = hero.name;

  let isFav = favorites.includes(heroId);
  favBtn.classList.toggle("fa-solid", isFav);
  favBtn.classList.toggle("fa-regular", !isFav);
}

function updateHeroSection(data, container) {
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `<h2>No data available</h2>`;
  }

  data.slice(0, 10).forEach((element) => {
    if (!element.resourceURI) return;
    let uri = element.resourceURI.replace("http://", "https://");
    let url = `${uri}?ts=${ts}&apikey=${apiKey}&hash=${hash}`;

    fetchHeroData(url)
      .then((result) => {
        if (
          !result.thumbnail ||
          result.thumbnail.path.includes("image_not_available")
        ) {
          return;
        }

        let path = result.thumbnail.path.replace("http://", "https://");
        container.innerHTML += `
          <div class="card">
            <div class="card-image">
              <img src="${path}.${result.thumbnail.extension}" alt="">
            </div>
            <div class="card-title">
              <h3>${result.title}</h3>
            </div>
          </div>`;
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

function toggleFavorite() {
  let isFav = favorites.includes(heroId);

  if (isFav) {
    favorites = favorites.filter((fav) => fav !== heroId);
  } else {
    favorites.push(heroId);
  }

  favBtn.classList.toggle("fa-regular", !isFav);
  favBtn.classList.toggle("fa-solid", isFav);

  localStorage.setItem("favs", JSON.stringify(favorites));
}

function initializeCharacterDetails() {
  let url = `https://gateway.marvel.com:443/v1/public/characters/${heroId}?ts=${ts}&apikey=${apiKey}&hash=${hash}`;

  fetchHeroData(url)
    .then((result) => {
      updateHeroHeader(result);
      favBtn.addEventListener("click", toggleFavorite);
      updateHeroSection(result.comics.items, comicsContainer);
      updateHeroSection(result.series.items, seriesContainer);
      updateHeroSection(result.events.items, eventsContainer);
    })
    .catch((error) => {
      console.log(error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeCharacterDetails();
});
