# Alpha Algorithm 

## introduction 
Alpha algorithm is an algorithm in the field of process modeling that is used to model a process from the event logs of an organization which is also knows as process mining 

## description 
I used node.js to perform this project due to it's simplicity and high level abstraction in managing arrays also performance wasn't really A high concern during this project and node was okay performance wise, this project was for business process modeling course in college during year my senior 1 year.

## challenges 
1. extracting data from csv file and preprocessing it for later use 
2. extracting relationships between nodes (causality, parallel and choice)
3. extracting data about resource utilization 

## what I learned
1. manipulating arrays and objects in node
2. manipulating csv files using node
3. implementing Alpha algorithm

## Current Features
1. input .CSV of your logs -columns:caseID,activityName,date,resource-
2. events and resources usage 
3. events durations
4. frequencies of events
5. A process model petri net -> causality, || parallel, # choice

## Future Features
+ Visualising the process model

## how to Use
+ you need node
+ you need npm
+ install dependencies
+ run using node main.js filename.csv
