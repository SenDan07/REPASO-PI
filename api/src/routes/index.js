const { Router } = require("express");
const router = Router();

const { showCharacter,getAllEpisodes,showCharacterById, createNewCharacter } = require("../controllers/controller")
// Configurar los routers

router.get("/episode", getAllEpisodes);
router.get("/character", showCharacter);
router.get("/character/:id", showCharacterById);
router.post("/character", createNewCharacter);

module.exports = router;
