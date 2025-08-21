// const mongoose = require('mongoose');

// const Faction = new mongoose.Schema({

// faction:{
//   type:String,
//   enum:[
//     'Dark Angels',
//     'Blood Angels',
//     'Space Marines',
//     'Space Wolves',
//     'Grey Knights',
//     'Black Templars',
//     'Deathwatch',
//     'Imperial Knights',
//     'Adeptus Mechanicus',
//     'Astra Militarum',
//     'Adeptus Custodes',
//     'Adepta Sororitas',
//     'Imperial Agents',
//     'Chaos Space Marines',
//     'Chaos Daemons',
//     'Thousand Sons',
//     'Death Guard',
//     'World Eaters',
//     'Emperor’s Children',
//     'Chaos Knights',
//     'Aeldari',
//     'Drukhari',
//     'Necrons',
//     'Orks',
//     'T’au Empire',
//     'Tyranids',
//     'Genestealer Cults',
//     'Leagues of Votann'
//   ],
//   default: 'Space Marines'
// },
// });

// module.exports = Faction;

// helpers/mongodb/Faction.js
module.exports = {
  type: String,
  enum: [
    'Dark Angels',
    'Blood Angels',
    'Space Marines',
    'Space Wolves',
    'Grey Knights',
    'Black Templars',
    'Deathwatch',
    'Imperial Knights',
    'Adeptus Mechanicus',
    'Astra Militarum',
    'Adeptus Custodes',
    'Adepta Sororitas',
    'Imperial Agents',
    'Chaos Space Marines',
    'Chaos Daemons',
    'Thousand Sons',
    'Death Guard',
    'World Eaters',
    'Emperor’s Children',
    'Chaos Knights',
    'Aeldari',
    'Drukhari',
    'Necrons',
    'Orks',
    'T’au Empire',
    'Tyranids',
    'Genestealer Cults',
    'Leagues of Votann'
  ],
  default: 'Space Marines',
  required: true
};
