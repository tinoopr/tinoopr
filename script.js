$(document).ready(function() {
  start();
});

//Executionary functions
function start() {
  step1();
}

function step1() { //data receival
  var team_query = {
      url: 'https://www.thebluealliance.com/event/2017calb#teams',
      type: 'html',
      selector: '.team-name a',
      extract: 'text'
    },
    team_uriQuery = encodeURIComponent(JSON.stringify(team_query)),
    team_request  = 'http://example.noodlejs.com/?q=' +
               team_uriQuery + '&callback=?';

  var match_query = {
      url: 'https://www.thebluealliance.com/event/2017calb#rankings',
      type: 'html',
      selector: '.col-sm-6:first-child .match-table tbody .visible-lg td:not(td:first-child):not(td:nth-child(2))',
      extract: 'text'
    },
    match_uriQuery = encodeURIComponent(JSON.stringify(match_query)),
    match_request  = 'http://example.noodlejs.com/?q=' +
               match_uriQuery + '&callback=?';

  // Make Ajax request to Noodle server
  jQuery.getJSON(team_request, function (team_data) {
    jQuery.getJSON(match_request, function(match_data) {
      step2(getTeams(team_data[0].results), getMatches(match_data[0].results));
    });
  });
}

function step2(team_data, match_data) { //matrix calculations
  var teams = team_data, length = team_data.length;
  var total_matrix = [], match_matrix = [];

  //fill match matrix with empty values, dim num_teams x num_teams, fill team totals points totals
  for(var i = 0; i < length; i++) {
    var add = [];
    for(var j = 0; j < length; j++) {
      add.push(0);
    }
    match_matrix.push(add);
    total_matrix.push(0);
  }

  for(var i = 0; i < match_data.length; i++) {
    updateMatrix(match_matrix, match_data[i],teams,total_matrix);
  }

  var solved = math.multiply(math.inv(match_matrix), total_matrix);

  var combine = [];

  for(var i = 0; i < length; i++) {
    combine.push([teams[i],solved[i]]);
  }
  combine.sort(
    function compare(a,b) {
      return b[1] - a[1];
  });

  step3(combine);
}

function step3(data) { //front-end updates
  for(i in data) {
    var opr = round(data[i][1], 2);

    var line = "<tr><td>" + data[i][0] + "</td><td>" + data[i][1].toFixed(2) + "</td></tr>";
    $("#ol").append(line);
  }
}

// Helper functions
function round(num, places) {
  var multiplier = Math.pow(10, places);
  return Math.round(num * multiplier) / multiplier;
}

function getNumber(string) {
  var returner = "";
  for(var i = 0; i < string.length; i++) {
    if(!isNaN(string.charAt(i))) returner += string.charAt(i);
  }
  return parseInt(returner);
}

function getNumberFirst(string) {
  var returner = "";
  for(var i = 0; i < string.length; i++) {
    if(!isNaN(string.charAt(i))) {
      returner += string.charAt(i);
    } else {
      break;
    }
  }
  return parseInt(returner);
}

function getTeams(data) {
  var returner = [];
  for(var i = 0; i < data.length; i++) {
    returner.push(getNumberFirst(data[i]));
  }
  return returner;
}

function getMatches(data) {
  var returner = [];
  for(var i = 0; i < data.length; i+=8) {
    returner.push([getNumber(data[i]), getNumber(data[i + 1]), getNumber(data[i + 2]), getNumber(data[i + 3]), getNumber(data[i + 4]), getNumber(data[i + 5]), getNumber(data[i + 6]), getNumber(data[i + 7])]);
  }
  return returner;
}

function updateMatrix(matrix, match, teams, total) {
  var reds = getRedData(match);
  var blues = getBlueData(match);

  //update reds
  for(var i = 0; i < 3; i++) {
    for(var j = 0; j < 3; j++) {
      matrix[teams.indexOf(reds[i])][teams.indexOf(reds[j])]++;
    }
    total[teams.indexOf(reds[i])]+=reds[3];
  }

  //update blues
  for(var i = 0; i < 3; i++) {
    for(var j = 0; j < 3; j++) {
      matrix[teams.indexOf(blues[i])][teams.indexOf(blues[j])]++;
    }
    total[teams.indexOf(blues[i])]+=blues[3];
  }
}

function getBlueData(match_data) {
  return [match_data[3], match_data[4], match_data[5], match_data[7]];
}

function getRedData(match_data) {
  return [match_data[0], match_data[1], match_data[2], match_data[6]];
}
