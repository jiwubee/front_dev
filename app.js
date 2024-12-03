const API_BASE_URL = "https://pokeapi.co/api/v2";

//html
const searchInput = document.getElementById("search");
const pokemonListElement = document.getElementById("pokemon-list");
const pokemonDetailsElement = document.getElementById("pokemon-details");
const loadingIndicator = document.createElement("p");
loadingIndicator.textContent = "Ładowanie...";

async function fetchPokemonList(limit = 20, offset = 0) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
    );
    if (!response.ok) throw new Error("Nie udało się pobrać listy Pokemonów");
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(error);
    showError("Nie udało się pobrać listy Pokemonów.");
    return [];
  }
}

async function fetchPokemonDetails(idOrName) {
  try {
    const response = await fetch(`${API_BASE_URL}/pokemon/${idOrName}`);
    if (!response.ok)
      throw new Error("Nie udało się pobrać szczegółów Pokemona");
    return await response.json();
  } catch (error) {
    console.error(error);
    showError("Nie udało się pobrać szczegółów Pokemona.");
    return null;
  }
}

async function displayPokemonList() {
  showLoading();
  const pokemons = await fetchPokemonList();
  pokemonListElement.innerHTML = ""; // Czyszczenie listy

  if (pokemons.length === 0) {
    pokemonListElement.innerHTML = "<li>Brak Pokemonów do wyświetlenia</li>";
    hideLoading();
    return;
  }

  for (const pokemon of pokemons) {
    const details = await fetchPokemonDetails(pokemon.name);
    const li = document.createElement("li");
    li.innerHTML = `
            <div class="pokemon-card">
                <img src="${details.sprites.front_default}" alt="${details.name}">
                <p>#${details.id} ${details.name}</p>
            </div>
        `;
    li.addEventListener("click", () => displayPokemonDetails(details));
    pokemonListElement.appendChild(li);
  }
  hideLoading();
}

function displayPokemonDetails(details) {
  if (!details) return;

  pokemonDetailsElement.innerHTML = `
        <h2>${details.name} (#${details.id})</h2>
        <img src="${details.sprites.front_default}" alt="${details.name}">
        <p><strong>Typ:</strong> ${details.types
          .map((t) => t.type.name)
          .join(", ")}</p>
        <p><strong>Wzrost:</strong> ${details.height} dm</p>
        <p><strong>Waga:</strong> ${details.weight} hg</p>
        <h3>Statystyki:</h3>
        <ul>
            ${details.stats
              .map((s) => `<li>${s.stat.name}: ${s.base_stat}</li>`)
              .join("")}
        </ul>
    `;
}

function showLoading() {
  if (!document.body.contains(loadingIndicator)) {
    document.body.appendChild(loadingIndicator);
  }
}

function hideLoading() {
  if (document.body.contains(loadingIndicator)) {
    document.body.removeChild(loadingIndicator);
  }
}

function showError(message) {
  alert(message);
}

searchInput.searchBar("input", async (e) => {
  const query = e.target.value.trim().toLowerCase();
  if (!query) {
    displayPokemonList();
    return;
  }

  const details = await fetchPokemonDetails(query);
  if (details) {
    pokemonListElement.innerHTML = "";
    displayPokemonDetails(details);
  }
});

document.asearchBar("DOMContentLoaded", () => {
  displayPokemonList();
});
