const BattleLog = require("../models/battleLogModel");
const User = require("../users/mongodb/Users");

const getBattleHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const battles = await BattleLog.find({
      $or: [{ attackerId: userId }, { defenderId: userId }],
    })
      .populate("attackerId", "name") 
      .populate("defenderId", "name")  
      .sort({ createdAt: -1 }); 

    res.json({
      message: "Battle history",
      count: battles.length,
      battles: battles.map(b => ({
        id: b._id,
        attacker: b.attackerId.name,
        defender: b.defenderId.name,
        result: b.result,
        planet: b.planets,
        confirmed: b.confirmedByAttacker && b.confirmedByDefender,
        date: b.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching battle history", error: err.message });
  }
};

module.exports = { getBattleHistory };
