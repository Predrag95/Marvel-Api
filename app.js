const marvelUrl = 'https://gateway.marvel.com/v1/public/characters?ts=1&apikey=1ea733c170cd9b5dcc20f21fa56a76cd&hash=7c8a1d5ea3502eaff35b8f9ef3027a77&limit=20';
const singleMarvelCharacterUrl = (characterId) => {
  return `https://gateway.marvel.com/v1/public/characters/${characterId}?ts=1&apikey=1ea733c170cd9b5dcc20f21fa56a76cd&hash=7c8a1d5ea3502eaff35b8f9ef3027a77`;
};

let timeOut;
const input = document.querySelector('input');
const charactersParent = document.querySelector('.char_container');
const bookmarkedParent = document.querySelector('.bookmarks');
let activeCharacters = [];
let bookmarkedCharacters = [];
if(localStorage.getItem('bookmarks')) {
  bookmarkedCharacters = JSON.parse(localStorage.getItem('bookmarks'))
  bookmarkedCharacters.forEach(charId=> {
    fetch(singleMarvelCharacterUrl(charId))
    .then(res=>res.json())
    .then(data=>drawCharacter(data.data.results[0], bookmarkedParent))
  })
}

input.addEventListener('keyup', searchCharacter);

function searchCharacter(event) {
  if (timeOut) {
    clearTimeout(timeOut);
  }
  const searchedChar = event.target.value;
  timeOut = setTimeout(()=> {
    fetchCharacter(searchedChar)
  }, 500)
};

function fetchCharacter(searchedChar) {
  if (searchedChar === '') {
    charactersParent.innerHTML = '';
    return;
  }
  fetch(marvelUrl + '&nameStartsWith=' + searchedChar)
  .then(res=>res.json())
  .then(data=>{
    activeCharacters = data.data.results;
    drawCharacters(data.data.results)
  })
}

const characterElement = (characterName, characterId, characterPicture) => {
  return `
    <div class='card'>
      <img src="${characterPicture}/standard_large.jpg">
      <div class='card_info' id=${characterId}>
        <span>${characterName}</span>
        <span class='bookmark'>Bookmark</span>
      </div>
    </div>
  `
};

function drawCharacters(characters) {
  charactersParent.innerHTML = '';
  characters.forEach(character => {
    drawCharacter(character, charactersParent);  
  });
}

function drawCharacter(character, parent) {
  const charElement = document.createElement('div');
  charElement.classList.add('card_wrapper')
  charElement.innerHTML = characterElement(character.name, character.id, character.thumbnail.path);
  parent.appendChild(charElement);
  const bookmark = charElement.querySelector('.bookmark');
  bookmark.addEventListener('click', bookmarkCharacter);
};

function bookmarkCharacter(event) {
  if (event.target.classList.contains('active')) {
    removeCharacterFromBookmars(event.target.parentElement.id);
    event.target.classList.remove('active');
    return;
  }
  event.target.classList.add('active')
  const charId = event.target.parentElement.id;
  const character = activeCharacters.find(char=>char.id === +charId);
  drawCharacter(character, bookmarkedParent);
  bookmarkedCharacters.push(charId);
  localStorage.setItem('bookmarks', JSON.stringify(bookmarkedCharacters));
};

function removeCharacterFromBookmars (characterId) {
  const index = bookmarkedCharacters.indexOf(characterId);
  bookmarkedCharacters.splice(index, 1);
  localStorage.setItem('bookmarks', JSON.stringify(bookmarkedCharacters));
  removeCharacterFromDOM(index);
};

function removeCharacterFromDOM (index) {
  const allCharactes = document.querySelectorAll('.bookmarks .card_wrapper');
  const characterToRemove = allCharactes[index];
  characterToRemove.remove();
};