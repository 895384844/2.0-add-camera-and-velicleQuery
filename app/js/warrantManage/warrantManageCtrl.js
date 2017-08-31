var warrantManageModule = angular.module('warrantManageModule', ['gridModule']);
warrantManageModule.controller('warrantManageCtrl',function($scope, $http, $filter, gridServices, ModalService){

    //实现表格呈现
    $scope.paginationOptions = {
        pageNumber: 1,
        pageSize: 10,
        sort: null
    };
    $scope.gridOptions = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        useExternalPagination: true,
        enableSorting: false,
        enableColumnResize: true,
        multiSelect: true,
        multiSelect: true,
        rowHeight : 35
    };
    
    $scope.promise = gridServices.promiseDefault('/system/licenseAction!showLicenseHistory.action',{
        page : 1,
        rows: 10,
        sort: 'id',
        order: 'desc'
    });
    
    $scope.gridOptions.columnDefs = [
        { field: 'id',displayName: 'ID',maxWidth:300,minWidth:100 },
        { field: 'username',displayName: '用户名',maxWidth:300,minWidth:100 },
        { field: 'from_time',displayName: '时间从',maxWidth:300,minWidth:100 },
        { field: 'to_time',displayName: '时间到',maxWidth:300,minWidth:100 },
        { field: 'device_count',displayName: '设备数量',maxWidth:300,minWidth:100 },
        { field: 'hwid',displayName:'硬件信息',maxWidth:300,minWidth:100},
        { field: 'signature',displayName: '密钥',maxWidth:300,minWidth:100 }, //  这个地方的密钥在现有api文档中未发现，先占位后修改
        { field: 'update_time',displayName: '导入日期',maxWidth:300,minWidth:100 }
    ];

    $scope.gridOptions.onRegisterApi = function(gridApi){
        $scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/system/licenseAction!showLicenseHistory.action',{
            	startDate : $filter('date')($scope.data.dateDropDownInputStart, 'yyyy-MM-dd HH:mm:ss'),
                closeDate : $filter('date')($scope.data.dateDropDownInputEnd, 'yyyy-MM-dd HH:mm:ss'),
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
            $scope.gridOptions.data = resp.data.rows;
            for(var i=0; i<$scope.gridOptions.data.length; i++){
                if($scope.gridOptions.data[i]['male'] == 1){
                    $scope.gridOptions.data[i]['male'] = '男';
                }else{
                    $scope.gridOptions.data[i]['male'] = '女';
                }
            }
        });
        $scope.rows = null;
    };

    $scope.getPage($scope.promise);

    $scope.power = {id :''};
    $scope.data = {
        dateDropDownInputStart :'',
        dateDropDownInputEnd :''
    };

    $scope.endDateBeforeRender = function ($view, $dates) {
           
        if ($scope.data.dateDropDownInputStart) {               
            var activeDate = moment($scope.data.dateDropDownInputStart).subtract(1, $view).add(1, 'minute');
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
           
        if ($scope.data.dateDropDownInputEnd) {
                
            var activeDate = moment($scope.data.dateDropDownInputEnd);

            $dates.filter(function (date) {
                  return date.localDateValue() >= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };

    $scope.search = function(){
    	var obj = {
            startDate : $filter('date')($scope.data.dateDropDownInputStart, 'yyyy-MM-dd HH:mm:ss'),
            closeDate : $filter('date')($scope.data.dateDropDownInputEnd, 'yyyy-MM-dd HH:mm:ss'),
            page : 1, 
            rows : 10,
            sort : 'id',
            order: 'desc'
        };
        $scope.promise = $http({
			url:'/system/licenseAction!showLicenseHistory.action',
			method:'POST',
			params: obj
		});
        $scope.getPage($scope.promise);
        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };
    $scope.clear = function(){
        $scope.power.id = '';
        $scope.data = {
            dateDropDownInputStart :'',
            dateDropDownInputEnd :''
        };
    };

    $scope.import = function(){
        ModalService.showModal({
            templateUrl: 'modals/warrantManage/import.html',
            controller: 'importLicenseCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {
                $scope.promise = gridServices.promiseDefault('/system/licenseAction!showLicenseHistory.action');
                $scope.getPage($scope.promise);
            });
        });
    };

});