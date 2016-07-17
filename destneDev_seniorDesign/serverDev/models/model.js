var dbUser = require('./db').dbUser;
var dbNet = require('./db').dbNet;

//Bookshelf Model for the User table in User DB
var User = dbUser.Model.extend({
  tableName: 'User',
  idAttribute: 'userId',
  role: function() {
    return this.belongsToMany(Role, 'User_Role', 'userId', 'roleId');
  }
});

//Bookshelf Model for the User_Role table in User DB
var UserRole = dbUser.Model.extend({
  tableName: 'User_Role',
  idAttribute: 'id'
});

//Bookshelf Model for the Role table in User DB
var Role = dbUser.Model.extend({
  tableName: 'Role',
  idAttribute: 'roleId'
});

//Bookshelf Model for the Netflow_test table in destne DB
var NetFlow = dbNet.Model.extend({
  tableName: 'netflow_test'
  //columns: ['agent_id','labl','bytes','packets','ip_src']
  //FYI theres no function unless we add a second table to relate
});

module.exports = {
  User: User,
  UserRole: UserRole,
  Role: Role,
  NetFlow: NetFlow
};
