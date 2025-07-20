const BattleLog = require("../models/battleLogModel");
const User = require("../users/mongodb/Users");

const createBattleLog = async (req, res) => {
  const { attackerId, defenderId, planetName, result } = req.body;

  try {
    const battle = await BattleLog.create({
      attackerId,
      defenderId,
      planets: planetName,
      result,
    });

    res.status(201).json({ message: "The fight is recorded", battle });
  } catch (err) {
    res.status(500).json({ message: "Error while recording the fight", error: err.message });
  }
};

const confirmBattle = async (req, res) => {
  const { battleId, userId } = req.body;

  try {
    const battle = await BattleLog.findById(battleId);
    if (!battle) return res.status(404).json({ message: "Fight not found" });

    if (battle.attackerId.toString() === userId) {
  battle.confirmedByAttacker = true;
  } else if (battle.defenderId.toString() === userId) {
  battle.confirmedByDefender = true;
  }
 else {
      return res.status(403).json({ message: "You are not a participant in this fight." });
    }

    if (battle.confirmedByAttacker && battle.confirmedByDefender && !battle.pointsGiven) {
      await applyBattleResults(battle);
    }

    await battle.save();
    res.json({ message: "Fight confirmed", battle });
  } catch (err) {
    res.status(500).json({ message: "Error during confirmation", error: err.message });
  }
};

const applyBattleResults = async (battle) => {
 const attacker = await User.findById(battle.attackerId);
 const defender = await User.findById(battle.defenderId);


  const planet = battle.planets.trim();
  const result = battle.result;

  if (result === "win") {
    attacker.points += 200;
    defender.points += 100;
    defender.planets = defender.planets.filter(p => p && p.trim() !== planet);
    attacker.planets.push(planet);
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
  const { battleId, userId } = req.body;

  try {
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

module.exports = { createBattleLog, confirmBattle, cancelBattle, };