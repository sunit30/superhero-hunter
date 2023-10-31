const favoritesContainer = document.querySelector("#favorite-heroes-container");
const [ts, apiKey, hash] = [
  credentials.timeStamp,
  credentials.publicKey,
  credentials.Md5hash,
];

async function getHeroData(heroId) {
  const url = `https://gateway.marvel.com:443/v1/public/characters/${heroId}?ts=${ts}&apikey=${apiKey}&hash=${hash}`;
  try {
    const response = await fetch(url);
    const json = await response.json();
    const hero = json.data.results[0];
    return hero;
  } catch (error) {
    console.error("Error fetching character data:", error);
    return null;
  }
}

// update the display
async function updateFavoritesDisplay() {
  favoritesContainer.innerHTML = ""; // Clear the container

  let favs = JSON.parse(localStorage.getItem("favs")) || [];

  if (favs.length === 0) {
    favoritesContainer.innerHTML = `<h1 class="no-favs">No Favorite Superheroes Added</h1>`;
    return;
  }

  // Looping favorite superheroes
  for (let heroId of favs) {
    const hero = await getHeroData(heroId);

    if (
      !hero ||
      !hero.thumbnail ||
      hero.thumbnail.path.includes("image_not_available")
    ) {
      continue;
    }

    const path = hero.thumbnail.path.replace("http://", "https://");
    const image = `${path}.${hero.thumbnail.extension}`;

    // favorite superhero
    const favoriteHeroCard = document.createElement("div");
    favoriteHeroCard.className = "favorite-hero-card";
    favoriteHeroCard.className = "hero-card";
    favoriteHeroCard.innerHTML = `
      <a href="char.html?id=${hero.id}" target="_blank">
        <div class="favorite-hero-image hero-image">
          <img class="favorite-hero-img hero-img" src="${image}" alt="${hero.name}" data-hero-id="${hero.id}">
        </div>
        <h2 class="favorite-hero-name hero-name" data-hero-id="${hero.id}">${hero.name}</h2>
      </a>
      <div class="fav-btn-container">
        <button class="remove-from-fav-button" data-hero-id="${hero.id}">Remove from Favorites</button>
      </div>
    `;

    favoritesContainer.appendChild(favoriteHeroCard);
  }

  const removeButtons = document.querySelectorAll(".remove-from-fav-button");
  removeButtons.forEach((button) => {
    button.addEventListener("click", removeFavorite);
  });
}

// remove superhero
function removeFavorite(event) {
  const heroId = event.target.dataset.heroId;
  let favs = JSON.parse(localStorage.getItem("favs")) || [];

  if (favs.includes(heroId)) {
    favs = favs.filter((id) => id !== heroId);
    localStorage.setItem("favs", JSON.stringify(favs));
    updateFavoritesDisplay(); // Refresh the display after removal
  }
}

updateFavoritesDisplay();
