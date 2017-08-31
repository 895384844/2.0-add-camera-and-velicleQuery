var deviceManageModule = angular.module('deviceManageModule', ['gridModule']);

deviceManageModule.controller('deviceManageCtrl',function($scope, $http, ModalService, gridServices){
	
	
	$http({
        url:'/device/deviceAction!getDeviceGroup.action',
        method:'POST'
    }).then(function(resp){
        $scope.groupArray = resp.data;
    });

    $scope.device = {
        name : '',
        number : '',
        ip : '',
        cardNumber : '',
        address : '',
        type : '',
        domain : '',
        groupId : '',
        last_report_time : ''
    };

    $scope.domainId = '';
	
    $http.post('/system/scopeAction!listScope.action').then(function(resp){
        $scope.roleList = resp.data;
    });

    $scope.$watch( 'mytree.currentNode', function( newObj, oldObj ) {
        if( $scope.mytree && angular.isObject($scope.mytree.currentNode) ) {
            $scope.device.domain = $scope.mytree.currentNode.sname;   
            $scope.domainId = $scope.mytree.currentNode.sid;
        }
    }, false);

    $scope.$watch('device.domain',function(newValue, oldValue){
        if(newValue == ''){
            $scope.domainId = '';
        }
    });

    $http({
		url:'/system/businessDictionaryAction!getChildrenByParentTypeName.action',
		method:'POST',
		params: { code : 'DeviceModel'}
	}).then(function(resp){
        $scope.devicedTypeList = resp.data;
	});

    //实现表格呈现
	$scope.paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };
	$scope.gridOptions = {
        paginationPageSizes: [20, 30],
        paginationPageSize: 20,
        useExternalPagination: true,
        enableSorting: false,
        enableColumnResize: true,
        multiSelect: true,
        rowHeight : 35
    };

    $scope.promise = gridServices.promiseNew('/device/deviceAction!getScopeDevice.action',{
        page: 1,
        rows: 20,
        sort: 'identity',
        order: 'desc'
    });

    var str = "'hidden'";
    var green = "'btnGreen'";
    var gray = "'btnGray'";

    $scope.gridOptions.columnDefs = [
        { field: 'name',displayName: '设备名称',maxWidth:150,minWidth:90 },
        { field: 'number',displayName: '设备编号',maxWidth:150,minWidth:90 },
        { field: 'longitude',displayName: '设备经度',maxWidth:150,minWidth:90 },
        { field: 'latitude',displayName: '设备纬度',maxWidth:150,minWidth:90 },
        { 
            field: 'btnGroup',
            displayName: '设备心跳状态', 
            maxWidth:150,minWidth:110,
            cellTemplate: '<span class="btnIcon" ng-class="{ ' + gray + ' : !row.entity.isonLine,' + green + ': !!row.entity.isonLine}"></span>'
        },
        { 
            field: 'btnGroup',
            displayName: 'BTS在线状态', 
            maxWidth:150,minWidth:110,
            cellTemplate: '<div ng-if="!row.entity.bts&&!row.entity.isonLine" class="bts-status">N/A</div> <span ng-if="!!row.entity.isonLine" class="btnIcon" ng-class="{ ' + gray + ' : !row.entity.bts,' + green + ': !!row.entity.bts}"></span>'
        },
        { field: 'last_report_time',displayName: '最后一次上号时间',maxWidth:150,minWidth:130 },
        { field: 'ip',displayName: 'ip地址',maxWidth:150,minWidth:90 },
        { field: 'numberNetCart',displayName: '上网卡号码',maxWidth:150,minWidth:90 },
        { field: 'modelId',displayName: '设备类型',maxWidth:150,minWidth:90 },
        { field: 'address',displayName: '设备地址',maxWidth:150,minWidth:90 },
        { field: 'memo',displayName: '设备描述',maxWidth:150,minWidth:90 },
        { field: 'scopeName',displayName: '管理域',maxWidth:150,minWidth:90 },
        { field: 'groupId',displayName: '组编号',maxWidth:150,minWidth:90 },
        
        { 
        	field: 'btnGroup',
        	displayName: '设备操作',
        	maxWidth:150,minWidth:90,
        	cellTemplate: '<a class="btnIcon btn-edit" href ng-click="grid.appScope.edit(row.entity)" uib-tooltip="编辑" tooltip-placement="left"></a><a class="btnIcon btn-gear" href ng-class="{ ' + str + ' : grid.appScope.isOpen(row.entity) }" ng-click="grid.appScope.setSearch(row.entity)" uib-tooltip="设置" tooltip-placement="left"></a><a class="btnIcon btn-alarm" href ng-click="grid.appScope.alarmSearch(5,row.entity)" uib-tooltip="实时告警查询" tooltip-placement="left"></a>'
        }
    ];

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/device/deviceAction!getScopeDevice.action',{
                number : $scope.device.number,
                ip : $scope.device.ip,
                modelId : $scope.device.type,
                address : $scope.device.address,
                name : $scope.device.name,
                numberNetCart : $scope.device.cardNumber,
                scopeId : $scope.domainId,
                groupId : $scope.groupId,
                last_report_time : $scope.last_report_time,
                page: newPage,
                rows: pageSize,
                sort: 'id',
                order: 'desc'
            });

	        $scope.getPage($scope.promise);
        });

        //表中行选择变化事件 
        gridApi.selection.on.rowSelectionChanged($scope,function(){
            $scope.rows = gridApi.selection.getSelectedRows();
            $scope.row = $scope.rows[0];
        });

        //表中行全选事件 
        gridApi.selection.on.rowSelectionChangedBatch($scope, function() {
            $scope.rows = gridApi.selection.getSelectedRows();
        });

	};

	$scope.getPage = function(promise){
		promise.then(function(resp){

            $scope.gridOptions.totalItems = resp.data.total;

            var list = resp.data.rows;

            var typeList = $scope.devicedTypeList;

            for(var i=0; i<list.length; i++){  // 对照设备类型（typeList）map，将 id 转换为 name

                var value = list[i]['modelId'];

                for(var j=0; j<typeList.length; j++){
                    if(typeList[j]['id'] == value){
                        list[i]['modelId'] = typeList[j]['name'];
                    }
                }
            }

            $scope.gridOptions.data = list;
		});
        $scope.rows = null;
	};

	$scope.getPage($scope.promise);

	$scope.edit =function(value){
		ModalService.showModal({
            templateUrl: 'modals/devicedManage/edit.html',
            controller: 'editDeviceCtrl',
            inputs: { 
                row : value,
                typeList : $scope.devicedTypeList
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() { 
                $scope.promise = gridServices.promiseNew('/device/deviceAction!getScopeDevice.action',{
                    page: $scope.newPage ? $scope.newPage : 1,
                    rows: 20,
                    sort : 'id',
                    order: 'desc'
                });
                $scope.getPage($scope.promise);
            });
        });
	};

    $scope.isOpen = function(value){
        if(value.modelId == 'SPID-WIFI'){
            return true;
        }else{
            return false;
        }
    };

	$scope.setSearch = function(value){
        ModalService.showModal({
            templateUrl: 'modals/devicedManage/setQuery.html',
            controller: 'setQueryCtrl',
            inputs: { 
                row: value
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {
                $scope.promise = gridServices.promiseNew('/device/deviceAction!getScopeDevice.action',{
                    page: $scope.newPage ? $scope.newPage : 1,
                    rows: 20,
                    sort : 'id',
                    order: 'desc'
                });
                $scope.getPage($scope.promise);
            });
        });

	};
	

	$scope.alarmSearch = function(type,value){ 
        ModalService.showModal({
            templateUrl: 'modals/devicedManage/addTask.html',
            controller: 'alarmSearchCtrl',
            inputs: { 
                rows: value,
                type: type
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {
                $scope.promise = gridServices.promiseNew('/device/deviceAction!getScopeDevice.action',{
                    page: $scope.newPage ? $scope.newPage : 1,
                    rows: 20,
                    sort : 'id',
                    order: 'desc'
                });
                $scope.getPage($scope.promise);
            });
        });
	};

    $scope.search = function(){

        var obj = {
            page : 1,//当前页
            rows : 20,//当前每页显示数量
            sort : 'id',
            order: 'desc',
            number : $scope.device.number,
            ip : $scope.device.ip,
            modelId : $scope.device.type,
            address : $scope.device.address,
            name : $scope.device.name,
            numberNetCart : $scope.device.cardNumber,
            scopeId : $scope.domainId,
            groupId : $scope.device.groupId
        };

        $scope.promise = gridServices.promiseNew('/device/deviceAction!getScopeDevice.action',obj);
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);

    };

    $scope.export = function(){
        var obj = {
            number : $scope.device.number,
            ip : $scope.device.ip,
            modelId : $scope.device.type,
            address : $scope.device.address,
            name : $scope.device.name,
            numberNetCart : $scope.device.cardNumber,
            scopeId : $scope.domainId
        };
        document.location.href = gridServices.exportAction('/device/deviceAction!exportDeviceExcel.action',obj);
    };    
    $scope.device_downLoad = function(){
    	
    	document.location.href = gridServices.exportAction('/system/downloadAction!downloadDeviceTemplate.action');

	};

});

deviceManageModule.controller('devicedModalCtrl',function($scope, $http, $interval, usSpinnerService, ModalService, gridServices){

	$scope.add = function() {
        ModalService.showModal({
            templateUrl: 'modals/devicedManage/add.html',
            controller: 'addDeviceCtrl',
            inputs: { 
                typeList : $scope.devicedTypeList
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {             
                $scope.promise = gridServices.promiseNew('/device/deviceAction!getScopeDevice.action',{
                    page: $scope.newPage ? $scope.newPage : 1,
                    rows: 20,
                    sort : 'id',
                    order: 'desc'
                });
                $scope.getPage($scope.promise);
            });
        });
    };

    $scope.delete = function() {

        if( $scope.rows != null){
            ModalService.showModal({
                templateUrl: 'modals/delete.html',
                controller: 'deleteDeviceCtrl',
                inputs: { 
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {
                    $scope.promise = gridServices.promiseNew('/device/deviceAction!getScopeDevice.action',{
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20,
                        sort : 'id',
                        order: 'desc'
                    });
                    $scope.getPage($scope.promise);
                });
            });
        }else{
            alert('请至少选择一条删除！');
        }
    };

    $scope.noWifiLte = function(type,modalCtrl){

        if( $scope.rows != null){
            
            var deviceTypeArray = []; //设备类型数组
            for(var i=0; i<$scope.rows.length; i++){
                deviceTypeArray.push($scope.rows[i]['modelId']);
            }

            var boolA = deviceTypeArray.indexOf('SPID-WIFI') < 0;
            var boolB = deviceTypeArray.indexOf('SPID-FDD-LTE') < 0;
            var boolC = deviceTypeArray.indexOf('SPID-TDD-LTE') < 0 ;

            if(boolA){
                //要求 设备类型数组 中不包含 'SPID-WIFI'，'SPID-FDD-LTE'，'SPID-TDD-LTE' 的字符串才启动模态框
                ModalService.showModal({
                    templateUrl: 'modals/devicedManage/addTask.html',
                    controller: modalCtrl,
                    inputs: { 
                        rows: $scope.rows,
                        type: type
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function(result) {
                        $scope.promise = gridServices.promiseNew('/device/deviceAction!getScopeDevice.action',{
                            page: $scope.newPage ? $scope.newPage : 1,
                            rows: 20,
                            sort : 'id',
                            order: 'desc'
                        });
                        $scope.getPage($scope.promise);

                        //判断任务是否成功

                        // if(typeof(result) != 'undefined'){

                        //     usSpinnerService.spin('spinner-1');

                        //     var timer = $interval(function(){
                        //         $http({  
                        //             url:'/device/deviceBus!resultConfig.action',
                        //             method:'POST',
                        //             params:{ id : result }
                        //         }).then(function(resp){
                        //             if(resp.data.status == 'success'){
                        //                 alert('任务成功！');
                        //                 $scope.stop();
                        //                 usSpinnerService.stop('spinner-1');
                        //             }
                        //         });

                        //     },1000,3);
                            
                        //     $scope.stop = function() {
                        //         $interval.cancel(timer);
                        //     };


                        //     timer.then(function(resp){
                        //         $scope.stop();
                        //         usSpinnerService.stop('spinner-1');
                        //         alert('任务失败！');
                        //     });

                        // }
                        
                    });
                });

            }else{
                ModalService.showModal({
                    templateUrl: 'modals/message.html',
                    controller: 'messageCtrl',
                    inputs: { 
                        mes: '包含 WIFI,LTE 类型设备，不能启动该程序！'
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function(result) {
                        $scope.promise = gridServices.promiseNew('/device/deviceAction!getScopeDevice.action',{
                            page: $scope.newPage ? $scope.newPage : 1,
                            rows: 20,
                            sort : 'id',
                            order: 'desc'
                        });
                        $scope.getPage($scope.promise);
                    });
                });
            }

        }else{
            alert('请至少选择一条编辑！');
        }

    };

    $scope.noWifi = function(type,modalCtrl){

        if( $scope.rows != null){
            
            var deviceTypeArray = []; //设备类型数组
            for(var i=0; i<$scope.rows.length; i++){
                deviceTypeArray.push($scope.rows[i]['modelId']);
            }

            var boolA = deviceTypeArray.indexOf('SPID-WIFI') < 0;

            if( boolA ){
                //要求 设备类型数组 中不包含 'SPID-WIFI' 的字符串才启动模态框
                ModalService.showModal({
                    templateUrl: 'modals/devicedManage/addTask.html',
                    controller: modalCtrl,
                    inputs: { 
                        rows: $scope.rows,
                        type: type
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function(result) {
                        $scope.promise = gridServices.promiseNew('/device/deviceAction!getScopeDevice.action',{
                            page: $scope.newPage ? $scope.newPage : 1,
                            rows: 20,
                            sort : 'id',
                            order: 'desc'
                        });
                        $scope.getPage($scope.promise);
                        
                        //判断任务是否成功
                        
                        // if(typeof(result) != 'undefined'){

                        //     usSpinnerService.spin('spinner-1');

                        //     var timer = $interval(function(){
                        //         $http({  
                        //             url:'/device/deviceBus!resultConfig.action',
                        //             method:'POST',
                        //             params:{ id : result }
                        //         }).then(function(resp){
                        //             if(resp.data.status == 'success'){
                        //                 alert('任务成功！');
                        //                 $scope.stop();
                        //                 usSpinnerService.stop('spinner-1');
                        //             }
                        //         });

                        //     },1000,3);
                            
                        //     $scope.stop = function() {
                        //         $interval.cancel(timer);
                        //     };


                        //     timer.then(function(resp){
                        //         $scope.stop();
                        //         usSpinnerService.stop('spinner-1');
                        //         alert('任务失败！');
                        //     });

                        // }
                    });
                });

            }else{
                ModalService.showModal({
                    templateUrl: 'modals/message.html',
                    controller: 'messageCtrl',
                    inputs: { 
                        mes: '包含 WIFI 类型设备，不能启动该程序！'
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function(result) {
                        $scope.promise = gridServices.promiseNew('/device/deviceAction!getScopeDevice.action',{
                            page: $scope.newPage ? $scope.newPage : 1,
                            rows: 20,
                            sort : 'id',
                            order: 'desc'
                        });
                        $scope.getPage($scope.promise);
                    });
                });
            }

        }else{
            alert('请至少选择一条编辑！');
        }

    };
    
    $scope.import = function(){
        ModalService.showModal({
            templateUrl: 'modals/devicedManage/import.html',
            controller: 'importDeviceCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {
                $scope.promise = gridServices.promiseDefault('/device/deviceAction!getScopeDevice.action');
                $scope.getPage($scope.promise);
            });
        });
    };
});