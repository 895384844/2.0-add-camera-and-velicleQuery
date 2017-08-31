var utilityModule = angular.module('utilityModule', []);
utilityModule.service('utilityServices',function() {
    
    this.clone = function(o) {
        var k, ret = o, b;
        if(o && ((b = (o instanceof Array)) || o instanceof Object)) {
            ret = b ? [] : {};
            for(k in o){
                if(o.hasOwnProperty(k)){
                    ret[k] = this.clone(o[k]);
                }
            }
        }
        return ret;
    }
});