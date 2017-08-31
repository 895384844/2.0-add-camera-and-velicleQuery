var mapServiceModule = angular.module('mapServiceModule', []);
mapServiceModule.service('mapServices',function() {

    var MapLevel = [10000,  // 1
                    5000,   // 2
                    2000,   // 3
                    1000,   // 4
                    500,    // 5
                    200,    // 6
                    100,    // 7
                    50,     // 8
                    25,     // 9
                    20,     // 10
                    10,     // 11
                    5,      // 12
                    2,      // 13
                    1,      // 14
                    0.5,    // 15
                    0.2,    // 16
                    0.1,    // 17
                    0.05,   // 18
                    0.02];  // 19
    

    this.calculateCenter = function(points) {
        var total = points.length;
        var X=0, Y=0, Z=0;
        $.each(points, function(index, point) {
            var lng = point.lng * Math.PI / 180;
            var lat = point.lat * Math.PI / 180;
            var x,y,z;
            x = Math.cos(lat) * Math.cos(lng);
            y = Math.cos(lat) * Math.sin(lng);
            z = Math.sin(lat);
            X += x;
            Y += y;
            Z += z;
        });

        X = X / total;
        Y = Y / total;
        Z = Z / total;

        var Lng = Math.atan2(Y, X);
        var Hyp = Math.sqrt(X * X + Y * Y);
        var Lat = Math.atan2(Z, Hyp);

        return {lng: Lng*180/Math.PI, lat: Lat*180/Math.PI};
    }

    this.calculateZoom = function(points, center) {
        if (points.length == 1) {
            return 14;
        }

        var zoom = 14;
        var maxDistance = 0;
        for (var i = 0; i < points.length; i++) {
            var distance = this.calculateDistance(points[i], center);
            maxDistance = maxDistance > distance ? maxDistance : distance;
        }
        var estimateScale = maxDistance / 3;
        for (var i = 0; i < MapLevel.length; i++) {
            if (estimateScale >= MapLevel[i]) {
                zoom = i;
                break;
            }
        }
        return zoom;
    }

    this.calculateDistance = function(point1, point2) {
        var R = 6378.137;
        var dLat = (point2.lat - point1.lat) * Math.PI / 180;
        var dLng = (point2.lng - point1.lng) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return Math.round(d);
    }

});