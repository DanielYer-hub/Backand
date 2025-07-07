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

    res.status(201).json({ message: "Бой записан", battle });
  } catch (err) {
    res.status(500).json({ message: "Ошибка при записи боя", error: err.message });
  }
};

const confirmBattle = async (req, res) => {
  const { battleId, userId } = req.body;

  try {
    const battle = await BattleLog.findById(battleId);
    if (!battle) return res.status(404).json({ message: "Бой не найден" });

    if (battle.attackerId.toString() === userId) {
  battle.confirmedByAttacker = true;
  } else if (battle.defenderId.toString() === userId) {
  battle.confirmedByDefender = true;
  }
 else {
      return res.status(403).json({ message: "Вы не участник этого боя" });
    }

    if (battle.confirmedByAttacker && battle.confirmedByDefender && !battle.pointsGiven) {
      await applyBattleResults(battle);
    }

    await battle.save();
    res.json({ message: "Бой подтверждён", battle });
  } catch (err) {
    res.status(500).json({ message: "Ошибка при подтверждении", error: err.message });
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

    // Планета переходит
    defender.planets = defender.planets.filter(p => p && p.trim() !== planet);
    attacker.planets.push(planet);
  } else if (result === "draw") {
    attacker.points += 150;
    defender.points += 150;
  } else if (result === "lose") {
    attacker.points += 100;
    defender.points += 200;
  }

  // Проставить флаг начисления
  battle.pointsGiven = true;

  await attacker.save();
  await defender.save();
};

module.exports = { createBattleLog, confirmBattle };
