module.exports = function(sequelize, DataTypes) {
  return sequelize.define('workout_exercise', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
  }, {});
};
