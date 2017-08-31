var wifiModule = angular.module('wifiModule', ['gridModule']);
wifiModule.controller('wifiCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService,usSpinnerService){

    $http({
        url:'/device/deviceAction!getDeviceGroup.action',
        method:'POST'
    }).then(function(resp){
        $scope.groupArray = resp.data;
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
        rowHeight : 35,
        columnDefs : [
	        { field: 'deviceName',displayName: '采集设备名称',maxWidth:300,minWidth:100 },
	        { field: 'deviceNum',displayName: '采集设备编号',maxWidth:300,minWidth:100 },
	        { field: 'deviceAddress',displayName: '采集设备地址',maxWidth:300,minWidth:100 },
	        { field: 'date',displayName: '采集时间',maxWidth:300,minWidth:100 },
	        { field: 'mac',displayName: 'Mac地址',maxWidth:300,minWidth:100 }
	    ]
    };

    $scope.promise = gridServices.promiseNew('/query/wifiInfo!listWifiInfo.action',{
        page : 1,
        rows: 20,
        sort: 'date',
        order: 'desc'
    });

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/query/wifiInfo!listWifiInfo.action',{
                groupId : $scope.wifi.groupId,
                mac : $scope.wifi.mac,
                startDate : $filter('date')($scope.wifi.startDate, 'yyyy-MM-dd HH:mm:ss'),
                closeDate : $filter('date')($scope.wifi.closeDate, 'yyyy-MM-dd HH:mm:ss'),
                page: newPage,
                rows: pageSize,
                sort: 'date',
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
            usSpinnerService.stop('spinner-1');
            var list = resp.data.rows;
            
            var netTypeMap = {   //终端网络类型字典
                '0' : 'GSM',
                '2' : 'TD-SCDMA',
                '4' : 'WCDMA',
                '8' : 'TDD-LTE',
                '7' : 'FDD-LTE',
                'A' : 'CDMA'
            };
            var netProviderMap = {  //终端网络提供商字典
                '0' : '移动',
                '1' : '联通',
                '2' : '电信',
                '3' : '其他'
            };
            
            var dataArray = [];
            for(var i=0; i<list.length; i++){
               
               for(var netTypeKey in netTypeMap){
                   if( netTypeKey == list[i]['netType'] ){
                       list[i]['netType'] = netTypeMap[netTypeKey];
                   }
               }
               for(var phoneKey in netProviderMap){
                   
                   if( phoneKey == list[i]['netProvider'] ){
                       list[i]['netProvider'] = netProviderMap[phoneKey];
                   }
               }
                var obj = {
                    date : list[i]['date'],
                    mac : list[i]['mac'],
                    deviceAddress : list[i]['deviceAddress'],
                    deviceName : list[i]['deviceName'],
                    deviceNum : list[i]['deviceNum']
                };
                var map = list[i]['device'];
                for(var key in map){
                    obj[key] = map[key];
                }
                dataArray.push(obj);
            }
            
            $scope.gridOptions.data = dataArray;
		});
        $scope.rows = null;
	};
    $scope.getPage($scope.promise);
    $scope.wifi = {
        groupId : '',
        mac : '',
        startDate : '',
        closeDate : ''
    };
    $scope.endDateBeforeRender = function ($view, $dates) {
        if ($scope.wifi.startDate) {               
            var activeDate = moment($scope.wifi.startDate).subtract(1, $view).add(1, 'minute');
            $dates.filter(function (date) {
                  return date.localDateValue() <= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };
    $scope.startDateOnSetTime = function () {
        $scope.$broadcast('start-date-changed');
    };
    $scope.endDateOnSetTime = function () {
        $scope.$broadcast('end-date-changed');
    };
    
    $scope.startDateBeforeRender = function ($dates) {
           
        if ($scope.wifi.closeDate) {
                
            var activeDate = moment($scope.wifi.closeDate);

            $dates.filter(function (date) {
                  return date.localDateValue() >= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };
    $scope.search = function(){
    	usSpinnerService.spin('spinner-1');
        var obj = {
            groupId : $scope.wifi.groupId,
            mac : $scope.wifi.mac,
            startDate : $filter('date')($scope.wifi.startDate, 'yyyy-MM-dd HH:mm:ss'),
            closeDate : $filter('date')($scope.wifi.closeDate, 'yyyy-MM-dd HH:mm:ss'),
            page : 1,
            rows : 20,
            sort: 'date',
            order: 'desc'
        };
        $scope.promise = gridServices.promiseNew('/query/wifiInfo!listWifiInfo.action',obj);
        $scope.getPage($scope.promise);
        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
        
    };

});