var services = angular.module('communityApp.services', []);

services.factory('BadmintonSvc', ['$rootScope', '$http', '$window', function($rootScope, $http, $window) {

    var badmintonServiceFunctions = {
        login: function(email, password) {
            return $http({
                    url: '/api/login',
                    method: "POST",
                    data: {email: email, password: password}
             });
        },

        logout: function() {
            return $http.get('/api/logout');
        },

        getMembers: function() {
            return $http.get('/api/getMembers');
        },

        getAbsents: function(day) {
            return $http({
                    url: '/api/absents',
                    method: "GET",
                    params: {day: day}
             });
        },

        getTransactions: function(email) {
            return $http.get('/api/getTransactions/' + email);
        },

        cantPlayOnSaturdays: function(email, weeks, future) {
            return $http({
                    url: '/api/cantPlayOnSaturdays',
                    method: "POST",
                    data: {email: email, weeks: weeks, future: future}
                 });
        },

        wantToPlayOnSaturdays: function(email) {
            return $http.get('/api/wantToPlayOnSaturdays/' + email);
        },

        cantPlayOnSundays: function(email, weeks, future) {
            return $http({
                    url: '/api/cantPlayOnSundays',
                    method: "POST",
                    data: {email: email, weeks: weeks, future: future}
                 });
        },

        wantToPlayOnSundays: function(email) {
            return $http.get('/api/wantToPlayOnSundays/' + email);
        },

        removeSaturdayAbsentee: function(email) {
            return $http({
                    url: '/api/removeSaturdayAbsentee',
                    method: "GET",
                    params: {email: email}
             });
        },

        removeSundayAbsentee: function(email) {
            return $http({
                    url: '/api/removeSundayAbsentee',
                    method: "GET",
                    params: {email: email}
             });
        },

        updateCourtsCost: function(cost, day) {
            return $http({
                    url: '/api/updateCourtsCost',
                    method: "GET",
                    params: {cost: cost, day: day}
             });
        },

        runShuttlesExpense: function(cost) {
            return $http({
                    url: '/api/runShuttlesExpense',
                    method: "GET",
                    params: {cost: cost}
             });
        },

        getGroupOwners: function() {
            return $http.get('/api/getGroupOwners');
        },

        getAllUsers: function() {
            return $http.get('/api/getAllUsers');
        },

        changeSuperUser: function(email) {
            return $http({
                    url: '/api/changeSuperUser',
                    method: "GET",
                    params: {email: email}
             });
        },

        topupGroup: function(email, amount) {
            return $http({
                    url: '/api/topupGroup',
                    method: "POST",
                    data: {email: email, amount: amount}
                 });
        },

        makeSomeoneSundayAbsent: function(email, numberOfWeeks) {
            return $http({
                    url: '/api/makeSomeoneSundayAbsent',
                    method: "POST",
                    data: {email: email, numberOfWeeks: numberOfWeeks}
                 });
        },

        runSundayExpense: function() {
            return $http.get('/api/runSundayExpense');
        },

        sendPaymentNotificationToSuperUser: function(amount) {
            return $http({
                    url: '/api/sendPaymentNotificationToSuperUser',
                    method: "GET",
                    params: {amount: amount}
             });
        },

        forgotpassword: function(email) {
            return $http({
                    url: '/api/forgotpassword',
                    method: "GET",
                    params: {email: email}
             });
        },

        deleteAUser: function(email) {
            return $http({
                    url: '/api/deleteAUser',
                    method: "GET",
                    params: {email: email}
             });
        },

        createANewUser: function(firstname, lastname, email, balance, saturdayAbsentWeeks, sundayAbsentWeeks, isAdmin) {
            return $http({
                    url: '/api/createANewUser',
                    method: "GET",
                    params: {firstname: firstname, lastname: lastname, email: email, balance: balance,
                             saturdayAbsentWeeks: saturdayAbsentWeeks, sundayAbsentWeeks: sundayAbsentWeeks,
                             isAdmin: isAdmin}
             });
        },

        sendAnEmail: function(subject, message) {
            return $http({
                    url: '/api/sendAnEmail',
                    method: "POST",
                    data: {subject: subject, message: message}
             });
        },

        adhocCharge: function(amount, subject, message) {
            return $http({
                    url: '/api/adhocCharge',
                    method: "POST",
                    data: {amount: amount, subject: subject, message: message}
             });
        }
    }
    return badmintonServiceFunctions;
}
]);

services.factory('ButtonService', ['$rootScope', '$ionicPopup', '$ionicLoading', '$stateParams', 'BadmintonSvc', '$q',
                                   function($rootScope, $ionicPopup, $ionicLoading, $stateParams, BadmintonSvc, $q) {
	var isDashboard = false;
	var member;
	var memberIndex;
	var scope;
	
	var buttonServiceFunctions = {
		show: function() {
			$ionicLoading.show({
				template: 'Please wait...'
			});
		},

		hide: function(){
			$ionicLoading.hide();
		},

		showUpdateFailedAlert: function(message) {
			var alertPopup = $ionicPopup.alert({
				title: 'Update failed!',
				template: message
			});
			alertPopup.then(function(res) {
				console.log('User clicked on the ok button');
			});
		},
		
		setScopeAndIndex: function(whichScope, index) {
			scope = whichScope;
			memberIndex = index;
		},

		refreshUI: function() {
			// If index is undefined then it is current user in dash board
			if(memberIndex === -1) {
				isDashboard = true;
				member = $rootScope.user;
				scope.member = member;
			} else {
				isDashboard = false;
				// Get the correct member from other members list
				member = $rootScope.members[memberIndex];
				// Pass that the member information to UI
				scope.member = member;
			}

			var isGroupOwner = $rootScope.user.isGroupOwner;

			if(isGroupOwner || isDashboard) {
				var isSaturdayAbsent = member.isSaturdayAbsent;
				var isSundayAbsent = member.isSundayAbsent;
				var futSatAbsent = member.futureSaturdayAbsentWeeks;
				var futSunAbsent = member.futureSundayAbsentWeeks;

				// Initialize all flags 
				if(isSaturdayAbsent || (futSatAbsent > 0)) {
					scope.showCantPlaySatBtn = false;
					scope.showWantPlaySatBtn = true;
				} else {
					scope.showCantPlaySatBtn = true;
					scope.showWantPlaySatBtn = false;
				}

				if(isSundayAbsent || (futSunAbsent > 0)) {
					scope.showCantPlaySunBtn = false;
					scope.showWantPlaySunBtn = true;
				} else {
					scope.showCantPlaySunBtn = true;
					scope.showWantPlaySunBtn = false;
				}
			} else {
				// If the logged in user is not a group owner then don't show any 
				// buttons
				scope.showCantPlaySatBtn = false;
				scope.showWantPlaySatBtn = false;
				scope.showCantPlaySunBtn = false;
				scope.showWantPlaySunBtn = false;
			}
		},

		refresh: function() {
			if(isDashboard === true) {
				var getCurrentUser = BadmintonSvc.login(member.email, $rootScope.user.password);
				getCurrentUser.then(function(payload) {
				    var password = $rootScope.user.password;
				    $rootScope.user = payload.data;
				    $rootScope.user.password = password;
					// Now we have got the latest data from backend so just hide the please wait... and refresh UI
					buttonServiceFunctions.hide();
					buttonServiceFunctions.refreshUI();
				}, function(error) {
					// Login failed to so goto login screen
					console.log(error);
					BadmintonSvc.logout();
				});
			} else {
				// First refresh the data and then refresh the UI
				var gettingOtherMembers = BadmintonSvc.getMembers();
				gettingOtherMembers.then(function(payload) {
				    $rootScope.members = payload.data;
					// Now we have got the latest data from backend so just hide the please wait... and refresh UI
					buttonServiceFunctions.hide();
					buttonServiceFunctions.refreshUI();
				}, function(error) {
					// Alert dialog, try again
					console.log(error);
					buttonServiceFunctions.hide();
					buttonServiceFunctions.showUpdateFailedAlert(error);
				});
			}
		},
		
		
		showPaymentAlert: function(title,message) {
			var alertPopup = $ionicPopup.alert({
				title: title,
				template: message
			});
			alertPopup.then(function(res) {
				console.log('User clicked on the ok button');
			});
		},
		
		
		// Payment Popup
		paymentPopup: function($scope) {
			$scope.data = {}
			// Build the payment pop-up
			var myPopup = $ionicPopup.show({
				template: '<input type="number" ng-model="data.paymentAmount">',
				title: "Payment Details",
				subTitle: "Please enter the amount which you have already transferred",
				scope: $scope,
				buttons: [
				          { text: 'Cancel' },
				          {
				        	  text: '<b>OK</b>',
				        	  type: 'button-positive',
				        	  onTap: function(e) {
				        		  if (!$scope.data.paymentAmount) {
				        			  e.preventDefault();
				        		  } else {
				        			  return $scope.data.paymentAmount;
				        		  }
				        	  }
				          },
				          ]
			});
			myPopup.then(function(res) {
				if(typeof(res) !== 'undefined' && res > 0) {
                    // Please show dialog
                    buttonServiceFunctions.show();
                    var sendNotificationToSuperUser = BadmintonSvc.sendPaymentNotificationToSuperUser(res);
                    sendNotificationToSuperUser.then(function(payload) {
                        buttonServiceFunctions.hide();
                        buttonServiceFunctions.showPaymentAlert('Payment Details','Payment details notified Successfully');
                    }, function(error) {
                        // Alert dialog, try again
                        console.log(error);
                        buttonServiceFunctions.hide();
                        buttonServiceFunctions.showPaymentAlert('Payment Failed!',error);
                    });
                } else if (res <= 0) {
                    console.log(res);
                    buttonServiceFunctions.showPaymentAlert('Payment Failed!','Payment should be greater than zero dollor');
                } else {
                    console.log('No response'||res);
                }
			});
	    },
		
		// Button clicks
		cantPlaySatBtnClick: function() {
			scope.data = {}
			// Build the pop-up to input number of weeks that user can't play on Saturdays
			var myPopup = $ionicPopup.show({
				template: '<input type="number" ng-model="data.numberOfWeeks">',
				title: "Can't Play on Saturdays",
				subTitle: "Please input the number of weeks that " + scope.member.firstname + " " + scope.member.lastname + " can't play on Saturdays",
				scope: scope,
				buttons: [
				          { text: 'Cancel' },
				          {
				        	  text: '<b>OK</b>',
				        	  type: 'button-positive',
				        	  onTap: function(e) {
				        		  var x = scope.data.numberOfWeeks;
				        		  var isInt = buttonServiceFunctions.isInt(x);
				        		  if ((scope.data.numberOfWeeks < 1) || (scope.data.numberOfWeeks > 520) || (!isInt)) {
				        			  // don't allow the user to close unless he/she enters some number
				        			  var alertPopup = $ionicPopup.alert({
				        				     title: 'Invalid Characters',
				        				     template: 'Please enter non-Decimal values between 1 and 520 inclusive.'
				        				   });
				        				   alertPopup.then(function(res) {
				        					   
				        				   });
				        			  e.preventDefault();
				        			  } else {
				        			  //console.log('user entered weeks: ' + scope.data.numberOfWeeks);
				        			  return scope.data.numberOfWeeks;
				        		  }
				        	  }
				          },
				          ]
			});
			myPopup.then(function(res) {
				if(typeof(res) !== 'undefined') {
					var d = new Date();
					var today = d.getDay();
					var currtime = d.getHours();
					// If it is less than Thursday or after 9 am on Saturday 
					if ((today < 4) || ((today === 6) && (currtime > 9))) {
						// Please show dialog
						buttonServiceFunctions.show();
						var cantPlayOnSaturdays = BadmintonSvc.cantPlayOnSaturdays(scope.member.email, res, false);
						cantPlayOnSaturdays.then(function(payload) {
							// Urrey! success, refresh the data
							buttonServiceFunctions.refresh();
						}, function(error) {
							// Alert dialog, try again
							console.log(error);
							buttonServiceFunctions.hide();
							buttonServiceFunctions.showUpdateFailedAlert(error);
						});
					} else {
						var alertPopup = $ionicPopup.alert({
							title: 'Late Notice',
							template: 'You will be charged this week due to late notice. The remaining weeks if any will be waived off.'
						});
						alertPopup.then(function(val) {
							// Please show dialog
							buttonServiceFunctions.show();
							var cantPlayOnSaturdays = BadmintonSvc.cantPlayOnSaturdays(scope.member.email, res - 1, true);
							cantPlayOnSaturdays.then(function(payload) {
								// Urrey! success, refresh the data
								buttonServiceFunctions.refresh();
							}, function(error) {
								// Alert dialog, try again
								console.log(error);
								buttonServiceFunctions.hide();
								buttonServiceFunctions.showUpdateFailedAlert(error);
							});
						});
					}
				}
			});
		},

		wantPlaySatBtnClick: function() {
			console.log('wantPlaySatBtnClick');
			var confirmPopup = $ionicPopup.confirm({
				title: 'Play on Saturdays?',
				template: 'Are you sure you want to play on Saturdays?'
			});
			confirmPopup.then(function(res) {
				if(res) {
					console.log('You are sure');
					buttonServiceFunctions.show();
					var wantToPlayOnSaturdays = BadmintonSvc.wantToPlayOnSaturdays(scope.member.email);
					wantToPlayOnSaturdays.then(function(payload) {
						// Urrey! success hide the please wait and refresh the data
						buttonServiceFunctions.refresh();
					}, function(error) {
						// Alert dialog, try again
						console.log(error);
						buttonServiceFunctions.hide();
						buttonServiceFunctions.showUpdateFailedAlert(error);
					});
				} else {
					console.log('You are not sure');
				}
			});
		},

		cantPlaySunBtnClick: function() {
			console.log('cantPlaySunBtnClick');
			scope.data = {}
			// Build the pop-up to input number of weeks that user can't play on Sundays
			var myPopup = $ionicPopup.show({
				template: '<input type="number" ng-model="data.numberOfWeeks">',
				title: "Can't Play on Sundays",
				subTitle: "Please input the number of weeks that " + scope.member.firstname + " " + scope.member.lastname + " can't play on Sundays",
				scope: scope,
				buttons: [
				          { text: 'Cancel' },
				          {
				        	  text: '<b>OK</b>',
				        	  type: 'button-positive',
				        	  onTap: function(e) {
				        		  var x = scope.data.numberOfWeeks;
				        		  var isInt = buttonServiceFunctions.isInt(x);
				        		  if ((scope.data.numberOfWeeks < 1) || (scope.data.numberOfWeeks > 520) || (!isInt)) {
			        			  // don't allow the user to close unless he/she enters some number
			        			  var alertPopup = $ionicPopup.alert({
			        				     title: 'Invalid Characters',
			        				     template: 'Please enter non-Decimal values between 1 and 520 inclusive.'
			        				   });
			        				   alertPopup.then(function(res) {
			        					console.log('invalid values caught');   
			        				   });
			        				   e.preventDefault();
				        		  } else {
				        			  //console.log('user entered weeks: ' + scope.data.numberOfWeeks);
				        			  return scope.data.numberOfWeeks;
				        		  }
				        	  }
				          },
				          ]
			});
			myPopup.then(function(res){
				//console.log('User entered value: ', res);
				if(typeof(res) !== 'undefined') {
					var d = new Date();
					var today = d.getDay();
					var currtime = d.getHours();
					// If it is less than Friday or after 9 am on Sunday
					if (((today > 0)  && (today < 5)) || ((today === 0) && (currtime > 9)))
					{
						// Please wait dialog
						buttonServiceFunctions.show();
						var cantPlayOnSundays = BadmintonSvc.cantPlayOnSundays(scope.member.email, res, false);
						cantPlayOnSundays.then(function(payload) {
							// Urrey! success, refresh the data
							buttonServiceFunctions.refresh();
						}, 
						function(error) {
							// Alert dialog, try again
							console.log(error);
							buttonServiceFunctions.hide();
							buttonServiceFunctions.showUpdateFailedAlert(error);
						});
					}		
					else
					{		
						//console.log('contorl entered the alert code');
						var alertPopup = $ionicPopup.alert({
							title: 'Late Notice',
							template: 'You will be charged this week due to late notice. The remaining weeks if any will be waived off.'
						});
						alertPopup.then(function(val) {
							// Please wait dialog
							buttonServiceFunctions.show();
							var cantPlayOnSundays = BadmintonSvc.cantPlayOnSundays(scope.member.email, res - 1, true);
							cantPlayOnSundays.then(function(payload) {
								// Urrey! success, refresh the data
								buttonServiceFunctions.refresh();
							}, 
							function(error) {
								// Alert dialog, try again
								console.log(error);
								buttonServiceFunctions.hide();
								buttonServiceFunctions.showUpdateFailedAlert(error);
							});
						});	
					}
				}
			});
		},

		wantPlaySunBtnClick: function() {
			console.log('wantPlaySunBtnClick');
			var confirmPopup = $ionicPopup.confirm({
				title: 'Play on Sundays?',
				template: 'Are you sure you want to play on Sundays?'
			});
			confirmPopup.then(function(res) {
				if(res) {
					console.log('You are sure');
					buttonServiceFunctions.show();
					var wantToPlayOnSundays = BadmintonSvc.wantToPlayOnSundays(scope.member.email);
					wantToPlayOnSundays.then(function(payload) {
						// Urrey! success, refresh the data
						buttonServiceFunctions.refresh();
					}, function(error) {
						// Alert dialog, try again
						console.log(error);
						buttonServiceFunctions.hide();
						buttonServiceFunctions.showUpdateFailedAlert(error);
					});
				} else {
					console.log('You are not sure');
				}
			});
		},
		
		isInt: function(value) {
			return !isNaN(value) && 
			parseInt(Number(value)) == value && 
			!isNaN(parseInt(value, 10));
		}
	}
	
	return buttonServiceFunctions;
}
]);

//Symbol Replacements: . is now -
//                      @ is now =
services.factory('UtilSvc', ['$ionicPopup', '$ionicLoading', function($ionicPopup, $ionicLoading) {
	var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
	
    return {
        isStringBlank: function(str) {
            return (!str || /^\s*$/.test(str));
        },

        validateEmail: function(email) {
            var re = /\S+@\S+\.\S+/;
            return re.test(email);
        },

    	showPleaseWait: function() {
    		$ionicLoading.show({
    			template: 'Please wait...'
    		});
        },
        
        hidePleaseWait: function() {
        	$ionicLoading.hide();
        },
        
        showAlert: function(title, msg) {
        	var alertPopup = $ionicPopup.alert({
    			title: title,
    			template: msg
    		});
    		alertPopup.then(function(res) {
    		});
        },
        
        // Returns number of days between today and coming Sunday
        daysUntilNextSunday: function() {
        	var today = new Date();
            var today_day = today.getDay();

            var sunday = 'sunday';

            for (var i = 7; i--;) {
                if (sunday === days[i]) {
                	sunday = (i <= today_day) ? (i + 7) : i;
                    break;
                }
            }
            
            return (sunday - today_day - 1);
        },
        
        // Returns number of days between today and coming Saturday
        daysUntilNextSaturday: function() {
        	var today = new Date();
            var today_day = today.getDay();

            var saturday = 'saturday';

            for (var i = 7; i--;) {
                if (saturday === days[i]) {
                	saturday = (i <= today_day) ? (i + 7) : i;
                    break;
                }
            }

            return (saturday - today_day -1);
        }
    }
}
]);

/**
 * Log service
 */
services.factory('LogSvc', function($log, UtilSvc) {
    return {
        info: function(msg, file, method) {
            var time = UtilSvc.getTimeStamp(true);
            $log.log('[' + time + '] in file: ' + file + ' at method: ' + method);
            $log.info(msg);
        },
        error: function(msg, file, method) {
            var time = UtilSvc.getTimeStamp(true);
            $log.log('[' + time + '] in file: ' + file + ' at at method: ' + method);
            $log.error(msg);
        }
    }
});
