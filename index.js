function styleTiles() {
    var // format value as pixels
    px = function(v) { return v ? (v|0) + "px" : '0'; },
    
    r = Math.random,
    // random value [0,m)
    rv = function(m) { return m*r(); },
    // random value [n,m)
    rb = function(n,m) { return rv(m-n)+n; },
    // random value centered around 0
    rc0 = function(rng) { return (r()*rng)-(rng/2); },
    // random pixel value [0,m)
    rpx = function(m) { return px(rv(m)) },
    // random background position
    bkg = function(w,h) { return rpx(w)+" "+rpx(h||w); },
    
    // Prototypes
    fp = Function.prototype,
    ap = Array.prototype,
    dp = Document.prototype,
   	
    // callable forEach
    forEach = fp.call.bind(ap.forEach),
    // jQuery-ish
    $ = dp.querySelectorAll.bind(document),
    
    tiles = $(".tile"),
    rackTiles = $(".rack>.tile");

    // Randomize the wood grain
    forEach(tiles, function(el) {
        el.style.backgroundPosition = bkg(600);
    });
    
    // randomize the rotation of the rack tiles. 
    forEach(rackTiles, function(el) {
        el.style.transform = "rotate("+ rc0(5) +"deg)";
    });
    
    // randomize the background-color of the all the tiles
    forEach(tiles, function(el) {
        var s = el.style, cs = window.getComputedStyle(el), amt = r();
        s.backgroundColor = cs.backgroundColor
        .darken(amt*20)
        .desaturate(amt*30)
        .toHexString();
    });
}

function fetchData(word) {
    document.querySelector(".result-container").innerHTML = "";
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    fetch(`http://www.localhost:3000/scrabble/${word}`)
    .then(res => res.json())
    .then(data => {
        WordList(data);
    })
    .catch(error => console.error('Error:', error));
}

function wordForm() {
    return `<div class="rack">
            </div>
            <div id="word-form">
                <input id="word" type="text" maxlength="12" placeholder="enter up to 12 letters" autocomplete="off">
                <button id="search">Search</button>
            </div>`
}

function renderWord(word) {
    return `<span>${word}</span>`
}

function wordsContainer() {
    return `<div class="result-container">
            </div>`
}

function calculateScore(word) {
    let values = {  a:1, e:1, i:1, o:1, u:1, l:1, n:1, n:1, s:1, t:1, r:1,
                    d:2, g:2,
                    b:3, c:3, m:3, p:3,
                    f:4, h:4, v:4, w:4, y:4,
                    k:5,
                    j:8, x:8,
                    q:10, z:10
    }
    let score = 0;
    for (char of word) {
        score += values[char];
    }
    return score;
}

function createResultBox(length) {

    let resultContainer = document.querySelector(".result-container");

    let wordContainer = document.createElement('div');
    let resultTitle = document.createElement('h2');
    let listContainer = document.createElement('div');
    let list = document.createElement('ul');

    wordContainer.classList.add("word-container");
    resultTitle.classList.add("result-title");
    listContainer.classList.add("list-container");
    list.id = `word-length-${length}`;
    resultTitle.innerHTML = `${length} letter words`;

    listContainer.appendChild(list);
    wordContainer.appendChild(resultTitle);
    wordContainer.appendChild(listContainer);
    resultContainer.appendChild(wordContainer);
}

function noMatchesFound() {
    return `<h1>No results found, try different letters</h1>`
}

function getDefinition(word) {
    window.open(`https://www.merriam-webster.com/dictionary/${word}`, '_blank');
}

function WordList(data) {
    let doc = document.querySelector(".result-container");
    if (!data.length) {
        doc.innerHTML = noMatchesFound();
    }
    let wordLength = [];
    
    data.forEach(word => {
        if (!wordLength.includes(word.length)) {
            wordLength.push(word.length);
            createResultBox(word.length);
        }
        let currentUl = document.querySelector(`#word-length-${word.length}`);
        let newWord = document.createElement('li');
        let score = document.createElement('sub');
        newWord.innerHTML = word;
        score.innerHTML = calculateScore(word);
        newWord.setAttribute("title", "Click for definition");
        newWord.appendChild(score);
        currentUl.appendChild(newWord);

        newWord.addEventListener('click', () => getDefinition(newWord.childNodes[0].textContent));
    });
}

function createTile(letter) {
    return `<div class=tile data-letter=${letter}></div>`
}

function displayWord(e) {
    let rack = document.querySelector('.rack');
    strippedWord = e.target.value.toLowerCase().replace(/[^a-z]/g, '').split('');
    rack.innerHTML = strippedWord.map(letter => createTile(letter)).join('');
    styleTiles();
}

function HomePage() {
    return `<div class="page">
                ${wordForm()}
                ${wordsContainer()}
            </div>`;
}

function addListeners() {
    let button = document.querySelector('#search');
    let word = document.querySelector('#word');

    button.addEventListener('click', () => fetchData(document.querySelector('#word').value));
    window.addEventListener('keypress', (e) => {
        if (e.keyCode === 13 || e.which === 13) {
            fetchData(document.querySelector('#word').value);
        }
    })
    word.addEventListener('input', displayWord);
}

document.querySelector('body').innerHTML = HomePage();

addListeners();