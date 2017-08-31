modalModule.controller('showMapCtrl',function($scope, $compile, list, close, $http, gridServices){
	$scope.list = list;
	
	var map_status=localStorage.getItem('isMapOnline');
	
	if(!map_status || map_status == null){
		localStorage.setItem("isMapOnline","false");
	}

    if(map_status == 'false'){    	
    	$scope.isOnline = false;
    }else{
    	$scope.isOnline = true;
    }

	$scope.points = [];
	if (typeof($scope.list) != "undefined") {
		for(var i = 0; i < $scope.list.length; i++) {
	        var point = {
	            'lat' : $scope.list[i]['lat'],
	            'lon' : $scope.list[i]['lon']
	        };
	        $scope.points.push(point);
	    }
	}
    

    $scope.close = function(result) {
 	    close(result,500);
    };


    function TimeList(list) {
		this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
		this.defaultOffset = new BMap.Size(10, 10);

		this.box = document.createElement("div");
		this.box.className = "timelist-box";
		this.box.id = "timelist-box";

		this.top = document.createElement("div");
		this.top.className = "timelist-top";
		this.box.appendChild(this.top);
		this.leftinfo = document.createElement("div");
		this.leftinfo.className = "timelist-left-info";
		this.top.appendChild(this.leftinfo);
		this.title = document.createElement("span");
		this.title.innerHTML = "轨迹信息";
		this.leftinfo.appendChild(this.title);

		this.content = document.createElement("div");
		this.content.className = "timelist-content";
		this.box.appendChild(this.content);
		this.list = list;
	}

	TimeList.prototype = new BMap.Control();

    TimeList.prototype.initialize = function(map) {  
			
		for (var i = 0; i <this.list.length; i++) {
			var entry = document.createElement("div");
			entry.className = "timelist-group";

			var addressLeft = document.createElement("div");
			addressLeft.className = "timelist-content-left timelist-mg-11";
			var addressImage = document.createElement("img");
			addressImage.src = "../../images/timelist_address.png";
			addressLeft.appendChild(addressImage);
			var addressRight = document.createElement("div");
			addressRight.className = "timelist-content-right timelist-mg-11";
			var addressText = document.createElement("span");
			addressText.innerHTML = '#'+String(i+1)+'地址:'+this.list[i]['device']['address'];
			addressRight.appendChild(addressText);

			var startLeft = document.createElement("div");
			startLeft.className = "timelist-content-left";
			var startImage = document.createElement("img");
			startImage.src = "../../images/timelist_start.png";
			startLeft.appendChild(startImage);
			var startRight = document.createElement("div");
			startRight.className = "timelist-content-right";
			var startText = document.createElement("span");
			startText.innerHTML = this.list[i]['startTime'];
			startRight.appendChild(startText);

			var endLeft = document.createElement("div");
			endLeft.className = "timelist-content-left";
			var endImage = document.createElement("img");
			endImage.src = "../../images/timelist_end.png";
			endLeft.appendChild(endImage);
			var endRight = document.createElement("div");
			endRight.className = "timelist-content-right";
			var endText = document.createElement("span");
			endText.innerHTML = this.list[i]['endTime'];
			endRight.appendChild(endText);

			var clear1 = document.createElement("div");
			clear1.style = "clear: both;";
			var clear2 = document.createElement("div");
			clear2.style = "clear: both;";

			var clickable = null;

			if (i == 0) {
				clickable = entry;
			} else {
				var addition = document.createElement("div");
				addition.className = "timelist-mg-5";
				entry.appendChild(addition);
				clickable = addition;
			}

			clickable.appendChild(addressLeft);
			clickable.appendChild(addressRight);
			clickable.appendChild(clear1);
			clickable.appendChild(startLeft);
			clickable.appendChild(startRight);
			clickable.appendChild(clear2);
			clickable.appendChild(endLeft);
			clickable.appendChild(endRight);

			entry.onclick = (function(map, list, index) {
				return function() {
					entryClick(map, list, index);
				}
			})(map, this.list, i);

			this.content.appendChild(entry);

			var line = document.createElement("span");
			line.className = "line";
			this.content.appendChild(line);
		}

		// 添加DOM元素到地图中 
		$(map.getContainer()).after(this.box);
		// 将DOM元素返回  
		return this.box;  
	}

	function entryClick(map, list, index) {
		var infoWindow = new BMap.InfoWindow("");
		var node = list[index];
		var zoomlevel = map.getZoom();
		var point = new BMap.Point(node['lon'], node['lat']);
		map.centerAndZoom(point, zoomlevel);

		var content = '<div style="margin:0;line-height:1.5;font-size:13px;">' +
                    node['device']['address'] + '<br/>经度：' + node["lon"] + '<br/>纬度：' + node["lat"] +
                  '</div>';
		infoWindow.setTitle(node['device']['name']);
		infoWindow.setContent(content);
		map.openInfoWindow(infoWindow, point);
	}

    var cb = function(map) {
		if(typeof($scope.list) != "undefined") {

			var mapPoints = [];
			for (var i = 0; i < $scope.points.length; i++) {
		        var lat = parseFloat($scope.points[i]['lat']);
		        var lon = parseFloat($scope.points[i]['lon']);
		        mapPoints.push(new BMap.Point(lon, lat));

		        if (i == $scope.points.length - 1) {
		        	var trackIcon = new BMap.Icon('images/track_end.png', new BMap.Size(26, 26));
		        	var marker = new BMap.Marker(new BMap.Point(lon, lat), {icon: trackIcon});
		        	marker.setTop(true);
		        	marker.setOffset(new BMap.Size(-5, -5));
		        } else if (i == 0) {
		        	var trackIcon = new BMap.Icon('images/track_start.png', new BMap.Size(26, 26));
		        	var marker = new BMap.Marker(new BMap.Point(lon, lat), {icon: trackIcon});
		        	marker.setTop(true);
		        	marker.setOffset(new BMap.Size(5, 5));
		        } else {
		        	var trackIcon = new BMap.Icon('images/track_point.png', new BMap.Size(26, 26));
		        	var marker = new BMap.Marker(new BMap.Point(lon, lat), {icon: trackIcon});
		        }

		        marker.disableDragging();
		        map.addOverlay(marker); 
			}
			map.setViewport(mapPoints);

	        //创建折线
			var polyline = new BMap.Polyline(mapPoints, {strokeColor:"blue", strokeWeight:5, strokeOpacity:0.5});
	        //增加折线
			map.addOverlay(polyline);

			var timeList = new TimeList($scope.list);
			map.addControl(timeList);
			   
		}else{
			map.centerAndZoom(new BMap.Point(116.417854,39.921988), 15);
		}
    }

    $scope.mapOptions = {
    	center: {
            longitude: $scope.points[0]['lon'],
            latitude: $scope.points[0]['lat']
        },
        zoom: 17,
        navCtrl:true,
        scaleCtrl:true,
        overviewCtrl:true,
        enableScrollWheelZoom:true,
        maxZoomLevel: 18,
        minZoomLevel: 15,
        externalCallBack: cb
    };
});

modalModule.controller('downLoadCtrlTrajectory',function($scope, $http, gridServices, rows ,close){
	$scope.list = rows;

	$scope.downLoad = function(index){
        var obj = { fileName : $scope.list[index]};        
        document.location.href = gridServices.exportAction('/system/downloadAction!downloadFile.action',obj); 
	};

	$scope.close = function(result) {
 	    close(result,500);
    };
})

