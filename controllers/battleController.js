const User = require("../users/mongodb/Users");

const resolveBattle = async (req, res) => {
  const { attackerId, defenderId, planetName, result } = req.body;

  try {
    const attacker = await User.findById(attackerId);
    const defender = await User.findById(defenderId);

    if (!attacker || !defender) {
      return res.status(404).json({ message: "Player not found" });
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (defender.lastAttackedAt && defender.lastAttackedAt > oneWeekAgo) {
      return res.status(403).json({
        message: "This player was recently attacked. He is under protection for 7 days.",
      });
    }

    
    const cleanPlanet = planetName?.trim();
    if (!cleanPlanet) {
      return res.status(400).json({ message: "The name of the planet is not provided or is empty." });
    }
    if (result === "win") {
      attacker.points += 200;
      defender.points += 100;
      defender.planets = defender.planets.filter(p => p && p.trim() !== cleanPlanet);
      if (!attacker.isStatic) {
        attacker.planets.push(cleanPlanet);
      }

      
      const isDefenderOnHomeland = cleanPlanet === defender.homeland;
      const onlyHomelandLeft = defender.planets.length === 1 && defender.planets[0] === defender.homeland;

      if (isDefenderOnHomeland && onlyHomelandLeft) {
        if (defender.defeatsOnHomeland === 1 && defender._lastHomelandDefeat && defender.updatedAt < defender._lastHomelandDefeat) {
          defender.isStatic = true;
          defender.spaceports = Math.min(defender.spaceports, 1);
          defender.epicHeroes = Math.min(defender.epicHeroes, 1);
          defender.defeatsOnHomeland = 2;
        } else {
          defender.defeatsOnHomeland = 1;
          defender._lastHomelandDefeat = now;
        }
      }
    } else if (result === "draw") {
      attacker.points += 150;
      defender.points += 150;
      defender.defeatsOnHomeland = 0;
      defender._lastHomelandDefeat = null;
    } else if (result === "lose") {
      attacker.points += 100;
      defender.points += 200;
      defender.defeatsOnHomeland = 0;
      defender._lastHomelandDefeat = null;
    } else {
      return res.status(400).json({ message: "Incorrect result: win / draw / lose" });
    }

    
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

    defender.lastAttackedAt = now;

    await attacker.save();
    await defender.save();

    return res.json({
      message: "The battle is over",
      result,
      attackerPoints: attacker.points,
      defenderPoints: defender.points,
      attackerPlanets: attacker.planets,
      defenderPlanets: defender.planets,
      defenderStatus: {
        isStatic: defender.isStatic,
        defeatsOnHomeland: defender.defeatsOnHomeland,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error processing battle", error: err.message });
  }
};

module.exports = { resolveBattle };