// Ionic communityApp App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('communityApp', ['ionic', 
                                'communityApp.controllers', 
                                'communityApp.services',
                                'ngMap'])

.run(function($ionicPlatform, UtilSvc, $state, $ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs))
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    
    window.addEventListener('native.keyboardshow', keyboardShowHandler);

    $state.go('login');

    function keyboardShowHandler(e){
    	window.scrollTo(0, 100);
    }
    
    function showPleaseWait() {
		$ionicLoading.show({
			template: 'Please wait...'
		});
    }
    
    function hidePleaseWait() {
    	$ionicLoading.hide();
    }
  });
})

.filter('customCurrency', ["$filter", function ($filter) {       
    return function(amount, currencySymbol){
        var currency = $filter('currency');         

        if(amount < 0){
            return currency(amount, currencySymbol).replace("(", "-").replace(")", ""); 
        }

        return currency(amount, currencySymbol);
    };
}])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: 'static/templates/tabs.html',
      controller: 'TabsCtrl'
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
      url: '/dash',
      views: {
        'tab-dash': {
          templateUrl: 'static/templates/tab-dash.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('tab.members', {
      url: '/members',
      views: {
        'tab-members': {
          templateUrl: 'static/templates/tab-members.html',
          controller: 'MembersCtrl'
        }
      }
    })
    .state('tab.member-detail', {
      url: '/member/:index',
      views: {
        'tab-members': {
          templateUrl: 'static/templates/member-detail.html',
          controller: 'MemberDetailCtrl'
        }
      }
    })

    .state('tab.absents', {
      url: '/absents',
      views: {
        'tab-absents': {
          templateUrl: 'static/templates/tab-absents.html',
          controller: 'AbsentsCtrl'
        }
      }
    })
    
     .state('tab.SuperUser', {
      url: '/SuperUser',
      views: {
        'tab-SuperUser': {
          templateUrl: 'static/templates/tab-SuperUser.html',
          controller: 'SuperUser'
        }
      }
    })

    .state('tab.topup', {
      url: '/topup',
      views: {
        'tab-SuperUser': {
          templateUrl: 'static/templates/top-up.html',
          controller: 'TopUpCtrl'
        }
      }
    })

    .state('tab.makeSomeoneSundayAbsent', {
      url: '/makeSomeoneSundayAbsent',
      views: {
        'tab-SuperUser': {
          templateUrl: 'static/templates/make-someone-sunday-absent.html',
          controller: 'MakeSomeoneSundayAbsentCtrl'
        }
      }
    })

    .state('tab.changeSU', {
      url: '/changeSU',
      views: {
        'tab-SuperUser': {
          templateUrl: 'static/templates/change_super_user.html',
          controller: 'ChangeSuperUserCtrl'
        }
      }
    })

    .state('tab.createNewUser', {
      url: '/changeNewUser',
      views: {
        'tab-SuperUser': {
          templateUrl: 'static/templates/create_new_user.html',
          controller: 'CreateNewUserCtrl'
        }
      }
    })

    .state('tab.deleteAUser', {
      url: '/deleteAUser',
      views: {
        'tab-SuperUser': {
          templateUrl: 'static/templates/delete_a_user.html',
          controller: 'DeleteAUserCtrl'
        }
      }
    })

    .state('tab.adhocCharge', {
      url: '/adhocCharge',
      views: {
        'tab-SuperUser': {
          templateUrl: 'static/templates/adhoc_charge.html',
          controller: 'AdHocChargeCtrl'
        }
      }
    })

    .state('tab.sendAnEmail', {
      url: '/sendAnEmail',
      views: {
        'tab-SuperUser': {
          templateUrl: 'static/templates/send_an_email.html',
          controller: 'SendAnEmailCtrl'
        }
      }
    })
    
    .state('login', {
      url: '/login',
      templateUrl: 'static/templates/login.html',
      controller: 'LoginCtrl'
    })
    
     // Reset Password
     .state('resetpwd', {
          name:'resetpwd',
          url: '/resetpwd',
          templateUrl: 'static/templates/resetpwd.html',
          controller: 'LoginCtrl'
    })
    
     // Location
     .state('location', {
          name:'location',
          url: '/location',
          templateUrl: 'static/templates/location.html',
          controller: 'MapCtrl'
    })
    
     // Help
     .state('help', {
          name:'help',
          url: '/help',
          templateUrl: 'static/templates/help.html',
          controller: 'HelpCtrl'
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('static/templates/login');

});

