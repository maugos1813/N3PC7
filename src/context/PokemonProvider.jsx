import { useEffect, useState } from 'react';
import { useForm } from '../hook/useForm';
import { PokemonContext } from '../context/PokemonContex';

export const PokemonProvider = ({ children }) => {
	const [allPokemons, setAllPokemons] = useState([]);
	const [globalPokemons, setGlobalPokemons] = useState([]);
	const [offset, setOffset] = useState(0);

	// Utilizar CustomHook - useForm
	const { valueSearch, onInputChange, onResetForm } = useForm({
		valueSearch: '',
	});

	// Estados para la aplicación simples
	const [loading, setLoading] = useState(true);
	const [active, setActive] = useState(false);

	// lLamar 50 pokemones a la API
	const getAllPokemons = async (limit = 50) => {
		const baseURL = 'https://pokeapi.co/api/v2/';

		try {
			const res = await fetch(
				`${baseURL}pokemon?limit=${limit}&offset=${offset}`
			);
			if (!res.ok) throw new Error('Network response was not ok');
			const data = await res.json();

			const promises = data.results.map(async pokemon => {
				const res = await fetch(pokemon.url);
				if (!res.ok) throw new Error('Network response was not ok');
				const data = await res.json();
				return data;
			});
			const results = await Promise.all(promises);

			setAllPokemons(prev => [...prev, ...results]);
			setLoading(false);
		} catch (error) {
			console.error('Error fetching all Pokemons:', error);
			setLoading(false);
		}
	};

	// Llamar todos los pokemones en lotes más pequeños
	const getGlobalPokemons = async (limit = 100) => {
		const baseURL = 'https://pokeapi.co/api/v2/';

		let allPokemons = [];
		let currentOffset = 0;
		let moreData = true;

		try {
			while (moreData) {
				const res = await fetch(
					`${baseURL}pokemon?limit=${limit}&offset=${currentOffset}`
				);
				if (!res.ok) throw new Error('Network response was not ok');
				const data = await res.json();

				const promises = data.results.map(async pokemon => {
					const res = await fetch(pokemon.url);
					if (!res.ok) throw new Error('Network response was not ok');
					const data = await res.json();
					return data;
				});
				const results = await Promise.all(promises);

				allPokemons = [...allPokemons, ...results];
				currentOffset += limit;
				moreData = data.results.length > 0;
			}

			setGlobalPokemons(allPokemons);
			setLoading(false);
		} catch (error) {
			console.error('Error fetching global Pokemons:', error);
			setLoading(false);
		}
	};

	// Llamar a un pokemon por ID
	const getPokemonByID = async id => {
		const baseURL = 'https://pokeapi.co/api/v2/';

		try {
			const res = await fetch(`${baseURL}pokemon/${id}`);
			if (!res.ok) throw new Error('Network response was not ok');
			const data = await res.json();
			return data;
		} catch (error) {
			console.error('Error fetching Pokemon by ID:', error);
		}
	};

	useEffect(() => {
		getAllPokemons();
	}, [offset]);

	useEffect(() => {
		getGlobalPokemons();
	}, []);

	// BTN CARGAR MÁS
	const onClickLoadMore = () => {
		setOffset(offset + 50);
	};

	// Filter Function + State
	const [typeSelected, setTypeSelected] = useState({
		grass: false,
		normal: false,
		fighting: false,
		flying: false,
		poison: false,
		ground: false,
		rock: false,
		bug: false,
		ghost: false,
		steel: false,
		fire: false,
		water: false,
		electric: false,
		psychic: false,
		ice: false,
		dragon: false,
		dark: false,
		fairy: false,
		unknow: false,
		shadow: false,
	});

	const [filteredPokemons, setfilteredPokemons] = useState([]);

	const handleCheckbox = e => {
		setTypeSelected({
			...typeSelected,
			[e.target.name]: e.target.checked,
		});

		if (e.target.checked) {
			const filteredResults = globalPokemons.filter(pokemon =>
				pokemon.types
					.map(type => type.type.name)
					.includes(e.target.name)
			);
			setfilteredPokemons(prev => [...prev, ...filteredResults]);
		} else {
			const filteredResults = filteredPokemons.filter(
				pokemon =>
					!pokemon.types
						.map(type => type.type.name)
						.includes(e.target.name)
			);
			setfilteredPokemons([...filteredResults]);
		}
	};

	return (
		<PokemonContext.Provider
			value={{
				valueSearch,
				onInputChange,
				onResetForm,
				allPokemons,
				globalPokemons,
				getPokemonByID,
				onClickLoadMore,
				// Loader
				loading,
				setLoading,
				// Btn Filter
				active,
				setActive,
				// Filter Container Checkbox
				handleCheckbox,
				filteredPokemons,
			}}
		>
			{children}
		</PokemonContext.Provider>
	);
};