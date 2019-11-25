// Based loosely from this D3 bubble graph https://bl.ocks.org/mbostock/4063269
// And this Forced directed diagram https://bl.ocks.org/mbostock/4062045
// Code edit by Eyob Westerink

import {loadApiData} from "./js/modules/fetch";
import {render} from "./js/modules/render";



/**
 * Own code to run the application
 */
let field  = d3.select('form')
let input  = d3.select('#serchTerm')
let searchTermBox  = d3.select(".searchbox")
let searchTermText  = d3.select(".searchTerm")
let searchButton  =   d3.select('.search')

checkForm()

function checkForm(){

    // check input button on submit
    let button = d3.select('.btn_primary');
    button.on("click",function () {
        let serchTerm = d3.select('#serchTerm').property('value')
        if(serchTerm !== ""){
            event.preventDefault()
            submitForm(serchTerm)
        }
    });

    // check keybutton enter
    const searchInput = d3.select('#serchTerm');
    searchInput.on('keydown', () => {
        let serchTerm = d3.select('#serchTerm').property('value')
        if(d3.event.keyCode == 13){
            if(serchTerm !== ""){
                event.preventDefault()
                submitForm(serchTerm)
            }
        }
    });

}

// submit form
function submitForm(serchTerm){
    //console.log(serchTerm)
    if(loadApiData(serchTerm)) {
        loadApiData(serchTerm).then(data => render(data));
        searchTermText.text(serchTerm)
        input.classed("FormError", false)
        searchTermBox.classed("visible", true)
        field.classed("FormInActive", true)
        searchButton.classed("visible", true)
    }else{
        input.classed("FormError",true)
    }
}


function showForm(){
    d3.selectAll('svg').remove()
    field.classed("FormInActive", false)
    searchTermBox.classed("visible", false)
    searchButton.classed("visible", false)

}

searchButton.on("click",showForm)


