const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(cors());

// .flat not supported by Heroku
function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
  }

const loadDictionary = () => {
    return fs.readFileSync('./modified.txt', 'utf8').replace(/\r/g,"").split('\n');
}

const sortDictionary = (dict) => {
    let sortedDict = {};
    dict.forEach(word => {
        if (word.length < 2) return;
        word = word.toLowerCase();
        let sortedWord = word.split('').sort().join('');
        if (sortedDict[sortedWord]) {
            sortedDict[sortedWord].push(word);
        } else {
            sortedDict[sortedWord] = [word];
        }
    });
    return sortedDict;
}

const isMatch = (word, possibleWord) => {
    if (possibleWord.length < 2 || possibleWord.length > word.length) {
        return false
    }
    possibleWord = possibleWord.split('');
    for (char of possibleWord) {
        let index  = word.indexOf(char);
        if (index >= 0) {
            word.splice(index, 1);
        } else {
            return false
        }
    }
    return true;
}

const findMatches = (letters, sortedDict) => {
    let results = [];
    Object.keys(sortedDict).forEach(entry => {
        if (isMatch(letters.slice(), entry)) {
            results.push(sortedDict[entry]);
        }
    });
    return flatten(results).sort((a, b) => b.length - a.length);
}

const stripInvalidCharsAndSplit = (word) => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    return word.split('');
}

const dict = loadDictionary();
const sortedDict = sortDictionary(dict);


app.get('/', (req, res) => {
    res.send("here you go");
});

app.get('/scrabble', (req, res) => {
    if (!req.body.word) {
        res.send([]);
    }
    console.log("request sent", req.body.word)
    let possibilities = findMatches(req.body.word.split(''), sortedDict);
    possibilities.length ? res.send(possibilities) : res.send([]);
    
});

app.get('/scrabble/:word', (req, res) => {
    if (!req.params.word) {
        res.send([]);
    }
    console.log("request sent", req.params.word)
    let word = stripInvalidCharsAndSplit(req.params.word);
    let possibilities = findMatches(word, sortedDict);
    possibilities.length ? res.send(possibilities) : res.send([]);
});

app.get("*", (req, res) => {
    res.send("Nothing to see here folks");
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

