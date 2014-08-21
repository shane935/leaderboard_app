(function() {

	/**************************************
	 *	Models
	 **************************************/

	var Name = Backbone.Model.extend({});

	var name1 = new Name({
		name: "Shane"
	});
	var name2 = new Name({
		name: "John"
	});
	var name3 = new Name({
		name: "Peter"
	});
	var name4 = new Name({
		name: "Mike"
	});

	/**************************************
	 *	Collections
	 **************************************/

	var NameCollection = Backbone.Collection.extend({
		model: Name,
	});

	var names = new NameCollection([name1, name2, name3, name4]);

	names.on("add", function() {
		nameView.render(names);
	});

	/**************************************
	 *	Views
	 **************************************/

	var NameView = Backbone.View.extend({

		template: Handlebars.compile($('#names-template').html()),
		templateName: Handlebars.compile($('#names-input-template').html()),

		events: {
			'submit form': 'addName',
			'keydown input': 'inputKey',
			'focus input': 'inputFocus',
			'blur input': 'inputBlur'
		},

		initialize: function() {
			this.$el = $('#names-list');
			this.selectedName = 1;
		},

		render: function(collection) {

			if (this.$el.has('form').length === 0) {
				this.$form = this.$el.html(this.templateName());
				this.$input = this.$form.find('input');

				this.$ul = this.$el.find('.js-user-select-list');
			}

			this.$ul.html(this.template({
				item: collection.toJSON()
			})).children('li:eq(0)').addClass('active');

			return this;
		},

		addName: function(e) {
			e.preventDefault();
			var name = new Name({
				name: this.$input.val()
			});
			this.$input.val('');
			names.add(name);
		},

		inputFocus: function() {
			this.$ul.show();
		},

		inputBlur: function() {
			this.$ul.hide();
		},

		inputKey: function(e) {
			var $activeItem = this.$ul.find('.active')
			if (e.keyCode === 40) { // Up Arrow
				if ($activeItem.next().length !== 0) {
					$activeItem.removeClass('active').next().addClass('active');
				}
			} else if (e.keyCode === 38) { // Down Arrow
				if ($activeItem.prev().length !== 0) {
					$activeItem.removeClass('active').prev().addClass('active');
				}
			} else if (e.keyCode === 9) { // Tab Key
				this.$input.val($activeItem.text());
			} else if (e.keyCode === 13) {
				e.preventDefault();
				this.$input.val($activeItem.text());
				this.inputBlur();
			} else {
				var inputString = this.$input.val();
				var filteredNames = names.filter(function(name) {
					return name.attributes.name.match(inputString);
				});
				this.render(new NameCollection(filteredNames));
			}
		}

	});

	var nameView = new NameView({});

	nameView.render(names);

}());