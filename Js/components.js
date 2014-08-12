   /** @jsx React.DOM */

(function(){
   "use strict";

   $.get("/data", function(data){
      startApp(data);
   });

   var socket = io();

   function rankingSort(a, b){
      return b.ranking - a.ranking;
   }

   function calculateElo(playerRanking, opponentRanking, playerSets, opponentSets){
      var expectedWin = 1/(1+Math.pow(10, (opponentRanking - playerRanking)/400)),
         expectedScore = expectedWin * (playerSets + opponentSets);
         return playerRanking + 32*(playerSets - expectedScore);
   }

   var LeaderBoardApp = React.createClass({
      getInitialState: function(){
         this.props.names.sort(rankingSort);
         return {names : this.props.names};
      },
      saveUpdates: function(updates){
         socket.emit('updates', updates);
      },
      updateTable: function(updatedData){
         updatedData.sort(rankingSort);
         this.setState({names: updatedData});
      },
      updateSave: function(){
         // Process master array update state and save; 
      },
      componentWillMount: function(){
         var that = this;
         socket.on('table updates', that.updateTable);
      },
      handleFormSubmit: function(e){
         e.preventDefault();
         var input1Name = e.target[0].value,
           input2Name = e.target[2].value,
           input1Sets = parseInt(e.target[1].value),
           input2Sets = parseInt(e.target[3].value),
           namesTemp = this.state.names,
           updatesToSave = [];

         var nameUnique = this.props.names.findIndex(function(obj){
           return obj.fname === input1Name;
         });
         var name2Unique = this.props.names.findIndex(function(obj){
           return obj.fname === input2Name;
         });

         var player1Ranking = nameUnique !== -1 ? namesTemp[nameUnique].ranking : 1000,
            player2Ranking = name2Unique !== -1 ? namesTemp[name2Unique].ranking : 1000,
            player1UpdateRank = calculateElo(player1Ranking, player2Ranking, input1Sets, input2Sets),
            player2UpdateRank = calculateElo(player2Ranking, player1Ranking, input2Sets, input1Sets);

         if(nameUnique === -1 || nameUnique === undefined){
            namesTemp.push({fname : input1Name, totalSets : input1Sets, ranking : player1UpdateRank});
            updatesToSave.push({
               fname : input1Name,
               totalSets : input1Sets,
               sets : input1Sets,
               ranking : player1UpdateRank,
            });
         }
         else{
            namesTemp[nameUnique].totalSets = namesTemp[nameUnique].totalSets + input1Sets;
            namesTemp[nameUnique].ranking = player1UpdateRank;
            updatesToSave.push({
               fname: namesTemp[nameUnique].fname,
               totalSets: namesTemp[nameUnique].totalSets,
               sets : input1Sets,
               ranking: namesTemp[nameUnique].ranking,
            });
         }
         if(name2Unique === -1 || name2Unique === undefined){
            namesTemp.push({fname : input2Name, totalSets : input2Sets, ranking : player2UpdateRank});
            updatesToSave.push({
               fname: input2Name,
               totalSets: input2Sets,
               sets : input2Sets,
               ranking: player2UpdateRank,
            });
         }
         else{
            namesTemp[name2Unique].totalSets = namesTemp[name2Unique].totalSets + input2Sets;
            namesTemp[name2Unique].ranking = player2UpdateRank;
            updatesToSave.push({
               fname: namesTemp[name2Unique].fname,
               totalSets: namesTemp[name2Unique].totalSets,
               sets : input2Sets,
               ranking: namesTemp[name2Unique].ranking,
            });
         }
         namesTemp.sort(rankingSort);
         this.saveUpdates(updatesToSave);
         this.setState({names: namesTemp});
         return false;
      },
      render: function(){
         return(
            <div className="row">
               <div className="medium-6 medium-push-6 column">
                  <LeaderBoardForm formSubmit={this.handleFormSubmit} names={this.state.names} />
               </div>
               <div className="medium-6 medium-pull-6 column">
                  <AlertBox />
                  <LeaderBoardTable names={this.state.names} />
               </div>
            </div>
         );
      }
   });

   var AlertBox = React.createClass({
      componentWillMount: function(){
         var that = this;
         socket.on('table updates', function(){
            that.getDOMNode().classList.remove('hide');
            setTimeout(function(){
               that.getDOMNode().classList.add('hide');
            }, 5000);
         });
      },
      render: function(){
         return (
            <div data-alert className="alert-box info radius hide">
              Form has been updated
            </div>
         );
      }
   });

   var LeaderBoardTable = React.createClass({
      render: function(){
         var tableRow = this.props.names.map(function(name){
            return (
               <tr>
                 <th>{name.fname}</th>
                 <th>{name.totalSets}</th>
                 <th>{parseInt(name.ranking)}</th>
               </tr>
            );
         });
         return (
            <table>
               <thead>
                  <tr>
                     <th>Name</th>
                     <th>Sets</th>
                     <th>Ranking</th>
                  </tr>
               </thead>
               <tbody>
                  {tableRow}
               </tbody>
            </table>
         );
      }
   });

   var LeaderBoardForm = React.createClass({
      render: function() {
         return (
            <form onSubmit={this.props.formSubmit}>
               <div className="row">
                  <div className="small-9 column">
                     <UserSelect player="1" names={this.props.names} />
                  </div>
                  <div className="small-3 column">
                     <label for="">Sets
                       <input min="0" required type="number" />
                     </label>
                  </div>
               </div>
               <div className="row">
                  <div className="small-9 column">
                     <UserSelect player="2" names={this.props.names} />
                  </div>
                  <div className="small-3 column">
                     <label for="">Sets
                        <input min="0" required type="number" />
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
         };
      },
      updateData: function(event){
         var rx = new RegExp(event.target.value, 'i');
         var obj = this.props.names.filter(function (obj){
            return obj.fname.match(rx);
         });
         this.setState({names: obj});
         return obj.length;
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
         var namesLength = this.updateData(e);
         if(!this.state.show){
            this.setState({show: true});
         }
         this.setState({nameValue: e.target.value});
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
         else if (e.key === "Enter" || e.key === "Tab"){
            // TODO: this errors on new name
            if (e.key === "Enter") {
               e.preventDefault();
            }
            this.setState({nameValue: this.state.names[element].fname});
            this.setState({show: false});
         }
      },
      render: function() { 
         return (
            <div className="user-select">
               <label onFocus={this.showList} onBlur={this.hideList}>Player {this.props.player}
                  <input required type="text" onKeyDown={this.handleKeyPress} onChange={this.handleChange} value={this.state.nameValue}/>
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
   });

   function startApp(data){
      React.renderComponent( 
         <LeaderBoardApp names={data} />,
         document.getElementById('UserSelect')
      );
   }
})();
   

