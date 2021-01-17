const fs = require("fs");
const csv = require("csvtojson");
const { parser } = require("json2csv");
const { Console } = require("console");

(async () => {
  try {
    const file = await csv().fromFile("log.csv");
    let activities = [];
    for (i = 0; i < file.length; i++) {
      temp = file[i].ActivityName;
      if (activities.indexOf(temp)){
        activities.push(temp);  
      } 
    }
    console.log(activities);
  } catch (error) {
    console.error(error);
  }
})();
