# Waar kan ik het meeste vinden van ...
<a href="https://gyazo.com/ad38a89d268cb5a20f205c9444fb7dcf"><img src="https://i.gyazo.com/ad38a89d268cb5a20f205c9444fb7dcf.gif" alt="Image from Gyazo" width="1000"/></a>

## Live demo
[Bekijk de demo](https://eyobdejene.github.io/)

## Concept
Met deze visualisatie kan de bezoeker van het museum er achter komen hoeveel objecten van bepaald onderwerp zijn te 
vinden
 in het museum.<br>
De objecten worden op basis van hun continent gecategoriseerd<br>
De bezoeker kan met behulp van zijn of haar eigen input het onderwerp invoeren om er achter te komen waar de meeste 
objecten vandaan komen.<br>
[Lees meer](https://github.com/EyobDejene/functional-programming/wiki/Concept)

## Doelgroep
Deze visualisatie is gemaakt voor de bezoekers van het museum.
Als bezoeker heb je misschien een voorkeur voor bepaalde objecten die je graag wil zien.
Aangezien het museum verdeelt is in continenten leek het mij handig om de objecten in de visualisatie te categoriseren 
op basis van het continent.
Daarom is deze visualisatie handig om te gebruiken bij het vinden van de objecten binnen het museum.
Niet alle objecten zijn te vinden in het museum daarom zou het ook prettig zijn om te kunnen zien of de objecten 
tentoon worden gesteld.

## Data gebruik &  verwerking
Data is afkomstig van het NMVW. De NMVW heeft de data beschikbaar gemaakt voor ons om er mee te werken.
In de collectie verschillende objecten te vinden over verschillende continenten.
Ik heb er voor gekozen om alle objecten op te halen per continent op basis van de termmaster.
Het opschonen en categoriseren heb doormiddel van vanilla javascript gedaan.
Van alle objecten die worden opgehaald heb ik er voor gezorgd dat de 10 objecten met de meeste resultaten 
gecategoriseerd worden op basis van het continent.

**Sparql**<br>
Via SparQL queries (RDF gebaseerde gegevens) is het mogelijk om bepaalde informatie uit de verzameling van 
wereldculturen op te vragen.<br>
[Lees meer](https://github.com/EyobDejene/functional-programming/wiki/Data-query)

## Features
* Fetch data van collectie database
* Weergeven van data in visualisatie

## Toekomstige features
* Zoom-in op bubble

## Code snippets
* [Code snippets](https://github.com/EyobDejene/functional-programming/wiki/Code-snippets)
* [Fetch data d3](https://github.com/EyobDejene/functional-programming/wiki/Code-snippets#fetch-data)
* [Data omzetten](https://github.com/EyobDejene/functional-programming/wiki/Code-snippets#data-omzetten)
* [Bubbles svg](https://github.com/EyobDejene/functional-programming/wiki/Code-snippets#bubbles-svg-d3)

## Persoonlijke progressie

* [Data opschonen](https://github.com/EyobDejene/functional-programming/wiki/Opschonen-enqu%C3%AAte-data) 
* [Werken met svg](https://github.com/EyobDejene/functional-programming/wiki/D3--experimentals#svg-smiley)
* [D3.js](https://github.com/EyobDejene/functional-programming/wiki/D3--experimentals#wat-is-d3)

## Wiki
Lees [wiki](https://github.com/EyobDejene/functional-programming/wiki) voor het hele proces. 

# Verder ontwikkelen
Wil je verder werken aan het project of een eigen versie van het bestaande project willen maken dan is het 
noodzakelijk om de volgende sofware vooraf geïnstalleerd te hebben:

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (met npm)
* [Google Chrome](https://google.com/chrome/)

## Installatie
* `git clone <repository-url>`
* `cd functional-programming`
* `npm install`

### Build
Het project maakt gebruik van een module bundler genaamd [rollup](https://rollupjs.org/) .
Het compiles kleine stukjes code in een één complex bestand.
Het gebundelde bestand komt terrecht in het build mapje.

* `npm run build`

### Development omgeving
Automatisch bundelen van javascript bestanden bij iedere verandering

* `npm run dev`

### Deploying
Om het project te deployen kan je gebruik maken van githubpages.
GitHub Pages is een statische site-hostingservice die HTML-, CSS- en JavaScript-bestanden rechtstreeks uit een 
repository op GitHub haalt en de bestanden desgewenst via een buildproces uitvoert en een website publiceert
* [Deploy de app op githubpages](https://pages.github.com/)

## Gebruikte bronnen / Handige links
* [Documentation D3.js](https://github.com/d3/d3/wiki)
* [Introduction to D3.js](https://www.xenonstack.com/blog/d3js/)
* [d3indepth](https://www.d3indepth.com/force-layout/)
* [Naustud.io](https://naustud.io/tech-stack/)
* [Responding to text](https://bl.ocks.org/curran/a683a360b9c78397a0db94ce15f473ce)
* [Introduction SVG](https://learn-the-web.algonquindesign.ca/courses/web-dev-3/svg-smiley-face/)
## Credits
*  Datavisual voorbeeld van [trongthanh](https://github.com/trongthanh/techstack)
*  Helpen met sparql query & d3 [Nick](https://github.com/CountNick)


