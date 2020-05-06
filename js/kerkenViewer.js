/**
 *  kerkenviewer.js
 *  Author:  Peter Vos, Universiteitsbibliotheek Vrije Universiteit Amsterdam
 *  Date:    17 january 2018
 *  Version: 0.1 Scaffolding
 *  Version: 01 march 2018, 0.8 Clustering, Legend, Filter, Typeahead search
 *  Version: 02 march 2018, 0.85 Dynamic filter
 *  Version: 22 march 2018, 0.9 Pie chart clusters, paged list, colorbrewer colors
 *  Version: 14 june 2018, 0.95 Periode legend, better filter typeahead
 *
 */
//['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)','rgb(255,255,153)','rgb(177,89,40)']
function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        //return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
        return [(c>>16)&255, (c>>8)&255, c&255, 1];
    }
    throw new Error('Bad Hex');
}
var classification = {};

classification['denominatie'] = {
    "Christelijke Gereformeerde Kerk": [166, 206, 227, 1],
    "Christian Science Church": [253, 191, 111, 1],
    "Doopsgezinde Sociëteit": [178, 223, 138, 1],
    "Evangelisch Lutherse Kerk": [51, 160, 44, 1],
    "Gereformeerde Gemeente (in Nederland)": [251, 154, 153, 1],
    "Gereformeerde Kerk (vrijgemaakt)": [227, 26, 28, 1],
    "Gereformeerde Kerken": [31, 120, 180, 1],
    "Nederlandse Hervormde Kerk": [106, 61, 154, 1],
    "Nederlandse Protestantenbond": [202, 178, 214, 1],
    "Oud-Katholieke Kerk": [255, 255, 153, 1],
    "Protestantse Kerk Nederland": [64, 0, 64, 1],
    "Remonstrantse Broederschap": [177, 89, 40, 1],
    "Rooms-katholieke Kerk": [255, 127, 0, 1],
    "Overig": [128, 128, 0, 1],
    "Grey": [211, 211, 211, 1],
}


//['rgb(228,26,28)','rgb(55,126,184)','rgb(77,175,74)','rgb(152,78,163)','rgb(255,127,0)','rgb(255,255,51)','rgb(166,86,40)','rgb(247,129,191)','rgb(153,153,153)']
classification['type'] = {
    "basiliek": [228, 26, 28, 1],
    "basiliek/centraalbouw": [55, 126, 184, 1],
    "centraalbouw": [77, 175, 74, 1],
    "hallenkerk": [166, 86, 40, 1],
    "kruisbasiliek": [255, 127, 0, 1],
    "kruiskerk": [255, 255, 51, 1],
    "onbepaald": [153, 153, 153, 1],
    "pseudobasiliek": [247, 129, 191, 1],
    "zaalkerk": [152, 78, 163, 1],
    "Grey": [211, 211, 211, 1],
}


classification['stijl'] = {
    "neogotiek": hexToRgbA("#2f4f4f"),
    "modernisme - functionalisme": hexToRgbA("#8b4513"),
    "expressionisme": hexToRgbA("#006400"),
    "traditionalisme": hexToRgbA("#000080"),
    "neorenaissance": hexToRgbA("#ff0000"),
    "eclecticisme": hexToRgbA("#00ced1"),
    "neoromaans": hexToRgbA("#ffa500"),
    "classicisme": hexToRgbA("#ffff00"),
    "gotiek": hexToRgbA("#00ff00"),
    "renaissance": hexToRgbA("#0000ff"),
    "romaans":hexToRgbA("#d8bfd8"),
    "neoclassicisme": hexToRgbA("#ff00ff"),
    "neobarok": hexToRgbA("#ff69b4"),
    "rationalisme": hexToRgbA("#1e90ff"),
    "overig": hexToRgbA("#C0C0C0"),
    "Grey": hexToRgbA("#C0C0C0"),
}


classification['huidige_bestemming'] = {
    "kerk": [27, 158, 119, 1],
    "anders": [217, 95, 2, 1],
    "Grey": [211, 211, 211, 1],
}
//['rgb()','rgb()','rgb()','rgb()','rgb()']
classification['monument'] = {
    "Gemeentelijk Monument": [228, 26, 28, 1],
    "Provinciaal Monument": [55, 126, 184, 1],
    "Rijksmonument": [77, 175, 74, 1],
    "geen monumenten status": [152, 78, 163, 1],
    "onbekend": [255, 127, 0, 1],
    "Grey": [211, 211, 211, 1],
}


var period_scheme=[[255,247,236,1],[254,232,200,1],[253,212,158,1],[253,187,132,1],[252,141,89,1],[239,101,72,1],[215,48,31,1],[179,0,0,1],[127,0,0,1]];
classification['periode'] = {
    "-1000": period_scheme[0],
    "1000-1500": period_scheme[1],
    "1500-1800": period_scheme[2],
    "1800-1850": period_scheme[3],
    "1850-1900": period_scheme[4],
    "1900-1945": period_scheme[5],
    "1945-": period_scheme[6],
    "onbekend": [211, 211, 211, 1]
}

kerkenFilter = function () {
// implements filtering on the legend categories via a separate popup window
    this.filter;
    this.typeahead_source;
}

kerkenInfo = function () {

}

kerkenLegend = function () {
    this.categoryCounter = {};
}

kerkenList = function () {
    this.pages = [];
}

kerkenViewer = function () {
    this.zoom;
    this.clusterDistance;
    this.filter = new kerkenFilter();
    this.legend = new kerkenLegend();
    this.info = new kerkenInfo();
    this.list = new kerkenList();
    this.styleCache = {};
}

kerkenFilter.prototype.init = function () {
    var me = this;
    me.filter = {
        'architect': [],
        'naam': [],
        'plaats': [],
        'gemeente': [],
        'provincie': [],
        'denominatie': [],
        'type': [],
        'stijl': [],
        'huidige_bestemming': [],
        'monument': [],
        'periode': []
    }
    var validfilter = true;
    me.init_search()
    var html = '';
    html += '<div class="panel panel-group">';
    for (var legendClass in classification) {
        html += '<div class="panel panel-default">';
        html += '<div class="panel-heading"><a class="legendClass" data-legendclass="' + legendClass + '" data-toggle="collapse" href="#collapse' + legendClass + '">' + legendClass + '</a></div>';
        html += '<div id="collapse' + legendClass + '" class="panel-body list-group panel-collapse collapse">';
        for (var cat in classification[legendClass]) {
            if (cat != 'Grey') {
                html += '<div class="col-lg-4 clearfix"><label><input type="checkbox" class="' + legendClass + '" checked value="' + cat + '">' + cat + '</label></div>';
            }
        }
        html += '<div class="col-md-12 clearfix"><b>selecteer</b>:&nbsp;<a class="select_all" data-legendclass="' + legendClass + '">alles</a>&nbsp;&nbsp;<a class="deselect_all" data-legendclass="' + legendClass + '">niets</a></div>';
        html += '</div></div>';
    }

    html += '</div>';
    $('#filterModal .filters').html(html);
    $('.filters :checkbox').change(function () {
        update();
    });

    $('.select_all').click(function () {
        var legendClass = $(this).data('legendclass');
        $('.' + legendClass).prop('checked', true);
        update();
    });
    $('.deselect_all').click(function () {
        var legendClass = $(this).data('legendclass');
        $('.' + legendClass).prop('checked', false);
        update();
    });

    // validate, every group should have at least one checked item
    $('.btn-filter').click(function () {
        if (validfilter) {
            viewer.loadSource({'filter': me.filter}, false, false, $('#legendheader select').val(), false);
        }
    });

    $('.btn-reset').click(function () {
        $('.searchfilters').remove();
        me.init();
    });

    function update() {
        $('#filterModal .message').html('');
        $('.legendClass').each(function () {
            var hasSelection = false;
            var legendClass = $(this).data('legendclass');
            var allSelected = true;
            me.filter[legendClass.trim()] = [];
            $('.' + legendClass).each(function () {
                var selected = $(this).prop('checked')
                var cat = $(this).val();
                if (selected) {
                    hasSelection = true
                    me.filter[legendClass.trim()].push(cat.trim());
                } else {
                    allSelected = false;
                }
            });
            if (allSelected) {
                me.filter[legendClass] = [];
            }
            if (hasSelection === false) {
                validfilter = false;
                $('#filterModal .message').html('<div class="alert alert-danger">Niets gekozen voor ' + legendClass + ', kies minstens 1 item</div>')
            } else {
                validfilter = true;
            }
        });
        me.setFilterState();
        me.setTypeahead();
    }
}

kerkenFilter.prototype.setFilterState = function () {
    var me = this;
    $.post('resources/getFilterState.php', {filter: me.filter}, function (res) {
        if (res) {
            $('.legendClass').each(function () {
                var legendClass = $(this).data('legendclass');
                $('.' + legendClass).each(function () {
                    var cat = $(this).val();
                    if (res[legendClass].indexOf(cat) > -1) {
                        $(this).parent().removeClass('missing');
                    } else {
                        $(this).parent().addClass('missing');
                    }
                });
            });
        } else {
            $(':checkbox').parent().removeClass('missing');
        }
    });
};

kerkenInfo.prototype.init = function () {
// set the close button on the kerkeninfo div
    $('#info button.close').click(function () {
        $('#info').hide();
        // give space back to the kerken list
        $('#resultlist li').removeClass('selected');
        viewer.removeHighlightFeature();
        viewer.updateSize();
    });
};

kerkenLegend.prototype.init = function (legendClass, params) {
    $('#legend').html(this.createHTML(legendClass));
    this.setCounters(legendClass, true);
};

kerkenList.prototype.init = function () {
    var me = this;

    $('.resbutton').click(function () {
        if ($(this).hasClass('glyphicon-plus')) {
            $(this).addClass('glyphicon-minus');
            $(this).removeClass('glyphicon-plus');
            $('#rightcolumn').show();
        } else {
            $('#res').html();
            $('#rightcolumn').hide();
            $(this).removeClass('glyphicon-minus');
            $(this).addClass('glyphicon-plus');
        }
        viewer.updateSize();
    });
}

kerkenFilter.prototype.init_search = function () {
    var me = this;
    $('.search select').val('architect');
    me.setTypeahead();
    $('.search select').on('change', function () {
        me.setTypeahead();
    })
    $('.search .typeahead').on('typeahead:selected', function (evt, data) {
        var f = $('.search select').val();
        var v = data;

        if (me.typeahead_source.indexOf(v) === -1) {
            // Not an existing value!
            $('#search').val('');
        } else {
            var new_filter = false;
            if (typeof me.filter[f] === 'undefined') {
                new_filter = true;
            } else if (me.filter[f].indexOf(v) < 0) {
                new_filter = true;
                me.filter[f].push(v);
            }

            if ((v !== '') && (new_filter)) {
                $('#searchfilter').append('<div class="searchfilters"><span class="key">' + f + '</span>: <span class="value">' + v + '</span><button type="button" class="remfilter">&times;</button></div>');
            }
            $('.search .typeahead').typeahead('val', '');
        }
        me.setFilterState();
        $('.remfilter').click(function () {
            // remove from filter
            var f = $(this).parent().children('.key').first().html();
            var v = $(this).parent().children('.value').first().html();
            console.log(me.filter);
            var i = me.filter[f].indexOf(v);
            console.log(i);
            if (i > -1) {
                me.filter[f].splice(i, 1);
            }
            delete me.filter[f][v];
            console.log(me.filter);
            $(this).parent().remove();
            $('#filterModal .alert').remove();
            me.setFilterState();
            me.setTypeahead();
        });
        // Update the selection filters
        //  me.viewer.filter.update();
    });
}

kerkenFilter.prototype.setTypeahead = function () {
    var me = this;
    var substringMatcher = function (strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;
            // an array that will be populated with substring matches
            matches = [];
            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');
            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function (i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });
            cb(matches);
        };
    };
    var list = $('.search select').val();
    $.post('resources/getTypeaheadData.php', {list: list, filter: me.filter}, function (res) {
        me.typeahead_source = res;
        $('.search .typeahead').typeahead('destroy', 'NoCached')
        $('.search .typeahead').typeahead({
                hint: true,
                highlight: true,
                minLength: 0
            },
            {
                limit: 15,
                name: 'list',
                source: substringMatcher(res)
            });
    });

}

/**
 * Creates an HTML string for the initial legend, basically a Bootstrap Collapsable containing a Bootstrap Group list
 *
 * All the categories and orders are set to not selected and not present in the initial view
 *
 * @returns {String} the HTML string
 */
kerkenLegend.prototype.createHTML = function (legendClass) {
    var html = '';
    html += '<div class="list-group row-fluid legcat">';
    for (var cat in classification[legendClass]) {
        if (cat != 'Grey') {
            var img = '<span style="float: left; vertical-align: middle;"><svg width="18" height="18" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="18" fill="rgba(' + classification[legendClass][cat] + ')" stroke-width="1"/></svg></span>';
            html += '<div class="list-group-item col-lg-12 col-md-12 col-xs-12 col-sm-12 present clearfix">' + img + '&nbsp;<span class="legend_name">' + cat + '</span><span class="legendcounter pull-right" data-cat="' + cat + '"></span></div>';
        }
    }
    html += '</div>';
    return html;
};
/**
 * Create map object with base layers.
 * Add Feature layer.
 * Call initOverlay & initBaseLayerSwitcher()
 * Set map controls
 *
 *
 * @param {type} mapDiv
 * @param {type} panelDiv
 * @returns {undefined}
 */
kerkenViewer.prototype.initMap = function (mapDiv, panelDiv) {
    var me = this;
    /*
     if (ol.has.DEVICE_PIXEL_RATIO > 2) {
     var iconscale = 1;
     var pixelRatio = 2;
     } else {
     var iconscale = 0.16;
     var pixelRatio = 1;
     }
     */
    var iconscale = 1;
    var pixelRatio = 1;
    var attribution = new ol.control.Attribution({
        collapsible: false
    });
    var BingApiKey = "AlB8IXPdl7qrdUWcIfLjx8lWjJpsvGLtnmDK9Nn5f9m99_w70z6y3S3TZ_e4J0a6";
    var baselayers = [];
    //cartodb light
    baselayers.push(new ol.layer.Tile({
        type: 'base',
        name: 'cartodb-light',
        source: new ol.source.XYZ({
            url: 'https://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            attributions: [new ol.Attribution({html: ['&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>']})]
        })

    }));
    baselayers.push(new ol.layer.Tile({
        type: 'base',
        name: 'OpenStreetMap',
        visible: false,
        source: new ol.source.OSM({})
    }));
    baselayers.push(new ol.layer.Tile({
        type: 'base',
        name: 'Bing Aerial',
        visible: false,
        preload: Infinity,
        source: new ol.source.BingMaps({
            key: BingApiKey,
            imagerySet: 'AerialWithLabels',
            maxZoom: 19
        })
    }));
    baselayers.push(new ol.layer.Tile({
        type: 'base',
        name: 'Bing Road',
        visible: false,
        preload: Infinity,
        source: new ol.source.BingMaps({
            key: BingApiKey,
            imagerySet: 'Road',
            maxZoom: 19
        })
    }));
    /*
     baselayers.push(new ol.layer.Tile({
     //-13884991, 2870341, -7455066, 6338219],
     extent: [356232.444029, 6571336.8142, 809607.331939, 7086692.07682],
     type: 'base',
     name: 'TMK 1845-1869',
     visible: false,
     source: new ol.source.TileWMS({
     url: 'http://mapsrv.ubvu.vu.nl/proxy/pub/service',
     params: {'LAYERS': 'TMK2:Topographische_en_militaire_kaart_1845-1869'},
     // Countries have transparency, so do not fade tiles:
     transition: 0
     })
     }));
     baselayers.push(new ol.layer.Tile({
     //-13884991, 2870341, -7455066, 6338219],
     extent: [356232.444029, 6571336.8142, 809607.331939, 7086692.07682],
     type: 'base',
     name: 'TMK 1888-1918',
     visible: false,
     source: new ol.source.TileWMS({
     url: 'http://mapsrv.ubvu.vu.nl/proxy/pub/service',
     params: {'LAYERS': 'TMK2:Topographische_en_militaire_kaart_1888-1918'},
     // Countries have transparency, so do not fade tiles:
     transition: 0
     })
     }));
     baselayers.push(new ol.layer.Tile({
     //-13884991, 2870341, -7455066, 6338219],
     extent: [356232.444029, 6571336.8142, 809607.331939, 7086692.07682],
     type: 'base',
     name: 'Bonne 1910',
     visible: false,
     source: new ol.source.TileWMS({
     url: 'http://mapsrv.ubvu.vu.nl/ows/bonne',
     params: {'LAYERS': 'Bonne 1910'},
     // Countries have transparency, so do not fade tiles:
     transition: 0
     })
     }));
     baselayers.push(new ol.layer.Tile({
     //-13884991, 2870341, -7455066, 6338219],
     extent: [356232.444029, 6571336.8142, 809607.331939, 7086692.07682],
     type: 'base',
     name: 'Bonne 1920',
     visible: false,
     source: new ol.source.TileWMS({
     url: 'http://mapsrv.ubvu.vu.nl/ows/bonne',
     params: {'LAYERS': 'Bonne 1920'},
     // Countries have transparency, so do not fade tiles:
     transition: 0
     })
     }));
     baselayers.push(new ol.layer.Tile({
     //-13884991, 2870341, -7455066, 6338219],
     extent: [356232.444029, 6571336.8142, 809607.331939, 7086692.07682],
     type: 'base',
     name: 'Bonne 1930',
     visible: false,
     source: new ol.source.TileWMS({
     url: 'http://mapsrv.ubvu.vu.nl/ows/bonne',
     params: {'LAYERS': 'Bonne 1930'},
     // Countries have transparency, so do not fade tiles:
     transition: 0
     })
     }));
     baselayers.push(new ol.layer.Tile({
     //-13884991, 2870341, -7455066, 6338219],
     extent: [356232.444029, 6571336.8142, 809607.331939, 7086692.07682],
     type: 'base',
     name: 'Bonne 1940',
     visible: false,
     source: new ol.source.TileWMS({
     url: 'http://mapsrv.ubvu.vu.nl/ows/bonne',
     params: {'LAYERS': 'Bonne 1940'},
     // Countries have transparency, so do not fade tiles:
     transition: 0
     })
     }));
     */
    // This id the base map object
    this.map = new ol.Map({

        target: mapDiv,
        layers: baselayers,
        controls: ol.control.defaults({
            attribution: false

        }).extend([attribution]),
        interactions: ol.interaction.defaults({
            pinchRotate: false
        }),
        view: new ol.View({
            center: ol.proj.fromLonLat([5.12, 52.09]),
            zoom: 8,
            maxZoom: 20
        })
    });
// Set the baselayer switcher
    this.initBaseLayerSwitcher();
    // set the Layer for the kerken markers and their styling
    me.highlightLayer = new ol.layer.Vector({
        source: new ol.source.Vector()
    });
    me.highlightLayer.setZIndex(10);
    this.map.addLayer(me.highlightLayer);

    // set the Layer for the kerken markers and their styling
    me.bagLayer = new ol.layer.Vector({
        name: 'bag',
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 255, 1.0)',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.3)'
            }),
        })
    })
    viewer.map.addLayer(viewer.bagLayer);

// Ininitializes opening the info div when clicking on a feature
    this.map.on('click', function (evt) {
        var feature = me.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
                //return feature;
                var clusterfeatures = feature.get('features');
                if (clusterfeatures.length == 1) {
                    return clusterfeatures[0]
                } else {
                    return false
                }
            }, {
                layerFilter: function (layer) {
                    return layer === me.kerkenLayer;
                },
                hitTolerance: 5 // important for touch
            }
        );
        if (feature) {
            me.info.show(feature); //PV An array because of the clustered features!
        }
    });
    // Add a button for a zoom to fit
    $('.controlFit').click(function () {
        me.zoomToExtent();
    });

    // refreshes the map when the user goes back to an inactive browser tab
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            //setTimeout( function() { me.map.renderSync();}, 200);
            //renderSync is not enough, force source reload?
            console.log('refresh layers');
            me.map.getLayers().forEach(function (layer) {
                layer.changed();
            });
            setTimeout(function () {
                me.map.renderSync();
            }, 500);
        }
    });

}
;
/**
 * Adds a baselayer switching panel in the map DIV and a button to open/close it
 *
 * @returns {undefined}
 */
kerkenViewer.prototype.initBaseLayerSwitcher = function () {
    var me = this;
    var layers = this.map.getLayers();
    layers.forEach(function (element, index, arr) {
        if (element.get('type') == 'base') {
            addLayerToList(element);
        }
    });
    $('#baseLayerSwitcher button.close').click(function () {
        $('#baseLayerSwitcher').hide();
        $('.controlBaseLayer').removeClass('mapButtonActive');
    });
    //$('#panel').append('<div class="olButton mapButton ui-corner-all controlBaseLayer" title="Change base layer"><span id="baseLayerButton" class="layericon panelicon"></span></div>');

    $('.controlBaseLayer').on('click', function (evt) {
        $('#baseLayerSwitcher').toggle();
        $('.controlBaseLayer').toggleClass('mapButtonActive');
    });

    function addLayerToList(layer) {
        var item = $('<li>', {
            "data-icon": "check",
            "class": layer.get('visible') ? "checked" : ""
        })
            .append($('<a />', {
                    text: layer.get('name')
                })
                .click(function () {
                    var layers = me.map.getLayers();
                    layers.forEach(function (element, index, arr) {
                        if (element.get('type') == 'base') {
                            element.setVisible(false);
                        }
                    });
                    layer.setVisible(true);
                    $('#baseLayersList li').removeClass('checked');
                    $(item).toggleClass('checked');
                })
            )
            .appendTo('#baseLayersList');
    }

};
kerkenViewer.prototype.removeKerkenLayer = function () {
    var layersToRemove = [];
    this.map.getLayers().forEach(function (layer) {
        if (layer.get('name') != undefined && layer.get('name') === 'kerken') {
            layersToRemove.push(layer);
        }
    });
    var len = layersToRemove.length;
    for (var i = 0; i < len; i++) {
        this.map.removeLayer(layersToRemove[i]);
    }
}

kerkenViewer.prototype.setClusterDistance = function () {
    var cutoff = 12;
    var source = this.kerkenLayer.getSource();
    var distance = source.getDistance();
    if (this.map.getView().getZoom() >= cutoff && distance > 0) {
        source.setDistance(0);
    } else if (this.map.getView().getZoom() < cutoff && distance == 0) {
        source.setDistance(this.clusterDistance);
    }
}

/**
 * Send post request to URL. This request should return Geojson which is loaded into source.
 * From this source the map is rendered
 *
 * @param {ol.source} source
 * @param {string} url
 * @param {type} params
 * @param {boolean} bZoom zoom to the data extent after the features are added?
 * @returns {undefined}
 */
kerkenViewer.prototype.loadSource = function (params, bZoom, kerkid, legendClass, rebuildlegend) {
    var me = this;
    console.log(params);
    $.post('resources/getGeoJSON.php', params, function (res) {
        if (res !== 'noresult') {
            me.styleCache = {};
            if (res.features.length == 0) {

                $('#filterModal .message').html('<div class="alert alert-danger">Geen resultaten voor deze filterkeuzes</div>')


                return false;
            }
            $('#filterModal').modal('hide');
            me.removeKerkenLayer();
            var geojsonFormat = new ol.format.GeoJSON();
            var features = geojsonFormat.readFeatures(res, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
            me.list.build(features);
            $('#restot').html(features.length);

            me.source = new ol.source.Vector({
                features: features
            })

            if (features.length < 300) {
                me.clusterDistance = 0;
            } else {
                me.clusterDistance = 50;
            }

            // set the Layer for the kerken markers and their styling
            me.kerkenLayer = new ol.layer.Vector({
                name: 'kerken',
                source: new ol.source.Cluster({
                    distance: me.clusterDistance,
                    source: me.source,
                })
            });
            me.zoom = me.map.getView().getZoom();
            me.map.on('moveend', function (e) {
                var curzoom = me.map.getView().getZoom();
                if (me.zoom != curzoom) {
                    me.setClusterDistance();
                    me.zoom = curzoom;
                }
            });
            me.setStyle(legendClass);
            me.setClusterDistance();
            me.map.addLayer(me.kerkenLayer);
            me.kerkenLayer.setZIndex(0);

            if (kerkid) {
                var feature = me.getFeatureByKerkAttribute('kerk_id', kerkid);
                if (feature !== false) {
                    me.panToFeature(feature);
                    me.info.show(feature);
                }

            }
            me.legend.init(legendClass);
            if (bZoom) {
                me.zoomToExtent();
            }

            //me.highlightLayer.getSource().clear();
            me.info.update();

            me.bagLayer.getSource().clear();

            me.map.updateSize();

        } else {
            //alert('geen resultaten');
        }
    });
};
kerkenViewer.prototype.setStyle = function (legendClass) {
    var me = this;

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(rgb) {
        if (typeof rgb !== "undefined") {
            return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
        } else {
            return '#fff';
        }
    }

    var style = function (feature) {
        var zoomLevel = me.map.getView().getZoom();
        var labelZoomLevel = 14;

        var features = feature.get('features');
        var num = features.length;
        var cat = features[0].get(legendClass);
        var naam = features[0].get('naam');
        var ingebruik = features[0].get('ingebruik');
        var id = features[0].get('kerk_id');

        var uq = legendClass + '_' + zoomLevel + '_' + id;
        if (num == 1) {
            if (zoomLevel > labelZoomLevel) {
                uq = cat + '_' + naam;
            } else {
                uq = cat
            }
        }
        var style = me.styleCache[uq];
        if (typeof classification[legendClass][cat] == 'undefined'){
            var symbolcolor = '#fff';
        } else {
            var symbolcolor = classification[legendClass][cat];
        }
        if (!style) {
            //console.log('no cached style for ' + uq)
            if (num == 1) {
                style = new ol.style.Style({
                    image: new ol.style.RegularShape({
                        radius: 8,
                        points: 4,
                        angle: Math.PI / 4,
                        stroke: new ol.style.Stroke({
                            color: '#606060'
                        }),
                        fill: new ol.style.Fill({
                            color: symbolcolor
                        }),
                    }),
                    text: new ol.style.Text({
                        font: '14px Calibri,sans-serif',
                        fill: new ol.style.Fill({color: '#000'}),
                        stroke: new ol.style.Stroke({
                            color: '#fff', width: 2
                        }),
                        offsetY: 15,
                        text: zoomLevel > labelZoomLevel ? naam + ' (' + ingebruik + ')' : ''
                    })
                });
            } else {
                var cdata = chartData(features, num)
                var size = 8 * Math.sqrt(Math.sqrt(num));
                style = new ol.style.Style({
                    zindex: num,
                    image: new ol.style.Chart({
                        type: 'pie',
                        offsetY: 0,
                        data: cdata['data'],
                        colors: cdata['colors'],
                        rotateWithView: true,
                        radius: size,
                        animation: false,
                        stroke: new ol.style.Stroke({
                            color: '#fff',
                            width: 0
                        }),
                    })
                });
            }
            me.styleCache[uq] = style;
        }
        return style;
    }
    this.kerkenLayer.setStyle(style);


    function chartData(features) {

        var index = [];
        var index_num = 0;
        var pie_colors = [];
        var pie_data = [];
        for (var i = 0; i < features.length; i++) {
            var cat = features[i].get(legendClass);
            if (typeof index[cat] == "undefined") {
                index[cat] = index_num;
                index_num++;
            }
            var n = index[cat];
            if (typeof pie_colors[n] == "undefined") {
                var color = classification[legendClass][cat];
                pie_colors[n] = rgbToHex(color);
            }
            if (typeof pie_data[n] !== "undefined") {
                pie_data[n]++;
            } else {
                pie_data[n] = 1;
            }
        }
        var pie_colors_sorted = [];
        var pie_data_sorted = [];
        for (cat in classification[legendClass]) {
            if (typeof index[cat] !== 'undefined') {
                index_num = index[cat];
                pie_colors_sorted.push(pie_colors[index_num]);
                pie_data_sorted.push(pie_data[index_num]);
            }
        }
        return {
            colors: pie_colors_sorted,
            data: pie_data_sorted
        }
    }

}

/**
 * Zooms the map to the current data extent. (all features shown in the map window)
 *
 * @returns -
 */
kerkenViewer.prototype.zoomToExtent = function () {
    var source = this.source;
    this.map.getView().fit(source.getExtent(), {maxZoom: 15, padding: [100, 100, 100, 100], duration: 0});
};
kerkenViewer.prototype.updateSize = function () {
    this.resizeRight();
    this.map.updateSize();
};
/**
 * return the feature which has an attribute with the exact value.
 *
 * @param {string} attribute
 * @param {strin} value
 * @returns {ol.feature|false}
 */
kerkenViewer.prototype.getFeatureByKerkAttribute = function (attribute, value) {
    //var source = viewer.kerkenLayer.getSource();
    var feature = false;
    this.source.forEachFeature(function (f) {
        var v = f.get(attribute);
        if (v == value) {
            feature = f;
        }
    });
    return feature;
};
/**
 * Pans (and zooms) the map to a feature
 *
 * @param {ol.fetaure} feature
 * @returns {undefined}
 */
kerkenViewer.prototype.panToFeature = function (feature) {
    this.map.getView().fit(feature.getGeometry(), {maxZoom: 15, padding: [100, 100, 100, 100], duration: 200});
};
/**
 * Highlights a feature by drawing a circle around it.
 * This should now add the highlight to a new later
 */
kerkenViewer.prototype.highlightFeature = function (feature) {
    var highlight = feature.clone();
    var style = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 20,
            snapToPixel: false,
            stroke: new ol.style.Stroke({
                color: 'rgba(255, 0, 0, 1)',
                width: 2
            })
        })
    });
    highlight.setId('highlight');
    highlight.setStyle(style);
    var source = this.highlightLayer.getSource();
    source.addFeature(highlight);
};
/**
 * remove the highlight feature from the map if it's shown
 * called when closing the info window
 *
 * @param {type} feature
 * @returns {undefined}
 */
kerkenViewer.prototype.removeHighlightFeature = function (feature) {
    var source = this.highlightLayer.getSource();
    var f = source.getFeatureById('highlight');
    if (f !== null) {
        source.removeFeature(f);
    }
};

kerkenViewer.prototype.resizeRight = function () {
    // we have 3 items:
    // #rightcolumn, #info, #geoplaza_attribution
    const windowheight = $('#map').height() - 5;
    const resheaderheight = $('#resheader').outerHeight();
    const attrheight = $('#geoplaza_attribution').outerHeight(); // fixed
    const info = $('#info').is(":visible");
    const res = $('#res').is(":visible");
    const availableheight = windowheight - attrheight - resheaderheight;
    if (!info && res) {
        $('#rightcolumn').height(availableheight);
    } else if (info && !res) {
        $('#info').height(availableheight);
    } else {
        $('#info').height(0.6 * availableheight);
        $('#rightcolumn').height(0.4 * availableheight);
    }
};

/**
 * Show the klooster list, build from the geojson
 *
 * @param {object} geojson
 * @returns {undefined}
 */

kerkenList.prototype.build = function (features) {
    var me = this;
    me.pages = [];

    console.log('start build');
    var pageSize = 15;


    var i = 0;
    var page = 1;
    me.pages[page] = [];
    if (typeof features !== "undefined") {
        features.forEach(function (feature) {
            if (i >= pageSize) {
                page++;
                me.pages[page] = [];
                i = 0;
            }
            me.pages[page][i] = {};
            me.pages[page][i]['kerk_id'] = feature.get('kerk_id');
            me.pages[page][i]['naam'] = feature.get('naam')
            me.pages[page][i]['plaats'] = feature.get('plaats')
            me.pages[page][i]['ingebruik'] = feature.get('ingebruik')
            i++;
        });
    }
    me.showPage(1);

    // This prevents the offset in map.forEachFeatureAtPixel
    viewer.updateSize();
    console.log('end build');
}

kerkenList.prototype.showPage = function (page) {
    var me = this;
    var last = me.pages.length - 1;

    $('#res').html('');
    $('#res').append('<ul class="pagination ustify-content-center" id="resultNavigate"></ul>');
    if (page == 1) {
        $('#resultNavigate').append('<li class="disabled"><a rel="prev" onclick="return false;" href="#">«</a></li>');
    } else {
        $('#resultNavigate').append('<li><a class="resultBack" href="#">«</a></li>');
    }
    if (page == last) {
        $('#resultNavigate').append('<li class="disabled"><a class="" href="#">»</a></li>');
    } else {
        $('#resultNavigate').append('<li class="resultForward"><a class="resultForward" href="#">»</a></li>');
    }

    if (page > 1) {
        // link to page 1
        $('#resultNavigate').append('<li><a class="resultFirst" href="#">1</a></li>');
    }

    if (page > 2) {
        $('#resultNavigate').append('<li class="disabled"><span>...</span></li>');
    }

    $('#resultNavigate').append('<li class="active"><span>' + page + '</span></li>');

    if (page < last - 1) {
        $('#resultNavigate').append('<li class="disabled"><span>...</span></li>');
    }

    if (page < last) {
        $('#resultNavigate').append('<li><a class="resultLast" href="#">' + last + '</a></li>');
    }

    $('#res').append('<ul id="resultlist"></ul></div>');
    var html = '';
    for (var i = 0; i < me.pages[page].length; i++) {
        html += '<li style="" id="res_' + me.pages[page][i]['kerk_id'] + '"><a data="' + me.pages[page][i]['kerk_id'] + '">' + me.pages[page][i]['plaats'] + ', ' + me.pages[page][i]['naam'] + ' (' + me.pages[page][i]['ingebruik'] + ')</a></li>';
    }

    $('.resultBack').click(function () {
        me.showPage(page - 1);
    });
    $('.resultForward').click(function () {
        me.showPage(page + 1);
    });
    $('.resultFirst').click(function () {
        me.showPage(1);
    });
    $('.resultLast').click(function () {
        me.showPage(last);
    });

    $('#resultlist').html(html);
    $('#resultlist a').click(function () {
        var id = $(this).attr('data');
        var feature = viewer.getFeatureByKerkAttribute('kerk_id', id);
        if (feature !== false) {
            viewer.panToFeature(feature);
            viewer.info.show(feature);
        }
    });
}

kerkenList.prototype.showId = function (kerk_id) {
    var me = this;
    // where is it
    var page = getPageById(kerk_id)
    // change page
    me.showPage(page);
    // activate it
    $('#res_' + kerk_id).addClass('selected');
    $('#res_' + kerk_id).scrollintoview();

    function getPageById(id) {
        for (var i = 1; i < me.pages.length; i++) {
            for (var j = 0; j < me.pages[i].length; j++) {
                if (me.pages[i][j]['kerk_id'] == kerk_id) {
                    return i;
                }
            }
        }
        return false;
    }
}

kerkenInfo.prototype.show = function (feature) {
    var me = this;
// remove any highlights from the map
    viewer.removeHighlightFeature();
    //show the spinning circle of doom
    $('html,body').css('cursor', 'wait');
    $.post('resources/getKerkInfo.php',
        {
            "id": feature.get('kerk_id')
        },
        function (res) {
            var html = res.html;
            var data = res.json;
            $('#resultlist li').removeClass('selected');
            $('#info-content').html(html);
            $('#info').show();

            // done waiting
            $('html,body').css('cursor', 'auto');
            // highlight the kerken in the list and scroll it into view
            viewer.list.showId(data.id);
            // initialize the zoombutton
            $('#info button.zoom').unbind("click");
            $('#info button.zoom').addClass('active');
            $('#info button.zoom').removeClass('disabled');
            $('#info button.zoom').attr('title', 'zoom');
            $('#info button.zoom').click(function () {
                var kerk_id = $('#info').data('kerk_id');
                viewer.getFeatureByKerkAttribute('kerk_id', kerk_id);
                viewer.panToFeature(feature);
            });
            // bind the ID of the kerken to the info div
            $('#info').data('kerk_id', data.id);
            // highlight the feature on the map
            viewer.highlightFeature(feature);
            //1882 (abdijterrein); 13942 (Hallum = Egmond-Binnen)
            me.showBag(data.bag_pand_id);
            // reset the map rendering the avoid problems
            viewer.updateSize();
        });
}

kerkenInfo.prototype.showBag = function (pand_id) {
    var me = this;
    console.log(('0' + pand_id).slice(-16))
    //https://geodata.nationaalgeoregister.nl/bag/wfs?&request=GetFeature&typeNames=bag:pand&count=5&outputFormat=application/json&cql_filter=bag:identificatie=402100001489136
    $.get('https://geodata.nationaalgeoregister.nl/bag/wfs?', {
            request: 'GetFeature',
            typeNames: 'bag:pand',
            count: 5,
            outputFormat: 'application/json',
            srsname: 'EPSG:3857',
            cql_filter: 'bag:identificatie=' + pand_id
        },
        function (res) {
            var geojsonFormat = new ol.format.GeoJSON();
            var features = geojsonFormat.readFeatures(res, {
                dataProjection: 'EPSG:3857',
                featureProjection: 'EPSG:3857'
            });
            if (features.length > 0) {
                var source = viewer.bagLayer.getSource();
                source.addFeatures(features)

                var html = '<ul class="bagactueel">';
                html += '<li><b>Status:</b><br> ' + features[0].get('status') + '</li>';
                html += '<li><b>Gebruiksdoel:</b><br> ' + features[0].get('gebruiksdoel') + '</li>';
                //html += '<li><a href="https://bagviewer.kadaster.nl/lvbag/bag-viewer/index.html#?searchQuery="'+ pand_id.padStart(16, '0') +'>Zie BAG viewer</a></li>';
                //https://bagviewer.kadaster.nl/lvbag/bag-viewer/index.html#?detailsObjectId=0362010002001823&objectId=0362100001082159
                html += '<li><a href="https://bagviewer.kadaster.nl/lvbag/bag-viewer/index.html#?searchQuery=' + pand_id.padStart(16, '0') + '" target="bag">BAG viewer link</a></li>';
                //html += '<li><b>Bouwjaar:</b><br> ' + features[0].get('bouwjaar') + '</li>';
                //html += '<li><b>Actualiteitsdatum:</b><br> ' + features[0].get('actualiteitsdatum') + '</li>'; //niet ingevuld
                html += '</ul>';
            } else {
                var html = 'geen info gevonden';
            }
            $('#bag_info').html(html);
        });
};

kerkenInfo.prototype.update = function () {
    // On updating the map check whether the highlighted kerk is still on the map, close it if it isn't.
    var kerk_id = $('#info').data('kerk_id');
    var feature = viewer.getFeatureByKerkAttribute('kerk_id', kerk_id);
    if (feature === false) {
        $('#info').hide();
        // give space back to the kerken list
        $('#resultlist li').removeClass('selected');
        viewer.removeHighlightFeature();
        viewer.updateSize();
    }
};

kerkenLegend.prototype.setCounters = function (legendClass, recount) {
    var me = this;
    if (recount) {
        me.categoryCounter = {}
    }
    if (typeof (me.categoryCounter[legendClass]) == "undefined") {
        me.categoryCounter[legendClass] = {};
        var features = viewer.source.getFeatures();
        if (typeof (features !== "undefined")) {
            features.forEach(function (feature) {
                var cat = feature.get(legendClass);
                if (typeof (me.categoryCounter[legendClass][cat]) == "undefined") {
                    me.categoryCounter[legendClass][cat] = 1;
                } else {
                    me.categoryCounter[legendClass][cat]++;
                }
            });
        }
    }
    $('.legendcounter').each(function () {
        $(this).parent().removeClass('present');
        var cat = $(this).data('cat');
        if (typeof (me.categoryCounter[legendClass][cat]) == "undefined") {
            $(this).html('0');
        } else {
            $(this).html(me.categoryCounter[legendClass][cat]);
            $(this).parent().addClass('present');
        }
    });
}


