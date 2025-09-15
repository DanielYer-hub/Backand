const BattleLog = require("../models/battleLogModel");
const User = require("../users/mongodb/Users");

const createBattleLog = async (req, res) => {
  try {
    const attackerId = req.user.id; 
    const { defenderId, planetName, result } = req.body;

    if (!defenderId) {
      return res.status(400).json({ message: "defenderId is required" });
    }
    const cleanPlanet = (planetName || "").trim();
    if (!cleanPlanet) {
      return res.status(400).json({ message: "planetName is required" });
    }
    if (!["win", "draw", "lose"].includes(result)) {
      return res.status(400).json({ message: "result must be win/draw/lose" });
    }
    if (attackerId === defenderId) {
      return res.status(400).json({ message: "You cannot attack yourself" });
    }

    const [attacker, defender] = await Promise.all([
      User.findById(attackerId),
      User.findById(defenderId),
    ]);
    if (!attacker || !defender) {
      return res.status(404).json({ message: "Player not found" });
    }

    const battle = await BattleLog.create({
      attackerId,
      defenderId,
      planets: cleanPlanet, 
      result,
      confirmedByAttacker: false,
      confirmedByDefender: false,
      pointsGiven: false,
    });

    res.status(201).json({ message: "The fight is recorded", battle });
  } catch (err) {
    res.status(500).json({ message: "Error while recording the fight", error: err.message });
  }
};

const confirmBattle = async (req, res) => {
  try {
    const { battleId } = req.body;
    const userId = req.user.id; 
    const battle = await BattleLog.findById(battleId);
    if (!battle) return res.status(404).json({ message: "Fight not found" });
    if (battle.attackerId.toString() === userId) {
      battle.confirmedByAttacker = true;
    } else if (battle.defenderId.toString() === userId) {
      battle.confirmedByDefender = true;
    } else {
      return res.status(403).json({ message: "You are not a participant in this fight." });
    }
    if (battle.confirmedByAttacker && battle.confirmedByDefender && !battle.pointsGiven) {
      await applyBattleResults(battle);
      await battle.save();
    } else {
      await battle.save();
    }
    return res.json({ message: "Fight confirmed", battle });
  } catch (err) {
    res.status(500).json({ message: "Error during confirmation", error: err.message });
  }
};

const applyBattleResults = async (battle) => {
  const attacker = await User.findById(battle.attackerId);
  const defender = await User.findById(battle.defenderId);

  const planet = (battle.planets || "").trim();
  const result = battle.result;

  if (result === "win") {
    attacker.points += 200;
    defender.points += 100;

    if (planet) {
      defender.planets = defender.planets.filter((p) => p && p.trim() !== planet);
      if (!attacker.isStatic) {
        attacker.planets.push(planet);
      }
    }
  } else if (result === "draw") {
    attacker.points += 150;
    defender.points += 150;
  } else if (result === "lose") {
    attacker.points += 100;
    defender.points += 200;
  }

  battle.pointsGiven = true;

  await attacker.save();
  await defender.save();
};

const cancelBattle = async (req, res) => {
  try {
    const { battleId } = req.body;
    const userId = req.user.id; 
    const battle = await BattleLog.findById(battleId);
    if (!battle) return res.status(404).json({ message: "Fight not found" });
    const isParticipant =
      battle.attackerId.toString() === userId || battle.defenderId.toString() === userId;
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this battle." });
    }
    if (battle.confirmedByAttacker || battle.confirmedByDefender) {
      return res.status(400).json({ message: "The fight is already confirmed. Cancellation is impossible." });
    }
    const defender = await User.findById(battle.defenderId);
    if (defender) {
      defender.lastAttackedAt = null;
      await defender.save();
    }
    await battle.deleteOne();
    return res.json({ message: "The fight is canceled." });
  } catch (err) {
    res.status(500).json({ message: "Error while canceling the fight", error: err.message });
  }
};

const incomingBattles = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await BattleLog.find({
      defenderId: userId,
      confirmedByDefender: false,
    })
      .populate("attackerId", "name faction region address.city")
      .sort({ createdAt: -1 });
    res.json({ battles: list });
  } catch (err) {
    res.status(500).json({ message: "Failed to load incoming", error: err.message });
  }
};

const outgoingBattles = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await BattleLog.find({
      attackerId: userId,
      confirmedByDefender: false,
    })
      .populate("defenderId", "name faction region address.city")
      .sort({ createdAt: -1 });
    res.json({ battles: list });
  } catch (err) {
    res.status(500).json({ message: "Failed to load outgoing", error: err.message });
  }
};

const getBattle = async (req, res) => {
  try {
    const battle = await BattleLog.findById(req.params.id)
      .populate("attackerId", "name faction region address.city")
      .populate("defenderId", "name faction region address.city");
    if (!battle) return res.status(404).json({ message: "Fight not found" });
    const userId = req.user.id;
    const isParticipant =
      battle.attackerId._id.toString() === userId ||
      battle.defenderId._id.toString() === userId;
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this fight." });
    }
    res.json({ battle });
  } catch (err) {
    res.status(500).json({ message: "Failed to load fight", error: err.message });
  }
};

const setResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { result } = req.body; 
    if (!["win", "lose", "draw"].includes(result)) {
      return res.status(400).json({ message: "result must be win/lose/draw" });
    }
    const battle = await BattleLog.findById(id);
    if (!battle) return res.status(404).json({ message: "Fight not found" });
    const userId = req.user.id;
    const isParticipant =
      battle.attackerId.toString() === userId ||
      battle.defenderId.toString() === userId;
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this fight." });
    }
    battle.result = result;
    await battle.save();
    res.json({ battle });
  } catch (err) {
    res.status(500).json({ message: "Failed to set result", error: err.message });
  }
};

module.exports = {
  createBattleLog,
  confirmBattle,
  cancelBattle,
  incomingBattles,
  outgoingBattles,
  getBattle,
  setResult,
};
