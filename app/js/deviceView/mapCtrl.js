var mapModule = angular.module('mapModule', ['utilityModule', 'mapServiceModule']);
mapModule.controller('mapCtrl',function($scope, $http, $interval, usSpinnerService, ModalService, utilityServices, mapServices){

    var GLOBAL_OBJECT = {};
    $scope.isOnline = false;
    
    var map_status=localStorage.getItem('isMapOnline');
	
	if(!map_status || map_status == null){
		localStorage.setItem("isMapOnline","false");
	}

    if(map_status == 'false'){    	
    	$scope.isOnline = false;
    }else if(map_status == 'true'){
    	$scope.isOnline = true;
    }
    
    $scope.device = { name : ''}; 
    $scope.actionType = '0';
    $scope.remoteUrlRequestFn = function(str) {
      return {
            name: str,
            page : 1,
            rows : 1000,
            sort : 'id',
            order : 'desc'
        };
    };
    $scope.devices=[];
    $scope.showDeviceInfo=false;
    $scope.dissmissDeviceInfo=function(){
    	$scope.showDeviceInfo=false;
        
    }
    
	$scope.actionTypes=[
		{
			name:"-----选择设备执行-----",
			value:"0"
		},
		{
			name:"设置查询",
			value:"1"
		},
		{
			name:"启动捕获程序",
			value:"2"
		},
		{
			name:"重启捕获程序",
			value:"3"
		},
		{
			name:"关闭捕获程序",
			value:"4"
		},
		{
			name:"重启设备系统",
			value:"5"
		},
		{
			name:"同步设备时钟",
			value:"6"
		},
		{
			name:"扫描频点",
			value:"7"
		},
		{
			name:"实时告警查询",
			value:"8"
		}
	]
	$scope.actionType="0";
    //得到设备类型对照表
    $http({
        url:'/system/businessDictionaryAction!getChildrenByParentTypeName.action',
        method:'POST',
        params: { code : 'DeviceModel'}
        }).then(function(resp){
        $scope.devicedTypeList = resp.data;                   //返回为设备的类型
    });

    var getDeviceModeById=function(id){
        var index = $scope.devicedTypeList.findIndex(
                        function(a){return a.id==id}
                   );
        if (index<0){
            return {};
        }
        return $scope.devicedTypeList[index];
    }

    $scope.mapOptions = {
            center: {
                longitude: 116.39449,
                latitude: 39.912056
            },
            zoom: 10,
            navCtrl:true,
            scaleCtrl:true,
            overviewCtrl:true,
            enableScrollWheelZoom:true,
            markers: [{
                    longitude: 0,
                    latitude: 0,
                    icon: '',
                    width: 49,
                    height: 60,
                    title: '',
                    content: '',
                    circle : false
                }],
            maxZoomLevel: 1,
            minZoomLevel: 18,
            onMarkerSelect: function(marker) {
                $scope.devices=marker.devices;
                $scope.showDeviceInfo=true;
                $scope.$apply();
            }
    };

    $scope.markers=[];
    var loadMarkers=function (node) {
        for (var i = 0; i < node.length; i++) {
            if (node[i]["children"]) {
                loadMarkers(node[i]["children"]);
            } else {
                var obj = {
                    longitude: node[i].longitude,
                    latitude: node[i].latitude,
                    icon: 'images/device_group.png',
                    width: 49,
                    height: 60,
                    title: node[i].sname,
                    content: node[i].address||'',
                    devices:node[i].devices,
                    circle : false
                };
                var devices=node[i].devices;
                for (var j = 0; j < devices.length; j++) {
                    var device=devices[j];
                    device.type=getDeviceModeById(device.modelId).code||'未知';
                }

                GLOBAL_OBJECT.NodeList.push(node[i]);
                $scope.markers.push(obj);
            }
        }
    }
    
    //angular.element操作页面元素
    angular.element('#devicelist-dropdown').on('hidden.bs.dropdown', function () {
        GLOBAL_OBJECT.isHidden = true;
    });
    //angular.element操作页面元素
    angular.element('#devicelist-dropdown').on('shown.bs.dropdown', function () {
        GLOBAL_OBJECT.isHidden = false;
    });
    //改变文本信息的时候
    $scope.onChangeText = function() {
        $scope.roleList = utilityServices.clone(GLOBAL_OBJECT.fullList);
        if ($scope.device.name != "") {
            filterNode($scope.device.name, $scope.roleList);
        }
        if (GLOBAL_OBJECT.isHidden) {
            angular.element('#devicelist-dropdown-menu').dropdown('toggle');
        }
    }

    $scope.selectedDevice = function(selected){
        if (selected) {
            $scope.mytree.currentNode = selected.originalObject;
        }
    };

    //过滤器，目前只过滤设备
    function filterNode(keyword, node) {
        for (var i = 0; i < node.length; i++) {
            if (node[i]["children"]) {
                if (node[i]["sname"].toLowerCase() == keyword.toLowerCase()) {
                    var tempNode = utilityServices.clone(node[i]);
                    node.splice(0, node.length);
                    node.push(tempNode);
                    break;
                }
                filterNode(keyword, node[i]["children"]);
                if (node[i]["children"].length == 0) {
                    node.splice(i, 1);
                    i--;
                }
            } else {
                if (node[i]["sname"].toLowerCase().indexOf(keyword.toLowerCase()) < 0) {
                    node.splice(i, 1);
                    i--;
                }
            }
        }
    }


    GLOBAL_OBJECT.isHidden = true;
    GLOBAL_OBJECT.NodeList = [];
    GLOBAL_OBJECT.currentNode = null;
    


    $http.post('/system/settingsAction!getSettings.action').then(function(resp){
    	//{"map_focus_max":18,"map_focus_min":0,"map_center_lat":"37.00901",map_center_lon}
        
        //$scope.zoomMax =repData.map_focus_max;
        //$scope.zoomMin =repData.map_focus_min;
          
        setMap(resp.data.map_center_lon,resp.data.map_center_lat,resp.data.map_focus_default);

        //加载设备下拉树
        $http.post('/system/scopeAction!listScopeForMap.action').then(function(resp){
            $scope.roleList = resp.data;
            GLOBAL_OBJECT.fullList = utilityServices.clone($scope.roleList);
            GLOBAL_OBJECT.positionList = [];
            GLOBAL_OBJECT.positionList.splice(0, GLOBAL_OBJECT.positionList.length);
            displayArea($scope.roleList[0]);
            var center = mapServices.calculateCenter(GLOBAL_OBJECT.positionList);
            var zoomNumber = mapServices.calculateZoom(GLOBAL_OBJECT.positionList, center);
            loadMarkers($scope.roleList);
            setMap(center.lng, center.lat, zoomNumber, $scope.markers);
        });

        

        $scope.$watch( 'mytree.currentNode', function( newObj, oldObj ) {

            if( $scope.mytree && angular.isObject($scope.mytree.currentNode) ) {
                //重新选择设备后需要隐藏信息框
                $scope.showDeviceInfo=false;
                $scope.device.name = $scope.mytree.currentNode.sname;

                if($scope.mytree.currentNode.groupId){
                    $scope.centerLongitude = $scope.mytree.currentNode.longitude;
                    $scope.centerLatitude = $scope.mytree.currentNode.latitude;
                    
                    setMap($scope.centerLongitude, $scope.centerLatitude, 14, $scope.markers);

                } else {
                    GLOBAL_OBJECT.positionList = [];
                    GLOBAL_OBJECT.positionList.splice(0, GLOBAL_OBJECT.positionList.length);

                    if ($scope.mytree.currentNode["children"]) {
                        if ($scope.mytree.currentNode["children"].length == 0) {
                            return;
                        }
                    } else {

                    }
                    
                    displayArea($scope.mytree.currentNode);
                    var center = mapServices.calculateCenter(GLOBAL_OBJECT.positionList);
                    var zoomNumber = mapServices.calculateZoom(GLOBAL_OBJECT.positionList, center);
                    setMap(center.lng, center.lat, zoomNumber, $scope.markers);
                }
            }

        }, false);

        function displayArea(currentNode) {
            if (currentNode["children"]) {
                var childrenList = currentNode["children"];

                for (var i = 0; i < childrenList.length; i++) {
                    if (childrenList[i]["children"]) {
                        displayArea(childrenList[i]);
                    } else {
                        var point = {lng: parseFloat(childrenList[i].longitude), lat: parseFloat(childrenList[i].latitude)};
                        GLOBAL_OBJECT.positionList.push(point);
                    }
                }
            } else {

            }
        }


        $scope.addAction =function(actionType,device){
                var type = actionType;
                switch (type)
                {
                case '0':
                    break;
                case '1':
                    $scope.setSearch(device);
                    break;
                case '2':
                    $scope.noWifiLte(0,'startCaptureCtrl',device);
                    break;
                case '3':
                    $scope.noWifiLte(2,'restartCaptureCtrl',device);
                    break;
                case '4':
                    $scope.noWifiLte(1,'closeCaptureCtrl',device);
                    break;
                case '5':
                    $scope.noWifi(3,'restartSystemCtrl',device);
                    break;
                case '6':
                    $scope.noWifi(8,'sameClockCtrl',device);
                    break;
                case '7':
                    $scope.noWifiLte(4,'catchPointCtrl',device)
                    break;
                case '8':
                    break;
                }
            
        };  

    });
    
    




    function setMap(centerLongitude,centerLatitude,zoom,markers){
        $scope.mapOptions.center.longitude= centerLongitude||$scope.mapOptions.center.longitude,
        $scope.mapOptions.center.latitude= centerLatitude||$scope.mapOptions.center.latitude;
        $scope.mapOptions.zoom= zoom||11;
        if(!!markers){
            $scope.mapOptions.markers=markers;
        }
        $scope.mapOptions.isUpdate=!$scope.mapOptions.isUpdate;
        //$scope.$apply();
    }
    

    //点击定位时与系统设置的经纬度一致
    $scope.setCenter = function() {    
	    $scope.device.name="";             //选择后点击返回中心点时清空里边的内容 
	    $http.post('/system/settingsAction!getSettings.action').then(function(resp){           //从系统设置那调的api
            setMap(resp.data.map_center_lon,resp.data.map_center_lat,resp.data.map_focus);   //再调用setMap
	    });
    }  
    

    $scope.setSearch = function(device){
        var d=angular.copy(device);
        d.modelId=d.type;
        d.identity= d.id;
        ModalService.showModal({
            templateUrl: 'modals/devicedManage/setQuery.html',
            controller: 'setQueryCtrl',
            inputs: { 
                row: d
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {
				
            });
        });

    };

    $scope.noWifiLte = function(type,modalCtrl,device){
        device['identity'] = device['id'];
        var rows = [];
        rows.push(device);
        
        //if( 39!=device.modelId && 40!=device.modelId && 41!=device.modelId){
        if(39!=device.modelId) {
            //要求 设备类型数组 中不包含 'SPID-WIFI'，'SPID-FDD-LTE'，'SPID-TDD-LTE' 的字符串才启动模态框
            ModalService.showModal({
                templateUrl: 'modals/devicedManage/addTask.html',
                controller: modalCtrl,
                inputs: { 
                    rows: rows,
                    type: type
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {

                    /*if(typeof(result) != 'undefined'){

                        usSpinnerService.spin('spinner-1');

                        var timer = $interval(function(){
                            $http({  
                                url:'/device/deviceBus!resultConfig.action',
                                method:'POST',
                                params:{ id : result }
                            }).then(function(resp){
                                if(resp.data.status == 'success'){
                                    alert('任务成功！');
                                    $scope.stop();
                                    usSpinnerService.stop('spinner-1');
                                }
                            });

                        },1000,3);
                        
                        $scope.stop = function() {
                            $interval.cancel(timer);
                        };


                      timer.then(function(resp){
                          $scope.stop();
                          usSpinnerService.stop('spinner-1');
                          alert('任务失败！');
                      });

                    }
                    */
                });
            });

        }else{
            alert('设备类型为WIFI或LTE的设备不能执行该操作！');
        }
        

    };

    //[{"code":"SPID-GSM2","id":7,"name":"SPID-GSM-900","typeId":5},{"code":"SPID-TD-SCDMA","id":31,"name":"SPID-TD-SCDMA","typeId":5},{"code":"SPID-WCDMA","id":32,"name":"SPID-WCDMA","typeId":5},{"code":"SPID-CDMA","id":33,"name":"SPID-CDMA","typeId":5},{"code":"SPID-WIFI","id":39,"name":"SPID-WIFI","typeId":5},{"code":"SPID-FDD-LTE","id":40,"name":"SPID-FDD-LTE","typeId":5},{"code":"SPID-TDD-LTE","id":41,"name":"SPID-TDD-LTE","typeId":5}]
    $scope.noWifi = function(type,modalCtrl,device){
            device['identity'] = device['id'];
            var rows = [];
            rows.push(device);
            if( 39!=device.modelId ){
                //要求 设备类型数组 中不包含 'SPID-WIFI' 的字符串才启动模态框
                ModalService.showModal({
                    templateUrl: 'modals/devicedManage/addTask.html',
                    controller: modalCtrl,
                    inputs: { 
                        rows: rows,
                        type: type
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function(result) {

                        /*if(typeof(result) != 'undefined'){

                            usSpinnerService.spin('spinner-1');

                            var timer = $interval(function(){
                                $http({  
                                    url:'/device/deviceBus!resultConfig.action',
                                    method:'POST',
                                    params:{ id : result }
                                }).then(function(resp){
                                    if(resp.data.status == 'success'){
                                        alert('任务成功！');
                                        $scope.stop();
                                        usSpinnerService.stop('spinner-1');
                                    }
                                });

                            },1000,3);
                            
                            $scope.stop = function() {
                                $interval.cancel(timer);
                            };

                          timer.then(function(resp){
                              $scope.stop();
                              usSpinnerService.stop('spinner-1');
                              alert('任务失败！');
                          });

                        }
 */
                    });
                });

            }else{
                alert('设备类型为WIFI的设备不能执行该操作！');
            }

    };
});