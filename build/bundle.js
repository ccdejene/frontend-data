(function () {
    'use strict';

    /**
     * Own code for load the data
     */
    function loadApiData(serchTerm) {
        // setup api url and query
        const url = 'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-27/sparql';
        const termMasterArray = [
            {category:"geluidsmiddelen",termmaster: "termmaster1248"},
            {category:"keukengereedschap",termmaster: "termmaster14783"},
            {category:"vervoersmiddelen",termmaster: "termmaster12626"},
            {category:"rookgerei",termmaster: "termmaster14607"}

            ];
        const termMaster = termMasterArray.filter(x => x.category === serchTerm).map(x => x.termmaster);
        console.log(termMaster);
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
                    objectItem.orgin = objectItem.orgin.value;
                    objectItem.objectType = objectItem.objectType.value;
                    objectItem.amount = JSON.parse(objectItem.amount.value
                    );
                }

                // make array only of the orgins
                let array = [];
                let orginsInData = bindings.filter(orgin => {
                    //check if orgin name excists in array
                    if (!array.includes(orgin.orgin)) {
                        return array.push(orgin.orgin)
                    }
                });

                // Saves orgin Array based on termmaster ["Eurazië","Azië", "Afrika", "Amerika", "Oceanië", "Oceanen","Antarctica"]
                let orginArray = orginsInData.map(objectobject => objectobject.orgin);
                let rankList = [];

                // Get the ranklist
                function getRankList(orginArray, bindings) {
                    let gettop = 10;
                    //loop over Orgins
                    for (let orgin of orginArray) {
                        let filteredOrgins = bindings.filter(object => {
                            return object.orgin == orgin
                        });
                        let orginList = filteredOrgins
                        //hoogste waardes sorten van hoog naar laag
                            .sort((a, b) => b.amount - a.amount)
                            //pak alleen de top 10
                            .sort((a, b) => b - a).slice(0, gettop);
                        // add rank to array orginList
                        rankList.push(orginList);
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
                        .classed("FormInActive",true);
                })
                .catch(err => console.error(err));
        }else{
            //if searchterm not found return false
            return false
        }

    }

    // function to render data
    function render(data) {


        // var expensesByName  = d3.nest()
        //     .key(function(d) { return d.orgin; })
        //     .entries(data);
        //
        // console.log(expensesByName);

        // make svg element
        let svg = d3.select('body').append('svg')
            .attr('width', '100%')
            .attr('height',  window.innerHeight)
            .attr('text-anchor', 'middle');


        // create a wrapper
        let wrapper = d3.select("svg")
            .append("g")
            .attr('class', 'wrapper');
        // set background color
        svg.style('background-color', '#eee');

        /**
         * Own code for declaring settings
         */
        let width = window.innerWidth; // get width in pixels
        let height = +svg.attr('height'); // set number of height in svg attribute
        let centerX = width * 0.5; // center position of X
        let centerY = height * 0.5; // center position of Y
        let minRadius = 0; // set minRadius of circle
        let paddingObject = 5; // padding between circles
        let magnifyStartPosition = 3000; //multiplier circle start postion
        let scaleColor = d3.scaleOrdinal(d3.schemeSet2); // set colorsheme for the circles


        // calculate radius of the circle with pack
        /**
         * Pack
         * returns a array of nodes associated with the specified root node.
         * The cluster layout is part of D3's family of hierarchical layouts.
         * These layouts follow the same basic structure: the input argument to the layout is the root node of the
         * hierarchy, and the output return value is an array representing the computed positions of all nodes.
         */
        let pack = d3.pack()
            .size([width, height]) // set the scale of the nodes (circles) based on window size
            .padding(paddingObject);

        // to collide the circles to each other
        /**
         * ForceCollide
         * forceCollide is used to stop elements overlapping and is particularly useful when 'clumping' circles together.
         * We must specify the radius of the elements using .radius() : var numNodes = 100 var nodes = d3. range(numNodes).
         */
            // stop elements overlapping and set padding between circles
        let forceCollide = d3.forceCollide(d => d.radius + paddingObject);

        // use the force and simulate
        /**
         *  Simulation
         *  Creates a new simulation with the specified array of nodes and no forces.
         *  If nodes is not specified, it defaults to the empty array.
         *  The simulator starts automatically; use simulation.on to listen for tick events as the simulation runs.
         */

        let simulation = d3.forceSimulation()
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(width / 2, height / 2))
            // .force('collision', forceCollide)
            .force('collide', d3.forceCollide().radius(function(d) {
                return d.radius

            }))
            // .force('x', d3.forceX(centerX))
            .force('y', d3.forceY(centerY))
            .force('x', d3.forceX(centerX));


        /**
         * Hierarchy
         * is a nested data structure representing a tree: each node has one parent node (node.parent), except for the root; likewise,
         * each node has one or more child nodes (node.children), except for the leaves. ...
         * A d3.hierarchy is purely an abstract data structure. That is: it's for working with hierarchical data
         * A d3.hierarchy object is a data structure that represents a hierarchy.
         * It has a number of functions defined on it for retrieving things like ancestor, descendant and leaf nodes and for computing the path between nodes.
         * It can be created from a nested JavaScript object.
         */
            // creating nested data structure of the data objects
        let root = d3.hierarchy({children: data})
                .sum(d => d.amount);


        // Use pack() to automatically calculate radius conveniently only
        // and get only the leaves
        //
        let circles = pack(root).leaves()
            .map(circle => {
                const data = circle.data;
                return {
                    x: centerX + (circle.x - centerX) * magnifyStartPosition, // magnify start position to have transition to center movement
                    y: centerY + (circle.y - centerY) * magnifyStartPosition,
                    r: minRadius, // for tweening
                    radius: circle.r, //original radius
                    cat: data.orgin,
                    objectType: data.objectType,
                    amount: data.amount,
                }
            });


            // select all circles
            let circle = wrapper.selectAll('.node')
                .data(circles)
                .enter()
                .append('g')
                .attr('class', d => d.cat + " node");

            // add the simulation to the circles
            simulation.nodes(circles).on('tick', ticked);


            circle.append('circle')
                .attr('r', minRadius)
                .style('fill', d => scaleColor(d.cat))
                .style('stroke', "rgba(0, 0, 0, 0.02)")
                .transition().duration(2000).ease(d3.easeElasticOut)
                .tween('circleIn', (d) => {
                    let i = d3.interpolateNumber(0, d.radius);
                    return (t) => {
                        d.r = i(t);
                        simulation.force('collision', forceCollide);
                    }
                });

            /**
             * Own code to automatic resize the text within the circle
             */

            // display orgin in circle
            circle
                .append('text')
                .classed('node-orgin', true)
                .attr("font-size", function (d) {
                    return Math.min(2 * d.radius, (2 * d.radius / 15)) + "px";
                })
                .text(d => d.objectType);

            //display amount in the circle
            circle
                .append('text')
                .classed('node-amount', true)
                .attr('y', function (d) {
                    return Math.min(2 * d.radius, (2 * d.radius / 10));
                })
                .attr("font-size", function (d) {
                    return Math.min(2 * d.radius, (2 * d.radius / 12));
                })
                .text(d => d.amount);

            // Set the radius of the circle and changes the position
            function ticked() {
                circle
                    .attr('transform', d => `translate(${d.x},${d.y})`)
                    .select('circle')
                    .attr('r', d => d.r)
                    .exit()
                    .remove();
            }

        /**
         * Shows legend in visual based on category and set color scale for each category
         */
        let legendOrdinal = d3.legendColor()
            .scale(scaleColor)
            .shape('circle');

        let legend = svg.append('g')
            .classed('legend-color', true)
            .attr('text-anchor', 'start')
            .attr('transform', 'translate(20,30)')
            .style('font-size', '12px')
            .call(legendOrdinal);

        // sets sizeScale
        let sizeScale = d3.scaleOrdinal()
            .domain(['Minder', 'Meer'])
            .range([5, 10]);

        // sets legendSize between circles
        let legendSize = d3.legendSize()
            .scale(sizeScale)
            .shape('circle')
            .shapePadding(10)
            .labelAlign('end');

        // sets legendSize between circles
        let legendSizeScale = svg.append('g')
            .classed('legend-size', true)
            .attr('text-anchor', 'start')
            .attr('transform', 'translate(150, 25)')
            .style('font-size', '12px')
            .call(legendSize);



        let nodes = d3.selectAll('.node');


        /**
         * filter by origin
         */
            //update by category
        function filterByCategoryMultiple(circles,orginsArray){
            //circles.filter(function(d) { return d.cat == category; })
            //resetFilter()


            wrapper.selectAll(".node")
                .filter(function(d) {
                    return ! orginsArray.includes(d.cat);
                })
            .transition().duration(500).style("opacity",0.1);


            wrapper.selectAll(".node")
                .filter(function(d) {
                    return orginsArray.includes(d.cat);
                })
                .transition().duration(500).style("opacity",1);





            // wrapper.selectAll(".node")
            //     .filter(function(d) {
            //         return! orginsArray.includes(d.cat);
            //     }).exit().remove()




            // let filtered = wrapper.selectAll(".node")
            //     .filter(function(d) {
            //         return! orginsArray.includes(d.cat);
            //     })
                // .transition().duration(500).style("opacity",0.1)


            // filtered.exit().remove();
            //filtered.transition().duration(500).style("opacity",0.1)
            //console.log("dsd",filtered)
           // renderCircles(filtered)



            if(orginsArray.length == 0){
                wrapper.selectAll(".node")
                    .transition()
                    .duration(500)
                    .style("opacity",1);

            }


        }

        function filterByCategory(circles,orgin) {
            let labelsChecked = svg.select(".legendCells").selectAll('.label').filter(".active").nodes().length;
            if (labelsChecked == 0 ) {
                wrapper.selectAll(".node")
                    .filter(function (d) {
                        return d.cat !== orgin;
                    })
                    .transition().duration(500).style("opacity", 0.1);

                wrapper.selectAll(".node")
                    .filter(function (d) {
                        return d.cat == orgin;
                    })
                    .transition().duration(500).style("opacity", 1);
            }

        }




        function resetFilter(){
            let labelsChecked = svg.select(".legendCells").selectAll('.label').filter(".active").nodes().length;
            if(labelsChecked == 0) {
                wrapper.selectAll(".node").transition().duration(500).style("opacity", 1);
            }
        }


        /**
         * filter based on legend
         */

        let label = svg.select(".legendCells").selectAll('.label');
        label.on("click",clickedlabel);
        function clickedlabel(){
            // check if the selected element contains active else remove active
            if(d3.select(this).classed('active')){
                d3.select(this).classed('active',false);
            }else{
                d3.select(this).classed('active',true);
            }
            // push selected orgin in array
            let labelSelected = label.filter(".active").nodes();
            let orginsArray = new Array;
            for(let orgin of labelSelected){
                orginsArray.push(orgin.textContent);
            }

            //var keysList = array.push(labelSelected)
            filterByCategoryMultiple(circles,orginsArray);
        }





        /**
         * tooltip
         */
        let tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        nodes.on("mouseover", showTooltip);
        nodes.on("mouseout", hideTooltip);
        nodes.on("mousemove",followMouseTooltip);
        function showTooltip(d){
            d3.select(this).selectAll('circle').style('stroke', "rgba(0, 0, 0, 0.4)");
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`
                      <span class="objectOrgin">
                        <span class="categoryOrgin" style="background-color:${scaleColor(d.cat)};"></span>
                        <span class="categoryTitle"> ${d.cat}</span>
                      </span>
                      <span class="objectType">${d.objectType}</span>
                      <span class="objectAmount">${d.amount}</span>`);

            filterByCategory(circles,d.cat);

        }

        function followMouseTooltip(){
            tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
        }

        function hideTooltip(){
            d3.select(this).selectAll('circle').style('stroke', "rgba(0, 0, 0, 0)");
            tooltip.transition().duration(500).style("opacity", 0);
            resetFilter();
        }




        /**
         * Zoom function
         */
        nodes.on("click", clicked);
        svg.on("click",reset);
        function clicked(d) {
            d3.event.stopPropagation();
            wrapper.transition().duration(750).call(
                zoom.transform,
                // zoom on circle based and scale based on radius
                d3.zoomIdentity.translate(width / 2, height / 2).scale(10 / d.radius * 15).translate(-d.x, -d.y),
                d3.mouse(svg.node())
            );


            // set barchart data
            let orgin = d.cat;
            let filterData =  circles.filter(function(d) {
                return d.cat == orgin;
            });

            selectionChanged(filterData);

        }

        function zoomed() {
            wrapper.attr("transform", d3.event.transform);
        }

        let zoom = d3.zoom()
            .scaleExtent([1, 40])
            .on("zoom", zoomed);

        // reset the zoom when clicked on background of svg
        function reset() {
            wrapper.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity,
                d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
            );
            d3.select("#vis-container")
                .classed("showChart", false)
                .transition()
                .duration(800)
                .delay(1500);
        }


        /**
         * bar chart
         *
         */



        const svg_bars = d3.select("#vis-container").append('svg');
        const margin = {top: 40, right: 30, bottom: 90, left: 50};
        const bar_height = 320 - margin.top - margin.bottom;
        const bar_width = 460 - margin.left - margin.right;
        /* Conventional margins: https://bl.ocks.org/mbostock/3019563. */
        const group = svg_bars
            .attr("height","320")
            .attr("width","460")
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Scales
        const x = d3.scaleBand().padding(0.2);
        const y = d3.scaleLinear().nice();
    // Global data variable
    //The initial variable the y axis is set on

        makeVisualization(data);
    // Our main function which runs other functions to make a visualization
     function makeVisualization(data){
            //Use the prepareData module to get and process our data
            setupScales(data);
            setupAxes();
            drawBars(data);
        }

    //Draw the initial bars
        function drawBars(data) {
            const bars = group
                .selectAll('.bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d.objectType))
                .attr('y', d => y(d.amount))
                .attr('width', x.bandwidth())
                .attr('height', d => bar_height - y(d.amount));
        }



    //This function will change the graph when the user selects another variable
        function selectionChanged(data){
            //'this' refers to the form element!
            console.log("Changing graph to reflect this variable", data);

            y.domain([0, d3.max(data.map(d => d.amount))] );
            x.domain(data.map(d => d.objectType));

            svg_bars.selectAll(".bar")
                .data(data)
                .exit().remove();


            svg_bars.select('.axis-y')
                .call(d3.axisLeft(y).ticks(10));

            svg_bars.select('.axis-x')
                .call(d3.axisBottom(x));

            svg_bars.selectAll('.bar')
                .attr("height", function(d) { return bar_height - y(0); }) // always equal to 0
                .attr("y", function(d) { return y(0); })
                .transition()
                .duration(800)
                .delay(1000)
                .attr('x', d => x(d.objectType))
                .attr('y', d => y(d.amount))
                .attr('width', x.bandwidth())
                .attr('height', d => bar_height - y(d.amount))
                .attr('fill', d => scaleColor(d.cat));


            d3.select("#vis-container")
                .classed("showChart", true)
                .transition()
                .duration(800)
                .delay(1500);

            let text = d3.select(".axis-x");
            text.selectAll(".tick").select("text")
                .attr("transform", "rotate(-30)")
                .classed("ytext",true)
                .attr("y", 18)
                .attr("dy", "-.80em")
                .attr("x", "-0.5em")
                .style("text-anchor", "end");


            setupScales(data);

        }

    //Set up the scales we'll use
        function setupScales(data){
            //We'll set the x domain to the different preferences
            x.domain(data.map(d => d.objectType));
            //The y-domain is set to the min and max of the current y variable
            y.domain([0, d3.max(data.map(d => d.amount))] );
            x.rangeRound([0, bar_width]);
            y.rangeRound([bar_height, 0]);
        }

    //Attach x and y axes to our svg
        function setupAxes(){
            group
                .append('g')
                .attr('class', 'axis axis-x')
                .call(d3.axisBottom(x)).attr('transform', 'translate(0,' + bar_height + ')');

            group
                .append('g')
                .attr('class', 'axis axis-y')
                .call(d3.axisLeft(y).ticks(10));

            let text = d3.select(".axis-x");
            text.selectAll(".tick").select("text")
                .attr("transform", "rotate(-30)")
                .classed("ytext",true)
                .attr("y", 18)
                .attr("dy", "-.80em")
                .attr("x", "-0.5em")
                .style("text-anchor", "end");


        }

    //This awesome function makes dynamic input options based on our data!
    //You can also create the options by hand if you can't follow what happens here








    }

    // Based loosely from this D3 bubble graph https://bl.ocks.org/mbostock/4063269



    /**
     * Own code to run the application
     */
    let field  = d3.select('form');
    let input  = d3.select('#serchTerm');
    let searchTermBox  = d3.select(".searchbox");
    let searchTermText  = d3.select(".searchTerm");
    let searchButton  =   d3.select('.search');
    let optionButton  =   d3.select('form').selectAll('.option');

    checkForm();

    function checkForm(){

        // check input button on submit
        let button = d3.select('.btn_primary');
        button.on("click",function () {
            let serchTerm = d3.select('#serchTerm').property('value');
            if(serchTerm !== ""){
                event.preventDefault();
                submitForm(serchTerm);
            }
        });

        // check keybutton enter
        const searchInput = d3.select('#serchTerm');
        searchInput.on('keydown', () => {
            let serchTerm = d3.select('#serchTerm').property('value');
            if(d3.event.keyCode == 13){
                if(serchTerm !== ""){
                    event.preventDefault();
                    submitForm(serchTerm);
                }
            }
        });

    }

    // submit form
    function submitForm(serchTerm){
        //console.log(serchTerm)
        if(loadApiData(serchTerm)) {
            loadApiData(serchTerm).then(data => render(data));
            searchTermText.text(serchTerm);
            input.classed("FormError", false);
            searchTermBox.classed("visible", true);
            field.classed("FormInActive", true);
            searchButton.classed("visible", true);
        }else{
            input.classed("FormError",true);
        }
    }


    function showForm(){
        d3.selectAll('svg').remove();
        field.classed("FormInActive", false);
        searchTermBox.classed("visible", false);
        searchButton.classed("visible", false);
        d3.select("#vis-container")
            .classed("showChart", false)
            .transition()
            .duration(800)
            .delay(1500);

    }

    function autoFill(e){
        event.preventDefault();
        let optionValue = d3.select(this).attr("value");
        let form_field = d3.select(".form_field");
        form_field.attr("value",optionValue);

    }

    searchButton.on("click",showForm);
    optionButton.on("click",autoFill);

}());
