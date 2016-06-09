angular.module('starter.controllers',[])

.controller('VideoCtrl', function($scope, $cordovaCapture, VideoService) {
    // TBD
    $scope.clip = '';
    $scope.captureVideo = function() {
      var options = { limit: 1, duration: 15 };
	     $cordovaCapture.captureVideo(options).then(function(videoData) {

      console.log(JSON.stringify(videoData));
			
			angular.forEach(videoData, function(val,key){
				console.log(val.fullPath);
				$scope.clipSrc =val.fullPath ;
				VideoService.uploadVideo(val.fullPath).then(function(result){
      // console.log("Response Inside create controller:::"+response);
      console.log("::::full url::"+result.response.secure_url);      
    });
				
			// 	VideoService.saveVideo(videoData).success(function(data) {
      //        console.log(data);
			// 			 var newpath = "file:"+data;
			      
				
			// });		       
       // $scope.$apply();
		 });
	});
 };


$scope.showClip = function(clip) {
	console.log('show clip: ' + clip);
};
});
