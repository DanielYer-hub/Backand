const User = require("../users/mongodb/Users");

const resolveBattle = async (req, res) => {
  const { attackerId, defenderId, planetName, attackerWon } = req.body;

  try {
    const attacker = await User.findById(attackerId);
    const defender = await User.findById(defenderId);

    if (!attacker || !defender) {
      return res.status(404).json({ message: "Игрок не найден" });
    }

    // если атакер победил
    if (attackerWon) {
      // удалить планету у защитника
      defender.planets = defender.planets.filter(p => p !== planetName);
      // добавить атакующему (если еще нет)
      if (!attacker.planets.includes(planetName)) {
        attacker.planets.push(planetName);
      }

      await defender.save();
      await attacker.save();

      return res.json({ message: `${planetName} перешла к атакующему` });
    }

    return res.json({ message: "Атакующий проиграл, планета осталась у защитника" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка обработки битвы", error: err.message });
  }
};

module.exports = { resolveBattle };
