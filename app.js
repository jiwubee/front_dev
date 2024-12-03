const API_BASE_URL = "https://pokeapi.co/api/v2";

//html
const searchInput = document.getElementById("search");
const pokemonListElement = document.getElementById("pokemon-list");
const pokemonDetailsElement = document.getElementById("pokemon-details");

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
  const pokemons = await fetchPokemonList();
  pokemonListElement.innerHTML = "";

  if (pokemons.length === 0) {
    pokemonListElement.innerHTML = "<li>Brak Pokemonów do wyświetlenia</li>";

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

function showError(message) {
  alert(message);
}

let debounceTimeout;

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();

  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(async () => {
    if (!query) return displayPokemonList();

    const pokemons = await fetchPokemonList();
    const filteredPokemons = pokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query)
    );

    pokemonListElement.innerHTML = "";

    if (filteredPokemons.length === 0) {
      pokemonListElement.insertAdjacentHTML(
        "beforeend",
        "<li>Nie znaleziono Pokémona o tej nazwie.</li>"
      );
    } else {
      for (const pokemon of filteredPokemons) {
        const details = await fetchPokemonDetails(pokemon.name);

        const pokemonCard = `
          <li>
            <div class="pokemon-card">
              <img src="${details.sprites.front_default}" alt="${details.name}">
              <p>#${details.id} ${details.name}</p>
            </div>
          </li>
        `;

        pokemonListElement.insertAdjacentHTML("beforeend", pokemonCard);
      }
    }
  }, 500);
});

document.addEventListener("DOMContentLoaded", displayPokemonList);
