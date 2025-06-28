const User = require("../users/mongodb/Users");

const resolveBattle = async (req, res) => {
  const { attackerId, defenderId, planetName, result } = req.body; 

  try {
    const attacker = await User.findById(attackerId);
    const defender = await User.findById(defenderId);

    if (!attacker || !defender) {
      return res.status(404).json({ message: "Игрок не найден" });
    }

   if (result === "win") {
      attacker.points += 200;
      defender.points += 100;

      // Перенос планеты
      defender.planets = defender.planets.filter(p => p !== planetName);
      if (!attacker.planets.includes(planetName)) {
        attacker.planets.push(planetName);
      }
    } else if (result === "draw") {
      attacker.points += 150;
      defender.points += 150;
    } else if (result === "lose") {
      attacker.points += 100;
      defender.points += 200;
    } else {
      return res.status(400).json({ message: "Некорректный результат: win / draw / lose" });
    }

    // Проверка спейс-портов и эпик героев
    const checkAndApplySpaceport = (player) => {
      if (player.points >= 2000 && player.spaceports < 2) {
        player.spaceports = 2;
        player.epicHeroes = 2;
      } else if (player.points >= 1500 && player.spaceports < 1) {
        player.spaceports = 1;
        player.epicHeroes = 1;
      }
    };

    checkAndApplySpaceport(attacker);
    checkAndApplySpaceport(defender);

    await attacker.save();
    await defender.save();

    return res.json({ message: "Битва завершена", result, attackerPoints: attacker.points, defenderPoints: defender.points });
  } catch (err) {
    res.status(500).json({ message: "Ошибка обработки битвы", error: err.message });
  }
};

module.exports = { resolveBattle };
