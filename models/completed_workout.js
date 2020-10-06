module.exports = function(sequelize, DataTypes) {
  return sequelize.define('completed_workout', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATEONLY,
      unique: true,
      allowNull: false
    }
  }, {});
};
