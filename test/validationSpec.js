describe( 'Validations for the step changes', function() {
	var $compile, $rootScope, WizardHandler;

	beforeEach(module('mgo-angular-wizard'));
	beforeEach(inject(function(_$compile_, _$rootScope_, _WizardHandler_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
		WizardHandler = _WizardHandler_;
	}));

	/**
	 * Create the view with wizard to test
	 * @param  {Scope} scope 				A scope to bind to
	 * @param  {String} validators 			Name of validators for each step
	 * @param  {Boolean} validateOnlyToAdvance 	Boolean value to set validate-only-to-advance
	 * @return {[DOM element]} 					A DOM element compiled
	 */
	function createView(scope, validators, validateOnlyToAdvance) {

		// Check the name of validators and generate attributes
		var attrValidators = [];
		if (!_.isArray(validators)) {
			validators = [];
		}
		validators.length = 3;
		_.each(validators, function (name, index) {
			attrValidators[index] = _.isUndefined(name) ? '' : 'validate-step="' + name + '"';
		});

		if (_.isBoolean(validateOnlyToAdvance))
			attrValidateOnlyToAdvance = 'validate-only-to-advance="' + validateOnlyToAdvance.toString() + '"';
		else
			attrValidateOnlyToAdvance = '';

		scope.referenceCurrentStep = null;
		
		var element = angular.element('<wizard on-finish="finishedWizard()" current-step="referenceCurrentStep" ng-init="msg = 14" ' + attrValidateOnlyToAdvance + ' >'
				+ '	<wz-step title="Starting" ' + attrValidators[0] + ' >'
				+ '		<h1>This is the first step</h1>'
				+ '		<p>Here you can use whatever you want. You can use other directives, binding, etc.</p>'
				+ '		<input type="submit" wz-next value="Continue" />'
				+ '	</wz-step>'
				+ '	<wz-step title="Continuing" ' + attrValidators[1] + ' >'
				+ '		<h1>Continuing</h1>'
				+ '		<p>You have continued here!</p>'
				+ '		<input type="submit" wz-next value="Go on" />'
				+ '	</wz-step>'
				+ '	<wz-step title="More steps" ' + attrValidators[2] + ' >'
				+ '		<p>Even more steps!!</p>'
				+ '		<input type="submit" wz-next value="Finish now" />'
				+ '	</wz-step>'
				+ '</wizard>');
		var elementCompiled = $compile(element)(scope);
		$rootScope.$digest();
		return elementCompiled;
	}

	it("should correctly create the wizard", function() {
		var scope = $rootScope.$new();
		var view = createView(scope);
		expect(WizardHandler).toBeTruthy();
		expect(view.find('section').length).toEqual(3);
		// expect the currect step to be desirable one
		expect(scope.referenceCurrentStep).toEqual('Starting');
	});

	it( "should allow to go to the next step when there isn't a function passed to validate", function() {
		var scope = $rootScope.$new();
		var view = createView(scope);
		expect(scope.referenceCurrentStep).toEqual('Starting');
		WizardHandler.wizard().next();
		$rootScope.$digest();
		expect(scope.referenceCurrentStep).toEqual('Continuing');
	});
	it( "should allow to go to the next step when the current step is valid", function() {
		var scope = $rootScope.$new();
		var view = createView(scope, ['true']);
		expect(scope.referenceCurrentStep).toEqual('Starting');
		WizardHandler.wizard().next();
		$rootScope.$digest();
		expect(scope.referenceCurrentStep).toEqual('Continuing');
	});
	it( "should not allow to go to the next step if the current step isn't valid", function() {
		var scope = $rootScope.$new();
		var view = createView(scope, ['false']);
		expect(scope.referenceCurrentStep).toEqual('Starting');
		WizardHandler.wizard().next();
		$rootScope.$digest();
		expect(scope.referenceCurrentStep).toEqual('Starting');
	});
	it( "should allow to return to a previous step if the current step isn't valid and isn't complete", function() {
		var scope = $rootScope.$new();
		var view = createView(scope, [undefined, 'false']);
		expect(scope.referenceCurrentStep).toEqual('Starting');
		WizardHandler.wizard().next();
		$rootScope.$digest();
		expect(scope.referenceCurrentStep).toEqual('Continuing');
		WizardHandler.wizard().previous();
		$rootScope.$digest();
		expect(scope.referenceCurrentStep).toEqual('Starting');
	});
	it( "should not allow to return to a previous step if the current step isn't valid and the attribute validateOnlyToAdvance is false", function() {
		var scope = $rootScope.$new();
		var view = createView(scope, [undefined, 'false'], false);
		expect(scope.referenceCurrentStep).toEqual('Starting');
		WizardHandler.wizard().next();
		$rootScope.$digest();
		expect(scope.referenceCurrentStep).toEqual('Continuing');
		WizardHandler.wizard().previous();
		$rootScope.$digest();
		expect(scope.referenceCurrentStep).toEqual('Continuing');
	});
	it( "should not allow to return to a previous step if the current step is completed and isn't valid", function() {
		var scope = $rootScope.$new();
		scope.validateSecondStep = true;
		var view = createView(scope, [undefined, 'validateSecondStep', undefined]);
		expect(scope.referenceCurrentStep).toEqual('Starting');
		WizardHandler.wizard().next();
		$rootScope.$digest();
		expect(scope.referenceCurrentStep).toEqual('Continuing');
		WizardHandler.wizard().next();
		$rootScope.$digest();
		expect(scope.referenceCurrentStep).toEqual('More steps');
		WizardHandler.wizard().previous();
		$rootScope.$digest();
		expect(scope.referenceCurrentStep).toEqual('Continuing');
		scope.validateSecondStep = false;
		WizardHandler.wizard().previous();
		$rootScope.$digest();
		expect(scope.referenceCurrentStep).toEqual('Continuing');
	});
});