modalModule.controller('showCharCtrl',function($scope, $timeout, gridServices,postData, close){
    $scope.echartOptions = {
        color: ['#7cb5ec'],
        title: {
            text: '设备流量统计分析图形展示'
        },
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: [],//xPoints,  
            'axisLabel':{  
                interval: 'auto'  
            }  
        }],
        yAxis: [{
            type: 'value'
        }],
        series: [{
            name: '总量',
            type: 'line',
            data: []//sPoints
        }]
    };
 

    var promise = gridServices.promiseNew('/query/query/statisticsAction!analyzeStatisForChart.action',postData);

    promise.then(function(resp){
        var points=resp.data;
        if (resp.data.length != 0) {
            
            var xPoints = [];
            var sPoints = [];

            for(var i=0; i<points.length; i++){
                xPoints.push(points[i]['startTime']);
                sPoints.push(points[i]['total']);
            }
            $scope.echartOptions.xAxis[0].data=xPoints;
            $scope.echartOptions.series[0].data=sPoints;

        }else{
            alert('无图表显示！');
        }
    });   

    $scope.close = function(result) {
 	    close(result,500); 
    };
});

modalModule.controller('downLoadCtrlTraffic',function($scope, $http, gridServices, rows ,close){

    $scope.list = rows;

	$scope.downLoad = function(index){

        var obj = { fileName : $scope.list[index]};        
        document.location.href = gridServices.exportAction('/system/downloadAction!downloadFile.action',obj); 
        
	};

	$scope.close = function(result) {
 	    close(result,500);  
    };
});

