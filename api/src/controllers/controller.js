const {Sequelize} = require('sequelize');
const axios = require('axios');
const { Character, Episode } = require('../db');

const getCharacterByAPI = async ()=>{
    const characterAPIPages = [];
    // for(let page in characterAPIPages){
        for(let i=0; i<=42 ; i++){
        const apiUrl = await axios.get(`https://rickandmortyapi.com/api/character?page=${i}`);
        apiUrl.data.results.map(e=>{
            characterAPIPages.push({
                id: e.id,
                name: e.name,
                species: e.species,
                origin: e.origin.name,
                image: e.image,
                episode: e.episode.map(e=> e.slice(40, e.length))
            })
            //Si queda tiempo al final, pulir cómo se renderizan los episodios
        })
    }
    return characterAPIPages;
}

const getCharacterByDb = async ()=>{
    const characterDb = await Character.findAll({
        include: {
            model: Episode,
            attributes: ['name'],
            through: {
                attributes: []
            }
        }
    })
    return characterDb;
}

const getAllCharacterInfo = async()=>{
    const characterByAPI = await getCharacterByAPI();
    const characterByDb = await getCharacterByDb();
    const allCharacters = [...characterByAPI, ...characterByDb];
    return allCharacters;
}

const showCharacter = async (req, res)=>{
    const name = req.query.name;
    const info = await getAllCharacterInfo();
    if (name){
        let characterName = info.filter(e => e.name.toLowerCase().includes(name.toLowerCase()));
        if(characterName.length > 0) res.status(200).send(characterName);
        else res.status(404).json('No character found with that name');
    }
    else res.status(200).json(info);
}

const showCharacterById = async (req, res)=>{
    const id = req.params.id;
    const info = await getAllCharacterInfo();
    if (id) {
        let characterId = info.filter(e => e.id.toString() === id.toString());
        if (characterId.length >0) res.status(200).send(characterId);
        else res.status(404).json('No character found with that ID');
    }
}

const createNewCharacter = async (req, res)=>{
    const { name, species, origin, image, episode, created} = req.body;
    try{
        const userMadeCharacter = await Character.create({
            name,
            species,
            origin,
            image,
            created
        });
        const allEpisodes = await Episode.findAll({
            where:{
                name: episode
            }
        });
        userMadeCharacter.addEpisode(allEpisodes);
        res.status(200).json(userMadeCharacter);
    }
    catch(error){
        console.log('Could not create character' + error);
    };
}

const getAllEpisodes = async (req, res)=> {
    for(let i=0; i<=3; i++){
        const allEpisodeInfo = await axios.get(`https://rickandmortyapi.com/api/episode?page=${i}`);
        const episodeInfo = await allEpisodeInfo.data.results.map(e => e.name);
        episodeInfo.map(e =>{
            Episode.findOrCreate({
                where: { name: e}
            })
        });
    }
    const allEpisodes = await Episode.findAll();
    res.status(200).json(allEpisodes);
}

module.exports = {
    getCharacterByAPI,
    getCharacterByDb,
    showCharacter,
    showCharacterById,
    createNewCharacter,
    getAllEpisodes
}