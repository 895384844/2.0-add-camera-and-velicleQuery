var historyQueryModule = angular.module('historyQueryModule', ['gridModule']);
historyQueryModule.controller('historyQueryCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService,usSpinnerService){

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
	        { field: 'name',displayName: '采集设备名称',maxWidth:300,minWidth:100 },
	        { field: 'number',displayName: '采集设备编号',maxWidth:300,minWidth:100 },
	        { field: 'address',displayName: '采集设备地址',maxWidth:300,minWidth:100 },
	        { field: 'date',displayName: '采集时间',maxWidth:300,minWidth:100 },
	        { field: 'imei',displayName: 'IMEI',maxWidth:300,minWidth:100 },
	        { field: 'imsi',displayName: 'IMSI',maxWidth:300,minWidth:100 },
	        { field: 'phoneNumPrifix',displayName: '手机号码',maxWidth:300,minWidth:100 },
	        { field: 'attribution',displayName: '归属地',maxWidth:300,minWidth:100 },
	        { field: 'netType',displayName: '终端网络类型',maxWidth:300,minWidth:100 },
	        { field: 'netProvider',displayName: '终端网络提供商',maxWidth:300,minWidth:100 }
	    ]
    };

    $scope.promise = gridServices.promiseNew('/query/query/acquisitionRecordAction!listAcquisitionRecord.action',{
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
            
            $scope.promise = gridServices.promiseNew('/query/query/acquisitionRecordAction!listAcquisitionRecord.action',{
                groupId : $scope.history.groupId,
                imei : $scope.history.imei,
                imsi : $scope.history.imsi,
                phoneNumPrifix: $scope.history.phoneNumPrifix,
                startDate : $filter('date')($scope.history.startTime, 'yyyy-MM-dd HH:mm:ss'),
                closeDate : $filter('date')($scope.history.endTime, 'yyyy-MM-dd HH:mm:ss'),
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
            if(resp.data.total == 0){alert("没有匹配的结果!");}
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
                    attribution : list[i]['attribution'],
                    date : list[i]['date'],
                    imei : list[i]['imei'],
                    imsi : list[i]['imsi'],
                    netProvider : list[i]['netProvider'],
                    netType : list[i]['netType'],
                    phoneNumPrifix : list[i]['phoneNumPrifix']
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
    $scope.history = {
        groupId : '',
        imsi : '',
        imei : '',
        startTime : '',
        endTime : '',
        phoneNumPrifix : ''
    };
    $scope.endDateBeforeRender = function ($view, $dates) {
        if ($scope.history.startTime) {               
            var activeDate = moment($scope.history.startTime).subtract(1, $view).add(1, 'minute');
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
           
        if ($scope.history.endTime) {
                
            var activeDate = moment($scope.history.endTime);

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
            groupId : $scope.history.groupId,
            imei : $scope.history.imei,
            imsi : $scope.history.imsi,
            phoneNumPrifix: $scope.history.phoneNumPrifix,
            startDate : $filter('date')($scope.history.startTime, 'yyyy-MM-dd HH:mm:ss'),
            closeDate : $filter('date')($scope.history.endTime, 'yyyy-MM-dd HH:mm:ss'),
            page : 1,
            rows : 20,
            sort: 'date',
            order: 'desc'
        };
        $scope.promise = gridServices.promiseNew('/query/query/acquisitionRecordAction!listAcquisitionRecord.action',obj);
        $scope.getPage($scope.promise);
        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
        
    };

    $scope.export = function(){
        var obj = {
            groupId : $scope.history.groupId,
            imei : $scope.history.imei,
            imsi : $scope.history.imsi,
            startDate : $filter('date')($scope.history.startTime, 'yyyy-MM-dd HH:mm:ss'),
            closeDate : $filter('date')($scope.history.endTime, 'yyyy-MM-dd HH:mm:ss')
        };
        httpServices.promise('/query/query/acquisitionRecordAction!countLength.action',obj).then(function(resp){
	        	if(resp.data.status == 'success'){
	                document.location.href = gridServices.exportAction('/query/query/acquisitionRecordAction!exportExcel.action',obj); 
	        	}else{
	        		httpServices.promise('/query/query/acquisitionRecordAction!exportExcel.action',obj).then(function(resp){
	        			if(resp.data){
	        				alert('后台正在准备数据，请稍后点击下载按钮！'); 
	        			}
	        		});
	        	}
	        });
    };
    $scope.downLoad = function(){
        $http.get('/system/downloadAction!listFileName.action').then(function(resp){
			if(resp.data){
                ModalService.showModal({
	                templateUrl: 'modals/downLoad.html',
	                controller: 'downLoadCtrlHistory',
	                inputs: { 
	                    rows: resp.data 
	                }
	            }).then(function(modal) {
	                modal.element.modal();
	                modal.close.then(function(result) {
	                });
	            });
			}
		});
	};

});