/**
 * Own code for load the data
 */
export function loadApiData(serchTerm) {
    // setup api url and query
    const url = 'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-27/sparql';
    const termMasterArray = [
        {category:"geluidsmiddelen",termmaster: "termmaster1248"},
        {category:"keukengereedschap",termmaster: "termmaster14783"},
        {category:"vervoersmiddelen",termmaster: "termmaster12626"},
        {category:"rookgerei",termmaster: "termmaster14607"}
        ]
    const termMaster = termMasterArray.filter(x => x.category === serchTerm).map(x => x.termmaster)
    console.log(termMaster)
    // termMaster = "termmaster12626"
    // if search contains in array
    if(termMaster.length > 0) {
        const query = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX edm: <http://www.europeana.eu/schemas/edm/>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        SELECT  ?orgin ?objectType (COUNT(?cho) AS ?amount)
        WHERE {
         # geef Objecttrefwoord
         <https://hdl.handle.net/20.500.11840/${termMaster[0]}> skos:narrower* ?type .
         ?type skos:prefLabel ?objectType .
         # Geef alle continenten
         <https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?orginSuper .
         ?orginSuper skos:prefLabel ?orgin .
         # geef per continent de onderliggende geografische termen
         ?orginSuper skos:narrower* ?orginSub .
         ?orginSub skos:prefLabel ?orginSubLabel .
         # geef objecten bij de onderliggende geografische termen
         ?cho dct:spatial ?orginSub .
         ?cho edm:object ?type .
        }
        `;


        // handle data
        const handleData = (json) => {
            let bindings = json.results.bindings;
            for (let i = 0; i < bindings.length; i++) {
                let objectItem = bindings[i];
                // objectItem.id = i;
                objectItem.orgin = objectItem.orgin.value
                objectItem.objectType = objectItem.objectType.value
                objectItem.amount = JSON.parse(objectItem.amount.value
                )
            }

            // make array only of the orgins
            let array = []
            let orginsInData = bindings.filter(orgin => {
                //check if orgin name excists in array
                if (!array.includes(orgin.orgin)) {
                    return array.push(orgin.orgin)
                }
            });

            // Saves orgin Array based on termmaster ["Eurazië","Azië", "Afrika", "Amerika", "Oceanië", "Oceanen","Antarctica"]
            let orginArray = orginsInData.map(objectobject => objectobject.orgin)
            let rankList = [];

            // Get the ranklist
            function getRankList(orginArray, bindings) {
                let gettop = 10;
                //loop over Orgins
                for (let orgin of orginArray) {
                    let filteredOrgins = bindings.filter(object => {
                        return object.orgin == orgin
                    })
                    let orginList = filteredOrgins
                    //hoogste waardes sorten van hoog naar laag
                        .sort((a, b) => b.amount - a.amount)
                        //pak alleen de top 10
                        .sort((a, b) => b - a).slice(0, gettop)
                    // add rank to array orginList
                    rankList.push(orginList)
                }
                // merge all arrays to one array
                // return rankList.flat()

                return rankList.flat()
            }

            // return  the ranklist
            return getRankList(orginArray, bindings)
        };

        return d3.json(url + '?query=' + encodeURIComponent(query) + '&format=json')
            .then(handleData)
            .finally(function () {
                d3.select("form")
                    .classed("FormInActive",true)
            })
            .catch(err => console.error(err));
    }else{
        //if searchterm not found return false
        return false
    }

}


