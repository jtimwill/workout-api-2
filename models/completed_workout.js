module.exports = function(sequelize, DataTypes) {
  return sequelize.define('completed_workout', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATE,
      // unique: true,
      allowNull: false,
      // defaultValue: Date.now
    }
  }, {});
};
