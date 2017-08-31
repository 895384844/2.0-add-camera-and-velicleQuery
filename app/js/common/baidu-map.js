/*
1.Baidu Map modules include:
var modules = {
        map: "3uc0wi",
        common: "5w45zj",
        style: "fcoka2",
        tile: "5r2pa2",
        vectordrawlib: "o0famu",
        newvectordrawlib: "hmclwu",
        groundoverlay: "suwtqa",
        pointcollection: "f2tyq3",
        marker: "25gtk1",
        symbol: "fwsijz",
        canvablepath: "x52cuy",
        vmlcontext: "hev5xu",
        markeranimation: "ulntww",
        poly: "qwgivy",
        draw: "o13qo0",
        drawbysvg: "wqhg4u",
        drawbyvml: "vgaolq",
        drawbycanvas: "rsib4k",
        infowindow: "gji4ki",
        oppc: "kh0en0",
        opmb: "u25mck",
        menu: "q2jarc",
        control: "nx31sg",
        navictrl: "vohbha",
        geoctrl: "koalnf",
        copyrightctrl: "4v1wlk",
        citylistcontrol: "r2lwar",
        scommon: "ktwwno",
        local: "fhktgv",
        route: "k4bch0",
        othersearch: "3me4d4",
        mapclick: "pispkz",
        buslinesearch: "ezbxvf",
        hotspot: "41pssw",
        autocomplete: "xipcdu",
        coordtrans: "npfahg",
        coordtransutils: "y3vgwm",
        convertor: "33e0az",
        clayer: "a0zbw1",
        pservice: "cj0qi1",
        pcommon: "yhbx4d",
        panorama: "je31xk",
        panoramaflash: "glznrv",
        vector: "kspzfy"
    };

2.Get modules from baidu:
  open http://api.map.baidu.com/getmodules?v=2.0&mod=vector_kspzfy

3. API Demo : http://lbsyun.baidu.com/jsdemo.htm#a1_2
*/


var baiduMap = angular.module('common.baiduMap', []);

baiduMap.directive('baiduMap',['$interval',function($interval){
		var mapStyle = {
		    width: '100%',
		    height: '100%'
		};
			
		var createMarker =  function(marker, pt) {
		    if (marker.icon) {
		        var icon = new BMap.Icon(marker.icon, new BMap.Size(marker.width, marker.height));
		        return new BMap.Marker(pt, { icon: icon });
		    }
		    return new BMap.Marker(pt);
		};

		var oldMarkers= [];
		
		window.isMapLoaded = false;
	    
	    window.initOnlineMap = function(){
	    	window.isMapLoaded = true;
	    }


		var redrawMarkers = function(map, newMarkers,onMarkerSelect) {

			    oldMarkers.forEach(function (_ref) {
			        var marker = _ref;
			        var listener = _ref.listener;
			        if(!!_ref.listener){
			        	marker.removeEventListener('click', listener);
			        }
			        map.removeOverlay(marker);
			        
			        
			    });

			    oldMarkers.length = 0;

			    if (!newMarkers) {
			        return;
			    }

			    newMarkers.forEach(function (marker) {

			        var newMarker = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));

			        // add marker to the map
			        map.addOverlay(newMarker);
			        //var previousMarker = { marker: marker2, listener: null };
			        //previousMarkers.push(previousMarker);

			        if (!marker.title && !marker.content) {
			            return;
			        }
			        var msg = '<p>' + (marker.title || '') + 
			        		'</p><p>' + (marker.content || '') + '</p>'+
			        		'<p>经度:'+marker.longitude+',纬度:'+marker.latitude+'</p>';
			        
			        // if(marker.devices){
			        // 	for(var j in marker.devices){
			        // 		msg=msg+'<a href="javascript:void(0)">'+marker.devices[j].name+'</a>'
			        // 	}
			        	
			        // }

			        var infoWindow = new BMap.InfoWindow(msg, {
			            enableMessage: !!marker.enableMessage
			        });


			        var clickMarkerListener = function () {
			            this.openInfoWindow(infoWindow);
			            if(!!onMarkerSelect){
			            	onMarkerSelect(marker);
			            }
			            
			        };
			        newMarker.addEventListener('click', clickMarkerListener);
			        oldMarkers.push(newMarker);
			    });
			};
		var createRadius=function (marker) {
        	var mPoint = new BMap.Point(marker[0]['longitude'], marker[0]['latitude']);  
            map.enableScrollWheelZoom();
		    map.centerAndZoom(mPoint,opts.zoom);

		    var circle = new BMap.Circle(mPoint,30000,{fillColor:"blue", strokeWeight: 1 ,fillOpacity: 0.2, strokeOpacity: 0.2});
            map.addOverlay(circle);
            return circle;
        };

        var createTag = function(url) {
	        var script = document.createElement('script');
	        script.type = 'text/javascript';
	        script.src = url;
	        script.onerror = function () {

	            Array.prototype.slice.call(document.querySelectorAll('baidu-map div')).forEach(function (node) {
	                node.style.opacity = 1;
	            });
	            document.body.removeChild(script);
	            setTimeout(createTag, offlineOpts.retryInterval);
	        };
	        script.onload=function(status){
	        	window.isMapLoaded=true;
	        }
	        
	        document.body.appendChild(script);
	    };
	    
	   


		return {
			restrict: 'EA',
			transclude: true,
			replace: false,
			template: '<div ng-style="mapStyle"></div>',
			scope: {
				mapStyle: '=?',
				online: '=?',
				options: '=?'
			},
			link: function(scope, element, attrs, controller) {


				if(!scope.mapStyle){
					scope.mapStyle =mapStyle;
				}

				var opts = scope.options;
				scope.options.isUpdate=false;

				 if(!!scope.online){
					if(!window.isMapLoaded){
						var url = 'http://api.map.baidu.com/api?v=2.0&ak=Qspv2In2CfD4PYqIfBeiL5wQTlL4EXp1&callback=initOnlineMap';
						createTag(url);
					}
				}else{
					var url = 'js/common/apiv2.0.min.js';
					createTag(url);
				}
				
				var autoRanderMap = function(){
					scope.map = new BMap.Map(element.find('div')[0],{mapType: BMAP_NORMAL_MAP,maxZoom:18,minZoom:5});
					
				    if (opts.navCtrl) {
				        // add navigation control
				        scope.map.addControl(new BMap.NavigationControl());
				    }
				    if (opts.scaleCtrl) {
				        // add scale control
				       scope.map.addControl(new BMap.ScaleControl());
				    }
				    if (opts.overviewCtrl) {
				        //add overview map control
				        scope.map.addControl(new BMap.OverviewMapControl());
				    }
				    if (opts.enableScrollWheelZoom) {
				        //enable scroll wheel zoom
				        scope.map.enableScrollWheelZoom();
				    }
				    scope.$watch('options.isUpdate', function (newValue, oldValue) {  
				    	var center =scope.options.center;
				    	var zoom =scope.options.zoom;
		                scope.map.centerAndZoom(new BMap.Point(center.longitude,center.latitude),zoom);
		             });
				    if (!!opts.center && !!opts.zoom) {
				    	var center =scope.options.center;
				    	var zoom =scope.options.zoom;
		                scope.map.centerAndZoom(new BMap.Point(center.longitude,center.latitude),zoom);
				    }
					if (!!opts.zoom) {
				    	//scope.map.setZoom(opts.zoom);
				    }
	                if (!!opts.markers) {
	                	redrawMarkers(scope.map,opts.markers,opts.onMarkerSelect);	
	                	scope.$watch('options.markers', function (newValue, oldValue) {
		                	redrawMarkers(scope.map,newValue,opts.onMarkerSelect);	            
		                }, true);
	                }

	                if (!!opts.externalCallBack) {
	                	opts.externalCallBack(scope.map);
	                }


				}
//				if(!!scope.online){	    
				    var timers = setInterval(function(){
				    	if(window.isMapLoaded){
				    		autoRanderMap();
				    		clearInterval(timers);
				    	}
				    },1000)
				    
//				}else{
//					setTimeout(autoRanderMap,1000);
//				}  
			}
		}

}]);