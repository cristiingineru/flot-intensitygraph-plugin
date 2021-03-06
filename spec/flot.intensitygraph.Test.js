/* global setFixtures */
/* brackets-xunit: includes=../lib/cbuffer.js,../jquery.flot.historybuffer.js*,../jquery.flot.js,../jquery.flot.charting.js */

describe('An Intensity graph', function () {
    'use strict';
    var $ = jQuery || NationalInstruments.Globals.jQuery;

    var plot;
    var placeholder;

    beforeEach(function () {
        var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);

        jasmine.addMatchers({
            toBeGreaterThanOrEqualTo: function () {
                return {
                    compare: function (actual, expected) {
                        return { pass: typeof actual === 'number' && typeof expected === 'number' && actual >= expected };
                    }
                };
            },
            toBeLessThanOrEqualTo: function () {
                return {
                    compare: function (actual, expected) {
                        return { pass: typeof actual === 'number' && typeof expected === 'number' && actual <= expected };
                    }
                };
            }
        });
    });

    it('should draw nothing when the graph is empty', function () {
        plot = $.plot(placeholder, [[[]]], {
            series: {
                intensitygraph: {
                    show: true
                }
            }
        });

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        spyOn(ctx, 'fillRect');

        plot.draw();

        expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('should perfectly fill the border area when the axis are one point long each and the graph has a single element', function () {
        plot = $.plot(placeholder, [[[0.5]]], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            xaxes: [{
                min: 0,
                max: 1,
                show: true
            }],
            yaxes: [{
                min: 0,
                max: 1,
                show: true
            }],
            grid: {
                borderWidth: 1
            }
        });

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        spyOn(ctx, 'fillRect').and.callThrough();

        plot.draw();

        expect(ctx.fillRect.calls.count()).toBe(1);
        var offset = plot.getPlotOffset(),
            x1 = ctx.fillRect.calls.first().args[0],
            y1 = ctx.fillRect.calls.first().args[1],
            x2 = ctx.fillRect.calls.first().args[2],
            y2 = ctx.fillRect.calls.first().args[3];
        expect(x1).toBe(offset.left);
        expect(y1).toBe(offset.top);
        expect(x2).toBe(plot.width());
        expect(y2).toBe(plot.height());
    });

    it('should draw the one element graph inside the border area', function () {
        plot = $.plot(placeholder, [[[0.5]]], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            xaxes: [{
                min: -1,
                max: 3,
                show: true
            }],
            yaxes: [{
                min: -1,
                max: 3,
                show: true
            }],
            grid: {
                borderWidth: 1
            }
        });

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        spyOn(ctx, 'fillRect').and.callThrough();

        plot.draw();

        expect(ctx.fillRect.calls.count()).toBe(1);
        var offset = plot.getPlotOffset(),
            x1 = ctx.fillRect.calls.first().args[0],
            y1 = ctx.fillRect.calls.first().args[1],
            x2 = ctx.fillRect.calls.first().args[2],
            y2 = ctx.fillRect.calls.first().args[3];
        expect(x1).toBeGreaterThanOrEqualTo(offset.left);
        expect(y1).toBeGreaterThanOrEqualTo(offset.top);
        expect(x2).toBeLessThanOrEqualTo(plot.width());
        expect(y2).toBeLessThanOrEqualTo(plot.height());
    });

    it('should draw nothing when the max of X axis is negative', function () {
        plot = $.plot(placeholder, [[[0.5]]], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            xaxes: [{
                min: -2,
                max: -1
            }]
        });

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        spyOn(ctx, 'fillRect');

        plot.draw();

        expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('should draw nothing when the min of Y axis is larger than the graph height', function () {
        plot = $.plot(placeholder, [[[0.5]]], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            yaxes: [{
                min: 1000,
                max: 2000
            }]
        });

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        spyOn(ctx, 'fillRect');

        plot.draw();

        expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    describe('legend', function () {

        var intensityGraph = new window.IntensityGraph();

        it('should add all the colors to the gradient according to the values of the markers', function () {
            var addColorStop = jasmine.createSpy(),
                ctx = {
                fillRect: jasmine.createSpy(),
                strokeRect: jasmine.createSpy(),
                createLinearGradient: function () {
                    return {
                        addColorStop: addColorStop
                    };
                }
            };

            var marker1 = { value: 0, color: 'red' },
                marker2 = { value: 40, color: 'yellow' },
                marker3 = { value: 100, color: 'green' };
            intensityGraph.drawLegend(ctx, 1, 1, 10, 50, [marker1, marker2, marker3], 'black', 'white');

            expect(addColorStop.calls.count()).toBe(3);
            expect(addColorStop.calls.argsFor(0)).toEqual([0.0, 'red']);
            expect(addColorStop.calls.argsFor(1)).toEqual([0.4, 'yellow']);
            expect(addColorStop.calls.argsFor(2)).toEqual([1.0, 'green']);
        });

        it('should use a gradient that perfectly fills the hole rectangle upside down', function () {
            var ctx = {
                fillRect: jasmine.createSpy(),
                strokeRect: jasmine.createSpy(),
                createLinearGradient: function () {
                    return {
                        addColorStop: jasmine.createSpy()
                    };
                }
            };
            spyOn(ctx, 'createLinearGradient').and.callThrough();

            var x = 1,
                y = 1,
                w = 10,
                h = 50;
            intensityGraph.drawLegend(ctx, x, y, w, h, [{ value: 0, color: 'red' }, { value: 100, color: 'green' }], 'black', 'white');

            expect(ctx.createLinearGradient.calls.first().args).toEqual([0, y + h, 0, y]);
        });

    });
});
