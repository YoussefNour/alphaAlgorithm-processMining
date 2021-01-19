const fs = require("fs");
const csv = require("csvtojson");
const { parser } = require("json2csv");
const { Console } = require("console");

(async () => {
  try {
    const file = await csv().fromFile("log - Copy.csv");
    console.log(file);

    const compare = (a, b) => {
      if (a.caseID < b.caseID) {
        return -1;
      }
      if (a.caseID > b.caseID) {
        return 1;
      }
      return 0;
    };

    file.sort(compare);
    //console.log(file);
    let activities = []; //holds all the activities names/ID
    let cases = []; //holds all the cases names/ID
    for (i = 0; i < file.length; i++) {
      //getting all the unqiue activities in the trace log
      temp = file[i].activityName;
      if (activities.indexOf(temp) < 0) {
        activities.push(temp);
      }
      //getting all the unqiue cases in the trace log
      temp = file[i].caseID;
      if (cases.indexOf(temp) < 0) {
        cases.push(temp);
      }
    }
    //getting frequencies of activities
    let frequencies = [];
    for (let i = 0; i < activities.length; i++) {
      let count=0,frequency=0;
      for (let j = 0; j < file.length; j++) {
        if(file[j].activityName==activities[i]){
          count++;
        }
      }
      frequency = count/file.length;
      frequencies.push({activityName:activities[i],frequency:frequency});
    }
    frequencies.sort(function(a,b){
      return b.frequency - a.frequency;
    });
    storeDataInJSON("./frequencies.json",frequencies);
    let dividedactivities = []; //holds all the activites but divided based on case name/ID
    for (i = 0; i < cases.length; i++) {
      dividedactivities.push([]);
      for (let j = 0; j < file.length; j++) {
        if (file[j].caseID == cases[i]) {
          dividedactivities[i].push(file[j]);
        }
      }
    }
    for (let i = 0; i < dividedactivities.length; i++) {
      for (let j = 0; j < dividedactivities[i].length; j++) {
        dividedactivities[i][j].date = new Date(dividedactivities[i][j].date);
      }
    }
    //console.log(dividedactivities);
    //console.log("\nunsorted divided data\n");
    //sorting data based on time stamp
    for (let i = 0; i < dividedactivities.length; i++) {
      dividedactivities[i].sort(function (a, b) {
        return a.date - b.date;
      });
    }
    //console.log(dividedactivities);
    //console.log("sorted based on date");

    let relations = []; //hold all the relations between events
    let successions = []; //hold all the relations between events
    for (let i = 0; i < dividedactivities.length; i++) {
      for (let j = 0; j < dividedactivities[i].length - 1; j++) {
        successions.push({
          activityone: dividedactivities[i][j].activityName,
          relation: ">",
          activitytwo: dividedactivities[i][j + 1].activityName,
        });
      }
    }
    //removing duplicates
    tempsuccessions = successions;
    for (let i = 0; i < tempsuccessions.length; i++) {
      for (let j = i + 1; j < tempsuccessions.length - 2; j++) {
        if (
          tempsuccessions[i].activityone == tempsuccessions[j].activityone &&
          tempsuccessions[i].activitytwo == tempsuccessions[j].activitytwo &&
          tempsuccessions[i].relation == tempsuccessions[j].relation
        ) {
          successions.splice(j, j);
        }
      }
    }
    storeDataInJSON("./successions.json", successions);
    // temprelation = relations;
    // noncausalrelations = [];
    // for (let i = 0; i < temprelation.length; i++) {
    //   for (let j = i + 1; j < temprelation.length - 2; j++) {
    //     if (
    //       temprelation[i].activityone == temprelation[j].activitytwo &&
    //       temprelation[i].activitytwo == temprelation[j].activityone &&
    //       temprelation[i].relation == temprelation[j].relation
    //     ) {
    //       relations[i].activityone = temprelation[i].activityone;
    //       relations[i].relation = "||";
    //       relations[i].activitytwo = temprelation[i].activitytwo;
    //       relations.splice(j, j);
    //     }
    //     //else if(
    //     //   temprelation[i].activityone == temprelation[j].activityone &&
    //     //   temprelation[i].activitytwo == temprelation[j].activitytwo &&
    //     //   temprelation[i].relation == temprelation[j].relation
    //     // ){
    //     //   relations.splice(j,j);
    //     // }
    //   }
    // }

    // // let indexes = [];
    // // for (let i = 0; i < activities.length; i++) {
    // //   let temp1,temp2;
    // //   temp1 = activities[i];
    // //   for (let j = 0; j < activities.length; j++) {

    // //   }
    // //   for (let j = 0; j < relations.length; j++) {

    // //     relations.push({activityone:dividedactivities[i][j].activityName,relation:">",activitytwo:dividedactivities[i][j+1].activityName});
    // //   }
    // // }
    // storeDataInJSON("./relationsparallelchecked.json", relations);
  } catch (error) {
    console.error(error);
  }
})();

function storeDataInJSON(file, data) {
  console.log("\n------------" + file + "------------\n");
  console.log(data);
  console.log("\n------------" + file + "------------\n");
  return fs.writeFileSync(file, JSON.stringify(data), (err) => {
    if (err) {
      return err;
    }
    return;
  });
}
