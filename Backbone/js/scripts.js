(function() {

	/**************************************
	 *	Models
	 **************************************/

	var Name = Backbone.Model.extend({});

	var name1 = new Name({
		name: 'Shane'
	});
	var name2 = new Name({
		name: 'John'
	});
	var name3 = new Name({
		name: 'Peter'
	});
	var name4 = new Name({
		name: 'Mike'
	});

	/**************************************
	 *	Collections
	 **************************************/

	var NameCollection = Backbone.Collection.extend({
		model: Name,
	});

	var names = new NameCollection([name1, name2, name3, name4]);

	/**************************************
	 *	Views
	 **************************************/

	var NamesSubmit = Backbone.View.extend({
		events: {
			'submit': 'addName',
		},

		addName: function(e) {
			e.preventDefault();
			var namesArray = [];
			this.$el.find('input').each(function() {
				$input = $(this);
				namesArray.push({
					name: $input.val()
				});
				$input.val('');
			});

			names.add(namesArray);
			console.log(names);
		}

	});

	var NameView = Backbone.View.extend({

		template: Handlebars.compile($('#names-template').html()),
		templateName: Handlebars.compile($('#names-input-template').html()),

		events: {
			'keyup input': 'inputKey',
			'focus input': 'inputFocus',
			'blur input': 'inputBlur'
		},

		initialize: function() {
			this.listenTo(this.collection, 'add', this.render);
		},

		render: function(collection) {

			debugger;
			collection = typeof collection === 'undefined' ? this.collection : collection;

			if (this.$el.has('input').length === 0) {
				this.$form = this.$el.html(this.templateName());
				this.$input = this.$form.find('input');

				this.$ul = this.$el.find('.js-user-select-list');
			}

			this.$ul.html(this.template({
				item: collection.toJSON()
			})).children('li:eq(0)').addClass('active');

			return this;
		},

		inputFocus: function() {
			this.$ul.show();
		},

		inputBlur: function() {
			this.$ul.hide();
		},

		inputKey: function(e) {
			var $activeItem = this.$ul.find('.active');
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
			} else if (e.keyCode === 13) { // Enter Key
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

	var namesSubmit = new NamesSubmit({
		el: document.getElementById('form')
	});

	var player1 = new NameView({
		el: document.getElementById('PlayerOne'),
		collection: names
	});

	var player2 = new NameView({
		el: document.getElementById('PlayerTwo'),
		collection: names
	});

	function renderPlayerInput() {
		player1.render();
		player2.render();
	}

	renderPlayerInput();

}());