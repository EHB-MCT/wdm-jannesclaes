# Written Report: Movement Dashboard - The Illusion of Efficiency

## 1. Project Architectuur & Keuzes
Voor dit project is gekozen voor een microservices-opzet die volledig lokaal draait in een Docker-omgeving. Dit simuleert hoe echte surveillance-systemen schaalbaar worden opgezet.

* **Backend:** Een Node.js Express server die fungeert als de centrale verwerker. Hier vindt de scoring-logica plaats (`tripController.js`) en wordt de data weggeschreven naar MongoDB.
* **Frontend:** Een Vanilla Javascript applicatie via Nginx. De keuze voor Vanilla Javascript was bewust om zo 'lightweight' mogelijk telemetry-scripts te kunnen injecteren zonder de overhead van zware frameworks. Ook omdat ik geen ervaring had met andere frameworks.
* **Database:** MongoDB is gekozen vanwege de flexibiliteit. Omdat we telemetry-data (muisbewegingen, kliks) in bulk opslaan, is een NoSQL-structuur ideaal voor dit ongestructureerde datavolume.

Alle componenten worden georkestreerd via `docker-compose`, waardoor de applicatie met één commando (`docker compose up --build`) reproduceerbaar is.

## 2. Data Analysis: The Flaws in the Model
Het kernidee van een "Weapon of Math Destruction" is dat een algoritme een oordeel velt op basis van gebrekkige data, maar dat dit oordeel wel als absolute waarheid wordt gepresenteerd. Mijn dashboard doet precies dit.

### De "Vogelvlucht" Illusie
In `BackEnd/controllers/tripController.js` gebruik ik de Haversine-formule om afstanden te berekenen. Dit meet de afstand in een rechte lijn tussen punt A en B.

* **De Valkuil:** In de realiteit bewegen mensen zich niet in rechte lijnen. Iemand die met de auto een omweg moet maken door wegwerkzaamheden, legt meer kilometers af en stoot meer uit. Mijn model 'ziet' dit niet en berekent een score op basis van een geïdealiseerde afstand.
* **De Impact:** Hoewel dit technisch een "tijdelijke oplossing" is voor de MVP, is het exemplarisch voor hoe algoritmes werken: ze versimpelen de complexe werkelijkheid. De gebruiker wordt beoordeeld op een theoretische rit, niet op de werkelijke rit.

### Self-Reporting Bias
De gebruiker vult zelf het vervoersmiddel in. Er is geen verificatie. Dit betekent dat we profielen opbouwen die volledig gebaseerd kunnen zijn op leugens. Toch presenteert het admin-dashboard deze data in harde grafieken en trends, waardoor het voor een beheerder betrouwbaar lijkt.

## 3. The Surveillance Layer: Measuring Doubt
Een ander aspect van de applicatie is onzichtbaar voor de gebruiker. In `FrontEnd/tracker.js` draait een script dat niet alleen registreert wat je doet, maar ook hoe je het doet.

We meten `mousemove` (gethrottled) en `hover` events.

* **Het doel:** We proberen hier "klimaat-twijfel" te kwantificeren. Als een gebruiker lang met de muis boven de knop 'Fiets' hangt, maar uiteindelijk op 'Auto' klikt, registreren we die twijfel.
* **De Interpretatie:** Dit geeft ons inzicht in de psychologie van de gebruiker: is men zich bewust van de keuze? Voelt men weerstand?
* **Privacy:** Deze data wordt verzameld en opgeslagen in de `Telemetry` collectie zonder expliciete context voor de gebruiker. Het is een klassiek voorbeeld van data-surveillance onder het mom van "User Experience tracking".

## 4. The Weapon: Confrontation & Influence
Hoe beïnvloedt dit systeem de gebruiker en de maatschappij?

### Labeling & Shaming
Het systeem is binair en onverbiddelijk. Na het invoeren van een rit krijgt de gebruiker direct een oordeel: **Eco Warrior** (Groen) of **Climate Criminal** (Rood). Deze directe confrontatie, zichtbaar in de pop-up na submission, is bedoeld om schuldgevoel aan te wakkeren. We gebruiken kleurenpsychologie (rood = gevaar/slecht) om gedrag te sturen. Er is geen nuance: wie net onder de scoregrens zit door een noodzakelijke autorit, krijgt toch het stempel "Criminal".

### Potentiële Toepassing: Overheidscontrole
Hoewel dit nu een lokaal project is, ligt het gevaar in de toepassing. Stel je voor dat een overheid dit systeem gebruikt.

* Een overheid zou deze "Climate Scores" kunnen koppelen aan belastingvoordelen of toegang tot milieuzones.
* Omdat het model onnauwkeurig is, zouden burgers onterecht gestraft kunnen worden op basis van een algoritme dat geen rekening houdt met context (zoals slecht ter been zijn of ontbrekend OV).
* De admin (overheid) heeft via het dashboard (`charts.js`) een overzicht en kan beslissingen nemen over groepen mensen op basis van deze gebrekkige, maar mooi gevisualiseerde data.

## 5. Conclusie & Leerpunten
Het bouwen van deze applicatie heeft laten zien hoe eenvoudig het is om met basis-technologieën een invasief profiel van iemand te schetsen. De grootste les is dat data visualisatie autoriteit uitstraalt. Zodra we de gebrekkige, onnauwkeurige input omzetten in strakke grafieken op het admin-dashboard, verdwijnt de nuance en wordt de data "de waarheid". Dat is het moment waarop een tool een Wapen wordt. Daarnaast heb ik uiteindelijk ook wel echt het nut van docker geleerd, het is een enorm handige tool die ik zeker in de toekomst ga blijven gebruiken. Op een meer technisch vlak moet ik wel zeggen dat ik toch wat vaker dan ik hoopte vast liep. In de toekomst hoop ik mijn programmeer vaardigheden toch weer een beetje op te krikken en misschien ook een front end framework leer gebruiken.