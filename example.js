/*global jQuery, $*/
/*jshint browser: true*/

$(function () {
    'use strict';
    var plot;
    var offset = 0.0;
    var h  = 50;
    var w = 100;
    var iMap = [];

    function updateData() {
        iMap = [];
        for (var i = 0; i < w; i ++) {
            for (var j = 0; j < h; j ++) {
                iMap.push([i, j, i+j]);
            }
        }
    }

    function updateGraph() {
        setTimeout(updateGraph, 16);

        if ($('#checkbox').prop('checked')) {
            updateData();

            plot.setData([
                {
                    data: iMap
                }
            ]);

            plot.setupGrid();
            plot.draw();
        }
    }

    updateData();
    plot = $.plot("#placeholder", [
        {
            data: iMap
        }    ], {
        series: {
            intensitymap: {
                active: true,
                show: true,
                max: 160,
                radius : 4,
                gradient : { 0: 'red', 0.12: 'orange', 0.25: 'yellow', 0.37: 'lightgreen', 0.5: 'cyan', 0.62: 'lightblue', 0.75: 'indigo', 0.9: 'violet', 1: 'white'}

            }
        },
        xaxis: { min: -10, max: 110 },
        yaxis: { min: -10, max: 60 },
    });

    updateGraph();
});