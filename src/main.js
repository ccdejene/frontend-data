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
let optionButton  =   d3.select('form').selectAll('.option')

// check form
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
    d3.select("#vis-container")
        .classed("showChart", false)
        .transition()
        .duration(800)
        .delay(1500)

}

function autoFill(){
    event.preventDefault()
    let optionValue = d3.select(this).attr("value")
    let form_field = d3.select(".form_field")
    form_field.attr("value",optionValue)
    form_field.node().value = optionValue
}

searchButton.on("click",showForm)
optionButton.on("click",autoFill)


