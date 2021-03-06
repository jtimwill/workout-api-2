module.exports = function(sequelize, DataTypes) {
  return sequelize.define('muscle', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      max: 50,
    }
  }, {});
};
