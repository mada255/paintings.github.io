App for paintings

Introducere

Aceasta este o aplicatie de "licitare" pentru anumite imagini / tablouri.

Descriere problemă 

Aplicatia pune la dispozitie o lista de imagini, care sunt procurate folosind un api de la Harvdard Museum, pe care utilizatorul poate sa le "cumpere", acesta primind mai departe un e-mail cu datele respective.

Descriere API

Am folosit 2 api-uri, unul de la muzeul hardvard (https://www.harvardartmuseums.org/), ce returneaza o lista de obiecte in format JSON, alcatuite din: url-ul imaginii, data, copyright.

Un alt api folosit este cel de la mailboxlayer, pentru verificarea adresei de e-mail introdusa de utilizator. Acest api primeste un request, si trimite inapoi un raspuns ce contine date despre corectitudinea formatului adresei de e-mail, a smtp-ului, si uneori poate oferi sugestii "did you mean ... ?".

Flux de date 

Prima data, utilizatorul poate intra in aplicatie, si va ajunge pe pagina principala, unde se afla 2 butoane, "Get the art" si "Display paintings". Primul buton face un request catre api-ul de la Hardvard, iar al doilea afiseaza lista sau ii face refresh. De fiecare data cand primul buton este apasat, se face un nou request catre api-ul de la Hardvard, si se intoarce un nou set de imagini, iar cand se apasa pe display, lista se reincarca cu aceste noi imagini.

Dupa ce userul a parcurs lista de imagini, poate apasa pe butonul "Get painting" din dreptul imaginii, si va fi redirectionat catre o alta pagina ce contine un formular, unde acesta va trebui sa introduca numele sau, e-mailul, adresa si numarul de telefon. Prin apasarea butonului "Get painting", si dupa verificarea e-mailului printr-un request catre api-ul de la mailboxlayer pentru a verifica daca adresa introdusa este corecta, acesta va primi un e-mail la adresa introdusa, de tipul:

Hello, Madalina Mirza

Thank you for using PaintingsApp.

You have requested the painting Abstract painting

Url: https://nrs.harvard.edu/urn-3:HUAM:70296_dynmc

The painting will be sent to the address Strada Florilor shortly.


PaintingsApp.

Image: 


Iar sub "Image:" va aparea imaginea ceruta. 

Ca si idee, tabloul cu imaginea respectiva ar fi mai departe trimis de catre un curier la adresa introdusa de catre utilizator, iar in cazul in care utilizatorul nu a fost gasit la adresa, ar primi un telefon la numarul de telefon solicitat.



Exemple de request / response



Primul api primeste un request printr-o metoda asincrona si folosind metoda "fetch()" astfel: 

console.log(pageNum);
const response = await fetch('https://api.harvardartmuseums.org/image?apikey=' + apiKey + '&page=' + pageNum);
const data = await response.json();
                
const { info, records } = data
                
console.log(records);

Acest request este introdus direct in codul paginii index.html printr-un script.

Ca response, va primi lista de obiecte de la Hardvard in format JSON, ce va fi mai departe parcursa si introdusa in baza de date, printr-un request catre server, folosind axios.

const urls = new Array();
                
let i = 0;

records.forEach(element => {
    const url = new Object();
    url.date = element.date;
    url.baseimageurl = element.baseimageurl;
    url.copyright = element.copyright;
    urls[i] = url;
    i++;
});


const options = {
    method: 'POST',
    headers: {
        'Content-Type' : 'application/json'
    },
    body: JSON.stringify(urls)
}

const apiresponse = await fetch('/artapi', options);
const json = await apiresponse.json();
console.log(json);


records.forEach(element => {

  axios.post('/paintings', {
      name: "Abstract painting",
      artist: element.copyright,
      date: element.date,
      museum: "Hardvard Museum",
      city: "Cambridge",
      country: "USA",
      imageurl: element.baseimageurl
  }).then(function(result) {
      //showPaintings();
      //$(event.target).trigger("reset");
  }).catch(function(err) {
      alert('Resource could not be saved');
  });
});


Iar in server, request-ul arata asa:

app.post('/paintings', (req, res) => {
    Painting.create(req.body).then((result) => {
        res.status(201).json(result);
    }).catch((err) => {
        console.log(err);
        res.status(500).send("resource not created");
    });
});



Un alt tip de request este facut la apasarea butonului "Get painting":

axios.get('/paintings/'+id).then(function(result) {
                    
  localStorage.setItem('id', result.data.id);
  localStorage.setItem('name', result.data.name);
  localStorage.setItem('imageurl', result.data.imageurl);

  window.document.location = './GetPainting.html';

}).catch(function(err) {
    console.log(err)
    alert('Could not find resource')
})

Acesta este un request facut prin axios catre server, ce primeste detalii despre o imagine din baza de date.

app.get('/paintings/:id', (req, res) => {
    Painting.findByPk(req.params.id).then((result) => {
        if(result) {
            res.status(200).json(result);
        } else {
            res.status(404).send('resource not found');
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).send('database error');
    });
});


Se primeste un response de tip json, cu detaliile despre imaginea respectiva: nume, url, copyright, etc.


Autentificare și autorizare servicii utilizate (dacă este cazul)

Serviciile api folosesc cate un apiKey, care sunt momentan puse in clar in cod.


Capturi ecran aplicație 

Prima pagina:

![Prima pagina](/Capture1.JPG)



![Pagina cu formularul](/Capture2.JPG)






Referinte
