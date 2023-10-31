// Find and store DOM elements
const heroGrid = document.querySelector(".hero-grid");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const navBar = document.querySelector("#navigation");
const favoriteSection = document.querySelector("#favorite-heroes");

const [ts, apiKey, hash] = [
  credentials.timeStamp,
  credentials.publicKey,
  credentials.Md5hash,
];
const initialUrl = `https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&apikey=${apiKey}&hash=${hash}`;

const popularHeroes = [
  "1017100",
  "1017577",
  "1009144",
  "1009726",
  "1010802",
  "1009718",
  "1009407",
  "1011358",
  "1017111",
];

let loaded = 0;

// Fetch the Data
async function fetchHeroData(url) {
  try {
    // Displaying message
    document.querySelector("#error-section").innerHTML = "Loading...";
    document.querySelector("#error-section").style.display = "block";
    let response = await fetch(url);
    let json = await response.json();
    let data = await json.data;
    let results = await data.results;

    if (results.length === 0) {
      throw new Error("No Results Found");
    } else {
      document.querySelector("#error-section").style.display = "none";
      updateHeroDisplay(results);
    }
  } catch (error) {
    // error
    if (
      error === "TypeError: NetworkError when attempting to fetch resource."
    ) {
      document.querySelector("#error-section").innerHTML = "Internet issue";
    } else {
      document.querySelector("#error-section").innerHTML = "NO RESULTS";
    }
    document.querySelector("#error-section").style.display = "block";
  }
}

function updateHeroDisplay(superheroes) {
  let favs = JSON.parse(localStorage.getItem("favs")) || [];

  for (let hero of superheroes) {
    // Check whether image is there or not
    if (
      !hero.thumbnail ||
      hero.thumbnail.path.includes("image_not_available")
    ) {
      continue;
    }

    if (favs.includes(hero.id.toString())) {
      continue;
    }

    let path = hero.thumbnail.path.replace("http://", "https://");
    let image = `${path}.${hero.thumbnail.extension}`;

    // Creating card
    let heroCard = document.createElement("div");
    heroCard.className = "hero-card";
    heroCard.innerHTML = `
      <a href="char.html?id=${hero.id}" target="_blank">
        <div class="hero-image">
          <img class="hero-img" src="${image}" alt="${hero.name}" data-hero-id="${hero.id}">
        </div>
        <h2 class="hero-name" data-hero-id="${hero.id}">${hero.name}</h2>
      </a>
      <button class="add-to-fav-button" data-hero-id="${hero.id}">Add to Favorites</button>
    `;

    heroGrid.appendChild(heroCard);
  }
}

// Search
function searchHero() {
  if (searchInput.value === "") return;
  let value = searchInput.value.toLowerCase().replace(" ", "-");
  let url = initialUrl + `&limit=50&nameStartsWith=${value}`;

  heroGrid.innerHTML = "";
  loaded = 0;
  fetchHeroData(url);
}

searchButton.addEventListener("click", searchHero);

// Toggle button
function toggleFavorite(element) {
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  let heroId = element.dataset.heroId;

  if (favs.includes(heroId)) {
    favs.splice(favs.indexOf(heroId), 1);
  } else {
    favs.push(heroId);
  }
  localStorage.setItem("favs", JSON.stringify(favs));
}

document.addEventListener("click", function (e) {
  if (e.target === searchButton) {
    searchHero();
  } else if (e.target === favoriteSection) {
    window.location.href = "favorites.html"; // Navigate to the favorites page
  } else if (e.target.classList.contains("add-to-fav-button")) {
    console.log(e.target);
    toggleFavorite(e.target);
    e.target.classList.add("added-to-fav");
    e.target.disabled = true;
    e.target.style.display = "none";
  } else if (
    e.target.classList.contains("hero-img") ||
    e.target.classList.contains("hero-name")
  ) {
    const heroId = e.target.getAttribute("data-hero-id");
    window.location.href = `char.html?id=${heroId}`;
  }
});

function initializeHeroes() {
  for (let heroId of popularHeroes) {
    if (heroId === null) continue;
    let url = `https://gateway.marvel.com:443/v1/public/characters/${heroId}?ts=${ts}&apikey=${apiKey}&hash=${hash}`;
    fetchHeroData(url);
  }
}

initializeHeroes();
