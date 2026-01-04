# Bronnen & Naamsvermelding

Dit document geeft een overzicht van de bronnen, tools en educatieve materialen die zijn gebruikt om het **Movement Dashboard** te bouwen.

## 1. AI-assistentie & Generatieve Tools
Conform de richtlijnen van de opdracht wordt het gebruik van AI-tools hieronder gedocumenteerd. Deze tools zijn gebruikt om de ontwikkeling te versnellen, complexe logica te debuggen en boilerplate-code te genereren.

### OpenCode Assistant
* **Gebruik**: Primaire ontwikkelingspartner. 
* **Belangrijkste bijdragen**: Gebruikt voor het genereren van de kernstructuur van de backend en de verbinding met de frontend, het opzetten van de projectstructuur en de API-routing.
* **Gespreksverslagen**:
    * [PLAK HIER LINK NAAR JE OPENCODE GESPREK 1]
    * (https://opncd.ai/share/maD5dHDv)

### Google Gemini
* **Gebruik**: Conceptualisering, debugging en het genereren van specifieke algoritmen.
* **Belangrijkste bijdragen**:
    * Verfijnen van het "Weapon of Math Destruction" concept.
    * Debuggen van problemen met de Docker-containerisatie.
    * Genereren van de Telemetry/Tracker-logica.
* **Gespreksverslagen**:
    * (https://gemini.google.com/share/c865b4bf91db)
    * (https://gemini.google.com/share/4861f15b0602)

## 2. Algoritmen & Technieken
Specifieke algoritmen en codeerpatronen die zijn gebruikt in de applicatielogica.

### Geospatiale Berekeningen (De Haversine-formule)
* **Bestand**: `BackEnd/controllers/tripController.js`
* **Bron**: [Movable Type Scripts - Calculate distance, bearing and more between Latitude/Longitude points](http://www.movable-type.co.uk/scripts/latlong.html)
* **Gebruik**: De formule wordt gebruikt om de afstand "in vogelvlucht" tussen twee coördinaten te berekenen. Dit dient als basis voor de efficiëntiescore, waarbij bewust echte wegennetwerken worden genegeerd om algoritmische bias (vooringenomenheid) te simuleren.

### Telemetry Tracking (Event Throttling)
* **Bestand**: `FrontEnd/tracker.js`
* **Techniek**: **Throttling & Batching**.
* **Uitleg Bron**: [GeeksForGeeks: JavaScript Throttling](https://www.geeksforgeeks.org/javascript-throttling/) en [MDN Web Docs: Performance](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Events)
* **Gebruik**: Om browservertraging te voorkomen tijdens het tracken van muisbewegingen, is een throttling-mechanisme geïmplementeerd (`moveThrottleDelay`). In plaats van elke pixelverandering naar de server te sturen, wordt data verzameld in een buffer en in batches verzonden (bijv. elke 5 seconden) om de netwerkbelasting te verminderen.

## 3. Technology Stack & Documentatie

### Infrastructuur & DevOps
* **Docker & Docker Compose**:
    * **Bron**: Erasmushogeschool Brussel - MCT Cursusmateriaal (Backend Web Development).
    * **Gebruik**: Containerisatie van de Node.js API, Nginx frontend en MongoDB database.

### Backend Frameworks
* **Node.js & Express**: [Express Documentatie](https://expressjs.com/)
* **Mongoose (MongoDB ODM)**: [Mongoose Documentatie](https://mongoosejs.com/)
* **JSON Web Tokens (JWT)**: [JWT.io Introductie](https://jwt.io/introduction) - Gebruikt voor stateless authenticatie via middleware.

### Frontend
* **Vanilla JavaScript**: [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* **Design**: Eigen CSS zonder externe frameworks (zoals Bootstrap of Tailwind) om de applicatie lichtgewicht te houden.

## 4. Academische Integriteit
Dit project is een individuele inzending voor de opdracht "Weapon of Math Destruction". Hoewel AI-tools codefragmenten en logica hebben aangeleverd, zijn de architecturale keuzes, het debuggen en de uiteindelijke implementatie uitgevoerd door de student.