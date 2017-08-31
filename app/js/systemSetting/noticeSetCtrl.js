var noticeSetModule = angular.module('noticeSetModule', []);
noticeSetModule.controller('noticeSetCtrl',function($scope, $http, ModalService){

    $http({
		url:'/system/settingsAction!getSettings.action',
		method:'POST'
	}).then(function(resp){ 
        
        var obj = resp.data;
        $scope.notice = {
        	mail_sender_name : obj['mail_sender_name'],
        	mail_sender_password : obj['mail_sender_password'],
        	mail_server_addr : obj['mail_server_addr'],
        	mail_server_port : obj['mail_server_port']
        };

        $scope.timeArray = [];

        if(obj['device_alarm_end_time'] != null && obj['device_alarm_start_time'] != null){

            var end_time = obj['device_alarm_end_time'].split(',');
            var start_time = obj['device_alarm_start_time'].split(',');

            for(var i=0; i<end_time.length; i++){
                var timeObj = {
                    startTime : start_time[i],
                    endTime : end_time[i]
                };
                if(timeObj.startTime != '' && timeObj.endTime != ''){
                    $scope.timeArray.push(timeObj);
                }   
            }
        }

        $scope.addTime = function(){
            ModalService.showModal({
                templateUrl: 'modals/noticeSet/addTime.html',
                controller: 'addTimeCtrl'
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    if(!!result){
                    	for(var tri in $scope.timeArray){
                    		var timeRange=$scope.timeArray[tri]
                    		if( result.startTime==timeRange.startTime||
                    			result.endTime==timeRange.endTime||
                    			(result.startTime<timeRange.endTime&&result.startTime>timeRange.startTime)||
                    			(result.endTime<timeRange.endTime&&result.endTime>timeRange.startTime)||
                    			(result.startTime<timeRange.startTime&&result.endTime>timeRange.endTime)
                    		  ){
                    			alert("时间区间不能重叠！");
                    			return;
                    		}
                    		
                    	}
                        $scope.timeArray.push(result);
                    }
                });
            });
        };

        $scope.removeTime = function(index){
            $scope.timeArray.splice(index, 1);
        };

        $scope.sure = function(){
        	var array = [];

			for(var key in $scope.notice){
                var list = key + ':' + '"' + $scope.notice[key] +'"';
                array.push(list);
			}

            startTimeArray = [];
            endTimeArray = [];

            for(var i=0; i<$scope.timeArray.length; i++){
                startTimeArray.push($scope.timeArray[i]['startTime']);
                endTimeArray.push($scope.timeArray[i]['endTime']);
            }
            
            startTimeStr = 'device_alarm_start_time' + ':' + '"' + startTimeArray.join() + '"';
            endTimeStr = 'device_alarm_end_time' + ':' + '"' + endTimeArray.join() + '"';
            array.push(startTimeStr);
            array.push(endTimeStr);

			$http({
			    url:'/system/settingsAction!setSettings.action',
			    method:'POST',
			    params: {
			    	map : array.join()
			    }
		    }).then(function(resp){
		    	if(resp.data.msg != 'ok'){
                    alert('提交失败！');
                }else{
                    alert('提交成功！');
                }
		    });
        };


	});

});

