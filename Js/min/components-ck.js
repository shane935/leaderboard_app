   /** @jsx React.DOM */
   var data = [
      {
         "fname" : "Shane",
         "sets" : 5
      },
      {
         "fname" : "Seb",
         "sets" : 2
      },
      {
         "fname" : "Katrina",
         "sets" : 1
      },
      {
         "fname" : "Rav",
         "sets" : 0
      },
      {
         "fname" : "Shannon",
         "sets" : 9
      },
      {
         "fname" : "Joe",
         "sets" : 2
      }
   ]

   function setsSort(a, b){
      return b.sets - a.sets;
   }

   var LeaderBoardApp = React.createClass({
      getInitialState: function(){
         this.props.names.sort(setsSort);
         return {names : this.props.names}
      },
      handleFormSubmit: function(e){
         e.preventDefault();
         var input1Name = e.target[0].value,
           input2Name = e.target[2].value,
           input1Sets = parseInt(e.target[1].value),
           input2Sets = parseInt(e.target[3].value),
           namesTemp = this.state.names;

         var nameUnique = this.props.names.findIndex(function(obj){
           return obj.fname === input1Name;
         });
         var name2Unique = this.props.names.findIndex(function(obj){
           return obj.fname === input2Name;
         });

         if(nameUnique === -1 || nameUnique === undefined){
            namesTemp.push({"fname" : input1Name, "sets" : input1Sets});
         }
         else{
            namesTemp.map(function(obj, index){
               if (index === nameUnique){
                  obj.sets = obj.sets + input1Sets;
                  return obj;
               }
               else{
                  return obj
               }
            });
         }
         if(name2Unique === -1 || name2Unique === undefined){
            namesTemp.push({"fname" : input2Name, "sets" : input2Sets});
         }
         else{
            namesTemp.map(function(obj, index){
               if (index === name2Unique){
                  obj.sets = obj.sets + input2Sets;
                  return obj;
               }
               else{
                  return obj
               }
            });
         }
         namesTemp.sort(setsSort);
         this.setState({names: namesTemp});
         return false;
      },
      render: function(){
         return(
            <div>
               <div className="medium-6 column">
                  <LeaderBoardTable names={this.props.names} />
               </div>
               <div className="medium-6 column">
                  <LeaderBoardForm formSubmit={this.handleFormSubmit} names={this.props.names} />
               </div>
            </div>
         )
      }
   })

   var LeaderBoardTable = React.createClass({
      render: function(){
         var tableRow = this.props.names.map(function(name){
            return (
               <tr>
                 <th>{name.fname}</th>
                 <th>{name.sets}</th>
                 <th>{name.sets * 3}</th>
               </tr>
            )
         });
         return (
            <table>
               <thead>
                  <tr>
                     <th>Name</th>
                     <th>Sets</th>
                     <th>Points</th>
                  </tr>
               </thead>
               <tbody>
                  {tableRow}
               </tbody>
            </table>
         )
      }
   })

   var LeaderBoardForm = React.createClass({
      render: function() {
         return (
            <form onSubmit={this.props.formSubmit}>
               <div className="row">
                  <div className="small-9 column">
                     <UserSelect names={this.props.names} />
                  </div>
                  <div className="small-3 column">
                     <label for="">Sets
                       <input type="number" />
                     </label>
                  </div>
               </div>
               <div className="row">
                  <div className="small-9 column">
                     <UserSelect names={this.props.names} />
                  </div>
                  <div className="small-3 column">
                     <label for="">Sets
                        <input type="number" />
                     </label>
                  </div>
               </div>
               <button type="submit">Submit</button>
            </form>
         );
      }
   });

   var UserSelect = React.createClass({
   	getInitialState: function() {
   		return {
            show: false,
            nameValue: '',
            selectedElement: 0,
            names: this.props.names
         }
   	},
      updateData: function(event){
         var rx = new RegExp(event.target.value, 'i');
         var obj = this.props.names.filter(function (obj){
            return obj.fname.match(rx);
         });
         this.setState({names: obj});
         return obj.length
      },
   	showList: function(e) {
   		this.setState({show: true});
         this.updateData(e);
   	},
   	hideList: function() {
         setTimeout(function(){
            this.setState({show: false});
         }.bind(this), 150);
   	},
      handleChange: function(e){
         if(!this.state.show){
            this.setState({show: true});
         }
         this.setState({nameValue: e.target.value});
         namesLength = this.updateData(e);
         if (this.state.selectedElement > namesLength) {
            this.setState({selectedElement: 0});
         }
      },
      handleListClick: function(e){
         // Callback for the click on li child
         this.setState({nameValue: e.target.innerHTML});
      },
      handleKeyPress: function(e){
         var element = this.state.selectedElement;
         if (e.key === "ArrowDown") {
            this.setState({selectedElement: element < this.state.names.length -1 ? element + 1 : element});
         }
         else if (e.key === "ArrowUp"){
            this.setState({selectedElement: element > 0 ? element - 1 : 0});
         }
         else if (e.key === "Enter"){
            this.setState({nameValue: this.state.names[element].fname});
            this.setState({show: false});
         }
      },
   	render: function() {	
   		return (
   			<div className="user-select">
   			  	<label onFocus={this.showList} onBlur={this.hideList}>Player 1
   			    	<input type="text" onKeyDown={this.handleKeyPress} onChange={this.handleChange} value={this.state.nameValue}/>
   			  	</label>
   			  	<UserSelectList showNode={this.state.show} selectedEl={this.state.selectedElement} names={this.state.names} listClick={this.handleListClick}/>
   			</div>
   		);
   	}
   });

   var UserSelectList = React.createClass({
   	render: function() {
   		var cx = React.addons.classSet;
   		var userSelectClasses = cx({
   			'user-select-list': true,
   			'show': this.props.showNode
   		});
         var i = 0;
         var listItem = this.props.names.map(function(names){
            var listActiveClass = cx({
               "active": i++ === this.props.selectedEl
            });
            return <li className={listActiveClass} onClick={this.props.listClick}>{names.fname}</li>
         }.bind(this));
   		return (
   			<ul className={userSelectClasses}>
   			  	{listItem}
   			</ul>
   		)
   	}
   })


   React.renderComponent( 
   	<LeaderBoardApp names={data} />,
    	document.getElementById('UserSelect')
  	);