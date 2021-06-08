const fs = require("fs");
const csv = require("csvtojson");
const { parser } = require("json2csv");

(async () => {
  try {
    //taking arguments
    args = process.argv;
    //source to scrap
    let source = args[2];

    const file = await csv().fromFile(source);
    //console.log(file);
    var dir = "./results";
    //creating results file if not found in directory
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    let activities = []; //holds all the activities names/ID
    let cases = []; //holds all the cases names/ID
    let resources = []; //holds all the resources names/ID

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
      //getting all the unqiue cases in the trace log
      temp = file[i].resource;
      if (resources.indexOf(temp) < 0) {
        resources.push(temp);
      }
    }
    activities.sort();
    cases.sort();
    resources.sort();
    console.log(activities);

    //creating the event resourse pivot table to see how much a resource gets used by each event
    let eventResourcetable = [];
    for (let i = 0; i < activities.length; i++) {
      eventResourcetable.push({ activityName: activities[i] });
      resources.forEach((element) => {
        eventResourcetable[i][element] = 0;
      });
      for (let j = 0; j < file.length; j++) {
        if (file[j].activityName == eventResourcetable[i].activityName) {
          eventResourcetable[i][file[j].resource] += 1;
        }
      }
    }
    writeToCSV("./results/event_resourceTable.csv", eventResourcetable);

    //getting frequencies of activities
    let frequencies = [];
    for (let i = 0; i < activities.length; i++) {
      let count = 0,
        frequency = 0;
      for (let j = 0; j < file.length; j++) {
        if (file[j].activityName == activities[i]) {
          count++;
        }
      }
      frequency = (count / file.length) * 100;
      frequencies.push({
        activityName: activities[i],
        frequency: count,
        precentage: frequency,
      });
    }
    frequencies.sort(function (a, b) {
      return b.frequency - a.frequency;
    });
    writeToCSV("./results/frequencies.csv", frequencies);

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

    //sorting data based on time stamp
    for (let i = 0; i < dividedactivities.length; i++) {
      dividedactivities[i].sort(function (a, b) {
        return a.date - b.date;
      });
    }
    writeToCSV("./results/processedData.csv", dividedactivities.flat());

    startingevents = [];
    endingevents = [];
    dividedactivities.forEach((element) => {
      temp = element[0].activityName;
      if (startingevents.indexOf(temp) < 0) {
        startingevents.push(temp);
      }
      temp = element[element.length - 1].activityName;
      if (endingevents.indexOf(temp) < 0) {
        endingevents.push(temp);
      }
    });
    console.log(startingevents);
    console.log(endingevents);

    let flatactivities = dividedactivities.flat();
    writeToCSV("./results/processedData.csv", flatactivities);

    //getting task time
    times = [];
    for (let i = 0; i < flatactivities.length; i++) {
      temp = flatactivities[i].activityName;
      if (endingevents.indexOf(temp) > -1) {
        flatactivities[i].date = 0;
      } else {
        diff = flatactivities[i + 1].date - flatactivities[i].date;
        var msec = diff;
        var hh = Math.floor(msec / 1000 / 60 / 60);
        msec -= hh * 1000 * 60 * 60;
        var mm = Math.floor(msec / 1000 / 60);
        var time = hh + ":" + mm;
        times.push({ activity: temp, period: time });
      }
    }
    writeToCSV("./results/eventperiods.csv", times);

    let relations = []; //hold all the relations between events
    for (let i = 0; i < dividedactivities.length; i++) {
      for (let j = 0; j < dividedactivities[i].length - 1; j++) {
        relations.push({
          activityone: dividedactivities[i][j].activityName,
          relation: ">",
          activitytwo: dividedactivities[i][j + 1].activityName,
        });
      }
    }

    //removing duplicates
    for (let i = 0; i < relations.length; i++) {
      for (let j = i + 1; j < relations.length; j++) {
        if (
          relations[i].activityone == relations[j].activityone &&
          relations[i].activitytwo == relations[j].activitytwo
        ) {
          relations[j].relation = "duplicate";
        }
      }
    }
    let arr = [];
    relations.forEach((element) => {
      if (element.relation != "duplicate") {
        arr.push(element);
      }
    });
    relations = arr;
    writeToCSV("./results/relations.csv", relations);

    //finding parallel relations
    arr = [];
    arrparallel = [];
    for (let i = 0; i < relations.length; i++) {
      for (let j = i + 1; j < relations.length; j++) {
        if (
          relations[i].activityone == relations[j].activitytwo &&
          relations[i].activitytwo == relations[j].activityone &&
          relations[i].relation == ">" &&
          relations[j].relation == ">"
        ) {
          relations[i].relation = "||";
          arrparallel.push(relations[i]);
          relations[j].relation = "duplicate";
        }
      }
    }
    for (let i = 0; i < arrparallel.length; i++) {
      first = true;
      for (let j = 0; j < relations.length; j++) {
        if (
          (arrparallel[i].activityone == relations[j].activityone ||
            arrparallel[i].activityone == relations[j].activitytwo ||
            arrparallel[i].activitytwo == relations[j].activityone ||
            arrparallel[i].activitytwo == relations[j].activitytwo) &&
          relations[j].relation == ">"
        ) {
          if (first) {
            relations[j].relation = "duplicate";
            first = false;
          }
        }
      }
    }
    relations.forEach((element) => {
      if (element.relation != "duplicate") {
        arr.push(element);
      }
    });
    relations = arr;

    for (let i = 0; i < relations.length; i++) {
      for (let j = 0; j < arrparallel.length; j++) {
        if (
          (relations[i].activityone == arrparallel[j].activityone ||
            relations[i].activityone == arrparallel[j].activitytwo) &&
          relations[i].relation == ">"
        ) {
          relations[i].activityone = JSON.stringify(arrparallel[j]);
        } else if (
          (relations[i].activitytwo == arrparallel[j].activitytwo ||
            relations[i].activitytwo == arrparallel[j].activityone) &&
          relations[i].relation == ">"
        ) {
          relations[i].activitytwo = JSON.stringify(arrparallel[j]);
        }
      }
    }

    for (let i = 0; i < relations.length; i++) {
      for (let j = i + 1; j < relations.length; j++) {
        if (
          relations[i].activityone == relations[j].activityone &&
          relations[i].activitytwo != relations[j].activitytwo &&
          relations[i].relation == ">" &&
          relations[j].relation == ">"
        ) {
          temp = {
            activityone: relations[i].activitytwo,
            relation: "#",
            activitytwo: relations[j].activitytwo,
          };
          //relations.push(temp);
          relations[i].activitytwo = JSON.stringify(temp);
          relations[j].activitytwo = JSON.stringify(temp);
        }
      }
    }
    //putting the causality signs
    relations.forEach((element) => {
      if (element.relation == ">") {
        element.relation = "->";
      }
    });
    writeToCSV("./results/relations.csv", relations);
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

// JSON to CSV Converter
function writeToCSV(name, arr) {
  const headers = Object.keys(arr[0]).join();
  const content = arr.map((r) => Object.values(r).join());
  X = [headers].concat(content).join("\n");
  fs.writeFileSync(name, X);
}
