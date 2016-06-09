angular.module('starter.services', [])

.service('VideoService', function($q, CloudinaryConfigs, $cordovaFileTransfer) {
    // TBD
var deferred = $q.defer();
var promise = deferred.promise;

promise.success = function(fn) {
	promise.then(fn);
	return promise;
};
promise.error = function(fn) {
	promise.then(null, fn);
	return promise;
};

// Resolve the URL to the local file
// Start the copy process
function createFileEntry(fileURI) {
	console.log("createFileEntry:::"+fileURI);
	window.resolveLocalFileSystemURL(fileURI, function(entry) {
		return copyFile(entry);
	}, fail);
}

// Create a unique name for the videofile
// Copy the recorded video to the app dir
function copyFile(fileEntry) {
	var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
	var newName = makeid() + name;
	

	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
			fileEntry.copyTo(fileSystem2, newName, function(succ) {
				return onCopySuccess(succ);
			}, fail);
		},
		fail
	);
}

// Called on successful copy process
// Creates a thumbnail from the movie
// The name is the moviename but with .png instead of .mov
function onCopySuccess(entry) {
	var name = entry.nativeURL.slice(0, -4);
	console.log(name+":::name");
	window.PKVideoThumbnail.createThumbnail (entry.nativeURL, name + '.png', function(prevSucc) {
		return prevImageSuccess(prevSucc);
	}, fail);
}

// Called on thumbnail creation success
// Generates the currect URL to the local moviefile
// Finally resolves the promies and returns the name
function prevImageSuccess(succ) {
	var correctUrl = succ.slice(0, -4);
	correctUrl += '.mp4';
	deferred.resolve(correctUrl);
}

// Called when anything fails
// Rejects the promise with an Error
function fail(error) {
	console.log('FAIL: ' + error.code);
	deferred.reject('ERROR');
}

// Function to make a unique filename
function makeid() {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for ( var i=0; i < 5; i++ ) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
  console.log(text);
	return text;
}

// The object and functions returned from the Service
return {
	// This is the initial function we call from our controller
	// Gets the videoData and calls the first service function
	// with the local URL of the video and returns the promise
	saveVideo: function(data) {
		createFileEntry(data[0].localURL);
		return promise;
	},
	uploadVideo: function (imageURI) {
      //  console.log("imagedata:::::"+imageURI);
            console.log('start upload image.'+imageURI);
            var deferred = $q.defer();
            var fileSize;
            var percentage;
            window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
              fileEntry.file(function(fileObj) {
                fileSize = fileObj.size;

                uploadFile();
              });
            });
            //uploadFile();
            function uploadFile() {
              console.log(CloudinaryConfigs.upload_preset+":::::CloudinaryConfigs:::"+CloudinaryConfigs.api_url);
              var uploadOptions = {
                params : { 'upload_preset': CloudinaryConfigs.upload_preset,
                            'folder': 'picsee',
							'resource_type': "video"
                        }
              };
              $cordovaFileTransfer
                .upload(CloudinaryConfigs.api_url, imageURI, uploadOptions)
                .then(function(result) {
                  //ionicToast.show('Uploaded !! ', 'top', false, 1000);
				  console.log("uploaded");
                 // $cordovaProgress.hide();
                  var response = JSON.parse(decodeURIComponent(result.response));
                  console.log(JSON.stringify(response));
                  //var cropped_url = CloudinaryConfigs.base_url+"/c_fit,h_220,e_brightness_hsb,g_south_east,l_picsee:logo,w_180/v"+response.version+"/"+response.public_id+".jpg";
                  deferred.resolve({'response':response});
                }, function(err) {
                  // Uh oh!
				  console.log(err);
                  //$ionicLoading.show({template : 'Failed.', duration: 3000});
                  deferred.reject(err);
                }, function (progress) {
                  percentage = Math.floor(progress.loaded / fileSize * 100);
				  console.log('Processing : ' + percentage + '%');
                  //$cordovaProgress.showBarWithLabel(true, 10000, 'Processing : ' + percentage + '%')
                  //ionicToast.show('Processing : ' + percentage + '%', 'top', false, 10000);
                });
            }
            return deferred.promise;
      }
};
});
