var parse = angular.module('communityApp.parseSvc', []);

parse.constant('credentials', {
	appid: '4oyWDZaWaG6Yd4teQfwgFZ31xNqSr9GZzaXnctIx',
	jskey: 'GSWlwjQsOHyO9yWrPQt0ZSFtsJJCLknb5D59y7ue'
});

parse.factory('ParseInitSvc', ['credentials',
                               function(credentials) {
	return {
		init: function() {
			// Initialize Parse
			Parse.initialize(credentials.appid, credentials.jskey);
		}
	}
}
]);

/**
 * Parse Service. This is the service what will deal with Parse.com backend.
 * All controllers must use the services provided by this service
 */
parse.factory('ParseSvc', ['$q', '$window', 'LogSvc',
                           function($q, $window, LogSvc) {
	var currentUser;
	var otherMembers;
	var transactions;

	return {
		save: function() {
			window.localStorage.setItem("parse_session_key", currentUser.getSessionToken());
			window.localStorage.setItem("user_secret", currentUser.get('password'));
		},

		load: function() {
			var defer = $q.defer();
			var sessionKey = window.localStorage.getItem("parse_session_key");
			var userSecret = window.localStorage.getItem("user_secret");
			if (sessionKey) {
				Parse.User.become(sessionKey)
				.then(function(user) {
					currentUser = user;
					currentUser.set('password', userSecret);
					defer.resolve();
				},
				function(error) {
					defer.reject();
				});
			} else {
				defer.reject();
			}
			return defer.promise;
		},

		authenticated: function() {
			console.log(currentUser);
			if (currentUser)
				return currentUser.authenticated();
			else
				return false;
		},

		getCurrentUser: function() {
			return currentUser;
		},

		getOtherMembers: function() {
			return otherMembers;
		},

		getOtherMember: function(index) {
			return otherMembers[index];
		},

		getTransactions: function() {
			return transactions;
		},

		login: function(username, password) {
			var deferred = $q.defer();
			Parse.User.logIn(username, password, {
				success: function(user) {
					// Save instance
					currentUser = user;
					currentUser.set('password', password);

					// Save session key for signing in as user again while still valid
					window.localStorage.setItem("parse_session_key", currentUser.getSessionToken());
					window.localStorage.setItem("user_secret", password);

					deferred.resolve(user);
				},
				error: function(user, error) {
					deferred.reject (error.code);
				}
			});
			return deferred.promise;
		},

		logout: function() {
			console.log('Parse Logout');
			Parse.User.logOut();
			currentUser = Parse.User.current();
			window.localStorage.removeItem("parse_session_key");
			$window.location.href = '#/login';
			$window.location.reload();
		},

		getLatestData: function() {
			var deferred = $q.defer();
			// First get current user
			var User = Parse.Object.extend("User");
			var currentUserQuery = new Parse.Query(User);
			currentUserQuery.equalTo('username', currentUser.get('username'));
			currentUserQuery.limit(1);
			currentUserQuery.find({
				success: function(userQueryResults) {
					// There must be one and only current user
					if(userQueryResults.length === 1) {
						// Save instance
						currentUser = userQueryResults[0];
						var userSecret = window.localStorage.getItem("user_secret");
						currentUser.set('password', userSecret);

						// Get other members 
						var User = Parse.Object.extend("User");
						var query = new Parse.Query(User);
						query.equalTo("group", Parse.User.current().get('group'));
						query.notEqualTo("username", Parse.User.current().get('username'));
						query.ascending("firstname");
						// Initiate the query
						query.find({
							success: function(members) {
								console.log('Members count: ' + members.length);
								// Store other members
								otherMembers = members;

								// Now get latest 5 transactions
								var username = Parse.User.current().get('username');
								var transtable = Parse.Object.extend('Transactions_Table');
								var transQuery = new Parse.Query(transtable);
								transQuery.equalTo('username', username);
								transQuery.limit(5);
								transQuery.descending("Date");
								transQuery.find({
									success: function(transactionResults) {
										console.log('Transactions results count: ' + transactionResults.length);
										transactions = transactionResults;
										// We are now finished getting all required data so return
										deferred.resolve();
									},
									error: function() {
										console.log('fetch failed');
									}
								});
							},
							error: function(error) {
								LogSvc.error('Error occured when attempting to get other members', 'parseSvc.js', 'getOtherMembersFromParse');
								deferred.reject();
							}
						});
					} else {
						console.error('There no current user');
						deferred.reject();
					}
				},
				error: function() {
					console.error('Failed to retrieve current user data');
					deferred.reject();
				}
			});

			return deferred.promise;
		},

		//Reset Password
		resetpwd: function(email,$ionicPopup) {
			Parse.User.requestPasswordReset(email, {
				success: function() {
					// Password reset request was sent successfully

					$ionicPopup.alert({
						title: 'Password Reset',
						template: 'Password reset request was sent successfully to '+email
					})

					location.href='#/login';
					//  location.reload();
				},
				error: function(error) {
					// Show the error message
					$ionicPopup.alert({
						title: 'Password Reset Failed!',
						template: 'Error: '+error.message
					})

				}
			});
		},

		getOtherMembersFromParse: function() {
			var deferred = $q.defer();
			// Get other members as part of login process
			// Query the back end for other members
			var User = Parse.Object.extend("User");
			var query = new Parse.Query(User);
			query.equalTo("group", Parse.User.current().get('group'));
			query.notEqualTo("username", Parse.User.current().get('username'));
			query.ascending("firstname");
			// Initiate the query
			query.find({
				success: function(members) {
					console.log('Results count: ' + members.length);
					if(members.length > 0) {
						// Store other members
						otherMembers = members;
					}
					deferred.resolve(members);
				},
				error: function(error) {
					LogSvc.error('Error occured when attempting to get other members', 'parseSvc.js', 'getOtherMembersFromParse');
					deferred.reject(error);
				}
			});
			return deferred.promise;
		},

		cantPlayOnSaturdays: function(username, numberOfWeeks, future) {
			if(future === 'undefined') {
				future = false;
			}
			var deferred = $q.defer();
			Parse.Cloud.run('cantPlayOnSaturdays', { username: username, numberOfWeeks: numberOfWeeks, future: future }, {
				success: function(success) {
					console.log('Successfully executed the cloud function: cantPlayOnSaturdays()');
					deferred.resolve(success);
				},
				error: function(error) {
					console.log('Failed to execute the cloud function: cantPlayOnSaturdays()');
					deferred.reject(error);
				}
			});
			return deferred.promise;
		},

		wantToPlayOnSaturdays: function(username) {
			var deferred = $q.defer();
			Parse.Cloud.run('wantToPlayOnSaturdays', { username: username }, {
				success: function(success) {
					console.log('Successfully executed the cloud function: wantToPlayOnSaturdays()');
					deferred.resolve(success);
				},
				error: function(error) {
					console.log('Failed to execute the cloud function: wantToPlayOnSaturdays()');
					deferred.reject(error);
				}
			});
			return deferred.promise;
		},

		cantPlayOnSundays: function(username, numberOfWeeks, future) {
			if(future === 'undefined') {
				future = false;
			}
			var deferred = $q.defer();
			Parse.Cloud.run('cantPlayOnSundays', { username: username, numberOfWeeks: numberOfWeeks, future: future }, {
				success: function(success) {
					console.log('Successfully executed the cloud function: cantPlayOnSundays()');
					deferred.resolve(success);
				},
				error: function(error) {
					console.log('Failed to execute the cloud function: cantPlayOnSundays()');
					deferred.reject(error);
				}
			});
			return deferred.promise;
		},

		wantToPlayOnSundays: function(username) {
			var deferred = $q.defer();
			Parse.Cloud.run('wantToPlayOnSundays', { username: username }, {
				success: function(success) {
					console.log('Successfully executed the cloud function: wantToPlayOnSundays()');
					deferred.resolve(success);
				},
				error: function(error) {
					console.log('Failed to execute the cloud function: wantToPlayOnSundays()');
					deferred.reject(error);
				}
			});
			return deferred.promise;
		},

		updateInstallation: function(installationId) {
			var deferred = $q.defer();
			Parse.Cloud.run('updateInstallation', { installationId: installationId, 
				username: Parse.User.current().get('username') }, {
					success: function(success) {
						console.log('Successfully executed the cloud function: updateInstallation()');
						deferred.resolve(success);
					},
					error: function(error) {
						console.log('Failed to execute the cloud function: updateInstallation()');
						deferred.reject(error);
					}
				});
			return deferred.promise;
		},

		updateSaturdayCourtsCost: function(cost) {
			var deferred = $q.defer();
			Parse.Cloud.run('updateCourtsCost', { username: currentUser.get('username'), 
				day: 'Saturday', cost: cost }, {
					success: function(success) {
						console.log('Successfully executed the cloud function: updateSaturdayCourtsCost()');
						deferred.resolve(success);
					},
					error: function(error) {
						console.log('Failed to execute the cloud function: updateSaturdayCourtsCost()');
						deferred.reject(error);
					}
				});
			return deferred.promise;
		},

		updateSundayCourtsCost: function(cost) {
			var deferred = $q.defer();
			Parse.Cloud.run('updateCourtsCost', { username: currentUser.get('username'), 
				day: 'Sunday', cost: cost }, {
					success: function(success) {
						console.log('Successfully executed the cloud function: updateSundayCourtsCost()');
						deferred.resolve(success);
					},
					error: function(error) {
						console.log('Failed to execute the cloud function: updateSundayCourtsCost()');
						deferred.reject(error);
					}
				});
			return deferred.promise;
		},

		runShuttlesExpense: function(cost) {
			var deferred = $q.defer();
			Parse.Cloud.run('runShuttlesExpense', { from: currentUser.get('username'), 
				description: currentUser.get('password'), cost: cost }, {
					success: function(success) {
						console.log('Successfully executed the cloud function: runShuttlesExpense()');
						deferred.resolve(success);
					},
					error: function(error) {
						console.log('Failed to execute the cloud function: runShuttlesExpense()');
						deferred.reject(error);
					}
				});
			return deferred.promise;
		},

		topUpGroup: function(group, topup) {
			var deferred = $q.defer();
			Parse.Cloud.run('topUpGroup', { username: currentUser.get('username'), 
				password: currentUser.get('password'), group: group,  topup: topup}, {
					success: function(success) {
						console.log('Successfully executed the cloud function: topUpGroup()');
						deferred.resolve(success);
					},
					error: function(error) {
						console.log('Failed to execute the cloud function: topUpGroup()');
						deferred.reject(error);
					}
				});
			return deferred.promise;
		},

		sendPaymentNotificationToSuperUser: function(amount) {
			var deferred = $q.defer();
			Parse.Cloud.run('sendPaymentNotificationToSuperUser', { userFirstName: currentUser.get('firstname'), 
				userLastName: currentUser.get('lastname'), amount: amount}, {
					success: function(success) {
						console.log('Successfully executed the cloud function: sendPaymentNotificationToSuperUser()');
						deferred.resolve(success);
					},
					error: function(error) {
						console.log('Failed to execute the cloud function: sendPaymentNotificationToSuperUser()');
						deferred.reject(error);
					}
				});
			return deferred.promise;
		},
		
		getSaturdayAbsentsList: function() {
			var deferred = $q.defer();
			var userQuery = new Parse.Query(Parse.User);
			userQuery.equalTo('isSaturdayAbsent', true);
			userQuery.ascending("firstname");
			userQuery.find({
				success: function(results) {
					console.log('Successfully executed the cloud function: getSaturdayAbsentsList()');
					deferred.resolve(results);
				},
				error: function() {
					console.log('Failed to execute the cloud function: getSaturdayAbsentsList()');
					deferred.reject(error);
				}
			});
			return deferred.promise;
		},
		
		getSundayAbsentsList: function() {
			var deferred = $q.defer();
			var userQuery = new Parse.Query(Parse.User);
			userQuery.equalTo('isSundayAbsent', true);
			userQuery.ascending("firstname");
			userQuery.find({
				success: function(results) {
					console.log('Successfully executed the cloud function: getSundayAbsentsList()');
					deferred.resolve(results);
				},
				error: function() {
					console.log('Failed to execute the cloud function: getSundayAbsentsList()');
					deferred.reject(error);
				}
			});
			return deferred.promise;
		},
		
		getOtherMemberTransactions: function(username) {
			var deferred = $q.defer();
			var transtable = Parse.Object.extend('Transactions_Table');
			var transQuery = new Parse.Query(transtable);
			transQuery.equalTo('username', username);
			transQuery.limit(5);
			transQuery.descending("Date");
			transQuery.find({
				success: function(transactionResults) {
					console.log('Successfully executed the cloud function: getOtherMemberTransactions()');
					// We are now finished getting all required data so return
					deferred.resolve(transactionResults);
				},
				error: function() {
					console.log('Failed to execute the cloud function: getOtherMemberTransactions()');
					deferred.reject(error);
				}
			});
			return deferred.promise;
		},
		
		removeSaturdayAbsentee: function(username) {
			var deferred = $q.defer();
			var adminname = currentUser.get('firstname') + ' ' + currentUser.get('lastname');
			Parse.Cloud.run('removeSaturdayAbsentee', { username: username, 
				adminname: adminname, adminusername: currentUser.get('username')}, {
					success: function(success) {
						console.log('Successfully executed the cloud function: removeSaturdayAbsentee()');
						deferred.resolve(success);
					},
					error: function(error) {
						console.log('Failed to execute the cloud function: removeSaturdayAbsentee()');
						deferred.reject(error);
					}
				});
			return deferred.promise;
		},
		
		removeSundayAbsentee: function(username) {
			var deferred = $q.defer();
			var adminname = currentUser.get('firstname') + ' ' + currentUser.get('lastname');
			Parse.Cloud.run('removeSundayAbsentee', { username: username, 
				adminname: adminname, adminusername: currentUser.get('username')}, {
					success: function(success) {
						console.log('Successfully executed the cloud function: removeSundayAbsentee()');
						deferred.resolve(success);
					},
					error: function(error) {
						console.log('Failed to execute the cloud function: removeSundayAbsentee()');
						deferred.reject(error);
					}
				});
			return deferred.promise;
		},
		
		registerAbsence: function(from, to, whichDay) {
			var deferred = $q.defer();
			Parse.Cloud.run('registerAbsence', { username: currentUser.get('username'), from: from, to: to, whichDay: whichDay}, {
					success: function(success) {
						console.log('Successfully executed the cloud function: registerAbsence()');
						deferred.resolve(success);
					},
					error: function(error) {
						console.log('Failed to execute the cloud function: registerAbsence()');
						deferred.reject(error);
					}
				});
			return deferred.promise;
		},
	}
}
]);
