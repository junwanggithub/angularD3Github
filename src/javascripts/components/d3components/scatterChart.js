import 'd3'

var scatterChart = {};

function draw() {
    // Get the Selection of the svg element
    var svg =  d3.select('svg');

    // Set a key function to identify the elements
    function key(d, i) {
        return d.x + '#' + d.y;
    }

    // Bind data array to the Selection
    var circles = svg.selectAll('circle').data(data, key);

    // Add circles for new data
    circles.enter()
        .append('circle')
        .attr('r', function(d) { return d.r; })
        .attr('cx', function(d) { return d.x*70 + 10; })
        .attr('cy', function(d) { return d.y*40 + 10; });

    // Change the fill color of all elements
    circles.attr('fill', function(d, i) {
        return 'rgb(' + parseInt(d.r*25) + ',0,0)';
    });

    // Delete circles when removed from data
    circles.exit()
        .remove();
}

function randPoint() {
    var rand = Math.random;
    return { x:rand()*10, y: rand()*10, r: rand()*10 };
}

scatterChart.init = function(){
    "use strict";
    // Create a data array
    var data = [];
// Add 300 random elements
    for (var i=0; i < 300; i++) {
        data.push(randPoint());
    }

// Do every 150ms
    setInterval(function(){

        // Remove first element from data array
        data.shift();

        // Add new random element to data array
        data.push(randPoint());

        // Redraw the scene
        draw();
    }, 150);
}

export default scatterChart



