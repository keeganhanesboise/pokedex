import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';

/**
 * 
 * @param {onClick} props 
 * @returns Navigation Buttons
 */
function NavButtons(props) {
    return (
        <div id="navBtnsContainer">
            <button onClick={() => props.onClick('prev')} className="navBtn">Previous</button>
            <button onClick={() => props.onClick('next')} className="navBtn">Next</button>
        </div>
    );
}

/**
 * 
 * @param {sprite, name, weight} props 
 * @returns Pokemon Information Card
 */
function PokeInfoCard(props) {
    const pokeAbilities = props.abilities.map((value) =>
        <li key={value.ability.name}>{value.ability.name}</li>
    );
    return (
        <div id="infoCard">
            <img src={props.sprite} alt="pokemon" id="pokeSprite"></img>
            <h1>{props.name}</h1>
            <p>Weight: {props.weight}lbs</p>
            <h3>Abilities:</h3>
            {pokeAbilities}
        </div>
    );
}

/**
 * 
 * @param {pokeData, selectValue, onChangeOption} props 
 * @returns Selector populated with every Pokemon
 */
function PokeSelector(props) {
    const pokeOptions = props.pokeData.results.map((pokemon) => 
        <option key={pokemon.name}>
            {pokemon.name}
        </option>
    );
    return (
        <select value={props.selectValue} onChange={props.onChangeOption}>
            {pokeOptions}
        </select>
    );
}

/**
 * Driver component that handles functionality for changing currently selected Pokemon
 */
class Pokedex extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectValue: this.props.pokeData.results[0].name,
            selectedPokemon: 0,
            selectedPokemonData: {
                name: '',
                sprites: {
                    front_default: '',
                },
                weight: 0,
                abilities: [],
            },
        };
    }

    componentDidMount() {
        this.updatePokemon();
    }

    updatePokemon = () => {
        let pokeUrl = this.props.pokeData.results[this.state.selectedPokemon].url;
        axios(pokeUrl)
        .then(response => {
            this.setState({ selectedPokemonData: response.data });
        })
        .catch(error => {
            console.error("error fetching data: ", error);
        })
    }

    handleChangeOption = (e) => {
        let selectedPokemon = this.props.pokeData.results.findIndex(function(pokemon, index) {
            if (pokemon.name === e.target.value) {
                return true;
            }
        });
        this.setState({ selectedPokemon: selectedPokemon }, function() {this.updatePokemon()});
        this.setState({ selectValue: e.target.value });
    }

    handleClick = (type) => {
        let pokeIndex = this.state.selectedPokemon;
        if (type === 'next') {
            if ((this.state.selectedPokemon + 1) !== this.props.pokeData.results.length) {
                pokeIndex++;
                this.setState({ selectedPokemon: pokeIndex }, function() {this.updatePokemon();});
            } else {
                console.log("Reached Last Pokemon");
            }
        } else {
            if (this.state.selectedPokemon > 0) {
                pokeIndex--;
                this.setState({ selectedPokemon: pokeIndex }, function() {this.updatePokemon();});
            } else {
                console.log("Already at first Pokemon");
            }
        }
    }

    render() {
        return (
            <div id="pokedex">
                <PokeSelector 
                    pokeData={this.props.pokeData}
                    value={this.state.selectValue}
                    onChangeOption={this.handleChangeOption}
                />
                <PokeInfoCard 
                    name={this.state.selectedPokemonData.name} 
                    weight={this.state.selectedPokemonData.weight}
                    sprite={this.state.selectedPokemonData.sprites.front_default}
                    abilities={this.state.selectedPokemonData.abilities}
                />
                <NavButtons
                    onClick={this.handleClick}
                />
            </div>
        );
    }
}

/**
 * Fetches Pokemon data from Pokemon API
 */
class PokeAPI extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pokeData: {
                results: [
                    {
                        name: ''
                    }
                ]
            },
        };
    }

    componentDidMount() {
        axios('https://pokeapi.co/api/v2/pokemon?offset=0&limit=100000')
            .then(response => {
                this.setState({ pokeData: response.data });      
            })
            .catch(error => {
                console.error("error fetching data: ", error);
            })
    }

    render() {
        if (this.state.pokeData.results.length < 2) {
            return null;
        } else {
            return(
                <Pokedex pokeData={this.state.pokeData}/>
            );
        }
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<PokeAPI/>)