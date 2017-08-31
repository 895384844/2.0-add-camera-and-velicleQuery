var accompanyAnalysisModule = angular.module('accompanyAnalysisModule', ['gridModule']);
accompanyAnalysisModule.controller('accompanyAnalysisCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService, usSpinnerService ){
    $scope.top = (angular.element('.form').prop('offsetHeight') + 30) + 'px';
    //遍历所有的组设备
	 $http({
	        url:'/device/deviceAction!getDeviceGroup.action',
	        method:'POST'
	  }).then(function(resp){
	        $scope.groupArray = resp.data;
	    });
	//初始化变量
    $scope.accompany = {
        atype:'known',
        targetEid : '',
        groupId : '',
        startTime : '',
        endTime : '',
        serialNumber : '',
        type : 'imsi'
    };
    $scope.conditionArray = [];

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
            { field: 'imei',displayName: 'IMEI',maxWidth:400,minWidth:200  },
            { field: 'imsi',displayName: 'IMSI',maxWidth:400,minWidth:200  },
            { field: 'similar',displayName: '轨迹相似度',maxWidth:400,minWidth:200 },
            { 
            	field: 'operation',
            	displayName: '详情查询',
            	maxWidth:400,minWidth:200,
            	cellTemplate: '<a class="btnIcon btn-search" href ng-click="grid.appScope.searchDetails(row.entity)" uib-tooltip="详情查询" tooltip-placement="left"></a>'
            }
        ]
    };
    
    
    

    var getPostData=function(){
        var postData ={
            timeSpan : 120
        }
        postData.startTimes=$filter('date')($scope.accompany.startTime, 'yyyy-MM-dd HH:mm')+":00";
        postData.endTimes=$filter('date')($scope.accompany.endTime, 'yyyy-MM-dd HH:mm')+":59";
        if($scope.accompany.atype=='known'){
            var startArray = [];
            var endArray = [];
            var groupIdArray=[];
            for (var i = 0; i < $scope.conditionArray.length; i++) {
                startArray.push($filter('date')($scope.conditionArray[i].startTime, 'yyyy-MM-dd HH:mm')+":00");
                endArray.push($filter('date')($scope.conditionArray[i].endTime, 'yyyy-MM-dd HH:mm')+":59");
                groupIdArray.push($scope.conditionArray[i].groupId);
            }
            postData.startTimes=startArray.join(',');
            postData.endTimes=endArray.join(',');
            postData.groupId=groupIdArray.join(',');
        }
        if($scope.accompany.type=='imsi'){
            postData.imsi= $scope.accompany.serialNumber;
        }else{
            postData.imei= $scope.accompany.serialNumber;
        }
       
        return postData;
    }

    $scope.gridOptions.onRegisterApi = function(gridApi){
        $scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.gridOptions.paginationPageSize=pageSize;
            var postData=getPostData();
            postData.page=newPage;
            postData.rows=pageSize;
            var promise = gridServices.promiseNew('/query/query/traceLogAction!collisionSiderAnalyze.action',postData); 
            $scope.getPage(promise);
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
            
            $scope.gridOptions.data = [];
            for(var i=0; i<list.length; i++){
                var obj = {
                	'targetEid' : list[i]['eid'],
                    'imei' : list[i]['imei'],
                    'imsi' : list[i]['imsi'],
                    'similar' : parseInt(list[i]['similar'])+'%'
                    
                };
                $scope.gridOptions.data.push(obj);
            }
        });
        $scope.rows = null;
    };
    $scope.search = function(){
    	var postData=getPostData();
    	usSpinnerService.spin('spinner-1');
        postData.page=$scope.gridApi.pagination.getPage();
        postData.rows=$scope.gridOptions.paginationPageSize;
        var promise = gridServices.promiseNew('/query/query/traceLogAction!collisionSiderAnalyze.action',postData);
        $scope.getPage(promise);
        $scope.gridApi.pagination.seek(1);
   
    };
    $scope.searchDetails = function(item){ 
        var postData=getPostData()
        postData.targetEid=item.targetEid;
        var gridHeight=angular.element('.grid').height();
        ModalService.showModal({
            templateUrl: 'modals/accompanyAnalysis/details.html',
            controller : 'detailsCtrl',
            inputs: {
                postData: postData
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {
                angular.element('.grid').css('height',gridHeight);
            });
        });
        
	};
    $scope.showCondition = function(){
        ModalService.showModal({
            templateUrl: 'modals/collisionAnalysis/filter.html',
            controller: 'collisionFilterModalCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {     
                if(typeof(result) !== 'undefined'){
                    $scope.conditionArray.push(result);
                }
            });
        });
    }

    $scope.removeCondition = function(index) {
        $scope.conditionArray.splice(index,1); 
        angular.element('.grid').trigger('resize')
    }

    $scope.known = true;
    $scope.unknown = false;
    $scope.tab = function() {
        $scope.known = !$scope.known;
        $scope.unknown = !$scope.unknown;
    }
});