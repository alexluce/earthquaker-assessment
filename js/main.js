var map;

$(function() {

    $('#submit').click( function() {
        getEarthquakes();
    });

    var today = new Date();
    today.setFullYear(today.getFullYear() - 1);
    var dd = today.getDate();
    var mm = today.getMonth();
    var yyyy = today.getFullYear();
    var lastYear = yyyy + '-' + mm + '-' + dd;

    var bigRequest = 'http://api.geonames.org/earthquakesJSON?north=90&south=-90&east=180&west=-180&maxRows=500&username=alexluce';

    $.getJSON(bigRequest).done( function(data) {
        var table = new Array;
        $.each(data.earthquakes, function(i,v) {
            if (v.datetime > lastYear) {
                var datatable = {
                    mag: v.magnitude,
                    lat: v.lat,
                    lng: v.lng,
                    date: v.datetime
                }
                table.push(datatable);
            }
        });
        var tableHTML = '<tr><th>ID</th><th>Magnitude</th><th>Longitude</th><th>Latitude</th><th>Date-Time</th></tr>'
        $.each(table, function(i,v) {
            if (i < 10) {
                tableHTML += '<tr><td>'+ i +'</td><td>'+ v.mag +'</td><td>'+ v.lng +'</td><td>'+ v.lat +'</td><td>'+ v.date +'</td></tr>'
            }
        });
        $('#quakes').html(tableHTML);
    });

    function getEarthquakes() {
        var placename = document.getElementById('city').value;
        $('#map_canvas').gmap3('destroy');
        $('#map_canvas').gmap3({
            map: {
                address: placename,
                options: {
                    zoom: 10,
                    mapTypeId: google.maps.MapTypeId.TERRAIN,
                    disableDefaultUI: true,
                    disableDoubleClickZoom:true,
                    draggable: false,
                    keyboardShortcuts: false,
                    scrollwheel: false
                },
                events: {
                    idle: function(){
                        map = $(this).gmap3('get');
                        var map_bounds = map.getBounds();
                        var request = 'http://api.geonames.org/earthquakesJSON?north=' + map_bounds.fa.d + '&south=' + map_bounds.fa.b + '&east=' + map_bounds.ka.d + '&west=' + map_bounds.ka.b + '&username=alexluce';
                        $.getJSON(request).done( function(data) {
                            var heatmapData = new Array;
                            var table = new Array;
                            $.each(data.earthquakes, function(i,v) {
                                var latLng = new google.maps.LatLng(v.lat, v.lng);
                                var marker = new google.maps.Marker({
                                    map: map,
                                    position: latLng,
                                    latitude: v.lat,
                                    longitude: v.lng
                                });
                                marker.metadata = {id: i}
                                marker.setMap(map);
                                google.maps.event.addListener(marker, 'mouseover', function() {
                                    addHighlight(marker.metadata.id);
                                });
                                google.maps.event.addListener(marker, 'mouseout', function() {
                                    removeHighlight(marker.metadata.id);
                                });
                                var dataTable = {
                                    mag: v.magnitude,
                                    lat: v.lat,
                                    lng: v.lng,
                                    date: v.datetime
                                }
                                var magnitude = v.magnitude;
                                var weightedMag = {
                                    location: latLng,
                                    weight: Math.pow(2, magnitude)
                                }
                                table.push(dataTable);
                                heatmapData.push(weightedMag);
                            });
                            var tableHTML = '<tr><th>ID</th><th>Magnitude</th><th>Longitude</th><th>Latitude</th><th>Date-Time</th></tr>'
                            $.each(table, function(i,v) {
                                tableHTML += '<tr><td>'+ i +'</td><td>'+ v.mag +'</td><td>'+ v.lng +'</td><td>'+ v.lat +'</td><td>'+ v.date +'</td></tr>'
                            });
                            $('h3').html('Earthquakes in ' + placename);
                            $('#quakes').html(tableHTML);
                            var heatmap = new google.maps.visualization.HeatmapLayer({
                                data: heatmapData,
                                dissipating: true,
                                radius: 25,
                                map: map
                            });

                        });
                    }
                }
            }
        });
    }
});

function isInt(n) {
    return +n === n && !(n % 1);
}

function addHighlight(id) {
    $('.selected').removeClass('selected');
    $('td').each(function() {
        if ($(this).html() == (id)) {
            $(this).parent().toggleClass('selected');
        }
    });
}

function removeHighlight(id) {
    $('.selected').removeClass('selected');
}