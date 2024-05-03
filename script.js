const containerErrorElement = document.querySelector(".containerError");
const containerInfoElement = document.querySelector(".containerInfo");
var evolucion = "";

document.querySelector(".buttonSearch").addEventListener("click", capturar);
document.querySelector('#in1').addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        capturar();
    }
});

document.querySelector('.buttonEvolution').addEventListener("click", evolucionar);

function capturar() {
    const in1 = document.getElementById('in1').value.trim().toLowerCase();
    fetchAndHandleData(`https://pokeapi.co/api/v2/pokemon/${in1}`);
}

function evolucionar() {
    fetchAndHandleData(`https://pokeapi.co/api/v2/pokemon/${evolucion}`);
}

async function fetchAndHandleData(url) {
    try {
        containerErrorElement.style.display = 'none';
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        handleData(data);
    } catch (error) {
        handleError(error);
    }
}

function handleError(error) {
    console.log(`Falló la petición con error: ${error.message}`);
    containerInfoElement.style.display = 'none';
    document.querySelector('.containerEvolution').style.display = 'none';
    containerErrorElement.style.display = 'flex';
}

async function handleData(data) {
    const { forms, sprites, types, abilities, species } = data;
    // Mostrar información del Pokémon
    document.querySelector('.pokemonName').textContent = forms[0].name;
    document.querySelector('.pokemonImg').src = sprites.other["official-artwork"].front_default;
    document.querySelector('.pokemonType').textContent = types[0].type.name;

    // Habilidades
    const habilidades = abilities.map(a => a.ability.name).join(", ") || "None";
    document.querySelector('.pokemonAbilities').textContent = habilidades;

    // Mostrar información de la especie
    containerInfoElement.style.display = 'flex';
    fetchAndHandleSpecies(species.url);
}

async function fetchAndHandleSpecies(url) {
    const response = await fetch(url);
    if (!response.ok) {
        handleError(new Error(`HTTP error! status: ${response.status}`));
        return;
    }
    const speciesData = await response.json();
    handleSpeciesData(speciesData);
}

async function handleSpeciesData(speciesData) {
    // Descripción
    const flavorTexts = speciesData.flavor_text_entries.filter(entry => entry.language.name === "en");
    const flavorText = flavorTexts.slice(0, 2).map(entry => entry.flavor_text).join(" ");
    document.querySelector('.pokemonDescrition').textContent = flavorText;

    // Cadena de evolución
    fetchAndHandleEvolutionChain(speciesData.evolution_chain.url);
}

async function fetchAndHandleEvolutionChain(url) {
    const response = await fetch(url);
    if (!response.ok) {
        handleError(new Error(`HTTP error! status: ${response.status}`));
        return;
    }
    const evolutionData = await response.json();
    handleEvolutionChainData(evolutionData);
}

function handleEvolutionChainData(evolutionData) {
    let chain = evolutionData.chain;
    let currentName = document.querySelector('.pokemonName').textContent;

    while (chain.species.name !== currentName) {
        chain = chain.evolves_to[0];
    }

    if (chain.evolves_to.length > 0) {
        evolucion = chain.evolves_to[0].species.name;
        document.querySelector('.containerEvolution').style.display = 'flex';
    } else {
        document.querySelector('.containerEvolution').style.display = 'none';
    }
}
