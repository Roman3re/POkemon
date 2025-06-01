let yourPokemons = []
let favPokemons = []
let idCounter = 1

const nameInput = document.getElementById('name')
const createBtn = document.getElementById('create')
const searchInput = document.getElementById('search')

const yourList = document.getElementById('your-pokemons')
const favList = document.getElementById('your-favourite-pokemons')
const pokeBlock = document.getElementById('pokemon-section')

createBtn.addEventListener('click', async () => {
	const query = nameInput.value.trim().toLowerCase()
	if (!query) {
		alert('Введи ім’я або ID покемона')
		return
	}

	try {
		const data = await fetchPokemon(query)
		const pokemon = mapDataToCard(data)
		yourPokemons.push(pokemon)
		nameInput.value = ''
		renderLists(searchInput.value.trim().toLowerCase())
	} catch (err) {
		alert('Не знайдено такого покемона 😢')
	}
})

searchInput.addEventListener('input', () => {
	renderLists(searchInput.value.trim().toLowerCase())
})

async function fetchPokemon(query) {
	const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
	if (!res.ok) throw new Error('not found')
	return res.json()
}

function mapDataToCard(d) {
	return {
		id: idCounter++,
		name: capitalize(d.name),
		type: d.types.map(t => t.type.name).join(', '),
		weight: d.weight / 10, // у кг
		power: d.base_experience,
		image: d.sprites.front_default,
	}
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

function renderLists(searchTerm = '') {
	pokeBlock.style.display =
		yourPokemons.length || favPokemons.length ? 'block' : 'none'
	yourList.innerHTML = ''
	favList.innerHTML = ''

	const filteredMain = yourPokemons.filter(p =>
		p.name.toLowerCase().includes(searchTerm)
	)
	const filteredFav = favPokemons.filter(p =>
		p.name.toLowerCase().includes(searchTerm)
	)

	filteredMain.forEach(p => yourList.appendChild(pokemonLi(p, true)))
	filteredFav.forEach(p => favList.appendChild(pokemonLi(p, false)))

	saveState()
}

function pokemonLi(pokemon, inMain) {
	const li = document.createElement('li')
	li.className = 'list-item'
	li.innerHTML = `
    <div class="card">
      <img src="${pokemon.image}" alt="${pokemon.name}">
      <div class="info">
        <h3>${pokemon.name}</h3>
        <p>Type: ${pokemon.type}</p>
        <p>Power: ${pokemon.power}</p>
        <p>Weight: ${pokemon.weight} kg</p>
        ${
					inMain
						? `<button class="fav">❤️ В избранное</button>
               <button class="del">🗑️ Удалить</button>`
						: `<button class="back">↩️ Вернуть</button>
               <button class="del">🗑️ Удалить</button>`
				}
      </div>
    </div>`

	li.querySelector('.del').addEventListener('click', () => {
		if (inMain) {
			yourPokemons = yourPokemons.filter(p => p.id !== pokemon.id)
		} else {
			favPokemons = favPokemons.filter(p => p.id !== pokemon.id)
		}
		renderLists(searchInput.value.trim().toLowerCase())
	})

	if (inMain) {
		li.querySelector('.fav').addEventListener('click', () => {
			yourPokemons = yourPokemons.filter(p => p.id !== pokemon.id)
			favPokemons.push(pokemon)
			renderLists(searchInput.value.trim().toLowerCase())
		})
	} else {
		li.querySelector('.back').addEventListener('click', () => {
			favPokemons = favPokemons.filter(p => p.id !== pokemon.id)
			yourPokemons.push(pokemon)
			renderLists(searchInput.value.trim().toLowerCase())
		})
	}

	return li
}

function saveState() {
	localStorage.setItem('pokeMain', JSON.stringify(yourPokemons))
	localStorage.setItem('pokeFav', JSON.stringify(favPokemons))
	localStorage.setItem('pokeID', idCounter)
}

function loadState() {
	const main = localStorage.getItem('pokeMain')
	const fav = localStorage.getItem('pokeFav')
	const id = localStorage.getItem('pokeID')
	if (main) yourPokemons = JSON.parse(main)
	if (fav) favPokemons = JSON.parse(fav)
	if (id) idCounter = +id
	renderLists()
}

loadState()
