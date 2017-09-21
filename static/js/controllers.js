var controllers = angular.module('communityApp.controllers', ['ionic', 'communityApp.services']);



//---------------------------------------------------------------
//Login controller code start
//---------------------------------------------------------------
controllers.controller('LoginCtrl', 
		function($rootScope, $scope, $state, $location, $ionicLoading, $ionicPopup, $ionicNavBarDelegate,
		            UtilSvc, LogSvc, BadmintonSvc) {

	// Confirm Popup for Logout 
	showLogoutConfirm = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Logout',
			template: 'Are you sure want to logout?'
		});
		confirmPopup.then(function(res) {
			if(res) {
				console.log('Yes');
			} else {
				console.log('No');
			}
		});
	};

	//Logout function
	$scope.Logout = function() {
		BadmintonSvc.logout();
		showLogin();
	}

	// Call Reset Password Page from Login
	$scope.resetPasword = function() {
		$state.go('resetpwd');
	}

	//  Reset Password Functionality
	$scope.resetPwd = function(email) {
	    UtilSvc.showPleaseWait();
		var forgotpassword = BadmintonSvc.forgotpassword(angular.lowercase(email),$ionicPopup);
		forgotpassword.then(function(response) {
            UtilSvc.hidePleaseWait();
            UtilSvc.showAlert('Request successful!', 'Your forgot password request is successfully registered. ' +
                     'An email with a link to reset password is sent to your email address. Please follow the ' +
                     'instructions given in the email to reset your password');
		}, function(response) {
		    UtilSvc.hidePleaseWait();
		    if (response.status == 404) {
				UtilSvc.showAlert('Error!', 'Wrong email address provided');
			} else {
			    UtilSvc.showAlert('Error!', 'Error occurred in executing your request. Please try again later.');
			}
		});
	}

	// 	Cancel button in Reset Pwd template
	$scope.cancel = function() {
		console.log('Cancel button');
		location.href = '#/login';
	}

	$scope.goBack = function() {
	    console.log('$scope.goBack');
        $state.go('login');
    };

	// Does the login
	$scope.doLogin = function(username, password) {
		UtilSvc.showPleaseWait();
		// First do user login 
		var msg;
		var login = BadmintonSvc.login(angular.lowercase(username), password);
		login.then(function(payload) {
			// User logged in successfully
            $rootScope.user = payload.data;
            $rootScope.user.password = password;
            // Now get latest data belonging to the logged in user. We do
			// this as part of login process to make things look faster
            var getMembers = BadmintonSvc.getMembers();
            getMembers.then(function(payload) {
                $rootScope.members = payload.data;
                var getTransactions = BadmintonSvc.getTransactions($rootScope.user.email);
                getTransactions.then(function(payload) {
                    $rootScope.transactions = payload.data;
                    showDashboard();
                }, function(error) {
                    // Alert dialog, try again
				    showLoginFailedAlert(msg);
                });
            }, function(error) {
                // Alert dialog, try again
				UtilSvc.hidePleaseWait();
				showLoginFailedAlert(msg);
            });
		}, function(response) {
			// Alert dialog, try again
			console.log('2:'+response.status);
			if (response.status === 401) {
				msg = 'Wrong password entered';
				showLoginFailedAlert(msg);
			} else if (response.status === 404) {
				msg = 'Wrong email entered';
				showLoginFailedAlert(msg);
			} else {
				msg = 'There might other issues with login, please try again later';
				showLoginFailedAlert(msg);

			}
		});
	};

	// Shows error popup when login attempt fails
	showLoginFailedAlert = function(msg) {
		// First hide the please wait dialog
		UtilSvc.hidePleaseWait();
		UtilSvc.showAlert('Login failed!', msg);
	};

	showDashboard = function() {
		// Now hide the please wait
		UtilSvc.hidePleaseWait();
		$location.path('/tab/dash');

	};

	showLogin = function() {
		// Now hide the please wait
		UtilSvc.hidePleaseWait();
		$location.path('/login');

	};
});
//---------------------------------------------------------------
//Login controller code end
//---------------------------------------------------------------

//---------------------------------------------------------------
//Tabs controller code start
//---------------------------------------------------------------
controllers.controller('TabsCtrl', function($rootScope, $scope, $location, $ionicLoading, LogSvc) {
	// By default we want to show other members tab
	$scope.showMembers = true;

	// If other members are not present or error occurred in getting them then don't show the tab
	if((typeof($rootScope.members) === 'undefined') || ($rootScope.members.length === 0)) {
		$scope.showMembers = false;
	}

	$scope.superUser = $rootScope.user.isSuperUser;
	return $scope.superUser;

});
//---------------------------------------------------------------
//Tabs controller code end
//---------------------------------------------------------------

//---------------------------------------------------------------
//Dashboard controller code start
//---------------------------------------------------------------
controllers.controller('DashCtrl', function($rootScope, $scope, $state, $timeout, $ionicSideMenuDelegate, $ionicLoading, ButtonService) {

	refreshUI = function() {
		// Current logged in user
		$scope.currentUser = $rootScope.user

		// Transaction History
		var transactions = $rootScope.transactions;
		$scope.transHists = [];
		if(typeof(transactions) !== 'undefined') {
			for (var i = 0; i < transactions.length; i++) {
				var longdate = new Date(transactions[i].date);
				var ldate = longdate.toDateString();
				var sdate = ldate.substring(4,10);
				$scope.transHists.push({date: sdate,
					desc:transactions[i].type,
					amount:transactions[i].amount,
					balance:transactions[i].balance});
			}
		}

		if(!$scope.$$phase) {
			// Let the HTML UI know that there is new data in transactions history so that this can be displayed
			// in the table
			$scope.$apply();
		}
	}

	//	Side Menu
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};

	//	Pull to refresh function
	$scope.doPullToRefresh = function() {
        refreshUI();
        ButtonService.refreshUI();
        $scope.$broadcast('scroll.refreshComplete');
	};

	// Button clicks
	$scope.cantPlaySatBtnClick = function() {
//		ButtonService.cantPlaySatBtnClick();
	};

	$scope.wantPlaySatBtnClick = function() {
//		ButtonService.wantPlaySatBtnClick();
	};

	$scope.cantPlaySunBtnClick = function() {
		ButtonService.cantPlaySunBtnClick();
	};

	$scope.wantPlaySunBtnClick = function() {
		ButtonService.wantPlaySunBtnClick();
	};

	// Set the scope and index for button service
	// -1 index indicates that the buttons we are dealing with are in dashboard
	ButtonService.setScopeAndIndex($scope, -1);
	ButtonService.refreshUI();

	//	When you come to dash board controller just refresh data
	refreshUI();
});
//---------------------------------------------------------------
//Dashboard controller code end
//---------------------------------------------------------------

// Payment Controller
controllers.controller('PaymentCtrl', function($scope, ButtonService) {
	$scope.NotifyPaymentClick = function() {
		ButtonService.paymentPopup($scope);
	}
});

//---------------------------------------------------------------
//Members controller code start
//---------------------------------------------------------------
controllers.controller('MembersCtrl', function($rootScope, $scope) {
	var members = $rootScope.members;
	$scope.members = members;
});
//---------------------------------------------------------------
//Members controller code end
//---------------------------------------------------------------

//---------------------------------------------------------------
//Members details controller code start
//---------------------------------------------------------------
controllers.controller('MemberDetailCtrl', function($rootScope, $scope, $ionicPopup, $ionicLoading, $ionicNavBarDelegate, $stateParams, BadmintonSvc, $q, ButtonService) {
	// Button clicks
	$scope.cantPlaySatBtnClick = function() {
//		ButtonService.cantPlaySatBtnClick();
	};

	$scope.wantPlaySatBtnClick = function() {
//		ButtonService.wantPlaySatBtnClick();
	};

	$scope.cantPlaySunBtnClick = function() {
		ButtonService.cantPlaySunBtnClick();
	};

	$scope.wantPlaySunBtnClick = function() {
		ButtonService.wantPlaySunBtnClick();
	};
	
	$scope.goBack = function() {
		$ionicNavBarDelegate.back();
	};
	
	getTransactions = function () {
		// Transaction History
		$scope.transHists = [];
		var otherMember = $rootScope.members[$stateParams.index];
		var getOtherMemberTransactions = BadmintonSvc.getTransactions(otherMember.email);
		getOtherMemberTransactions.then(function(payload) {
		    var transactions = payload.data;
			for (var i = 0; i < transactions.length; i++) {
				var longdate = new Date(transactions[i].date);
				var ldate = longdate.toDateString();
				var sdate = ldate.substring(4,10);
				$scope.transHists.push({date: sdate, 
					desc:transactions[i].type,
					amount:transactions[i].amount,
					balance:transactions[i].balance});
			}
			
			if(!$scope.$$phase) {
				// Let the HTML UI know that there is new data in transactions history so that this can be displayed 
				// in the table
				$scope.$apply();
			}
		}, function(error) {
			console.error(error);
		});
	};

	// Set the scope and index for the button service 
	ButtonService.setScopeAndIndex($scope, $stateParams.index);
	ButtonService.refreshUI();
	getTransactions();
});
//---------------------------------------------------------------
//Members details controller code end
//---------------------------------------------------------------

//---------------------------------------------------------------
//Absents controller code start
//---------------------------------------------------------------
controllers.controller('AbsentsCtrl', function($scope) {
});
//---------------------------------------------------------------
//Absents controller code end
//---------------------------------------------------------------

//---------------------------------------------------------------
//Absents tab - Start
//---------------------------------------------------------------
controllers.controller('AbsentList', function($rootScope, $scope, UtilSvc, BadmintonSvc, $ionicPopup) {
	// Triggered on a button click, or some other target
	$scope.satAbsentList = function() {
		UtilSvc.showPleaseWait();
		$scope.whichAbsents = 'Saturday Absents List:';
		
		$scope.flag = true;

		$scope.onItemDelete = function(item, email) {
			var confirmPopup = $ionicPopup.confirm({
			     title: 'Confirm Delete',
			     template: 'Are you sure want to delete ' + item.firstname + ' ' + item.lastname + ' from Saturday absentee list?'
			   });
			confirmPopup.then(function(res) {
			    if(res) {
			        UtilSvc.showPleaseWait();
			    	var removeSaturdayAbsentee = BadmintonSvc.removeSaturdayAbsentee(email);
					removeSaturdayAbsentee.then(function(payload) {
			            $scope.items.splice($scope.items.indexOf(item), 1);
						$scope.noAbsentees = $scope.items.length == 0 ? true : false;
						UtilSvc.hidePleaseWait();
					}, function(error) {
                        // Alert dialog, try again
                        console.log(error);
                        UtilSvc.hidePleaseWait();
                        UtilSvc.showAlert('Error!', 'Could not remove user from absentee list');
					});
			    } else {
			       console.log('You are not sure');
			    }
			});
		};
		
		var absentList = [{firstname:"",lastname:"", email:""}];
		$scope.items = [];
		$scope.admin = $rootScope.user.isAdmin;
		var getAbsents = BadmintonSvc.getAbsents("Saturday");
		getAbsents.then(function(payload) {
		    var absents = payload.data;
		    if (absents.length == 0) {
		        $scope.noAbsentees = true;
		    } else {
		        $scope.noAbsentees = false;
		        for (var i = 0; i < absents.length; i++) {
					absentList.firstname = absents[i].firstname;
					absentList.lastname = absents[i].lastname;
					absentList.email = absents[i].email;
					$scope.items.push({firstname: absentList.firstname, lastname: absentList.lastname, email: absentList.email});
					absentList = [{first:"",last:"",uname:""}];
				}
				if(!$scope.$$phase) {
                    // Let the HTML UI know that there is new data in transactions history so that this can be displayed
                    // in the table
                    $scope.$apply();
                }
		    }
		    UtilSvc.hidePleaseWait();
		}, function(error) {
		    UtilSvc.hidePleaseWait();
		    UtilSvc.showAlert('Error!', 'Could not retrieve absents list');
		});
	}

	$scope.sunAbsentList = function() {
		UtilSvc.showPleaseWait();
		$scope.whichAbsents = 'Sunday Absents List:';

		$scope.onItemDelete = function(item, email) {
			var confirmPopup = $ionicPopup.confirm({
			     title: 'Confirm Delete',
			     template: 'Are you sure want to delete ' + item.firstname + ' ' + item.lastname + ' from Sunday absentee list?'
			   });
			confirmPopup.then(function(res) {
			    if(res) {
			        UtilSvc.showPleaseWait();
			    	var removeSundayAbsentee = BadmintonSvc.removeSundayAbsentee(email);
					removeSundayAbsentee.then(function(payload) {
			            $scope.items.splice($scope.items.indexOf(item), 1);
						$scope.noAbsentees = $scope.items.length == 0 ? true : false;
						UtilSvc.hidePleaseWait();
					}, function(error) {
                        // Alert dialog, try again
                        console.log(error);
                        UtilSvc.hidePleaseWait();
                        UtilSvc.showAlert('Error!', 'Could not remove user from absentee list');
					});
			    } else {
			       console.log('You are not sure');
			    }
			});
		};

		var absentList = [{firstname:"",lastname:"", email:""}];
		$scope.items = [];
		$scope.admin = $rootScope.user.isAdmin;
		var getAbsents = BadmintonSvc.getAbsents("Sunday");
		getAbsents.then(function(payload) {
		    var absents = payload.data;
		    if (absents.length == 0) {
		        $scope.noAbsentees = true;
		    } else {
		        $scope.noAbsentees = false;
		        for (var i = 0; i < absents.length; i++) {
					absentList.firstname = absents[i].firstname;
					absentList.lastname = absents[i].lastname;
					absentList.email = absents[i].email;
					$scope.items.push({firstname: absentList.firstname, lastname: absentList.lastname, email: absentList.email});
					absentList = [{first:"",last:"",uname:""}];
				}
				if(!$scope.$$phase) {
                    // Let the HTML UI know that there is new data in transactions history so that this can be displayed
                    // in the table
                    $scope.$apply();
                }
		    }
		    UtilSvc.hidePleaseWait();
		}, function(error) {
		    UtilSvc.hidePleaseWait();
		    UtilSvc.showAlert('Error!', 'Could not retrieve absents list');
		});  
	}

})
//---------------------------------------------------------------
//Absents tab - End
//---------------------------------------------------------------

//---------------------------------------------------------------
//SuperUser tab - End
//---------------------------------------------------------------	
controllers.controller('SuperUser', function($scope, $ionicPopup, $state, $timeout, BadmintonSvc, UtilSvc, $ionicLoading, $stateParams){
	$scope.enterSaturdayCourtCost = function() {
		$scope.data = {};
		var myPopup = $ionicPopup.prompt({
			template: '<input type="number" ng-model="data.satCourtExpense">',
			title: 'Enter Sat Court Cost',
			subTitle: 'Enter amount',
			scope: $scope,
			buttons: [
			          { text: 'Cancel' },
			          {
			        	  text: '<b>Run Job</b>',
			        	  type: 'button-dark',
			        	  onTap: function(e) {
			        		  if (!$scope.data.satCourtExpense) {
			        			  console.log('Char other than number is entered - Sat logic');
			        			  e.preventDefault();
			        		  } else {
			        			  return $scope.data.satCourtExpense;
			        		  }
			        	  }
			          },
			          ]
		});
		myPopup.then(function(res) {
			if(res != undefined) {
			    UtilSvc.showPleaseWait();
				var updateSaturdayCourtsCost = BadmintonSvc.updateCourtsCost(res, "Saturday");
				updateSaturdayCourtsCost.then(function(success) {
					UtilSvc.hidePleaseWait();
					UtilSvc.showAlert('Success', 'Successfully changed Saturday courts cost');
					myPopup.close();
				}, function(error) {
					// Alert dialog, try again
					UtilSvc.hidePleaseWait();
					UtilSvc.showAlert('Saturday Cost Update Failed!', 'There was an error in updating the courts cost for Saturday. Please try again later.');
					myPopup.close();
				});
			} else {
				myPopup.close();	
			}
		});
	};	

	$scope.enterSundayCourtCost = function() {
		$scope.data = {};
		var myPopup = $ionicPopup.prompt({
			template: '<input type="number" ng-model="data.sunCourtExpense">',
			title: 'Enter Sun Court Cost',
			subTitle: 'Enter amount',
			scope: $scope,
			buttons: [
			          { text: 'Cancel' },
			          {
			        	  text: '<b>Run Job</b>',
			        	  type: 'button-dark',
			        	  onTap: function(e) {
			        		  if (!$scope.data.sunCourtExpense) {
			        			  console.log('Char other than number is entered - Sun logic');
			        			  e.preventDefault();
			        		  } else {
			        			  return $scope.data.sunCourtExpense;
			        		  }
			        	  }
			          },
			          ]
		});
		myPopup.then(function(res) {
			if(res!=undefined) {
			    UtilSvc.showPleaseWait();
				var jobSundayExpense = BadmintonSvc.updateCourtsCost(res, "Sunday");
				jobSundayExpense.then(function(success) {
					UtilSvc.hidePleaseWait();
					UtilSvc.showAlert('Success', 'Successfully changed Sunday courts cost');
					myPopup.close();
				}, function(error) {
					// Alert dialog, try again
					UtilSvc.hidePleaseWait();
					UtilSvc.showAlert('Sunday Cost Update Failed!', 'There was an error in updating the courts cost for Sunday. Please try again later.');
					myPopup.close();
				});
			} else {
				myPopup.close();	
			}
		});
	};

	$scope.runSundayExpense = function () {
        var confirmPopup = $ionicPopup.confirm({
                    title: 'Run Sunday Expense?',
                    template: 'Are you sure you want to run Sunday Expense?'
                });
        confirmPopup.then(function(res) {
            if(res) {
                console.log('You are sure');
                $ionicLoading.show({
                    template: 'Please wait...'
                });
                var runSundayExpenses = BadmintonSvc.runSundayExpense();
                runSundayExpenses.then(function(payload) {
                    // Urrey! success, refresh the data
                    $ionicLoading.hide();
                    UtilSvc.showAlert('Success', 'Successfully run Sunday expense');
                }, function(error) {
                    // Alert dialog, try again
                    console.log(error);
                    $ionicLoading.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Run Sunday Expense failed!',
                        template: message
                    });
                    alertPopup.then(function(res) {
                        console.log('User clicked on the ok button');
                    });
                });
            } else {
                console.log('You are not sure');
            }
        });
	};

	$scope.enterShuttlesExpense = function() {
		$scope.data = {}

		// An elaborate, custom popup
		var myPopup = $ionicPopup.prompt({
			template: '<input type="number" ng-model="data.shuttleExpense">',
			title: 'Enter shuttle Expense',
			subTitle: 'Enter amount',
			scope: $scope,
			buttons: [
			          { text: 'Cancel' },
			          {
			        	  text: '<b>Run Job</b>',
			        	  type: 'button-dark',
			        	  onTap: function(e) {
			        		  if (!$scope.data.shuttleExpense) {
			        			  e.preventDefault();
			        		  } else {
			        			  return $scope.data.shuttleExpense;
			        		  }
			        	  }
			          },
			          ]
		});
		myPopup.then(function(res) {
			if(res != undefined) {
			    UtilSvc.showPleaseWait();
				var jobShuttlesExpense = BadmintonSvc.runShuttlesExpense(res);
				jobShuttlesExpense.then(function(success) {
				    UtilSvc.hidePleaseWait();
				    UtilSvc.showAlert('Success', 'Successfully charged shuttle expense');
					myPopup.close();
				}, function(error) {
					// Alert dialog, try again
					UtilSvc.hidePleaseWait();
					UtilSvc.showAlert('Error!', 'Could not run shuttle expense, please try again later');
					myPopup.close();
				});
			} else {
				console.log('shuttle - cancel button is clicked');
				myPopup.close();	
			}
		});
	};

	$scope.groupOwners = function() {
	    $state.go('tab.topup');
	};

	$scope.makeSomeoneSundayAbsent = function() {
	    $state.go('tab.makeSomeoneSundayAbsent');
	};

	$scope.changeSuperUser = function() {
	    $state.go('tab.changeSU');
	};

	$scope.deleteAUser = function() {
	    $state.go('tab.deleteAUser');
	};

	$scope.createANewUser = function() {
	    $state.go('tab.createNewUser');
	};

	$scope.adhocCharge = function() {
	    $state.go('tab.adhocCharge');
	};

	$scope.sendAnEmail = function() {
	    $state.go('tab.sendAnEmail');
	};
});
//---------------------------------------------------------------
//SuperUser tab - End
//---------------------------------------------------------------

//---------------------------------------------------------------
//TopUpCtrl - Start
//---------------------------------------------------------------
controllers.controller('TopUpCtrl', function($scope, $ionicPopup, $ionicNavBarDelegate, UtilSvc, BadmintonSvc) {
    $scope.goBack = function() {
		$ionicNavBarDelegate.back();
	};

	refreshUI = function() {
		$scope.flag = true;
        UtilSvc.showPleaseWait();
        $scope.items = [];
        var getGroupOwners = BadmintonSvc.getGroupOwners();
        getGroupOwners.then(function(payload) {
            UtilSvc.hidePleaseWait();
            var groupOwners = payload.data;
            for (var i = 0; i < groupOwners.length; i++) {
                $scope.items.push({firstname: groupOwners[i].firstname, lastname: groupOwners[i].lastname, email: groupOwners[i].email});
            }
            if(!$scope.$$phase) {
                // Let the HTML UI know that there is new data in transactions history so that this can be displayed
                // in the table
                $scope.$apply();
            }
        }, function(error) {
            UtilSvc.hidePleaseWait();
            UtilSvc.showAlert('Error!', 'Could not retrieve users. Please try again later');
        });

        $scope.openTopup = function(groupOwner) {
            $scope.data = {}
            var myPopup = $ionicPopup.prompt({
                template: '<input type="number" ng-model="data.topupAmt">',
                title: 'Enter Topup Value',
                subTitle: 'For '  + groupOwner.firstname + ' ' + groupOwner.lastname + ':',
                scope: $scope,
                buttons: [
                          { text: 'Cancel' },
                          {
                              text: '<b>Save</b>',
                              type: 'button-dark',
                              onTap: function(e) {
                                  if (!$scope.data.topupAmt) {
                                      e.preventDefault();
                                  } else {
                                      return $scope.data.topupAmt;
                                  }
                              }
                          },
                          ]
            });

            myPopup.then(function(res) {
                if (res != undefined) {
                    UtilSvc.showPleaseWait();
                    var topUpFnc = BadmintonSvc.topupGroup(groupOwner.email, res);
                    topUpFnc.then(function(payload) {
                        UtilSvc.hidePleaseWait();
                        UtilSvc.showAlert('Success', 'Successfully topped up');
                        myPopup.close();
                    },
                    function(error) {
                        UtilSvc.hidePleaseWait();
                        UtilSvc.showAlert('Error!', 'Could not top up users. Please try again later');
                        myPopup.close();
                    });
                } else {
                    UtilSvc.hidePleaseWait();
                    myPopup.close();
                }
            });
        };
	}

	//	When you come to top up controller just refresh data
	refreshUI();
});
//---------------------------------------------------------------
//TopUpCtrl - End
//---------------------------------------------------------------

//---------------------------------------------------------------
//TopUpCtrl - Start
//---------------------------------------------------------------
controllers.controller('MakeSomeoneSundayAbsentCtrl', function($scope, $ionicPopup, $ionicNavBarDelegate, UtilSvc, BadmintonSvc) {
    $scope.goBack = function() {
		$ionicNavBarDelegate.back();
	};

	refreshUI = function() {
		$scope.flag = true;
        UtilSvc.showPleaseWait();
        $scope.items = [];
        var getAllUsers = BadmintonSvc.getAllUsers();
        getAllUsers.then(function(payload) {
            UtilSvc.hidePleaseWait();
            var allUsers = payload.data;
            for (var i = 0; i < allUsers.length; i++) {
                $scope.items.push({firstname: allUsers[i].firstname, lastname: allUsers[i].lastname, email: allUsers[i].email});
            }
            if(!$scope.$$phase) {
                // Let the HTML UI know that there is new data in transactions history so that this can be displayed
                // in the table
                $scope.$apply();
            }
        }, function(error) {
            UtilSvc.hidePleaseWait();
            UtilSvc.showAlert('Error!', 'Could not retrieve users. Please try again later');
        });

        $scope.makeAbsent = function(user) {
            $scope.data = {}
            var myPopup = $ionicPopup.prompt({
                template: '<input type="number" ng-model="data.absentWeeks">',
                title: 'Enter number of absent weeks',
                subTitle: 'For '  + user.firstname + ' ' + user.lastname + ':',
                scope: $scope,
                buttons: [
                          { text: 'Cancel' },
                          {
                              text: '<b>Save</b>',
                              type: 'button-dark',
                              onTap: function(e) {
                                  if (!$scope.data.absentWeeks) {
                                      e.preventDefault();
                                  } else {
                                      return $scope.data.absentWeeks;
                                  }
                              }
                          },
                          ]
            });

            myPopup.then(function(res) {
                console.log("Absent weeks = " + res);
                if (res != undefined) {
                    UtilSvc.showPleaseWait();
                    var topUpFnc = BadmintonSvc.makeSomeoneSundayAbsent(user.email, res);
                    topUpFnc.then(function(payload) {
                        UtilSvc.hidePleaseWait();
                        UtilSvc.showAlert('Success', 'Successfully made user as absent');
                        myPopup.close();
                    },
                    function(error) {
                        UtilSvc.hidePleaseWait();
                        UtilSvc.showAlert('Error!', 'Could not make user absent. Please try again later');
                        myPopup.close();
                    });
                } else {
                    UtilSvc.hidePleaseWait();
                    myPopup.close();
                }
            });
        };
	}

	//	When you come to top up controller just refresh data
	refreshUI();
});
//---------------------------------------------------------------
//TopUpCtrl - End
//---------------------------------------------------------------

//---------------------------------------------------------------
//ChangeSuperUserCtrl - Start
//---------------------------------------------------------------
controllers.controller('ChangeSuperUserCtrl', function($scope, $ionicPopup, $state, $ionicNavBarDelegate, UtilSvc, BadmintonSvc) {
    $scope.goBack = function() {
		$ionicNavBarDelegate.back();
	};

	refreshUI = function() {
		$scope.flag = true;
        UtilSvc.showPleaseWait();
        $scope.items = [];
        var getAllUsers = BadmintonSvc.getAllUsers();
        getAllUsers.then(function(payload) {
            UtilSvc.hidePleaseWait();
            var allUsers = payload.data;
            for (var i = 0; i < allUsers.length; i++) {
                $scope.items.push({firstname: allUsers[i].firstname, lastname: allUsers[i].lastname, email: allUsers[i].email});
            }
            if(!$scope.$$phase) {
                // Let the HTML UI know that there is new data in transactions history so that this can be displayed
                // in the table
                $scope.$apply();
            }
        }, function(error) {
            UtilSvc.hidePleaseWait();
            UtilSvc.showAlert('Error!', 'Could not retrieve all users. Please try again later');
        });
	};

	$scope.change = function(user) {
	    var confirmPopup = $ionicPopup.confirm({
			title: 'Change Super User',
			template: 'Are you sure want to change super user role to: ' + user.firstname + ' ' + user.lastname +
			            '? \r\n\nAfter this you will NO longer be a super user and this action is unreversible.'
		});
		confirmPopup.then(function(res) {
			if(res) {
				UtilSvc.showPleaseWait();
                var changeSuperUser = BadmintonSvc.changeSuperUser(user.email);
                changeSuperUser.then(function(successResponse) {
                    UtilSvc.hidePleaseWait();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Super User is changed',
                        template: 'Successfully changed the super user and you no longer a super user. ' +
                                    'You must to logout now!'
                    });
                    alertPopup.then(function(res) {
                        BadmintonSvc.logout();
                        $state.go('login');
                    });
                }, function(errorResponse) {
                    UtilSvc.hidePleaseWait();
                    UtilSvc.showAlert('Error!', 'Could not change super user. Please try again later');
                });
			} else {
				// Do nothing
			}
		});
	};

	//	When you come to top up controller just refresh data
	refreshUI();
});
//---------------------------------------------------------------
//ChangeSuperUserCtrl - End
//---------------------------------------------------------------

//---------------------------------------------------------------
//DeleteAUserCtrl - Start
//---------------------------------------------------------------
controllers.controller('DeleteAUserCtrl', function($scope, $ionicPopup, $state, $ionicNavBarDelegate, UtilSvc, BadmintonSvc) {
    $scope.goBack = function() {
		$ionicNavBarDelegate.back();
	};

	refreshUI = function() {
		$scope.flag = true;
        UtilSvc.showPleaseWait();
        $scope.items = [];
        var getAllUsers = BadmintonSvc.getAllUsers();
        getAllUsers.then(function(payload) {
            UtilSvc.hidePleaseWait();
            var allUsers = payload.data;
            for (var i = 0; i < allUsers.length; i++) {
                $scope.items.push({firstname: allUsers[i].firstname, lastname: allUsers[i].lastname, email: allUsers[i].email});
            }
            if(!$scope.$$phase) {
                // Let the HTML UI know that there is new data in transactions history so that this can be displayed
                // in the table
                $scope.$apply();
            }
        }, function(error) {
            UtilSvc.hidePleaseWait();
            UtilSvc.showAlert('Error!', 'Could not retrieve all users. Please try again later');
        });
	};

	$scope.onItemDelete = function(item) {
        var confirmPopup = $ionicPopup.confirm({
             title: 'Confirm Delete?',
             template: 'Are you sure want to delete ' + item.firstname + ' ' + item.lastname + ' permanently from' +
                        ' badminton group?'
           });
        confirmPopup.then(function(res) {
            if(res) {
                UtilSvc.showPleaseWait();
                var removeSundayAbsentee = BadmintonSvc.deleteAUser(item.email);
                removeSundayAbsentee.then(function(payload) {
                    UtilSvc.hidePleaseWait();
                    $scope.items.splice($scope.items.indexOf(item), 1);
                }, function(error) {
                    // Alert dialog, try again
                    UtilSvc.hidePleaseWait();
                    UtilSvc.showAlert('Error!', 'Could not remove user from the group, please try again later');
                });
            } else {
               console.log('You are not sure');
            }
        });
	};

	//	When you come to top up controller just refresh data
	refreshUI();
});
//---------------------------------------------------------------
//DeleteAUserCtrl - End
//---------------------------------------------------------------

//---------------------------------------------------------------
//AdHocChargeCtrl - Start
//---------------------------------------------------------------
controllers.controller('AdHocChargeCtrl', function($scope, $ionicPopup, $state, $ionicNavBarDelegate, UtilSvc, BadmintonSvc) {
    $scope.goBack = function() {
		$ionicNavBarDelegate.back();
	};

	$scope.charge = function() {
	    if(isNaN($scope.amount)) {
	        UtilSvc.showAlert('Invalid Input!', 'Enter valid number in amount field');
	        return;
	    }
	    if(!$scope.subject || UtilSvc.isStringBlank($scope.subject)) {
	        UtilSvc.showAlert('Invalid Input!', 'Please enter subject');
	        return;
	    }
	    if(!$scope.description || UtilSvc.isStringBlank($scope.description)) {
	        UtilSvc.showAlert('Invalid Input!', 'Please enter description');
	        return;
	    }
	    if($scope.amount === null) { $scope.amount = 0 }

        UtilSvc.showPleaseWait();
        var adhocCharge = BadmintonSvc.adhocCharge($scope.amount, $scope.subject, $scope.description);
        adhocCharge.then(function(successResponse) {
            UtilSvc.hidePleaseWait();
            var alertPopup = $ionicPopup.alert({
                title: 'AdHoc Charge Successful',
                template: 'Successfully charged all users'
            });
            alertPopup.then(function(res) {
                $ionicNavBarDelegate.back();
            });
        }, function(errorResponse) {
            UtilSvc.hidePleaseWait();
            UtilSvc.showAlert('Error!', 'Error occurred in executing AdHoc charge. Please try again later.');
        });
	};
});
//---------------------------------------------------------------
//AdHocChargeCtrl - End
//---------------------------------------------------------------

//---------------------------------------------------------------
//SendAnEmailCtrl - Start
//---------------------------------------------------------------
controllers.controller('SendAnEmailCtrl', function($scope, $ionicPopup, $state, $ionicNavBarDelegate, UtilSvc, BadmintonSvc) {
    $scope.goBack = function() {
		$ionicNavBarDelegate.back();
	};

	$scope.send = function() {
	    if(!$scope.subject || UtilSvc.isStringBlank($scope.subject)) {
	        UtilSvc.showAlert('Invalid Input!', 'Please enter subject');
	        return;
	    }
	    if(!$scope.body || UtilSvc.isStringBlank($scope.body)) {
	        UtilSvc.showAlert('Invalid Input!', 'Please enter email body');
	        return;
	    }

        UtilSvc.showPleaseWait();
        var sendAnEmail = BadmintonSvc.sendAnEmail($scope.subject, $scope.body);
        sendAnEmail.then(function(successResponse) {
            UtilSvc.hidePleaseWait();
            var alertPopup = $ionicPopup.alert({
                title: 'Email Sent',
                template: 'Successfully an email has been sent all users'
            });
            alertPopup.then(function(res) {
                $ionicNavBarDelegate.back();
            });
        }, function(errorResponse) {
            UtilSvc.hidePleaseWait();
            UtilSvc.showAlert('Error!', 'Could not send an email now. Please try again later.');
        });
	};
});
//---------------------------------------------------------------
//SendAnEmailCtrl - End
//---------------------------------------------------------------

//---------------------------------------------------------------
//CreateNewUserCtrl - Start
//---------------------------------------------------------------
controllers.controller('CreateNewUserCtrl', function($scope, $ionicPopup, $state, $ionicNavBarDelegate, UtilSvc, BadmintonSvc) {
    $scope.isAdmin = false;

    $scope.goBack = function() {
		$ionicNavBarDelegate.back();
	};

	$scope.createANewUser = function() {
	    if(!$scope.firstname || UtilSvc.isStringBlank($scope.firstname)) {
	        UtilSvc.showAlert('Invalid Input!', 'Please enter first name');
	        return;
	    }
	    if(!$scope.lastname || UtilSvc.isStringBlank($scope.lastname)) {
	        UtilSvc.showAlert('Invalid Input!', 'Please enter last name');
	        return;
	    }
	    if(!$scope.email || !UtilSvc.validateEmail($scope.email)) {
	        UtilSvc.showAlert('Invalid Input!', 'Please enter valid email');
	        return;
	    }
	    if(!$scope.confirmEmail || ($scope.email !== $scope.confirmEmail)) {
	        UtilSvc.showAlert('Invalid Input!', 'Confirm email does not match with email field');
	        return;
	    }
	    if(isNaN($scope.balance)) {
	        UtilSvc.showAlert('Invalid Input!', 'Enter valid number in balance field');
	        return;
	    }
	    if(isNaN($scope.saturdayAbsentWeeks)) {
	        UtilSvc.showAlert('Invalid Input!', 'Enter valid number in Saturday absent field');
	        return;
	    }
	    if(isNaN($scope.sundayAbsentWeeks)) {
	        UtilSvc.showAlert('Invalid Input!', 'Enter valid number in Sunday absent field');
	        return;
	    }

	    if($scope.balance === null) { $scope.balance = 0 }
	    if($scope.saturdayAbsentWeeks === null) { $scope.saturdayAbsentWeeks = 0 }
	    if($scope.sundayAbsentWeeks === null) { $scope.sundayAbsentWeeks = 0 }

        UtilSvc.showPleaseWait();
        var createANewUser = BadmintonSvc.createANewUser($scope.firstname, $scope.lastname, $scope.confirmEmail,
                                                         $scope.balance, $scope.saturdayAbsentWeeks,
                                                         $scope.sundayAbsentWeeks, $scope.isAdmin)
        createANewUser.then(function(successResponse) {
            UtilSvc.hidePleaseWait();
            var alertPopup = $ionicPopup.alert({
                title: 'New user is created',
                template: 'Successfully create a new user for ' + $scope.firstname + ' ' + $scope.lastname
            });
            alertPopup.then(function(res) {
                $ionicNavBarDelegate.back();
            });
        }, function(errorResponse) {
            if(errorResponse.status === 409) {
                UtilSvc.hidePleaseWait();
                UtilSvc.showAlert('Error!', 'An user account with entered email address already exists.');
            } else {
                UtilSvc.hidePleaseWait();
                UtilSvc.showAlert('Error!', 'Could not create a new user. Please try again later.');
            }
        });
	};
});
//---------------------------------------------------------------
//CreateNewUserCtrl - End
//---------------------------------------------------------------

//Map Controller
controllers.controller('MapCtrl', function($scope, $ionicLoading, $ionicNavBarDelegate) {
	
    $scope.positions = [{
        lat: -33.829882,
        lng: 151.048898
    }];

    $scope.$on('mapInitialized', function(event, map) {
        $scope.map = map;
    });

    $scope.centerOnMe= function(){
        $scope.positions = [];

        $ionicLoading.show({
          template: 'Loading...'
        });

        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            $scope.positions.push({lat: pos.k,lng: pos.B});
            console.log(pos);
            $scope.map.setCenter(pos);
            $ionicLoading.hide();
        });
    };

    $scope.location = function() {
        console.log('Location Button Click');
        location.href = '#/location';

    };

    $scope.goBack = function() {
        $ionicNavBarDelegate.back();
    };
 
});

controllers.controller('HelpCtrl', function($scope, $ionicNavBarDelegate) {
	
	$scope.help = function() {
		location.href = '#/help';
	};
	
	$scope.goBack = function() {
		$ionicNavBarDelegate.back();
	};
});