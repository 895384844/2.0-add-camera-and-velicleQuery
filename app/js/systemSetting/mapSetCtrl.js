var mapSetModule = angular.module('mapSetModule', []);
mapSetModule.controller('mapSetCtrl',function($scope, $http){
    $http({
		url:'/system/settingsAction!getSettings.action',
		method:'POST'
	}).then(function(resp){
//		console.log(resp.data);
        $scope.map = {
        	map_focus_min : resp.data.map_focus_min,
        	map_focus_max : resp.data.map_focus_max,
//          map_focus : resp.data.map_focus,
            map_center_lon : resp.data.map_center_lon,
            map_center_lat : resp.data.map_center_lat, 
            map_focus_default : resp.data.map_focus_default,           
        };
        
        var radio1 = document.getElementById("offline");
	    var radio2 = document.getElementById("online");
	    var map_status = localStorage.getItem("isMapOnline");
	                                	               
        if(map_status == 'false'){
        	radio1.checked = true;
        	radio2.checked = false;
        }else{
        	radio1.checked = false;
        	radio2.checked = true;
        }
       
        $scope.sure = function(){
        	var array = [];
            for(var key in $scope.map){
                var list = key + ':' + $scope.map[key];
                array.push(list);
            } 
             
         

            
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
                    localStorage.setItem("isMapOnline",radio2.checked);
                    if(!radio2.checked){
                    	var keys=Object.keys(localStorage);
						for(var i=0; i<keys.length; i++){
							if(keys[i].indexOf('BMap')>=0){
								localStorage.removeItem(keys[i])
							}
						}
                    }
                    location.reload();                   
                }
            });
        };
	});
});